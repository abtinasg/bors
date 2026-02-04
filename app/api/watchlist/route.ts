import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { addWatchlistSchema } from "@/lib/validators";

// Get user's watchlist
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

    const watchlist = await prisma.watchlist.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: watchlist,
    });
  } catch (error) {
    console.error("Watchlist GET error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}

// Add asset to watchlist
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
    const validation = addWatchlistSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { assetSlug, assetType, assetName } = validation.data;

    // Check if already exists
    const existing = await prisma.watchlist.findUnique({
      where: {
        userId_assetSlug: { userId, assetSlug },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "این دارایی در واچ‌لیست شما وجود دارد" },
        { status: 400 }
      );
    }

    const watchlist = await prisma.watchlist.create({
      data: {
        userId,
        assetSlug,
        assetType,
        assetName,
      },
    });

    return NextResponse.json({
      success: true,
      data: watchlist,
      message: "به واچ‌لیست اضافه شد",
    });
  } catch (error) {
    console.error("Watchlist POST error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}

// Delete from watchlist
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

    await prisma.watchlist.delete({
      where: {
        userId_assetSlug: { userId, assetSlug },
      },
    });

    return NextResponse.json({
      success: true,
      message: "از واچ‌لیست حذف شد",
    });
  } catch (error) {
    console.error("Watchlist DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}
