"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Layers,
  Target,
  Grid3X3,
  ChevronDown,
  Check,
  Loader2,
} from "lucide-react";
import DashboardNav from "@/components/DashboardNav";
import TechnicalChart from "@/components/TechnicalChart";

interface User {
  id: string;
  phone: string;
  name: string | null;
}

interface Asset {
  slug: string;
  name: string;
  icon: string;
}

interface PricePoint {
  date: string;
  price: number;
  high?: number;
  low?: number;
}

interface AnalysisData {
  asset: Asset;
  currentPrice: number;
  change: number;
  changePercent: number;
  historicalPrices: PricePoint[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  analysis: any;
  lastUpdate: string;
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("fa-IR").format(Math.round(num));
};

export default function AnalysisPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string>("USD");
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [showFibonacci, setShowFibonacci] = useState(true);
  const [showGann, setShowGann] = useState(false);
  const [showPRZ, setShowPRZ] = useState(true);
  const [period, setPeriod] = useState<number>(30);

  // Auth check
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

  // Fetch available assets
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await fetch("/api/analysis?list=true");
        const data = await res.json();
        if (data.success) {
          setAssets(data.data);
        }
      } catch (error) {
        console.error("Error fetching assets:", error);
      }
    };
    fetchAssets();
  }, []);

  // Fetch analysis data
  const fetchAnalysis = useCallback(async () => {
    if (!selectedAsset) return;
    
    setAnalysisLoading(true);
    try {
      const res = await fetch(`/api/analysis?slug=${selectedAsset}&days=${period}`);
      const data = await res.json();
      if (data.success) {
        setAnalysisData(data.data);
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
    } finally {
      setAnalysisLoading(false);
    }
  }, [selectedAsset, period]);

  useEffect(() => {
    if (user && selectedAsset) {
      fetchAnalysis();
    }
  }, [user, selectedAsset, period, fetchAnalysis]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

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

  const selectedAssetInfo = assets.find((a) => a.slug === selectedAsset);

  return (
    <div className="min-h-screen bg-slate-50 font-[var(--font-vazir)]">
      <DashboardNav user={user} onLogout={handleLogout} />

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-slate-600" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">تحلیل تکنیکال</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                فیبوناچی، گن و مناطق PRZ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Asset Selector */}
            <div className="relative">
              <button
                onClick={() => setShowAssetDropdown(!showAssetDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors min-w-[180px]"
              >
                {selectedAssetInfo && (
                  <>
                    <span className="text-lg">{selectedAssetInfo.icon}</span>
                    <span className="font-medium text-slate-900">
                      {selectedAssetInfo.name}
                    </span>
                  </>
                )}
                <ChevronDown className="w-4 h-4 text-slate-400 mr-auto" />
              </button>

              {showAssetDropdown && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                  {assets.map((asset) => (
                    <button
                      key={asset.slug}
                      onClick={() => {
                        setSelectedAsset(asset.slug);
                        setShowAssetDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${
                        selectedAsset === asset.slug ? "bg-slate-50" : ""
                      }`}
                    >
                      <span className="text-lg">{asset.icon}</span>
                      <span className="font-medium text-slate-900">{asset.name}</span>
                      {selectedAsset === asset.slug && (
                        <Check className="w-4 h-4 text-emerald-500 mr-auto" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Period Selector */}
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value={7}>۷ روز</option>
              <option value={14}>۱۴ روز</option>
              <option value={30}>۳۰ روز</option>
              <option value={60}>۶۰ روز</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchAnalysis}
              disabled={analysisLoading}
              className="p-2.5 border border-slate-200 bg-white text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <RefreshCw
                className={`w-5 h-5 ${analysisLoading ? "animate-spin" : ""}`}
                strokeWidth={1.5}
              />
            </button>
          </div>
        </div>

        {/* Tool Toggles */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setShowFibonacci(!showFibonacci)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showFibonacci
                ? "bg-purple-100 text-purple-700 border border-purple-200"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            <Target className="w-4 h-4" strokeWidth={1.5} />
            فیبوناچی
          </button>
          <button
            onClick={() => setShowGann(!showGann)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showGann
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            <Grid3X3 className="w-4 h-4" strokeWidth={1.5} />
            گن
          </button>
          <button
            onClick={() => setShowPRZ(!showPRZ)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showPRZ
                ? "bg-amber-100 text-amber-700 border border-amber-200"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" strokeWidth={1.5} />
            مناطق PRZ
          </button>
        </div>

        {/* Current Price Card */}
        {analysisData && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{analysisData.asset.icon}</span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {analysisData.asset.name}
                  </h2>
                  <p className="text-xs text-slate-500">
                    آخرین بروزرسانی: {analysisData.lastUpdate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-left">
                  <p className="text-xs text-slate-500">قیمت فعلی</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatNumber(analysisData.currentPrice)}
                    <span className="text-sm font-normal text-slate-400 mr-1">
                      تومان
                    </span>
                  </p>
                </div>

                <div
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                    analysisData.changePercent >= 0
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {analysisData.changePercent >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="font-bold">
                    {Math.abs(analysisData.changePercent).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chart & Analysis */}
        {analysisLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              <p className="text-slate-500">در حال تحلیل...</p>
            </div>
          </div>
        ) : analysisData ? (
          <TechnicalChart
            prices={analysisData.historicalPrices}
            analysis={analysisData.analysis}
            currentPrice={analysisData.currentPrice}
            assetName={analysisData.asset.name}
            showFibonacci={showFibonacci}
            showGann={showGann}
            showPRZ={showPRZ}
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">یک دارایی را انتخاب کنید</p>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-bold text-slate-900 mb-3">راهنما</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-purple-700 mb-2">فیبوناچی</h4>
              <p className="text-slate-500">
                سطوح اصلاحی ۲۳.۶٪، ۳۸.۲٪، ۵۰٪، ۶۱.۸٪ و ۷۸.۶٪ نقاط احتمالی حمایت
                و مقاومت هستند. سطح ۶۱.۸٪ (نسبت طلایی) مهم‌ترین سطح است.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-2">زوایای گن</h4>
              <p className="text-slate-500">
                زاویه ۱×۱ (۴۵ درجه) مهم‌ترین زاویه گن است. شکست این خط نشانه
                تغییر روند است. زوایای ۱×۲ و ۲×۱ نقاط کلیدی دیگر هستند.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-amber-700 mb-2">مناطق PRZ</h4>
              <p className="text-slate-500">
                مناطقی که چند سطح فیبوناچی و گن همگرا می‌شوند. هرچه تعداد
                همگرایی بیشتر باشد، احتمال بازگشت قیمت بیشتر است.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
