import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendOtp, generateOtpCode, normalizePhone } from "@/lib/sms";
import { phoneSchema } from "@/lib/validators";

// مدت اعتبار OTP: ۲ دقیقه
const OTP_EXPIRY_MINUTES = 2;
// حداقل فاصله بین درخواست‌ها: ۶۰ ثانیه
const OTP_COOLDOWN_SECONDS = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // اعتبارسنجی ورودی
    const validation = phoneSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.issues?.[0]?.message || "شماره تلفن نامعتبر است";
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: 400 }
      );
    }

    const phone = normalizePhone(validation.data.phone);

    // بررسی cooldown (جلوگیری از spam)
    const recentOtp = await prisma.otp.findFirst({
      where: {
        phone,
        createdAt: {
          gte: new Date(Date.now() - OTP_COOLDOWN_SECONDS * 1000),
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentOtp) {
      const waitSeconds = Math.ceil(
        (recentOtp.createdAt.getTime() + OTP_COOLDOWN_SECONDS * 1000 - Date.now()) / 1000
      );
      return NextResponse.json(
        { 
          success: false, 
          message: `لطفاً ${waitSeconds} ثانیه صبر کنید`,
          waitSeconds 
        },
        { status: 429 }
      );
    }

    // تولید کد OTP
    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // غیرفعال کردن OTPهای قبلی
    await prisma.otp.updateMany({
      where: { phone, used: false },
      data: { used: true },
    });

    // ذخیره OTP جدید
    await prisma.otp.create({
      data: {
        phone,
        code,
        expiresAt,
      },
    });

    // ارسال پیامک
    const smsResult = await sendOtp(phone, code);
    
    if (!smsResult.success) {
      return NextResponse.json(
        { success: false, message: smsResult.message || "خطا در ارسال پیامک" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "کد تایید ارسال شد",
      expiresIn: OTP_EXPIRY_MINUTES * 60, // ثانیه
    });

  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}
