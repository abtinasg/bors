import { NextRequest, NextResponse } from "next/server";
import { fetchCarData, searchCars, formatCarName, CarData, CarAPIResponse } from "@/lib/car";

export interface CarPriceItem {
  unique_id: string;
  cid: number;
  name: string;
  type: string;
  type_en: string;
  model: string;
  trim_fa: string;
  year: number;
  description: string;
  price: number;
  change_percent: number;
  market_price: boolean;
  last_update: string;
}

function formatCarResponse(car: CarData): CarPriceItem {
  return {
    unique_id: car.unique_id,
    cid: car.cid,
    name: formatCarName(car),
    type: car.type,
    type_en: car.type_en,
    model: car.model,
    trim_fa: car.trim_fa,
    year: car.year,
    description: car.description,
    price: car.price,
    change_percent: car.change_percent,
    market_price: car.market_price,
    last_update: car.last_update,
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date") || undefined; // تاریخ شمسی: 1400/08/03
    const search = searchParams.get("search");
    const id = searchParams.get("id"); // unique_id

    const carData: CarAPIResponse = await fetchCarData(date);
    
    // Fetch single car by unique_id
    if (id) {
      const car = carData[id];
      if (!car) {
        return NextResponse.json(
          { success: false, error: "خودرو یافت نشد" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: formatCarResponse(car),
        timestamp: new Date().toISOString(),
      });
    }

    let cars: CarData[];
    
    if (search) {
      // Search cars by name/type/model
      cars = searchCars(carData, search);
    } else {
      // Return all cars
      cars = Object.values(carData);
    }
    
    // Format response - keyed by unique_id
    const formattedCars: Record<string, CarPriceItem> = {};
    for (const car of cars) {
      if (car.price > 0) {
        formattedCars[car.unique_id] = formatCarResponse(car);
      }
    }

    return NextResponse.json({
      success: true,
      data: formattedCars,
      count: Object.keys(formattedCars).length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Car API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "خطا در دریافت قیمت خودرو",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
