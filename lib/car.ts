/**
 * SourceArena Car API
 * Real-time and historical car prices
 */

const SOURCEARENA_BASE_URL = "https://apis.sourcearena.ir/api/";

export interface CarData {
  cid: number;
  unique_id: string;
  type: string;        // برند فارسی (آریسان، پژو، ...)
  type_en: string;     // برند انگلیسی
  model: string;       // مدل خودرو
  trim_fa: string;     // نسخه فارسی
  year: number;        // سال تولید (شمسی)
  description: string; // توضیحات
  price: number;       // قیمت به تومان
  change_percent: number;
  market_price: boolean;
  last_update: string;
}

// Raw API response from SourceArena
interface RawCarItem {
  cid: number;
  unique_id: string;
  type: string;
  type_en: string;
  model: string;
  trim_fa: string;
  year: number;
  description: string;
  price: string | number;
  change_percent: string | number;
  market_price: boolean;
  last_update: string;
}

export interface CarAPIResponse {
  [key: string]: CarData;
}

/**
 * Fetch real-time car prices
 * @param date - Optional date in format 1400/08/03 for historical data
 */
export async function fetchCarData(date?: string): Promise<CarAPIResponse> {
  const token = process.env.SOURCEARENA_API_TOKEN;

  if (!token) {
    throw new Error("SOURCEARENA_API_TOKEN is not configured");
  }

  let url = `${SOURCEARENA_BASE_URL}?token=${token}&car=all`;

  if (date) {
    url += `&date=${date}`;
  }

  const response = await fetch(url, {
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch car data: ${response.status}`);
  }

  // API returns array directly, not wrapped in { data: [...] }
  const rawData: RawCarItem[] = await response.json();
  
  const result: CarAPIResponse = {};
  
  if (Array.isArray(rawData)) {
    for (const item of rawData) {
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      const changePercent = typeof item.change_percent === 'string' 
        ? parseFloat(item.change_percent) 
        : item.change_percent;
      
      // Use unique_id as key
      result[item.unique_id] = {
        cid: item.cid,
        unique_id: item.unique_id,
        type: item.type,
        type_en: item.type_en,
        model: item.model,
        trim_fa: item.trim_fa || "",
        year: item.year,
        description: item.description || "",
        price: price || 0,
        change_percent: changePercent || 0,
        market_price: item.market_price,
        last_update: item.last_update,
      };
    }
  }
  
  return result;
}

/**
 * Fetch single car by unique_id
 */
export async function fetchCarByUniqueId(uniqueId: string, date?: string): Promise<CarData | null> {
  const cars = await fetchCarData(date);
  return cars[uniqueId] || null;
}

/**
 * Get popular cars (most searched)
 */
export function getPopularCars(cars: CarAPIResponse): CarData[] {
  const popularIds = [
    // پژو
    "peugeot_206_2",
    "peugeot_207i",
    "peugeot_pars",
    // سمند
    "samand_lx",
    "samand_soren",
    // دنا
    "dena_plus",
    "dena_plus_turbo",
    // تارا
    "tara",
    // هایما
    "haima_s7",
    "haima_s5",
    // کوییک
    "quick_r",
    "quick_s",
    // شاهین
    "shahin",
    // رانا
    "runna",
  ];

  return popularIds
    .map(id => {
      // Try to find matching car
      const car = Object.values(cars).find(c => 
        c.unique_id === id || 
        c.unique_id.includes(id) ||
        (c.type_en.toLowerCase().includes(id.split('_')[0]) && c.model === id.split('_')[1])
      );
      return car;
    })
    .filter((car): car is CarData => car !== undefined);
}

/**
 * Search cars by name/type
 */
export function searchCars(cars: CarAPIResponse, query: string): CarData[] {
  const searchTerm = query.toLowerCase();
  return Object.values(cars).filter(car => 
    car.type.toLowerCase().includes(searchTerm) ||
    car.type_en.toLowerCase().includes(searchTerm) ||
    car.model.toLowerCase().includes(searchTerm) ||
    car.description.toLowerCase().includes(searchTerm)
  );
}

/**
 * Format car name for display
 */
export function formatCarName(car: CarData): string {
  let name = car.type;
  if (car.model) name += ` ${car.model}`;
  if (car.trim_fa) name += ` ${car.trim_fa}`;
  if (car.year) name += ` (${car.year})`;
  return name;
}
