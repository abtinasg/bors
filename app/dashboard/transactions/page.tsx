"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Calendar, 
  Filter, 
  Trash2, 
  RefreshCw,
  Search,
  TrendingUp,
  TrendingDown
} from "lucide-react";

interface Transaction {
  id: string;
  assetSlug: string;
  assetType: string;
  assetName: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  totalValue: number;
  date: string;
  note?: string;
  createdAt: string;
}

interface TransactionSummary {
  totalBuy: number;
  totalSell: number;
  buyCount: number;
  sellCount: number;
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("fa-IR").format(Math.round(num));
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const ASSET_TYPE_LABELS: Record<string, string> = {
  currency: "ارز",
  gold: "طلا",
  coin: "سکه",
  crypto: "رمزارز",
  stock: "سهام",
  car: "خودرو",
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filterType, setFilterType] = useState<"all" | "buy" | "sell">("all");
  const [filterAssetType, setFilterAssetType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filterType !== "all") params.append("type", filterType);
      if (filterAssetType !== "all") params.append("assetType", filterAssetType);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      
      const res = await fetch(`/api/transaction?${params.toString()}`);
      const json = await res.json();
      
      if (json.success) {
        let filtered = json.data;
        if (searchQuery) {
          filtered = filtered.filter((t: Transaction) => 
            t.assetName.includes(searchQuery) || 
            t.assetSlug.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        setTransactions(filtered);
        setSummary(json.summary);
      } else {
        setError(json.error || "خطا در دریافت تراکنش‌ها");
      }
    } catch {
      setError("خطا در برقراری ارتباط");
    } finally {
      setLoading(false);
    }
  }, [filterType, filterAssetType, startDate, endDate, searchQuery]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این تراکنش مطمئن هستید؟")) return;
    
    try {
      const res = await fetch(`/api/transaction?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      
      if (json.success) {
        fetchTransactions();
      } else {
        alert(json.error || "خطا در حذف");
      }
    } catch {
      alert("خطا در برقراری ارتباط");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-stone-900">تاریخچه تراکنش‌ها</h1>
            <p className="text-stone-500 text-sm mt-1">لیست خرید و فروش‌های شما</p>
          </div>
          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="p-2.5 text-stone-500 hover:text-stone-700 hover:bg-stone-200 rounded-xl transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span className="text-sm text-emerald-700">مجموع خرید</span>
              </div>
              <div className="text-xl font-black text-emerald-800">{formatNumber(summary.totalBuy)}</div>
              <div className="text-xs text-emerald-600">{summary.buyCount} تراکنش</div>
            </div>
            <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-700">مجموع فروش</span>
              </div>
              <div className="text-xl font-black text-red-800">{formatNumber(summary.totalSell)}</div>
              <div className="text-xs text-red-600">{summary.sellCount} تراکنش</div>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpCircle className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-700">خالص</span>
              </div>
              <div className={`text-xl font-black ${summary.totalBuy - summary.totalSell >= 0 ? "text-blue-800" : "text-orange-800"}`}>
                {formatNumber(Math.abs(summary.totalBuy - summary.totalSell))}
              </div>
              <div className="text-xs text-blue-600">
                {summary.totalBuy - summary.totalSell >= 0 ? "سرمایه‌گذاری" : "برداشت"}
              </div>
            </div>
            <div className="bg-stone-100 rounded-2xl p-4 border border-stone-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-stone-600" />
                <span className="text-sm text-stone-700">کل تراکنش</span>
              </div>
              <div className="text-xl font-black text-stone-800">{transactions.length}</div>
              <div className="text-xs text-stone-600">تراکنش</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-stone-500" />
            <span className="font-bold text-stone-700">فیلترها</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="col-span-2 md:col-span-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="جستجو..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>
            </div>
            
            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as "all" | "buy" | "sell")}
              className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
            >
              <option value="all">همه تراکنش‌ها</option>
              <option value="buy">فقط خرید</option>
              <option value="sell">فقط فروش</option>
            </select>
            
            {/* Asset Type Filter */}
            <select
              value={filterAssetType}
              onChange={(e) => setFilterAssetType(e.target.value)}
              className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
            >
              <option value="all">همه دارایی‌ها</option>
              <option value="currency">ارز</option>
              <option value="gold">طلا</option>
              <option value="coin">سکه</option>
              <option value="crypto">رمزارز</option>
              <option value="stock">سهام</option>
            </select>
            
            {/* Date Range */}
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
              placeholder="از تاریخ"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
              placeholder="تا تاریخ"
            />
          </div>
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">{error}</div>
            <button onClick={fetchTransactions} className="px-4 py-2 bg-stone-900 text-white rounded-xl text-sm">
              تلاش مجدد
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-stone-400" />
            </div>
            <div className="text-stone-500 text-lg font-medium">تراکنشی یافت نشد</div>
            <div className="text-stone-400 text-sm mt-2">اولین خرید یا فروش خود را ثبت کنید</div>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-white rounded-2xl p-4 border border-stone-100 hover:border-stone-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      tx.type === "buy" 
                        ? "bg-emerald-100 text-emerald-600" 
                        : "bg-red-100 text-red-600"
                    }`}>
                      {tx.type === "buy" 
                        ? <ArrowDownCircle className="w-6 h-6" /> 
                        : <ArrowUpCircle className="w-6 h-6" />
                      }
                    </div>
                    
                    {/* Details */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-800">{tx.assetName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          tx.type === "buy" 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-red-100 text-red-700"
                        }`}>
                          {tx.type === "buy" ? "خرید" : "فروش"}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                          {ASSET_TYPE_LABELS[tx.assetType] || tx.assetType}
                        </span>
                      </div>
                      <div className="text-sm text-stone-500 mt-1">
                        {formatNumber(tx.quantity)} واحد × {formatNumber(tx.price)} تومان
                      </div>
                      {tx.note && (
                        <div className="text-xs text-stone-400 mt-1">یادداشت: {tx.note}</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Right Side */}
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <div className={`text-lg font-black ${
                        tx.type === "buy" ? "text-emerald-600" : "text-red-600"
                      }`}>
                        {tx.type === "buy" ? "-" : "+"}{formatNumber(tx.totalValue)}
                      </div>
                      <div className="text-xs text-stone-400">{formatDate(tx.date)}</div>
                    </div>
                    
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
