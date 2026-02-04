/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import "server-only";

const Kavenegar = require("kavenegar");

interface KavenegarEntry {
  messageid: number;
  message: string;
  status: number;
  statustext: string;
  sender: string;
  receptor: string;
  date: number;
  cost: number;
}

// Create Kavenegar API instance
const api = Kavenegar.KavenegarApi({
  apikey: process.env.KAVENEGAR_API_KEY,
});

interface SendOtpResult {
  success: boolean;
  message?: string;
  code?: string;
}

/**
 * ارسال کد OTP با استفاده از کاوه‌نگار
 * همیشه SMS واقعی ارسال می‌کند
 */
export async function sendOtp(phone: string, code: string): Promise<SendOtpResult> {
  const message = `کد ورود شما به برس: ${code}`;
  
  console.log(`\n========================================`);
  console.log(`📱 Sending SMS via Kavenegar`);
  console.log(`========================================`);
  console.log(`📞 Phone: ${phone}`);
  console.log(`🔐 Code: ${code}`);
  console.log(`========================================\n`);

  return new Promise((resolve) => {
    api.Send(
      {
        message,
        sender: process.env.KAVENEGAR_SENDER || "2000660110",
        receptor: phone,
      },
      (response: KavenegarEntry[], status: number) => {
        if (status === 200) {
          console.log("✅ SMS sent successfully:", response);
          resolve({ success: true, message: "پیامک ارسال شد" });
        } else {
          console.error("❌ Failed to send SMS. Status:", status);
          resolve({ success: false, message: "خطا در ارسال پیامک" });
        }
      }
    );
  });
}

/**
 * تولید کد OTP ۶ رقمی
 */
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * اعتبارسنجی فرمت شماره موبایل ایران
 */
export function validateIranPhone(phone: string): boolean {
  // فرمت‌های قابل قبول: 09123456789, +989123456789, 989123456789
  const iranPhoneRegex = /^(\+98|98|0)?9\d{9}$/;
  return iranPhoneRegex.test(phone);
}

/**
 * نرمال‌سازی شماره موبایل به فرمت 09xxxxxxxxx
 */
export function normalizePhone(phone: string): string {
  // حذف کاراکترهای اضافی
  let normalized = phone.replace(/[\s\-\(\)]/g, "");
  
  // تبدیل به فرمت استاندارد
  if (normalized.startsWith("+98")) {
    normalized = "0" + normalized.slice(3);
  } else if (normalized.startsWith("98")) {
    normalized = "0" + normalized.slice(2);
  } else if (!normalized.startsWith("0")) {
    normalized = "0" + normalized;
  }
  
  return normalized;
}
