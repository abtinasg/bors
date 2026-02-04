"use client";

import { useState, useEffect, useCallback } from "react";
import { Gem, Coins, RefreshCw, TrendingUp, TrendingDown, AlertCircle, Info } from "lucide-react";

interface CurrencyData {
  slug: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
}

interface BubbleData {
  name: string;
  slug: string;
  price: number;
  intrinsicValue: number;
  bubble: number;
  bubblePercent: number;
  goldWeight: number;
  change_percent: number;
}

// وزن طلای خالص سکه‌ها (بر حسب گرم طلای ۱۸ عیار)
// سکه‌های ایرانی ۲۲ عیار هستند (۹۱.۶۶٪ طلا)
// وزن طلای خالص = وزن سکه × (۲۲/۲۴)
const COIN_WEIGHTS: Record<string, { name: string; weight18: number; description: string }> = {
  SEKE_EMAMI: {
    name: "سکه امامی",
    weight18: 8.133 * (22/24) * (24/18), // تبدیل به معادل طلای ۱۸ عیار
    description: "۸.۱۳۳ گرم طلای ۲۲ عیار"
  },
  SEKE_BAHAR: {
    name: "سکه بهار آزادی",
    weight18: 8.133 * (22/24) * (24/18),
    description: "۸.۱۳۳ گرم طلای ۲۲ عیار"
  },
  SEKE_NIM: {
    name: "نیم سکه",
    weight18: 4.066 * (22/24) * (24/18),
    description: "۴.۰۶۶ گرم طلای ۲۲ عیار"
  },
  SEKE_ROB: {
    name: "ربع سکه",
    weight18: 2.033 * (22/24) * (24/18),
    description: "۲.۰۳۳ گرم طلای ۲۲ عیار"
  },
  SEKE_GERAMI: {
    name: "سکه گرمی",
    weight18: 1.0 * (22/24) * (24/18),
    description: "۱ گرم طلای ۲۲ عیار"
  }
};

// فرمت عدد به فارسی
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("fa-IR").format(Math.round(num));
};

const formatPercent = (num: number): string => {
  const sign = num >= 0 ? "+" : "";
  return `${sign}${num.toFixed(2).replace(".", "٫")}٪`;
};

