"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  RefreshCw,
  ChevronDown,
  Calculator,
} from "lucide-react";
import DashboardNav from "@/components/DashboardNav";

interface User {
  id: string;
  phone: string;
  name: string | null;
}

interface CurrencyRate {
  slug: string;
  name: string;
  price: number;
  change_percent: number;
}

interface CryptoRate {
  slug: string;
  name: string;
  price: number;
  change_percent: number;
}

const CURRENCIES = [
  { slug: "IRR", name: "تومان", icon: "🇮🇷", type: "base" },
  { slug: "USD", name: "دلار آمریکا", icon: "🇺🇸", type: "currency" },
  { slug: "EUR", name: "یورو", icon: "🇪🇺", type: "currency" },
  { slug: "GBP", name: "پوند انگلیس", icon: "🇬🇧", type: "currency" },
  { slug: "AED", name: "درهم امارات", icon: "🇦🇪", type: "currency" },
  { slug: "TRY", name: "لیر ترکیه", icon: "🇹🇷", type: "currency" },
  { slug: "CAD", name: "دلار کانادا", icon: "🇨🇦", type: "currency" },
  { slug: "AUD", name: "دلار استرالیا", icon: "🇦🇺", type: "currency" },
  { slug: "CNY", name: "یوان چین", icon: "🇨🇳", type: "currency" },
  { slug: "CHF", name: "فرانک سوئیس", icon: "🇨🇭", type: "currency" },
  { slug: "TALA_18", name: "طلای ۱۸ عیار (گرم)", icon: "🥇", type: "gold" },
  { slug: "TALA_24", name: "طلای ۲۴ عیار (گرم)", icon: "🥇", type: "gold" },
  { slug: "TALA_MESGHAL", name: "مثقال طلا", icon: "⚖️", type: "gold" },
  { slug: "SEKE_EMAMI", name: "سکه امامی", icon: "🪙", type: "coin" },
  { slug: "SEKE_BAHAR", name: "سکه بهار آزادی", icon: "🪙", type: "coin" },
  { slug: "SEKE_NIM", name: "نیم سکه", icon: "🪙", type: "coin" },
  { slug: "SEKE_ROB", name: "ربع سکه", icon: "🪙", type: "coin" },
  { slug: "BTC", name: "بیت‌کوین", icon: "₿", type: "crypto" },
  { slug: "ETH", name: "اتریوم", icon: "Ξ", type: "crypto" },
  { slug: "TETHER", name: "تتر", icon: "₮", type: "crypto" },
];

