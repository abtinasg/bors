import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizePhone } from "@/lib/sms";
import { verifyOtpSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // اعتبارسنجی ورودی
    const validation = verifyOtpSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const phone = normalizePhone(validation.data.phone);
    const { code } = validation.data;

    // پیدا کردن OTP معتبر
    const otp = await prisma.otp.findFirst({
      where: {
        phone,
        code,
        used: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return NextResponse.json(
        { success: false, message: "کد تایید نامعتبر یا منقضی شده است" },
        { status: 400 }
      );
    }

    // علامت‌گذاری OTP به عنوان استفاده شده
    await prisma.otp.update({
      where: { id: otp.id },
      data: { used: true },
    });

    // پیدا کردن یا ساختن کاربر
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { phone },
      });
    }

    // اتصال OTP به کاربر
    await prisma.otp.update({
      where: { id: otp.id },
      data: { userId: user.id },
    });

    // در اینجا می‌تونید JWT token یا session بسازید
    // فعلاً فقط اطلاعات کاربر رو برمی‌گردونیم
    
    const response = NextResponse.json({
      success: true,
      message: "ورود موفق",
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        isNewUser: !user.name, // اگر اسم ندارد، کاربر جدید است
      },
    });

    // ست کردن کوکی ساده برای session (در production از JWT استفاده کنید)
    response.cookies.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // ۷ روز
    });

    return response;

  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}