export default function GoldCoinBubble() {
  const [prices, setPrices] = useState<Record<string, CurrencyData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const fetchPrices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/currency");
      const data = await res.json();
      if (data.success) {
        setPrices(data.data);
      } else {
        setError("خطا در دریافت قیمت‌ها");
      }
    } catch (err) {
      console.error("Error fetching prices:", err);
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    // بروزرسانی هر ۶۰ ثانیه
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  // محاسبه حباب سکه‌ها
  const calculateBubbleData = (): BubbleData[] => {
    const gold18Price = prices["TALA_18"]?.price || 0;
    
    if (gold18Price === 0) return [];

    const bubbleData: BubbleData[] = [];

    for (const [slug, coinInfo] of Object.entries(COIN_WEIGHTS)) {
      const coinPrice = prices[slug]?.price;
      if (!coinPrice) continue;

      // ارزش ذاتی = وزن طلای ۱۸ عیار × قیمت هر گرم طلای ۱۸ عیار
      const intrinsicValue = coinInfo.weight18 * gold18Price;
      const bubble = coinPrice - intrinsicValue;
      const bubblePercent = intrinsicValue > 0 ? (bubble / intrinsicValue) * 100 : 0;

      bubbleData.push({
        name: coinInfo.name,
        slug,
        price: coinPrice,
        intrinsicValue,
        bubble,
        bubblePercent,
        goldWeight: coinInfo.weight18,
        change_percent: prices[slug]?.change_percent || 0
      });
    }

    return bubbleData;
  };

  const bubbleData = calculateBubbleData();
  const gold18Price = prices["TALA_18"]?.price || 0;
  const gold18Change = prices["TALA_18"]?.change_percent || 0;

  if (loading && Object.keys(prices).length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-stone-200">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-stone-200">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button
            onClick={fetchPrices}
            className="mr-auto px-3 py-1 bg-red-50 rounded-lg text-sm hover:bg-red-100 transition-colors"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Coins className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">حباب طلا و سکه</h2>
            <p className="text-xs text-stone-500">اختلاف قیمت بازار با ارزش ذاتی</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            title="راهنما"
          >
            <Info className="w-5 h-5" />
          </button>
          <button
            onClick={fetchPrices}
            disabled={loading}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Info Box */}
      {showInfo && (
        <div className="mb-4 p-4 bg-amber-50 rounded-xl text-sm text-amber-800">
          <p className="mb-2 font-medium">نحوه محاسبه حباب:</p>
          <p className="mb-1">• ارزش ذاتی سکه = وزن طلای سکه × قیمت طلای ۱۸ عیار</p>
          <p className="mb-1">• حباب = قیمت بازار - ارزش ذاتی</p>
          <p>• سکه‌های بهار آزادی و امامی از طلای ۲۲ عیار ساخته شده‌اند</p>
        </div>
      )}

      {/* Gold 18 Base Price */}
      <div className="mb-4 p-4 bg-gradient-to-l from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gem className="w-5 h-5 text-amber-600" />
            <div>
              <div className="text-sm text-stone-600">قیمت مبنا: طلای ۱۸ عیار</div>
              <div className="text-lg font-bold text-stone-900">
                {formatNumber(gold18Price)} <span className="text-sm font-normal text-stone-500">تومان/گرم</span>
              </div>
            </div>
          </div>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium ${
            gold18Change >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
          }`}>
            {gold18Change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {formatPercent(gold18Change)}
          </div>
        </div>
      </div>

      {/* Bubble Cards */}
      <div className="space-y-3">
        {bubbleData.map((item) => (
          <div
            key={item.slug}
            className="p-4 bg-stone-50 rounded-xl border border-stone-100 hover:bg-stone-100 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-stone-100 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="font-bold text-stone-900">{item.name}</div>
                  <div className="text-xs text-stone-500">
                    معادل {item.goldWeight.toFixed(2)} گرم طلای ۱۸ عیار
                  </div>
                </div>
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                item.change_percent >= 0 ? "text-emerald-600" : "text-red-600"
              }`}>
                {item.change_percent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {formatPercent(item.change_percent)}
              </div>
            </div>

            {/* Price Details */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-white rounded-lg">
                <div className="text-xs text-stone-500 mb-1">قیمت بازار</div>
                <div className="font-bold text-stone-900 text-sm">{formatNumber(item.price)}</div>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <div className="text-xs text-stone-500 mb-1">ارزش ذاتی</div>
                <div className="font-bold text-stone-700 text-sm">{formatNumber(item.intrinsicValue)}</div>
              </div>
              <div className={`p-2 rounded-lg ${
                item.bubble >= 0 ? "bg-red-50" : "bg-emerald-50"
              }`}>
                <div className={`text-xs mb-1 ${
                  item.bubble >= 0 ? "text-red-600" : "text-emerald-600"
                }`}>حباب</div>
                <div className={`font-bold text-sm ${
                  item.bubble >= 0 ? "text-red-700" : "text-emerald-700"
                }`}>
                  {item.bubble >= 0 ? "+" : ""}{formatNumber(item.bubble)}
                </div>
              </div>
            </div>

            {/* Bubble Percentage Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-stone-500">درصد حباب</span>
                <span className={`font-bold ${
                  item.bubblePercent >= 0 ? "text-red-600" : "text-emerald-600"
                }`}>
                  {formatPercent(item.bubblePercent)}
                </span>
              </div>
              <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    item.bubblePercent >= 0 ? "bg-red-500" : "bg-emerald-500"
                  }`}
                  style={{ 
                    width: `${Math.min(Math.abs(item.bubblePercent), 50)}%`,
                    marginLeft: item.bubblePercent < 0 ? `${50 - Math.abs(item.bubblePercent)}%` : "50%"
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-stone-400 mt-1">
                <span>-۵۰٪</span>
                <span>۰</span>
                <span>+۵۰٪</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {bubbleData.length === 0 && !loading && (
        <div className="text-center py-8 text-stone-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-stone-400" />
          <p>اطلاعات قیمتی در دسترس نیست</p>
        </div>
      )}

      {/* Summary */}
      {bubbleData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-stone-200">
          <div className="text-xs text-stone-500 text-center">
            آخرین بروزرسانی: {new Date().toLocaleTimeString("fa-IR")}
          </div>
        </div>
      )}
    </div>
  );
}
