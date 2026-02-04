import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { addPortfolioSchema, updatePortfolioSchema } from "@/lib/validators";
import { fetchCurrencyData } from "@/lib/currency";

// Get user's portfolio
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

    const portfolio = await prisma.portfolio.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Fetch current prices directly from lib
    const prices: Record<string, number> = {};
    try {
      const currencyData = await fetchCurrencyData();
      console.log("Fetched currency data, keys:", Object.keys(currencyData).slice(0, 10));
      Object.values(currencyData).forEach((val) => {
        prices[val.slug] = val.price;
      });
      console.log("Prices map sample:", Object.entries(prices).slice(0, 5));
    } catch (error) {
      console.error("Error fetching prices:", error);
    }

    // Calculate enriched portfolio with current prices and PnL
    const enrichedPortfolio = portfolio.map((item) => {
      const currentPrice = prices[item.assetSlug] || item.buyPrice;
      const totalCost = item.quantity * item.buyPrice;
      const totalValue = item.quantity * currentPrice;
      const pnl = totalValue - totalCost;
      const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
      const change = currentPrice - item.buyPrice;
      const changePercent = item.buyPrice > 0 ? (change / item.buyPrice) * 100 : 0;

      console.log(`Item ${item.assetSlug}: buyPrice=${item.buyPrice}, currentPrice=${currentPrice}, pnlPercent=${pnlPercent}`);

      return {
        ...item,
        currentPrice,
        totalCost,
        totalValue,
        pnl,
        pnlPercent,
        change,
        changePercent,
        allocation: 0, // will be calculated below
      };
    });

    // Calculate allocations
    const totalPortfolioValue = enrichedPortfolio.reduce((sum, item) => sum + item.totalValue, 0);
    enrichedPortfolio.forEach((item) => {
      item.allocation = totalPortfolioValue > 0 ? (item.totalValue / totalPortfolioValue) * 100 : 0;
    });

    return NextResponse.json({
      success: true,
      data: enrichedPortfolio,
    });
  } catch (error) {
    console.error("Portfolio GET error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}

// Add asset to portfolio
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "وارد نشده‌اید" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = addPortfolioSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { assetSlug, assetType, assetName, quantity, buyPrice } = validation.data;

    // Check if already exists and update or create
    const existing = await prisma.portfolio.findUnique({
      where: {
        userId_assetSlug: { userId, assetSlug },
      },
    });

    let portfolio;
    if (existing) {
      // Update existing - calculate new average price
      const totalQuantity = existing.quantity + quantity;
      const totalValue = existing.quantity * existing.buyPrice + quantity * buyPrice;
      const newAvgPrice = totalValue / totalQuantity;

      portfolio = await prisma.portfolio.update({
        where: { id: existing.id },
        data: {
          quantity: totalQuantity,
          buyPrice: newAvgPrice,
        },
      });
    } else {
      portfolio = await prisma.portfolio.create({
        data: {
          userId,
          assetSlug,
          assetType,
          assetName,
          quantity,
          buyPrice,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: portfolio,
      message: existing ? "پرتفوی بروزرسانی شد" : "به پرتفوی اضافه شد",
    });
  } catch (error) {
    console.error("Portfolio POST error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}

// Update portfolio item
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "وارد نشده‌اید" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { assetSlug, ...updateData } = body;

    if (!assetSlug) {
      return NextResponse.json(
        { success: false, message: "شناسه دارایی الزامی است" },
        { status: 400 }
      );
    }

    const validation = updatePortfolioSchema.safeParse(updateData);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const portfolio = await prisma.portfolio.update({
      where: {
        userId_assetSlug: { userId, assetSlug },
      },
      data: validation.data,
    });

    return NextResponse.json({
      success: true,
      data: portfolio,
      message: "پرتفوی بروزرسانی شد",
    });
  } catch (error) {
    console.error("Portfolio PUT error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}

// Delete from portfolio
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "وارد نشده‌اید" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const assetSlug = searchParams.get("assetSlug");

    if (!assetSlug) {
      return NextResponse.json(
        { success: false, message: "شناسه دارایی الزامی است" },
        { status: 400 }
      );
    }

    await prisma.portfolio.delete({
      where: {
        userId_assetSlug: { userId, assetSlug },
      },
    });

    return NextResponse.json({
      success: true,
      message: "از پرتفوی حذف شد",
    });
  } catch (error) {
    console.error("Portfolio DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}
