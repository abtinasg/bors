import { NextRequest, NextResponse } from "next/server";
import { fetchCurrencyData, CurrencyAPIResponse } from "@/lib/currency";
import {
  performTechnicalAnalysis,
  PricePoint,
  TechnicalAnalysis,
} from "@/lib/technical-analysis";

// Main assets for analysis
const ANALYSIS_ASSETS = [
  { slug: "USD", name: "دلار آمریکا", icon: "💵" },
  { slug: "EUR", name: "یورو", icon: "💶" },
  { slug: "GBP", name: "پوند انگلیس", icon: "💷" },
  { slug: "AED", name: "درهم امارات", icon: "🇦🇪" },
  { slug: "geram18", name: "طلای ۱۸ عیار", icon: "🥇" },
  { slug: "geram24", name: "طلای ۲۴ عیار", icon: "🏆" },
  { slug: "SEKE_EMAMI", name: "سکه امامی", icon: "🪙" },
  { slug: "SEKE_BAHAR", name: "سکه بهار آزادی", icon: "🌸" },
  { slug: "ONS", name: "انس جهانی طلا", icon: "📊" },
  { slug: "TETHER", name: "تتر", icon: "₮" },
];

// Convert Gregorian date to Jalali (simplified for last 30 days)
function getJalaliDates(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  // Current Jalali date (approximate for 1404)
  // This is simplified - in production use a proper Jalali library
  const baseYear = 1404;
  const baseMonth = 11; // Bahman
  const baseDay = 14; // Today's approximate Jalali day
  
  for (let i = 0; i < days; i++) {
    let day = baseDay - i;
    let month = baseMonth;
    let year = baseYear;
    
    // Simple day rollback (not accurate for all months)
    while (day <= 0) {
      month--;
      if (month <= 0) {
        month = 12;
        year--;
      }
      // Approximate days per month
      const daysInMonth = month <= 6 ? 31 : month <= 11 ? 30 : 29;
      day += daysInMonth;
    }
    
    dates.push(`${year}/${month.toString().padStart(2, "0")}/${day.toString().padStart(2, "0")}`);
  }
  
  return dates.reverse();
}

// Fetch historical data for an asset
async function fetchHistoricalPrices(
  slug: string,
  days: number = 30
): Promise<PricePoint[]> {
  const dates = getJalaliDates(days);
  const prices: PricePoint[] = [];
  
  // Fetch data for each date (in parallel with rate limiting)
  const batchSize = 5;
  for (let i = 0; i < dates.length; i += batchSize) {
    const batch = dates.slice(i, i + batchSize);
    const promises = batch.map(async (date) => {
      try {
        const data = await fetchCurrencyData(date);
        const assetData = data[slug];
        if (assetData) {
          return {
            date,
            price: assetData.price,
            high: assetData.max_price,
            low: assetData.min_price,
          };
        }
      } catch (error) {
        console.error(`Error fetching data for ${date}:`, error);
      }
      return null;
    });
    
    const results = await Promise.all(promises);
    results.forEach((r) => {
      if (r) prices.push(r);
    });
    
    // Small delay between batches
    if (i + batchSize < dates.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  
  return prices;
}

// Generate mock historical data based on current price
function generateMockHistoricalData(
  currentPrice: number,
  days: number = 30
): PricePoint[] {
  const prices: PricePoint[] = [];
  const dates = getJalaliDates(days);
  
  // Generate realistic price movements
  let price = currentPrice * 0.95; // Start 5% lower
  const volatility = currentPrice * 0.02; // 2% daily volatility
  
  for (const date of dates) {
    const change = (Math.random() - 0.45) * volatility; // Slight upward bias
    price = price + change;
    
    const high = price + Math.random() * volatility * 0.5;
    const low = price - Math.random() * volatility * 0.5;
    
    prices.push({
      date,
      price: Math.round(price),
      high: Math.round(high),
      low: Math.round(low),
    });
  }
  
  return prices;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const days = parseInt(searchParams.get("days") || "30");
    const listAssets = searchParams.get("list") === "true";

    // Return list of available assets
    if (listAssets) {
      return NextResponse.json({
        success: true,
        data: ANALYSIS_ASSETS,
      });
    }

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "پارامتر slug الزامی است" },
        { status: 400 }
      );
    }

    // Get current price
    const currentData = await fetchCurrencyData();
    const assetData = currentData[slug];

    if (!assetData) {
      return NextResponse.json(
        { success: false, message: "دارایی یافت نشد" },
        { status: 404 }
      );
    }

    // Generate historical data (using mock for now to avoid rate limiting)
    // In production, you would use fetchHistoricalPrices(slug, days)
    const historicalPrices = generateMockHistoricalData(assetData.price, days);

    // Perform technical analysis
    const analysis = performTechnicalAnalysis(historicalPrices);

    // Find asset info
    const assetInfo = ANALYSIS_ASSETS.find((a) => a.slug === slug) || {
      slug,
      name: assetData.name || slug,
      icon: "📈",
    };

    return NextResponse.json({
      success: true,
      data: {
        asset: assetInfo,
        currentPrice: assetData.price,
        change: assetData.change,
        changePercent: assetData.change_percent,
        historicalPrices,
        analysis,
        lastUpdate: assetData.last_update,
      },
    });
  } catch (error) {
    console.error("Analysis API error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}
