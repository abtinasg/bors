"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Loader2,
  TrendingUp,
  TrendingDown,
  Trash2,
  Edit3,
  X,
  Briefcase,
  PieChart,
  CircleDollarSign,
  Layers,
  Wallet,
} from "lucide-react";
import AssetIcon from "@/components/AssetIcon";
import AssetSelector from "@/components/AssetSelector";
import DashboardNav from "@/components/DashboardNav";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface User {
  id: string;
  phone: string;
  name: string | null;
}

interface PortfolioItem {
  id: string;
  assetSlug: string;
  assetType: string;
  assetName: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  totalCost: number;
  totalValue: number;
  pnl: number;
  pnlPercent: number;
  change: number;
  changePercent: number;
  allocation: number;
  createdAt: string;
}

const CHART_COLORS = [
  "#64748b", "#94a3b8", "#475569", "#334155", "#1e293b", "#0f172a",
  "#78716c", "#57534e", "#44403c", "#292524", "#a8a29e", "#d6d3d1",
];

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("fa-IR").format(Math.round(num));
};

const formatPrice = (num: number): string => {
  if (Math.abs(num) >= 1000000000) {
    return `${(num / 1000000000).toFixed(1).replace(".", "٫")} میلیارد`;
  }
  if (Math.abs(num) >= 1000000) {
    return `${(num / 1000000).toFixed(1).replace(".", "٫")} میلیون`;
  }
  return formatNumber(num);
};

const formatPercent = (num: number | undefined): string => {
  if (num === undefined || num === null || isNaN(num)) return "۰٪";
  return `${Math.abs(num).toFixed(2).replace(".", "٫")}٪`;
};

type SortKey = "pnl" | "pnlPercent" | "totalValue" | "change" | "allocation";
type SortOrder = "asc" | "desc";

