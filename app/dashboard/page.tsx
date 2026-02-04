"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Bell,
  MoreHorizontal,
  Briefcase,
  Plus,
  LogOut,
  Loader2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Activity,
  Eye,
  PieChart,
  CircleDollarSign,
  Layers,
  BarChart3,
  Home,
  Star,
  LineChart,
  ArrowLeftRight,
} from "lucide-react";
import GoldCoinBubble from "@/components/GoldCoinBubble";
import AssetIcon from "@/components/AssetIcon";
import { toPersianDigits } from "@/lib/toPersianDigits";

interface User {
  id: string;
  phone: string;
  name: string | null;
  createdAt: string;
}

interface PortfolioItem {
  id: string;
  assetSlug: string;
  assetType: string;
  assetName: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  change: number;
  changePercent: number;
}

interface WatchlistItem {
  id: string;
  assetSlug: string;
  assetType: string;
  assetName: string;
  currentPrice: number;
  change: number;
  changePercent: number;
}

interface DashboardData {
  portfolio: {
    items: PortfolioItem[];
    totalValue: number;
    totalInvested: number;
    totalPnl: number;
    totalPnlPercent: number;
    dailyPnl: number;
    dailyPnlPercent: number;
  };
  watchlist: {
    gainers: WatchlistItem[];
    losers: WatchlistItem[];
  };
}

const formatNumber = (num: number): string => {
  const formatted = Math.abs(num).toLocaleString("fa-IR", { maximumFractionDigits: 0 });
  return toPersianDigits(formatted);
};

const formatPercent = (num: number): string => {
  const sign = num >= 0 ? "+" : "";
  return toPersianDigits(`${sign}${num.toFixed(2).replace(".", "٫")}`) + "٪";
};