export default function ConverterPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("IRR");
  const [result, setResult] = useState<number | null>(null);

  const [currencyRates, setCurrencyRates] = useState<Record<string, CurrencyRate>>({});
  const [cryptoRates, setCryptoRates] = useState<Record<string, CryptoRate>>({});
  const [ratesLoading, setRatesLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        } else {
          router.push("/auth/login");
        }
      } catch {
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const fetchRates = useCallback(async () => {
    setRatesLoading(true);
    try {
      const currRes = await fetch("/api/currency");
      const currData = await currRes.json();
      if (currData.success && currData.data) {
        setCurrencyRates(currData.data);
      }

      const cryptoRes = await fetch("/api/crypto");
      const cryptoData = await cryptoRes.json();
      if (cryptoData.success && cryptoData.crypto) {
        const cryptoMap: Record<string, CryptoRate> = {};
        cryptoData.crypto.forEach((c: { symbol: string; nameFa?: string; name: string; price: number; change24h?: number }) => {
          cryptoMap[c.symbol] = {
            slug: c.symbol,
            name: c.nameFa || c.name,
            price: c.price,
            change_percent: c.change24h || 0,
          };
        });
        setCryptoRates(cryptoMap);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching rates:", error);
    } finally {
      setRatesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, [fetchRates]);

  const getRateInToman = useCallback((slug: string): number | null => {
    if (slug === "IRR") return 1;

    const currency = CURRENCIES.find((c) => c.slug === slug);
    if (currency?.type === "crypto" && slug !== "TETHER") {
      const crypto = cryptoRates[slug];
      const usdRate = currencyRates["USD"]?.price;
      if (crypto && usdRate) {
        return crypto.price * usdRate;
      }
      return null;
    }

    if (currencyRates[slug]) {
      return currencyRates[slug].price;
    }

    return null;
  }, [currencyRates, cryptoRates]);

  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    if (numAmount <= 0) {
      setResult(null);
      return;
    }

    const fromRate = getRateInToman(fromCurrency);
    const toRate = getRateInToman(toCurrency);

    if (fromRate && toRate) {
      const inToman = numAmount * fromRate;
      const converted = inToman / toRate;
      setResult(converted);
    } else {
      setResult(null);
    }
  }, [amount, fromCurrency, toCurrency, getRateInToman]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)} میلیارد`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)} میلیون`;
    }
    return new Intl.NumberFormat("fa-IR", {
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const getCurrency = (slug: string) => CURRENCIES.find((c) => c.slug === slug);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
          <span className="text-slate-500 text-sm">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-[var(--font-vazir)]">
      {/* Navigation */}
      <DashboardNav user={user} onLogout={handleLogout} />

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium mb-4">
            <Calculator className="w-4 h-4" strokeWidth={1.5} />
            محاسبه‌گر ارز
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">تبدیل ارز و دارایی</h1>
          <p className="text-slate-500 text-sm">تبدیل ارز، طلا، سکه و رمزارز با نرخ لحظه‌ای</p>
        </div>

        {/* Converter Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          {/* From */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">از</label>
            <div className="flex gap-3">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-lg text-lg font-bold focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                placeholder="مقدار"
              />
              <div className="relative">
                <button
                  onClick={() => setFromOpen(!fromOpen)}
                  className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-lg min-w-[180px] hover:bg-slate-50 transition-all"
                >
                  <span className="text-2xl">{getCurrency(fromCurrency)?.icon}</span>
                  <span className="font-medium text-slate-900">{getCurrency(fromCurrency)?.name}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 mr-auto" />
                </button>
                {fromOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c.slug}
                        onClick={() => {
                          setFromCurrency(c.slug);
                          setFromOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-50 transition-all"
                      >
                        <span className="text-xl">{c.icon}</span>
                        <span className="text-sm font-medium text-slate-900">{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={swapCurrencies}
              className="p-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all"
            >
              <ArrowLeftRight className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
            </button>
          </div>

          {/* To */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">به</label>
            <div className="flex gap-3">
              <div className="flex-1 px-4 py-3 border border-slate-200 rounded-lg bg-slate-50">
                <div className="text-2xl font-bold text-slate-900">
                  {result !== null ? formatNumber(result) : "---"}
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setToOpen(!toOpen)}
                  className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-lg min-w-[180px] hover:bg-slate-50 transition-all"
                >
                  <span className="text-2xl">{getCurrency(toCurrency)?.icon}</span>
                  <span className="font-medium text-slate-900">{getCurrency(toCurrency)?.name}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 mr-auto" />
                </button>
                {toOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c.slug}
                        onClick={() => {
                          setToCurrency(c.slug);
                          setToOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-50 transition-all"
                      >
                        <span className="text-xl">{c.icon}</span>
                        <span className="text-sm font-medium text-slate-900">{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rate Info */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="text-sm text-slate-500">
              {lastUpdate && (
                <>
                  آخرین بروزرسانی: {lastUpdate.toLocaleTimeString("fa-IR")}
                </>
              )}
            </div>
            <button
              onClick={fetchRates}
              disabled={ratesLoading}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${ratesLoading ? "animate-spin" : ""}`} strokeWidth={1.5} />
              بروزرسانی
            </button>
          </div>
        </div>

        {/* Quick Convert */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">نرخ‌های محبوب</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { from: "USD", to: "IRR" },
              { from: "EUR", to: "IRR" },
              { from: "TALA_18", to: "IRR" },
              { from: "SEKE_EMAMI", to: "IRR" },
            ].map(({ from, to }) => {
              const fromRate = getRateInToman(from);
              const toRate = getRateInToman(to);
              const rate = fromRate && toRate ? fromRate / toRate : null;

              return (
                <div
                  key={`${from}-${to}`}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getCurrency(from)?.icon}</span>
                    <span className="font-medium text-slate-900">{getCurrency(from)?.name}</span>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-900">
                      {rate ? formatNumber(rate) : "---"}
                    </div>
                    <div className="text-xs text-slate-400">تومان</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