export default function PortfolioPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedAssetForAdd, setSelectedAssetForAdd] = useState<{
    slug: string;
    name: string;
    price: number;
  } | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("totalValue");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

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

  const fetchPortfolio = useCallback(async () => {
    try {
      const res = await fetch("/api/portfolio");
      const data = await res.json();
      if (data.success) {
        setPortfolio(data.data || []);
      }
    } catch (error) {
      console.error("Portfolio fetch error:", error);
    } finally {
      setPortfolioLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchPortfolio();
      const interval = setInterval(fetchPortfolio, 60000);
      return () => clearInterval(interval);
    }
  }, [user, fetchPortfolio]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("آیا از حذف این دارایی مطمئن هستید؟")) return;
    try {
      const res = await fetch(`/api/portfolio?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchPortfolio();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const sortedPortfolio = [...portfolio].sort((a, b) => {
    const multiplier = sortOrder === "desc" ? -1 : 1;
    return (a[sortKey] - b[sortKey]) * multiplier;
  });

  const totalValue = portfolio.reduce((sum, item) => sum + item.totalValue, 0);
  const totalCost = portfolio.reduce((sum, item) => sum + item.totalCost, 0);
  const totalPnl = portfolio.reduce((sum, item) => sum + item.pnl, 0);
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  const pieData = portfolio.map((item, index) => ({
    name: item.assetName,
    value: item.totalValue,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

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

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-slate-600" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">پرتفوی من</h1>
              <p className="text-sm text-slate-500 mt-0.5">{portfolio.length} دارایی</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            افزودن دارایی
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <PieChart className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {portfolioLoading ? "..." : formatPrice(totalValue)}
            </div>
            <div className="text-xs text-slate-400">ارزش کل</div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <CircleDollarSign className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {portfolioLoading ? "..." : formatPrice(Math.abs(totalPnl))}
              </span>
              <span className={`text-sm font-bold ${totalPnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {totalPnl >= 0 ? "↑" : "↓"}
              </span>
            </div>
            <div className="text-xs text-slate-400">سود/زیان کل</div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {portfolioLoading ? "..." : formatPercent(Math.abs(totalPnlPercent))}
              </span>
              <span className={`text-sm font-bold ${totalPnlPercent >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {totalPnlPercent >= 0 ? "↑" : "↓"}
              </span>
            </div>
            <div className="text-xs text-slate-400">بازدهی</div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {portfolioLoading ? "..." : portfolio.length}
            </div>
            <div className="text-xs text-slate-400">تعداد دارایی</div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Portfolio Chart */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-xl p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">توزیع دارایی‌ها</h2>
            {portfolio.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatNumber(value as number)}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontFamily: "inherit",
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <PieChart className="w-10 h-10 text-slate-300 mb-3" strokeWidth={1.5} />
                <p className="text-sm text-slate-400">داده‌ای برای نمایش وجود ندارد</p>
              </div>
            )}
            
            {/* Legend */}
            <div className="mt-4 space-y-2">
              {pieData.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-slate-400">{((item.value / totalValue) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio List */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">لیست دارایی‌ها</h2>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">مرتب‌سازی:</span>
                {[
                  { key: "totalValue" as SortKey, label: "ارزش" },
                  { key: "pnl" as SortKey, label: "سود" },
                  { key: "pnlPercent" as SortKey, label: "بازدهی" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleSort(item.key)}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      sortKey === item.key
                        ? "bg-slate-900 text-white"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {portfolioLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : sortedPortfolio.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {sortedPortfolio.map((item) => {
                  const isProfit = item.pnl >= 0;
                  return (
                    <div key={item.id} className="p-4 hover:bg-slate-50 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AssetIcon assetSlug={item.assetSlug} assetType={item.assetType} size="md" />
                          <div>
                            <div className="font-bold text-slate-900">{item.assetSlug}</div>
                            <div className="text-xs text-slate-400">{item.assetName}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-left">
                            <div className="font-bold text-slate-900">{formatNumber(item.totalValue)}</div>
                            <div className="text-xs text-slate-400">ارزش فعلی</div>
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-1">
                              <span className={`font-bold ${isProfit ? "text-emerald-600" : "text-red-600"}`}>
                                {isProfit ? "↑" : "↓"} {formatNumber(Math.abs(item.pnl))}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400">
                              {formatPercent(Math.abs(item.pnlPercent))} {isProfit ? "سود" : "ضرر"}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                              <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                  <Wallet className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
                </div>
                <p className="text-slate-500 mb-4">هنوز دارایی‌ای اضافه نکرده‌اید</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm"
                >
                  <Plus className="w-4 h-4" />
                  افزودن دارایی
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">افزودن دارایی</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <AssetSelector
                onSelect={(asset) => {
                  setSelectedAssetForAdd({
                    slug: asset.slug,
                    name: asset.name,
                    price: asset.price,
                  });
                  setShowAddModal(false);
                  setShowQuantityModal(true);
                }}
                onClose={() => setShowAddModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quantity Modal */}
      {showQuantityModal && selectedAssetForAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">تعیین مقدار</h3>
              <button
                onClick={() => {
                  setShowQuantityModal(false);
                  setSelectedAssetForAdd(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const quantity = parseFloat(formData.get("quantity") as string);
                const buyPrice = parseFloat(formData.get("buyPrice") as string);

                try {
                  const res = await fetch("/api/portfolio", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      assetSlug: selectedAssetForAdd.slug,
                      assetName: selectedAssetForAdd.name,
                      assetType: "currency",
                      quantity,
                      buyPrice,
                    }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    fetchPortfolio();
                    setShowQuantityModal(false);
                    setSelectedAssetForAdd(null);
                  }
                } catch (error) {
                  console.error("Add error:", error);
                }
              }}
              className="p-4 space-y-4"
            >
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="font-bold text-slate-900">{selectedAssetForAdd.name}</div>
                <div className="text-sm text-slate-500">
                  قیمت فعلی: {formatNumber(selectedAssetForAdd.price)} تومان
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">مقدار</label>
                <input
                  type="number"
                  name="quantity"
                  step="any"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="مثلاً: 100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">قیمت خرید (تومان)</label>
                <input
                  type="number"
                  name="buyPrice"
                  step="any"
                  required
                  defaultValue={selectedAssetForAdd.price}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-all"
              >
                افزودن به پرتفوی
              </button>
            </form>
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
