"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import AssetIcon from "@/components/AssetIcon";

interface CurrencyData {
  slug: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  max_price: number;
  min_price: number;
  last_update: string;
  change_percent_24h: number;
}

interface CurrencyAPIResponse {
  success: boolean;
  data: Record<string, CurrencyData>;
  timestamp: string;
  error?: string;
}

const getAssetType = (slug: string): string => {
  if (["USD", "EUR", "GBP", "AED", "TRY", "CHF", "CAD", "AUD", "JPY", "CNY", "SAR", "KWD", "QAR", "RUB", "INR", "PKR", "AFN", "IQD", "OMR", "BHD", "NZD", "NOK", "SEK", "DKK", "HKD", "SGD", "MYR", "THB", "KRW", "GEL", "AZN", "AMD", "KGS", "TJS", "TMT", "SYP"].includes(slug)) {
    return "currency";
  }
  if (["geram18", "geram24", "mesghal", "ONS", "ONSNOGHRE", "PALA", "ONSPALA", "OIL", "TALA_18", "TALA_24", "TALA_MESGHAL"].includes(slug)) {
    return "gold";
  }
  if (["sekee", "sekeb", "nim", "rob", "gerami", "emami", "bahar", "SEKE_EMAMI", "SEKE_BAHAR", "SEKE_NIM", "SEKE_ROB", "SEKE_GERAMI"].includes(slug)) {
    return "coin";
  }
  return "currency";
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("fa-IR").format(Math.round(num));
};

interface CurrencyCardProps {
  currency: CurrencyData;
  index: number;
}

function CurrencyCard({ currency, index }: CurrencyCardProps) {
  const assetType = getAssetType(currency.slug);
  const changePercent = currency.change_percent ?? 0;
  const isPositive = changePercent >= 0;

  return (
    <div 
      className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-all"
      style={{ animationDelay: `${index * 0.02}s` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <AssetIcon assetSlug={currency.slug} assetType={assetType} size="lg" />
          <div>
            <div className="font-bold text-slate-900 text-sm">{currency.name}</div>
            <div className="text-xs text-slate-400">{currency.slug}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-sm font-bold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
            {isPositive ? "↑" : "↓"}
          </span>
          <span className={`text-sm font-bold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
            {Math.abs(changePercent).toFixed(2)}٪
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        <div className="text-2xl font-bold text-slate-900">
          {formatNumber(currency.price)}
        </div>
        <div className="text-xs text-slate-400 mt-0.5">تومان</div>
      </div>

      {/* Min/Max */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2">
          <div className="text-[10px] text-slate-400 mb-0.5">بیشترین</div>
          <div className="text-xs font-bold text-slate-700">{formatNumber(currency.max_price)}</div>
        </div>
        <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2">
          <div className="text-[10px] text-slate-400 mb-0.5">کمترین</div>
          <div className="text-xs font-bold text-slate-700">{formatNumber(currency.min_price)}</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <div className="text-[10px] text-slate-400">
          تغییر ۲۴ ساعته: 
          <span className={`mr-1 font-bold ${currency.change_percent_24h >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {currency.change_percent_24h >= 0 ? "+" : ""}{(currency.change_percent_24h ?? 0).toFixed(2)}٪
          </span>
        </div>
        <div className="text-[10px] text-slate-400">{currency.last_update}</div>
      </div>
    </div>
  );
}

interface CurrencyPricesProps {
  view?: "grid" | "table";
  filter?: "all" | "currency" | "gold" | "coin" | "crypto";
  limit?: number;
}

const CURRENCY_CATEGORIES: Record<string, string[]> = {
  currency: ["USD", "EUR", "GBP", "AED", "TRY", "CHF", "CAD", "AUD", "CNY", "JPY", "SAR", "KWD", "QAR", "RUB", "INR", "PKR", "AFN", "IQD", "OMR", "BHD", "NZD", "NOK", "SEK", "DKK", "HKD", "SGD", "MYR", "THB", "KRW", "GEL", "AZN", "AMD", "KGS", "TJS", "TMT", "SYP"],
  gold: ["TALA_18", "TALA_24", "TALA_MESGHAL", "ONS", "ONSNOGHRE", "PALA", "ONSPALA", "OIL"],
  coin: ["SEKE_EMAMI", "SEKE_BAHAR", "SEKE_NIM", "SEKE_ROB", "SEKE_GERAMI"],
  crypto: ["TETHER"],
};

export default function CurrencyPrices({ view = "grid", filter = "all", limit }: CurrencyPricesProps) {
  const [currencies, setCurrencies] = useState<CurrencyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/currency");
      const json: CurrencyAPIResponse = await res.json();

      if (json.success && json.data) {
        let currencyList = Object.values(json.data);

        if (filter !== "all") {
          const allowedSlugs = CURRENCY_CATEGORIES[filter] || [];
          currencyList = currencyList.filter((c) => allowedSlugs.includes(c.slug));
        }

        // Pin important currencies
        const pinnedSlugs = ["USD", "EUR", "GBP", "AED"];
        currencyList.sort((a, b) => {
          const aIndex = pinnedSlugs.indexOf(a.slug);
          const bIndex = pinnedSlugs.indexOf(b.slug);
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return 0;
        });

        if (limit) currencyList = currencyList.slice(0, limit);

        setCurrencies(currencyList);
        setLastUpdate(new Date(json.timestamp).toLocaleTimeString("fa-IR"));
      } else {
        setError(json.error || "خطا در دریافت اطلاعات");
      }
    } catch {
      setError("خطا در برقراری ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }, [filter, limit]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading && currencies.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <button onClick={fetchData} className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm">
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
            <span className="text-lg">💹</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">قیمت لحظه‌ای ارز و سکه</h2>
            <div className="text-xs text-slate-400">آخرین بروزرسانی: {lastUpdate}</div>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} strokeWidth={1.5} />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currencies.map((currency, index) => (
          <CurrencyCard key={currency.slug} currency={currency} index={index} />
        ))}
      </div>
    </div>
  );
}
