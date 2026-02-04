import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { addTransactionSchema } from "@/lib/validators";

// GET - Get user's transactions
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "لطفاً وارد شوید" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const assetSlug = searchParams.get("assetSlug");
    const assetType = searchParams.get("assetType");
    const type = searchParams.get("type"); // buy or sell
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = searchParams.get("limit");

    // Build where clause
    const where: {
      userId: string;
      assetSlug?: string;
      assetType?: string;
      type?: string;
      date?: { gte?: Date; lte?: Date };
    } = { userId };

    if (assetSlug) where.assetSlug = assetSlug;
    if (assetType) where.assetType = assetType;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const transactions = await db.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      take: limit ? parseInt(limit) : undefined,
    });

    // Calculate summary
    const summary = {
      totalBuy: transactions.filter(t => t.type === "buy").reduce((sum, t) => sum + t.totalValue, 0),
      totalSell: transactions.filter(t => t.type === "sell").reduce((sum, t) => sum + t.totalValue, 0),
      buyCount: transactions.filter(t => t.type === "buy").length,
      sellCount: transactions.filter(t => t.type === "sell").length,
    };

    return NextResponse.json({
      success: true,
      data: transactions,
      summary,
      count: transactions.length,
    });
  } catch (error) {
    console.error("Transaction GET error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت تراکنش‌ها" },
      { status: 500 }
    );
  }
}

// POST - Add new transaction
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "لطفاً وارد شوید" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = addTransactionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { assetSlug, assetType, assetName, type, quantity, price, date, note } = validation.data;
    const totalValue = quantity * price;

    // Create transaction
    const transaction = await db.transaction.create({
      data: {
        userId,
        assetSlug,
        assetType,
        assetName,
        type,
        quantity,
        price,
        totalValue,
        date: date ? new Date(date) : new Date(),
        note,
      },
    });

    // Update portfolio based on transaction
    const existingPortfolio = await db.portfolio.findUnique({
      where: { userId_assetSlug: { userId, assetSlug } },
    });

    if (type === "buy") {
      if (existingPortfolio) {
        // Update existing portfolio with new average price
        const newQuantity = existingPortfolio.quantity + quantity;
        const newTotalCost = (existingPortfolio.quantity * existingPortfolio.buyPrice) + totalValue;
        const newAvgPrice = newTotalCost / newQuantity;

        await db.portfolio.update({
          where: { id: existingPortfolio.id },
          data: {
            quantity: newQuantity,
            buyPrice: newAvgPrice,
          },
        });
      } else {
        // Create new portfolio entry
        await db.portfolio.create({
          data: {
            userId,
            assetSlug,
            assetType,
            assetName,
            quantity,
            buyPrice: price,
          },
        });
      }
    } else if (type === "sell" && existingPortfolio) {
      const newQuantity = existingPortfolio.quantity - quantity;
      if (newQuantity <= 0) {
        // Remove from portfolio
        await db.portfolio.delete({
          where: { id: existingPortfolio.id },
        });
      } else {
        // Update quantity
        await db.portfolio.update({
          where: { id: existingPortfolio.id },
          data: { quantity: newQuantity },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: transaction,
      message: type === "buy" ? "خرید ثبت شد" : "فروش ثبت شد",
    });
  } catch (error) {
    console.error("Transaction POST error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در ثبت تراکنش" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a transaction
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "لطفاً وارد شوید" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "شناسه تراکنش الزامی است" },
        { status: 400 }
      );
    }

    // Verify ownership
    const transaction = await db.transaction.findFirst({
      where: { id, userId },
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: "تراکنش یافت نشد" },
        { status: 404 }
      );
    }

    await db.transaction.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "تراکنش حذف شد",
    });
  } catch (error) {
    console.error("Transaction DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در حذف تراکنش" },
      { status: 500 }
    );
  }
}
