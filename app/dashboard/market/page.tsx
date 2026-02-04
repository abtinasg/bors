"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Briefcase,
  LineChart,
  LayoutGrid,
  List,
  RefreshCw,
  Car,
  DollarSign,
  Gem,
  Coins,
  Bitcoin,
} from "lucide-react";
import CurrencyPrices from "@/components/CurrencyPrices";
import DashboardNav from "@/components/DashboardNav";

interface User {
  id: string;
  phone: string;
  name: string | null;
}

interface StockData {
  slug: string;
  name: string;
  fullName: string;
  closePrice: number;
  closePriceChange: number;
  closePriceChangePercent: number;
}

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  nameFa: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
}

interface CarData {
  unique_id: string;
  name: string;
  type: string;
  model: string;
  year: number;
  price: number;
  change_percent: number;
}

type TabType = "all" | "currency" | "gold" | "coin" | "stock" | "auto" | "crypto";

export default function MarketPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [stockData, setStockData] = useState<StockData[]>([]);
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [carData, setCarData] = useState<CarData[]>([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [cryptoLoading, setCryptoLoading] = useState(false);
  const [carLoading, setCarLoading] = useState(false);

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

  const fetchStocks = useCallback(async (category?: string) => {
    setStockLoading(true);
    try {
      const url = category ? `/api/stock?category=${category}` : `/api/stock?popular=true`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.stocks) {
        setStockData(data.stocks);
      }
    } catch (error) {
      console.error("Error fetching stocks:", error);
    } finally {
      setStockLoading(false);
    }
  }, []);

  const fetchCrypto = useCallback(async () => {
    setCryptoLoading(true);
    try {
      const res = await fetch("/api/crypto");
      const data = await res.json();
      if (data.success && data.crypto) {
        setCryptoData(data.crypto);
      }
    } catch (error) {
      console.error("Error fetching crypto:", error);
    } finally {
      setCryptoLoading(false);
    }
  }, []);

  const fetchCars = useCallback(async () => {
    setCarLoading(true);
    try {
      const res = await fetch("/api/car");
      const data = await res.json();
      if (data.success && data.data) {
        // data.data is Record<string, CarData>
        const cars = Object.values(data.data) as CarData[];
        // Sort by price descending and limit to 24
        const sortedCars = cars.sort((a, b) => b.price - a.price).slice(0, 24);
        setCarData(sortedCars);
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
    } finally {
      setCarLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "stock") {
      fetchStocks();
    } else if (activeTab === "auto") {
      fetchCars();
    } else if (activeTab === "crypto") {
      fetchCrypto();
    }
  }, [activeTab, fetchStocks, fetchCars, fetchCrypto]);

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

  const marketTabs = [
    { id: "all", label: "همه", icon: LayoutGrid },
    { id: "currency", label: "ارز", icon: DollarSign },
    { id: "gold", label: "طلا", icon: Gem },
    { id: "coin", label: "سکه", icon: Coins },
    { id: "stock", label: "بورس", icon: TrendingUp },
    { id: "auto", label: "خودرو", icon: Car },
    { id: "crypto", label: "رمزارز", icon: Bitcoin },
  ];

  const formatNumber = (num: number) => new Intl.NumberFormat("fa-IR").format(Math.round(num));

  const renderStockCard = (stock: StockData, index: number) => {
    const isPositive = stock.closePriceChangePercent >= 0;
    return (
      <div
        key={stock.slug}
        className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-all"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
              {stock.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{stock.name}</h3>
              <p className="text-xs text-slate-400 truncate max-w-[120px]">{stock.fullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className={`text-sm font-bold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
              {isPositive ? "↑" : "↓"}
            </span>
            <span className={`text-sm font-bold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
              {Math.abs(stock.closePriceChangePercent).toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 mb-1">قیمت پایانی</p>
          <p className="text-xl font-bold text-slate-900">
            {formatNumber(stock.closePrice)} <span className="text-xs font-normal text-slate-400">ریال</span>
          </p>
        </div>
      </div>
    );
  };

  const renderCryptoCard = (crypto: CryptoData, index: number) => {
    const isPositive = crypto.change24h >= 0;
    return (
      <div
        key={crypto.id}
        className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-all"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
              {crypto.symbol.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{crypto.nameFa}</h3>
              <p className="text-xs text-slate-400">{crypto.symbol.toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className={`text-sm font-bold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
              {isPositive ? "↑" : "↓"}
            </span>
            <span className={`text-sm font-bold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
              {Math.abs(crypto.change24h).toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 mb-1">قیمت</p>
          <p className="text-xl font-bold text-slate-900">
            ${crypto.price.toLocaleString("en-US", { maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    );
  };

  const renderCarCard = (car: CarData, index: number) => {
    const isPositive = car.change_percent >= 0;
    return (
      <div
        key={car.unique_id}
        className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-all"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Car className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight">{car.name}</h3>
              <p className="text-xs text-slate-400">{car.year}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className={`text-sm font-bold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
              {isPositive ? "↑" : "↓"}
            </span>
            <span className={`text-sm font-bold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
              {Math.abs(car.change_percent).toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 mb-1">قیمت</p>
          <p className="text-xl font-bold text-slate-900">
            {formatNumber(car.price)} <span className="text-xs font-normal text-slate-400">تومان</span>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-[var(--font-vazir)]">
      {/* Navigation */}
      <DashboardNav user={user} onLogout={handleLogout} />

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center">
              <LineChart className="w-6 h-6 text-slate-600" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">بازار</h1>
              <p className="text-sm text-slate-500 mt-0.5">قیمت لحظه‌ای ارز، طلا، سکه و رمزارز</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                <LayoutGrid className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                <List className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Market Tabs */}
        <div className="bg-white rounded-xl p-2 border border-slate-200 mb-8">
          <div className="flex items-center gap-1 overflow-x-auto">
            {marketTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-slate-900 text-white"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {activeTab === "all" && <CurrencyPrices view={viewMode} />}
        {activeTab === "currency" && <CurrencyPrices view={viewMode} filter="currency" />}
        {activeTab === "gold" && <CurrencyPrices view={viewMode} filter="gold" />}
        {activeTab === "coin" && <CurrencyPrices view={viewMode} filter="coin" />}

        {activeTab === "stock" && (
          <div>
            {stockLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {stockData.map((stock, index) => renderStockCard(stock, index))}
              </div>
            )}
          </div>
        )}

        {activeTab === "auto" && (
          <div>
            {carLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {carData.map((car, index) => renderCarCard(car, index))}
              </div>
            )}
          </div>
        )}

        {activeTab === "crypto" && (
          <div>
            {cryptoLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {cryptoData.map((crypto, index) => renderCryptoCard(crypto, index))}
              </div>
            )}
          </div>
        )}
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
