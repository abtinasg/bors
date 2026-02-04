import { NextRequest, NextResponse } from "next/server";
import { fetchAllStocks, fetchStock, fetchStockHistory, POPULAR_STOCKS, STOCK_CATEGORIES, ETF_FUNDS } from "@/lib/stock";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get("name");
    const days = searchParams.get("days");
    const time = searchParams.get("time") || undefined;
    const popular = searchParams.get("popular");
    const category = searchParams.get("category");

    // Fetch single stock history
    if (name && days) {
      const history = await fetchStockHistory(name, parseInt(days));
      return NextResponse.json({
        success: true,
        data: history,
        timestamp: new Date().toISOString(),
      });
    }

    // Fetch single stock
    if (name) {
      const stock = await fetchStock(name, time);
      if (!stock) {
        return NextResponse.json(
          { success: false, error: "نماد یافت نشد" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: stock,
        timestamp: new Date().toISOString(),
      });
    }

    // Fetch popular stocks only
    if (popular === "true") {
      const allStocks = await fetchAllStocks(0, time);
      const popularStocksData = POPULAR_STOCKS
        .filter((symbol) => allStocks[symbol])
        .map((symbol) => allStocks[symbol]);
      
      return NextResponse.json({
        success: true,
        stocks: popularStocksData,
        data: Object.fromEntries(POPULAR_STOCKS.filter(s => allStocks[s]).map(s => [s, allStocks[s]])),
        count: popularStocksData.length,
        timestamp: new Date().toISOString(),
      });
    }

    if (category && STOCK_CATEGORIES[category]) {
      const allStocks = await fetchAllStocks(0, time);
      const symbols = STOCK_CATEGORIES[category];
      const filteredStocks = symbols
        .filter((symbol) => allStocks[symbol])
        .map((symbol) => allStocks[symbol]);

      return NextResponse.json({
        success: true,
        stocks: filteredStocks,
        data: Object.fromEntries(symbols.filter(s => allStocks[s]).map(s => [s, allStocks[s]])),
        count: filteredStocks.length,
        timestamp: new Date().toISOString(),
      });
    }

    // Fetch ETF funds
    if (category === "etf") {
      const allStocks = await fetchAllStocks(2, time); // type 2 for all symbols including ETFs
      const etfStocks = ETF_FUNDS
        .filter((symbol) => allStocks[symbol])
        .map((symbol) => allStocks[symbol]);

      return NextResponse.json({
        success: true,
        stocks: etfStocks,
        data: Object.fromEntries(ETF_FUNDS.filter(s => allStocks[s]).map(s => [s, allStocks[s]])),
        count: etfStocks.length,
        timestamp: new Date().toISOString(),
      });
    }

    // Fetch all stocks
    const stocks = await fetchAllStocks(0, time);
    
    return NextResponse.json({
      success: true,
      data: stocks,
      count: Object.keys(stocks).length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Stock API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "خطا در دریافت اطلاعات",
      },
      { status: 500 }
    );
  }
}
