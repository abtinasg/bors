import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { fetchCurrencyData, CurrencyAPIResponse } from "@/lib/currency";

interface PortfolioItem {
  id: string;
  assetSlug: string;
  assetType: string;
  assetName: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  change: number;
  changePercent: number;
}

interface WatchlistItem {
  id: string;
  assetSlug: string;
  assetType: string;
  assetName: string;
  currentPrice: number;
  change: number;
  changePercent: number;
}

interface DashboardData {
  portfolio: {
    items: PortfolioItem[];
    totalValue: number;
    totalInvested: number;
    totalPnl: number;
    totalPnlPercent: number;
    dailyPnl: number;
    dailyPnlPercent: number;
  };
  watchlist: {
    gainers: WatchlistItem[];
    losers: WatchlistItem[];
  };
}

// Get current price for an asset from currency data
function getCurrentPrice(assetSlug: string, currencyData: CurrencyAPIResponse): number | null {
  const asset = currencyData[assetSlug];
  return asset ? asset.price : null;
}

// Get change data for an asset
function getChangeData(assetSlug: string, currencyData: CurrencyAPIResponse): { change: number; changePercent: number } {
  const asset = currencyData[assetSlug];
  if (asset) {
    return {
      change: asset.change,
      changePercent: asset.change_percent,
    };
  }
  return { change: 0, changePercent: 0 };
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "وارد نشده‌اید" },
        { status: 401 }
      );
    }

    // Fetch user's portfolio and watchlist
    const [portfolioDb, watchlistDb, currencyData] = await Promise.all([
      prisma.portfolio.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.watchlist.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      fetchCurrencyData(),
    ]);

    // Process portfolio with current prices
    let totalValue = 0;
    let totalInvested = 0;
    let dailyPnl = 0;

    const portfolioItems: PortfolioItem[] = portfolioDb.map((item) => {
      const currentPrice = getCurrentPrice(item.assetSlug, currencyData) || item.buyPrice;
      const { change, changePercent } = getChangeData(item.assetSlug, currencyData);
      
      const invested = item.quantity * item.buyPrice;
      const currentValue = item.quantity * currentPrice;
      const pnl = currentValue - invested;
      const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;
      
      // Daily P&L based on price change
      const dailyChange = item.quantity * change;
      
      totalValue += currentValue;
      totalInvested += invested;
      dailyPnl += dailyChange;

      return {
        id: item.id,
        assetSlug: item.assetSlug,
        assetType: item.assetType,
        assetName: item.assetName,
        quantity: item.quantity,
        buyPrice: item.buyPrice,
        currentPrice,
        currentValue,
        pnl,
        pnlPercent,
        change,
        changePercent,
      };
    });

    const totalPnl = totalValue - totalInvested;
    const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
    const dailyPnlPercent = totalValue > 0 ? (dailyPnl / (totalValue - dailyPnl)) * 100 : 0;

    // Process watchlist with current prices and split into gainers/losers
    const watchlistItems: WatchlistItem[] = watchlistDb.map((item) => {
      const currentPrice = getCurrentPrice(item.assetSlug, currencyData) || 0;
      const { change, changePercent } = getChangeData(item.assetSlug, currencyData);

      return {
        id: item.id,
        assetSlug: item.assetSlug,
        assetType: item.assetType,
        assetName: item.assetName,
        currentPrice,
        change,
        changePercent,
      };
    });

    // Sort and split watchlist
    const gainers = watchlistItems
      .filter((item) => item.changePercent >= 0)
      .sort((a, b) => b.changePercent - a.changePercent);
    
    const losers = watchlistItems
      .filter((item) => item.changePercent < 0)
      .sort((a, b) => a.changePercent - b.changePercent);

    const dashboardData: DashboardData = {
      portfolio: {
        items: portfolioItems,
        totalValue,
        totalInvested,
        totalPnl,
        totalPnlPercent,
        dailyPnl,
        dailyPnlPercent,
      },
      watchlist: {
        gainers,
        losers,
      },
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}