const formatPrice = (num: number): string => {
  if (num >= 1000000000) {
    return toPersianDigits((num / 1000000000).toFixed(2).replace(".", "٫")) + " میلیارد";
  }
  if (num >= 1000000) {
    return toPersianDigits((num / 1000000).toFixed(1).replace(".", "٫")) + " میلیون";
  }
  return toPersianDigits(num.toLocaleString("fa-IR", { maximumFractionDigits: 0 }));
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [watchlistTab, setWatchlistTab] = useState("gainers");

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

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        
        if (data.success) {
          setDashboardData(data.data);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setDashboardLoading(false);
      }
    };
    
    if (user) {
      fetchDashboard();
      const interval = setInterval(fetchDashboard, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

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

  if (!user) {
    return null;
  }

  const portfolio = dashboardData?.portfolio;
  const watchlist = dashboardData?.watchlist;
  const topPositions = portfolio?.items.slice(0, 3) || [];
  const watchlistGainers = watchlist?.gainers || [];
  const watchlistLosers = watchlist?.losers || [];
  const chartData = [45, 52, 48, 58, 65, 62, 70, 78, 82, 88, 92];

  return (
    <div className="min-h-screen bg-slate-50 font-[var(--font-vazir)]">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center font-bold text-slate-700 text-lg">
                B
              </div>
              <span className="text-xl font-bold text-slate-800">برس</span>
            </Link>
            <div className="hidden md:flex items-center gap-1 bg-slate-50 rounded-xl p-1">
              {[
                { id: "home", label: "خانه", href: "/dashboard", icon: Home },
                { id: "portfolio", label: "پرتفوی", href: "/dashboard/portfolio", icon: PieChart },
                { id: "watchlist", label: "واچ‌لیست", href: "/dashboard/watchlist", icon: Star },
                { id: "market", label: "بازار", href: "/dashboard/market", icon: LineChart },
                { id: "analysis", label: "تحلیل", href: "/dashboard/analysis", icon: BarChart3 },
                { id: "converter", label: "تبدیل ارز", href: "/dashboard/converter", icon: ArrowLeftRight },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                      tab.id === "home"
                        ? "bg-white text-slate-900 border border-slate-200 shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <Search className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" strokeWidth={1.5} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="خروج"
            >
              <LogOut className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <div className="w-9 h-9 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-700 font-medium">
              {user.name ? user.name[0] : user.phone.slice(-2)}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-slate-500" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                سلام{user.name ? `، ${user.name}` : ""}!
              </h1>
              <p className="text-slate-500 text-sm mt-1">{user.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-medium text-sm">
              واریز
            </button>
            <button className="px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-medium text-sm">
              معامله
            </button>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Portfolio Value */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <PieChart className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">
              {dashboardLoading ? "..." : portfolio?.totalValue ? formatPrice(portfolio.totalValue) : "۰"}
            </div>
            <div className="text-xs text-slate-400 font-medium">ارزش کل پرتفوی</div>
          </div>

          {/* Daily Change */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-black ${
                (portfolio?.dailyPnl ?? 0) >= 0 ? "text-slate-900" : "text-slate-900"
              }`}>
                {dashboardLoading ? "..." : portfolio ? formatPrice(Math.abs(portfolio.dailyPnl)) : "۰"}
              </span>
              {!dashboardLoading && portfolio && (
                <span className={`text-sm font-bold ${
                  portfolio.dailyPnl >= 0 ? "text-emerald-600" : "text-red-600"
                }`}>
                  {portfolio.dailyPnl >= 0 ? "↑" : "↓"}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 font-medium">تغییر روزانه</div>
          </div>

          {/* Total P&L */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <CircleDollarSign className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-slate-900">
                {dashboardLoading ? "..." : portfolio ? formatPrice(Math.abs(portfolio.totalPnl)) : "۰"}
              </span>
              {!dashboardLoading && portfolio && (
                <span className={`text-sm font-bold ${
                  portfolio.totalPnl >= 0 ? "text-emerald-600" : "text-red-600"
                }`}>
                  {portfolio.totalPnl >= 0 ? "↑" : "↓"}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 font-medium">سود/زیان کل</div>
          </div>

          {/* Asset Count */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 animate-fade-in" style={{ animationDelay: "0.25s" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">
              {dashboardLoading ? "..." : portfolio?.items.length ?? "۰"}
            </div>
            <div className="text-xs text-slate-400 font-medium">تعداد دارایی</div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-5">
          
          {/* Portfolio Value Card */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-xl p-6 border border-slate-200 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button className="text-slate-900 font-bold text-sm">ارزش</button>
                <button className="text-slate-400 font-medium text-sm hover:text-slate-600 transition-colors">عملکرد</button>
              </div>
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            
            {dashboardLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
              </div>
            ) : portfolio && portfolio.totalValue > 0 ? (
              <>
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  {formatNumber(portfolio.totalValue)}
                </div>
                <div className="font-medium text-sm mb-6">
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                    portfolio.totalPnl >= 0 
                      ? "bg-emerald-50 text-emerald-700" 
                      : "bg-red-50 text-red-700"
                  }`}>
                    {portfolio.totalPnl >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {portfolio.totalPnl >= 0 ? "+" : ""}{formatNumber(portfolio.totalPnl)} ({portfolio.totalPnlPercent.toFixed(2).replace(".", "٫")}٪)
                  </span>
                  <span className="text-slate-400 mr-2">کل سود/زیان</span>
                </div>
              </>
            ) : (
              <>
                <div className="text-4xl font-bold text-slate-900 mb-2">۰</div>
                <div className="text-slate-400 font-medium text-sm mb-6">
                  پرتفوی خالی است
                </div>
              </>
            )}
            
            {/* Mini Chart */}
            <div className="h-32 flex items-end gap-1 mb-4">
              {portfolio && portfolio.items.length > 0 ? (
                <svg viewBox="0 0 200 80" className="w-full h-full">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={portfolio.totalPnl >= 0 ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)"} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={portfolio.totalPnl >= 0 ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)"} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M0,${80 - chartData[0] * 0.8} ${chartData.map((d, i) => `L${i * 20},${80 - d * 0.8}`).join(" ")} L200,${80 - chartData[chartData.length - 1] * 0.8} L200,80 L0,80 Z`}
                    fill="url(#chartGradient)"
                  />
                  <path
                    d={`M0,${80 - chartData[0] * 0.8} ${chartData.map((d, i) => `L${i * 20},${80 - d * 0.8}`).join(" ")}`}
                    fill="none"
                    stroke={portfolio.totalPnl >= 0 ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)"}
                    strokeWidth="2.5"
                  />
                  <circle cx={200} cy={80 - chartData[chartData.length - 1] * 0.8} r="5" fill={portfolio.totalPnl >= 0 ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)"} />
                </svg>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs text-slate-400 text-center">برای نمایش نمودار بازدهی<br/>حداقل یک دارایی اضافه کنید</p>
                </div>
              )}
            </div>

            {/* Time Range Tabs */}
            <div className="flex items-center gap-1 text-xs">
              {["۱ه", "ماه", "۱م", "۳م", "سال", "همه"].map((label, i) => (
                <button
                  key={i}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    label === "سال" 
                      ? "bg-slate-900 text-white" 
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Positions Card */}
          <div className="col-span-12 lg:col-span-5 bg-white rounded-xl p-6 border border-slate-200 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">پوزیشن‌های شما</h2>
              </div>
              <Link href="/dashboard/portfolio" className="text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">
                مشاهده همه
              </Link>
            </div>
            
            {dashboardLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : topPositions.length > 0 ? (
              <div className="flex gap-3">
                {topPositions.map((pos, index) => {
                  const isProfit = pos.pnl >= 0;
                  return (
                    <div 
                      key={pos.id} 
                      className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-slate-200 transition-all animate-fade-in"
                      style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <AssetIcon assetSlug={pos.assetSlug} assetType={pos.assetType} size="sm" />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{pos.assetSlug}</div>
                          <div className="text-xs text-slate-400 truncate max-w-[60px]">{pos.assetName}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mb-3">
                        <span className={`text-sm font-bold ${isProfit ? "text-emerald-600" : "text-red-600"}`}>
                          {isProfit ? "↑" : "↓"}
                        </span>
                        <span className={`text-sm font-bold ${isProfit ? "text-emerald-600" : "text-red-600"}`}>
                          {formatPrice(Math.abs(pos.pnl))}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mb-1">آخرین قیمت</div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-slate-900">{formatNumber(pos.currentPrice)}</span>
                        <span className={`text-xs font-medium ${pos.changePercent >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {formatPercent(pos.changePercent)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-6 h-6 text-slate-400" strokeWidth={1.5} />
                </div>
                <p className="text-slate-400 mb-4 text-sm">هنوز دارایی‌ای ندارید</p>
                <Link 
                  href="/dashboard/portfolio" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  افزودن دارایی
                </Link>
              </div>
            )}
          </div>

          {/* Unrealized P&L Card */}
          <div className="col-span-12 lg:col-span-3 bg-white rounded-xl p-6 border border-slate-200 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-slate-600" strokeWidth={1.5} />
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            
            {dashboardLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
              </div>
            ) : portfolio ? (
              <>
                <div className="text-xs text-slate-400 mb-1">سود/زیان تحقق نیافته</div>
                <div className={`text-3xl font-bold mb-4 ${portfolio.totalPnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {portfolio.totalPnl >= 0 ? "+" : ""}{formatPrice(portfolio.totalPnl)}
                </div>
                
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">سود روزانه</div>
                    <div className="flex items-baseline gap-2">
                      <span className={`font-bold ${portfolio.dailyPnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {portfolio.dailyPnl >= 0 ? "+" : ""}{formatPrice(portfolio.dailyPnl)}
                      </span>
                      <span className={`text-xs font-medium ${portfolio.dailyPnlPercent >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {formatPercent(portfolio.dailyPnlPercent)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">سرمایه اولیه</div>
                    <div className="font-bold text-slate-900">{formatNumber(portfolio.totalInvested)}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-slate-400 text-sm">بدون داده</p>
              </div>
            )}
          </div>

          {/* Watchlist Card */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-xl p-6 border border-slate-200 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">واچ‌لیست</h2>
              </div>
              <Link href="/dashboard/watchlist" className="w-9 h-9 border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors">
                <Plus className="w-4 h-4" strokeWidth={1.5} />
              </Link>
            </div>

            {dashboardLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
              </div>
            ) : watchlistGainers.length > 0 || watchlistLosers.length > 0 ? (
              <>
                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setWatchlistTab("gainers")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                      watchlistTab === "gainers"
                        ? "bg-slate-900 text-white"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-emerald-500">↑</span>
                      {watchlistGainers.length} صعودی
                    </span>
                  </button>
                  <button
                    onClick={() => setWatchlistTab("losers")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                      watchlistTab === "losers"
                        ? "bg-slate-900 text-white"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-red-500">↓</span>
                      {watchlistLosers.length} نزولی
                    </span>
                  </button>
                </div>

                {/* List */}
                <div className="space-y-3">
                  {(watchlistTab === "gainers" ? watchlistGainers : watchlistLosers).slice(0, 3).map((item, index) => {
                    return (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors animate-fade-in"
                        style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                      >
                        <div className="flex items-center gap-3">
                          <AssetIcon assetSlug={item.assetSlug} assetType={item.assetType} size="md" />
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{item.assetSlug}</div>
                            <div className="text-xs text-slate-400 truncate max-w-[80px]">{item.assetName}</div>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-slate-900 text-sm">{formatNumber(item.currentPrice)}</div>
                          <div className={`inline-flex items-center gap-1 text-xs font-bold ${
                            item.changePercent >= 0 ? "text-emerald-600" : "text-red-600"
                          }`}>
                            {item.changePercent >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {formatPercent(item.changePercent)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-400 mb-4">واچ‌لیست خالی است</p>
                <Link 
                  href="/dashboard/watchlist" 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                  افزودن دارایی
                </Link>
              </div>
            )}
          </div>

          {/* Gold & Coin Bubble Card */}
          <div className="col-span-12 lg:col-span-8 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <GoldCoinBubble />
          </div>

        </div>
      </div>
    </div>
  );
}
