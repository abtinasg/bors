"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  X,
  Star,
  Eye,
  Search,
} from "lucide-react";
import AssetSelector from "@/components/AssetSelector";
import AssetIcon from "@/components/AssetIcon";
import DashboardNav from "@/components/DashboardNav";

interface User {
  id: string;
  phone: string;
  name: string | null;
}

interface WatchlistItem {
  id: string;
  assetSlug: string;
  assetType: string;
  assetName: string;
}

interface CurrencyData {
  slug: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  max_price: number;
  min_price: number;
  last_update: string;
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("fa-IR").format(Math.round(num));
};

export default function WatchlistPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [prices, setPrices] = useState<Record<string, CurrencyData>>({});
  const [pricesLoading, setPricesLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  const fetchWatchlist = useCallback(async () => {
    try {
      const res = await fetch("/api/watchlist");
      const data = await res.json();
      if (data.success) {
        setWatchlist(data.data);
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    }
  }, []);

  const fetchPrices = useCallback(async () => {
    try {
      setPricesLoading(true);
      const res = await fetch("/api/currency");
      const data = await res.json();
      if (data.success) {
        setPrices(data.data);
      }
    } catch (error) {
      console.error("Error fetching prices:", error);
    } finally {
      setPricesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchWatchlist();
      fetchPrices();
      const interval = setInterval(fetchPrices, 60000);
      return () => clearInterval(interval);
    }
  }, [user, fetchWatchlist, fetchPrices]);

  const handleDelete = async (assetSlug: string) => {
    try {
      const res = await fetch(`/api/watchlist?assetSlug=${assetSlug}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchWatchlist();
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const watchlistWithPrices = watchlist.map((item) => ({
    ...item,
    priceData: prices[item.assetSlug],
  }));

  const filteredWatchlist = watchlistWithPrices.filter((item) => {
    const matchesFilter = activeFilter === "all" || item.assetType === activeFilter;
    const matchesSearch =
      item.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.assetSlug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const gainersCount = watchlistWithPrices.filter(
    (item) => item.priceData && item.priceData.change_percent > 0
  ).length;
  const losersCount = watchlistWithPrices.filter(
    (item) => item.priceData && item.priceData.change_percent < 0
  ).length;

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

  const filters = [
    { id: "all", label: "همه" },
    { id: "currency", label: "ارز" },
    { id: "gold", label: "طلا" },
    { id: "coin", label: "سکه" },
    { id: "crypto", label: "رمزارز" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-[var(--font-vazir)]">
      {/* Navigation */}
      <DashboardNav user={user} onLogout={handleLogout} />

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-slate-600" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">واچ‌لیست</h1>
              <p className="text-sm text-slate-500 mt-0.5">دارایی‌های مورد علاقه خود را پیگیری کنید</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchPrices}
              disabled={pricesLoading}
              className="p-2.5 border border-slate-200 bg-white text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${pricesLoading ? "animate-spin" : ""}`} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium text-sm"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              افزودن به لیست
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{watchlist.length}</div>
            <div className="text-xs text-slate-400">تعداد واچ‌لیست</div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">{gainersCount}</span>
              <span className="text-sm font-bold text-emerald-600">↑</span>
            </div>
            <div className="text-xs text-slate-400">صعودی</div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">{losersCount}</span>
              <span className="text-sm font-bold text-red-600">↓</span>
            </div>
            <div className="text-xs text-slate-400">نزولی</div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{watchlist.length - gainersCount - losersCount}</div>
            <div className="text-xs text-slate-400">بدون تغییر</div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeFilter === filter.id
                      ? "bg-slate-900 text-white"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="جستجو..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 pr-10 pl-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Watchlist Grid */}
        {filteredWatchlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredWatchlist.map((item, index) => {
              const price = item.priceData;
              const isPositive = price ? price.change_percent >= 0 : true;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-all group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <AssetIcon assetSlug={item.assetSlug} assetType={item.assetType} size="lg" />
                      <div>
                        <div className="font-bold text-slate-900">{item.assetSlug}</div>
                        <div className="text-xs text-slate-400">{item.assetName}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(item.assetSlug)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>

                  {price ? (
                    <>
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-slate-900">
                          {formatNumber(price.price)}
                        </div>
                        <div className="text-xs text-slate-400">تومان</div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                          <span className={`text-sm font-bold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
                            {isPositive ? "↑" : "↓"}
                          </span>
                          <span className={`text-sm font-bold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
                            {Math.abs(price.change_percent).toFixed(2)}٪
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">{price.last_update}</div>
                      </div>
                    </>
                  ) : (
                    <div className="py-4 text-center text-slate-400 text-sm">
                      در حال دریافت قیمت...
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
            </div>
            <p className="text-slate-500 mb-4">
              {searchQuery ? "نتیجه‌ای یافت نشد" : "واچ‌لیست شما خالی است"}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm mx-auto"
            >
              <Plus className="w-4 h-4" />
              افزودن دارایی
            </button>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">افزودن به واچ‌لیست</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <AssetSelector
                onSelect={async (asset) => {
                  try {
                    const res = await fetch("/api/watchlist", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        assetSlug: asset.slug,
                        assetName: asset.name,
                        assetType: asset.type,
                      }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      fetchWatchlist();
                      setShowAddModal(false);
                    }
                  } catch (error) {
                    console.error("Error adding:", error);
                  }
                }}
                onClose={() => setShowAddModal(false)}
              />
            </div>
          </div>
        </div>
      )}

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
