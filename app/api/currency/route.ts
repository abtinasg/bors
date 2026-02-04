import { NextRequest, NextResponse } from "next/server";
import { fetchCurrencyData } from "@/lib/currency";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date") || undefined;

    const data = await fetchCurrencyData(date);

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Currency API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "خطا در دریافت اطلاعات",
      },
      { status: 500 }
    );
  }
}
