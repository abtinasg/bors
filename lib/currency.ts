/**
 * SourceArena Currency API
 * Real-time and historical currency/coin prices
 */

const SOURCEARENA_BASE_URL = "https://apis.sourcearena.ir/api/";

export interface CurrencyData {
  slug: string;
  name?: string;
  price: number;
  change: number;
  change_percent: number;
  max_price: number;
  min_price: number;
  last_update: string;
  change_percent_24h: number;
}

// Raw API response from SourceArena
interface RawCurrencyItem {
  slug: string;
  name: string;
  price: string;
  change: string;
  change_percent: string;
  min_price: string;
  max_price: string;
  last_update: string;
  ts: string;
}

interface RawAPIResponse {
  data: RawCurrencyItem[];
}

export interface CurrencyAPIResponse {
  [key: string]: CurrencyData;
}

/**
 * Fetch real-time currency and coin prices
 * @param date - Optional date in format 1400/08/03 for historical data (available from 1400/08/03)
 */
export async function fetchCurrencyData(
  date?: string
): Promise<CurrencyAPIResponse> {
  const token = process.env.SOURCEARENA_API_TOKEN;

  if (!token) {
    throw new Error("SOURCEARENA_API_TOKEN is not configured");
  }

  let url = `${SOURCEARENA_BASE_URL}?token=${token}&currency`;

  if (date) {
    url += `&date=${date}`;
  }

  const response = await fetch(url, {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch currency data: ${response.status}`);
  }

  const rawData: RawAPIResponse = await response.json();
  
  // Transform array to object and parse string values to numbers
  // API returns prices in Rial, we convert to Toman (divide by 10)
  const result: CurrencyAPIResponse = {};
  
  // These slugs have prices in USD/international units, not Rial
  const internationalPriceSlugs = ["ONS", "ONSNOGHRE", "PALA", "ONSPALA", "OIL"];
  
  if (rawData.data && Array.isArray(rawData.data)) {
    for (const item of rawData.data) {
      const rawPrice = parseFloat(item.price) || 0;
      const rawChange = parseFloat(item.change) || 0;
      const rawMaxPrice = parseFloat(item.max_price) || 0;
      const rawMinPrice = parseFloat(item.min_price) || 0;
      
      // Don't convert international prices (ONS, OIL, etc.)
      const isInternational = internationalPriceSlugs.includes(item.slug);
      const divisor = isInternational ? 1 : 10;
      
      result[item.slug] = {
        slug: item.slug,
        name: item.name,
        price: rawPrice / divisor,
        change: rawChange / divisor,
        change_percent: parseFloat(item.change_percent) || 0,
        max_price: rawMaxPrice / divisor,
        min_price: rawMinPrice / divisor,
        last_update: item.ts || item.last_update,
        change_percent_24h: parseFloat(item.change_percent) || 0,
      };
    }
  }
  
  return result;
}

/**
 * Get specific currency/coin by slug
 */
export async function getCurrencyBySlug(
  slug: string,
  date?: string
): Promise<CurrencyData | null> {
  const data = await fetchCurrencyData(date);
  return data[slug] || null;
}

/**
 * Currency slugs for common items
 */
export const CURRENCY_SLUGS = {
  // Currencies
  USD: "USD", // دلار آمریکا
  EUR: "EUR", // یورو
  GBP: "GBP", // پوند انگلیس
  AED: "AED", // درهم امارات
  TRY: "TRY", // لیر ترکیه
  
  // Gold & Coins
  GOLD_18: "geram18", // طلای ۱۸ عیار
  GOLD_24: "geram24", // طلای ۲۴ عیار
  GOLD_MESGHAL: "mesghal", // مثقال طلا
  OUNCE: "ounce", // انس جهانی طلا
  COIN_EMAMI: "emami", // سکه امامی
  COIN_BAHAR: "bahar", // سکه بهار آزادی
  COIN_NIM: "nim", // نیم سکه
  COIN_ROB: "rob", // ربع سکه
  COIN_GERAMI: "gerami", // سکه گرمی
} as const;

/**
 * Persian names for currencies
 */
export const CURRENCY_NAMES: Record<string, string> = {
  // Currencies
  USD: "دلار آمریکا",
  EUR: "یورو",
  GBP: "پوند انگلیس",
  AED: "درهم امارات",
  TRY: "لیر ترکیه",
  CHF: "فرانک سوئیس",
  CAD: "دلار کانادا",
  AUD: "دلار استرالیا",
  CNY: "یوان چین",
  JPY: "ین ژاپن",
  INR: "روپیه هند",
  KWD: "دینار کویت",
  SAR: "ریال عربستان",
  QAR: "ریال قطر",
  IQD: "دینار عراق",
  SEK: "کرون سوئد",
  NOK: "کرون نروژ",
  DKK: "کرون دانمارک",
  RUB: "روبل روسیه",
  AFN: "افغانی",
  PKR: "روپیه پاکستان",
  // Gold
  geram18: "طلای ۱۸ عیار",
  geram24: "طلای ۲۴ عیار",
  mesghal: "مثقال طلا",
  ounce: "انس جهانی طلا",
  // Coins
  emami: "سکه امامی",
  bahar: "سکه بهار آزادی",
  nim: "نیم سکه",
  rob: "ربع سکه",
  gerami: "سکه گرمی",
  // Crypto
  bitcoin: "بیت‌کوین",
  ethereum: "اتریوم",
  tether: "تتر",
  binance: "بایننس کوین",
  xrp: "ریپل",
  cardano: "کاردانو",
  solana: "سولانا",
  dogecoin: "دوج‌کوین",
  polkadot: "پولکادات",
  litecoin: "لایت‌کوین",
  tron: "ترون",
  shiba: "شیبا",
  ton: "تون‌کوین",
};

/**
 * Asset type categories
 */
export const ASSET_TYPES: Record<string, string> = {
  // Currencies
  USD: "currency",
  EUR: "currency",
  GBP: "currency",
  AED: "currency",
  TRY: "currency",
  CHF: "currency",
  CAD: "currency",
  AUD: "currency",
  CNY: "currency",
  JPY: "currency",
  INR: "currency",
  KWD: "currency",
  SAR: "currency",
  QAR: "currency",
  IQD: "currency",
  SEK: "currency",
  NOK: "currency",
  DKK: "currency",
  RUB: "currency",
  AFN: "currency",
  PKR: "currency",
  // Gold
  geram18: "gold",
  geram24: "gold",
  mesghal: "gold",
  ounce: "gold",
  // Coins
  emami: "coin",
  bahar: "coin",
  nim: "coin",
  rob: "coin",
  gerami: "coin",
  // Crypto
  bitcoin: "crypto",
  ethereum: "crypto",
  tether: "crypto",
  binance: "crypto",
  xrp: "crypto",
  cardano: "crypto",
  solana: "crypto",
  dogecoin: "crypto",
  polkadot: "crypto",
  litecoin: "crypto",
  tron: "crypto",
  shiba: "crypto",
  ton: "crypto",
};

/**
 * Check if an asset is a car
 */
export function isCarAsset(slug: string): boolean {
  // Car slugs typically have specific patterns or we can check against known car data
  return slug.startsWith("car_") || ASSET_TYPES[slug] === "car";
}

/**
 * Get asset type for a slug
 */
export function getAssetType(slug: string): string {
  return ASSET_TYPES[slug] || "currency";
}

/**
 * Get asset name for a slug
 */
export function getAssetName(slug: string): string {
  return CURRENCY_NAMES[slug] || slug;
}

/**
 * Format price to Persian-readable format with Toman
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
}

/**
 * Format change percent with color indicator
 */
export function getChangeStatus(changePercent: number): "positive" | "negative" | "neutral" {
  if (changePercent > 0) return "positive";
  if (changePercent < 0) return "negative";
  return "neutral";
}
