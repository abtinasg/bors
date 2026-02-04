"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "phone" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  // شروع تایمر برای ارسال مجدد
  const startCountdown = (seconds: number) => {
    setCountdown(seconds);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // درخواست ارسال OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (data.success) {
        setStep("otp");
        startCountdown(data.expiresIn || 120);
      } else {
        setError(data.message || "خطا در ارسال کد");
        if (data.waitSeconds) {
          startCountdown(data.waitSeconds);
        }
      }
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  // تایید OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/dashboard");
      } else {
        setError(data.message || "کد نادرست است");
      }
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  // ارسال مجدد OTP
  const handleResend = async () => {
    if (countdown > 0) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (data.success) {
        startCountdown(data.expiresIn || 120);
        setOtp("");
      } else {
        setError(data.message || "خطا در ارسال مجدد");
        if (data.waitSeconds) {
          startCountdown(data.waitSeconds);
        }
      }
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white flex items-center justify-center px-4 py-12">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative">
        {/* لوگو و برگشت */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-6 text-stone-500 hover:text-stone-900 transition-colors">
            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            بازگشت به صفحه اصلی
          </a>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center font-bold text-white text-2xl shadow-lg shadow-emerald-600/20">
              B
            </div>
            <span className="text-2xl font-bold text-stone-800">برس</span>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">
            {step === "phone" ? "ورود به حساب" : "تایید شماره موبایل"}
          </h1>
          <p className="text-stone-500">
            {step === "phone" 
              ? "شماره موبایل خود را وارد کنید" 
              : `کد ارسال شده به ${phone} را وارد کنید`}
          </p>
        </div>

        {/* فرم */}
        <div className="bg-white border border-stone-200/50 rounded-3xl p-8 shadow-xl shadow-stone-200/50">
          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-2">
                  شماره موبایل
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-left"
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  required
                  dir="ltr"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || countdown > 0}
                className="w-full px-6 py-4 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-all font-medium text-lg shadow-lg shadow-stone-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    در حال ارسال...
                  </span>
                ) : countdown > 0 ? (
                  `صبر کنید (${countdown} ثانیه)`
                ) : (
                  "دریافت کد تایید"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-stone-700 mb-2">
                  کد تایید ۶ رقمی
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full px-4 py-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-center text-2xl tracking-[0.5em] font-mono focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  placeholder="------"
                  maxLength={6}
                  required
                  dir="ltr"
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full px-6 py-4 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-all font-medium text-lg shadow-lg shadow-stone-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    در حال بررسی...
                  </span>
                ) : (
                  "ورود به داشبورد"
                )}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setOtp("");
                    setError("");
                  }}
                  className="text-stone-500 hover:text-stone-900 transition-colors"
                >
                  تغییر شماره
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || loading}
                  className={`transition-colors ${
                    countdown > 0 ? "text-stone-400" : "text-emerald-600 hover:text-emerald-700"
                  }`}
                >
                  {countdown > 0 ? `ارسال مجدد (${countdown})` : "ارسال مجدد کد"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-stone-500 text-sm">
              حساب کاربری ندارید؟ با وارد کردن شماره موبایل، حساب شما ساخته می‌شود
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
