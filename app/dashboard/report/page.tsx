"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  PieChart,
  RefreshCw
} from "lucide-react";

interface PortfolioItem {
  id: string;
  assetSlug: string;
  assetType: string;
  assetName: string;
  quantity: number;
  buyPrice: number;
  currentPrice?: number;
  currentValue?: number;
  profitLoss?: number;
  profitLossPercent?: number;
}

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
}

interface MonthlyReport {
  month: string;
  year: string;
  portfolio: {
    totalValue: number;
    totalCost: number;
    profitLoss: number;
    profitLossPercent: number;
    items: PortfolioItem[];
  };
  transactions: {
    totalBuy: number;
    totalSell: number;
    buyCount: number;
    sellCount: number;
    items: Transaction[];
  };
  allocation: {
    type: string;
    name: string;
    value: number;
    percentage: number;
  }[];
  topGainers: PortfolioItem[];
  topLosers: PortfolioItem[];
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("fa-IR").format(Math.round(num));
};

const TYPE_LABELS: Record<string, string> = {
  currency: "ارز",
  gold: "طلا",
  coin: "سکه",
  crypto: "رمزارز",
  stock: "سهام",
};

const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
];

export default function MonthlyReportPage() {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const reportRef = useRef<HTMLDivElement>(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch portfolio data
      const portfolioRes = await fetch("/api/portfolio");
      const portfolioJson = await portfolioRes.json();
      
      // Fetch transactions for the month
      const startDate = new Date(selectedYear, selectedMonth, 1);
      const endDate = new Date(selectedYear, selectedMonth + 1, 0);
      
      const txRes = await fetch(
        `/api/transaction?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      const txJson = await txRes.json();

      if (!portfolioJson.success) {
        setReport(null);
        return;
      }

      const portfolioItems: PortfolioItem[] = portfolioJson.data || [];
      const transactions: Transaction[] = txJson.data || [];

      // Calculate totals
      const totalValue = portfolioItems.reduce((sum, item) => 
        sum + (item.currentValue || item.quantity * item.buyPrice), 0
      );
      const totalCost = portfolioItems.reduce((sum, item) => 
        sum + (item.quantity * item.buyPrice), 0
      );
      const profitLoss = totalValue - totalCost;
      const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

      // Calculate allocation
      const typeGroups: Record<string, number> = {};
      portfolioItems.forEach((item) => {
        const value = item.currentValue || item.quantity * item.buyPrice;
        typeGroups[item.assetType] = (typeGroups[item.assetType] || 0) + value;
      });

      const allocation = Object.entries(typeGroups)
        .map(([type, value]) => ({
          type,
          name: TYPE_LABELS[type] || type,
          value,
          percentage: (value / totalValue) * 100,
        }))
        .sort((a, b) => b.percentage - a.percentage);

      // Top gainers and losers
      const sortedByProfit = [...portfolioItems]
        .filter(item => item.profitLossPercent !== undefined)
        .sort((a, b) => (b.profitLossPercent || 0) - (a.profitLossPercent || 0));
      
      const topGainers = sortedByProfit.filter(item => (item.profitLossPercent || 0) > 0).slice(0, 3);
      const topLosers = sortedByProfit.filter(item => (item.profitLossPercent || 0) < 0).slice(-3).reverse();

      // Transaction summary
      const totalBuy = transactions.filter(t => t.type === "buy").reduce((sum, t) => sum + t.totalValue, 0);
      const totalSell = transactions.filter(t => t.type === "sell").reduce((sum, t) => sum + t.totalValue, 0);

      setReport({
        month: PERSIAN_MONTHS[selectedMonth],
        year: selectedYear.toString(),
        portfolio: {
          totalValue,
          totalCost,
          profitLoss,
          profitLossPercent,
          items: portfolioItems,
        },
        transactions: {
          totalBuy,
          totalSell,
          buyCount: transactions.filter(t => t.type === "buy").length,
          sellCount: transactions.filter(t => t.type === "sell").length,
          items: transactions,
        },
        allocation,
        topGainers,
        topLosers,
      });
    } catch (error) {
      console.error("Error fetching report:", error);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <div>
            <h1 className="text-2xl font-black text-stone-900">گزارش ماهانه</h1>
            <p className="text-stone-500 text-sm mt-1">خلاصه عملکرد پرتفوی</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Month/Year Selector */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm"
            >
              {PERSIAN_MONTHS.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm"
            >
              {[2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <button
              onClick={fetchReport}
              disabled={loading}
              className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-200 rounded-xl transition-all"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-sm hover:bg-stone-800 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>چاپ / PDF</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-10 h-10 border-3 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
          </div>
        ) : !report ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <div className="text-stone-500 text-lg">داده‌ای برای نمایش وجود ندارد</div>
          </div>
        ) : (
          <div ref={reportRef} className="space-y-6 print:space-y-4">
            {/* Report Header */}
            <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl p-6 text-white print:bg-stone-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-stone-400 text-sm mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>گزارش {report.month} {report.year}</span>
                  </div>
                  <h2 className="text-3xl font-black">خلاصه عملکرد پرتفوی</h2>
                </div>
                <div className="text-left">
                  <div className="text-stone-400 text-sm">ارزش کل پرتفوی</div>
                  <div className="text-3xl font-black">{formatNumber(report.portfolio.totalValue)}</div>
                  <div className="text-stone-400 text-sm">تومان</div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-stone-200">
                <div className="flex items-center gap-2 text-stone-500 text-sm mb-2">
                  <Wallet className="w-4 h-4" />
                  <span>سرمایه اولیه</span>
                </div>
                <div className="text-xl font-black text-stone-800">{formatNumber(report.portfolio.totalCost)}</div>
              </div>
              
              <div className={`rounded-2xl p-4 border ${
                report.portfolio.profitLoss >= 0 
                  ? "bg-emerald-50 border-emerald-200" 
                  : "bg-red-50 border-red-200"
              }`}>
                <div className="flex items-center gap-2 text-sm mb-2">
                  {report.portfolio.profitLoss >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={report.portfolio.profitLoss >= 0 ? "text-emerald-700" : "text-red-700"}>
                    سود/زیان
                  </span>
                </div>
                <div className={`text-xl font-black ${
                  report.portfolio.profitLoss >= 0 ? "text-emerald-700" : "text-red-700"
                }`}>
                  {report.portfolio.profitLoss >= 0 ? "+" : ""}{formatNumber(report.portfolio.profitLoss)}
                </div>
                <div className={`text-sm font-bold ${
                  report.portfolio.profitLoss >= 0 ? "text-emerald-600" : "text-red-600"
                }`}>
                  {report.portfolio.profitLossPercent >= 0 ? "+" : ""}{report.portfolio.profitLossPercent.toFixed(2)}٪
                </div>
              </div>

              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700 text-sm mb-2">
                  <ArrowDownCircle className="w-4 h-4" />
                  <span>مجموع خرید</span>
                </div>
                <div className="text-xl font-black text-blue-800">{formatNumber(report.transactions.totalBuy)}</div>
                <div className="text-sm text-blue-600">{report.transactions.buyCount} تراکنش</div>
              </div>

              <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
                <div className="flex items-center gap-2 text-orange-700 text-sm mb-2">
                  <ArrowUpCircle className="w-4 h-4" />
                  <span>مجموع فروش</span>
                </div>
                <div className="text-xl font-black text-orange-800">{formatNumber(report.transactions.totalSell)}</div>
                <div className="text-sm text-orange-600">{report.transactions.sellCount} تراکنش</div>
              </div>
            </div>

            {/* Allocation */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-stone-600" />
                <h3 className="font-bold text-stone-800">تخصیص دارایی‌ها</h3>
              </div>
              
              <div className="space-y-3">
                {report.allocation.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-stone-600">{item.name}</div>
                    <div className="flex-1 h-6 bg-stone-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-stone-600 to-stone-500 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="w-20 text-left">
                      <div className="text-sm font-bold text-stone-800">{item.percentage.toFixed(1)}٪</div>
                      <div className="text-xs text-stone-500">{formatNumber(item.value)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performers */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Top Gainers */}
              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-emerald-800">بهترین عملکرد</h3>
                </div>
                {report.topGainers.length > 0 ? (
                  <div className="space-y-2">
                    {report.topGainers.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/60 rounded-xl p-3">
                        <span className="text-sm text-stone-700">{item.assetName}</span>
                        <span className="text-sm font-bold text-emerald-600">
                          +{(item.profitLossPercent || 0).toFixed(2)}٪
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-emerald-700 text-center py-4">داده‌ای موجود نیست</div>
                )}
              </div>

              {/* Top Losers */}
              <div className="bg-red-50 rounded-2xl p-5 border border-red-200">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <h3 className="font-bold text-red-800">ضعیف‌ترین عملکرد</h3>
                </div>
                {report.topLosers.length > 0 ? (
                  <div className="space-y-2">
                    {report.topLosers.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/60 rounded-xl p-3">
                        <span className="text-sm text-stone-700">{item.assetName}</span>
                        <span className="text-sm font-bold text-red-600">
                          {(item.profitLossPercent || 0).toFixed(2)}٪
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-red-700 text-center py-4">داده‌ای موجود نیست</div>
                )}
              </div>
            </div>

            {/* Portfolio Items Table */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              <div className="p-4 border-b border-stone-100">
                <h3 className="font-bold text-stone-800">جزئیات پرتفوی</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50">
                    <tr>
                      <th className="text-right p-3 text-stone-600 font-medium">دارایی</th>
                      <th className="text-right p-3 text-stone-600 font-medium">نوع</th>
                      <th className="text-right p-3 text-stone-600 font-medium">مقدار</th>
                      <th className="text-right p-3 text-stone-600 font-medium">قیمت خرید</th>
                      <th className="text-right p-3 text-stone-600 font-medium">ارزش فعلی</th>
                      <th className="text-right p-3 text-stone-600 font-medium">سود/زیان</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.portfolio.items.map((item, index) => (
                      <tr key={index} className="border-t border-stone-100">
                        <td className="p-3 font-medium text-stone-800">{item.assetName}</td>
                        <td className="p-3 text-stone-600">{TYPE_LABELS[item.assetType]}</td>
                        <td className="p-3 text-stone-600">{formatNumber(item.quantity)}</td>
                        <td className="p-3 text-stone-600">{formatNumber(item.buyPrice)}</td>
                        <td className="p-3 text-stone-800 font-medium">
                          {formatNumber(item.currentValue || item.quantity * item.buyPrice)}
                        </td>
                        <td className={`p-3 font-bold ${
                          (item.profitLossPercent || 0) >= 0 ? "text-emerald-600" : "text-red-600"
                        }`}>
                          {(item.profitLossPercent || 0) >= 0 ? "+" : ""}{(item.profitLossPercent || 0).toFixed(2)}٪
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-stone-400 text-sm py-4 print:py-2">
              <p>این گزارش به صورت خودکار تولید شده است</p>
              <p>تاریخ تولید: {new Date().toLocaleDateString("fa-IR")}</p>
            </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-stone-800 {
            background-color: #292524 !important;
          }
        }
      `}</style>
    </div>
  );
}
