import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      // کوکی نامعتبر - پاک کردن
      const response = NextResponse.json(
        { success: false, message: "کاربر یافت نشد" },
        { status: 401 }
      );
      response.cookies.delete("userId");
      return response;
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}
