"use client";

import { useState, useEffect } from "react";
import { PieChart, AlertTriangle, TrendingUp, Info } from "lucide-react";

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

interface AllocationData {
  name: string;
  value: number;
  percentage: number;
  color: string;
  type: string;
}

const TYPE_COLORS: Record<string, string> = {
  currency: "#3B82F6", // blue
  gold: "#F59E0B", // amber
  coin: "#EAB308", // yellow
  crypto: "#8B5CF6", // violet
  stock: "#10B981", // emerald
  car: "#6366F1", // indigo
};

const TYPE_LABELS: Record<string, string> = {
  currency: "ارز",
  gold: "طلا",
  coin: "سکه",
  crypto: "رمزارز",
  stock: "سهام",
  car: "خودرو",
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("fa-IR").format(Math.round(num));
};

interface PortfolioAnalysisProps {
  portfolio?: PortfolioItem[];
}

export default function PortfolioAnalysis({ portfolio }: PortfolioAnalysisProps) {
  const [data, setData] = useState<PortfolioItem[]>(portfolio || []);
  const [loading, setLoading] = useState(!portfolio);
  const [allocation, setAllocation] = useState<AllocationData[]>([]);
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">("low");
  const [concentrationRisk, setConcentrationRisk] = useState<string[]>([]);

  useEffect(() => {
    if (!portfolio) {
      fetchPortfolio();
    } else {
      calculateAllocation(portfolio);
    }
  }, [portfolio]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/portfolio");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        calculateAllocation(json.data);
      }
    } catch {
      console.error("Error fetching portfolio");
    } finally {
      setLoading(false);
    }
  };

  const calculateAllocation = (items: PortfolioItem[]) => {
    const totalValue = items.reduce((sum, item) => sum + (item.currentValue || item.quantity * item.buyPrice), 0);
    
    // Group by asset type
    const typeGroups: Record<string, number> = {};
    items.forEach((item) => {
      const value = item.currentValue || item.quantity * item.buyPrice;
      typeGroups[item.assetType] = (typeGroups[item.assetType] || 0) + value;
    });

    const allocationData: AllocationData[] = Object.entries(typeGroups)
      .map(([type, value]) => ({
        name: TYPE_LABELS[type] || type,
        value,
        percentage: (value / totalValue) * 100,
        color: TYPE_COLORS[type] || "#6B7280",
        type,
      }))
      .sort((a, b) => b.percentage - a.percentage);

    setAllocation(allocationData);

    // Calculate concentration risk
    const risks: string[] = [];
    let riskScore = 0;

    // Check if any asset type is more than 50%
    allocationData.forEach((item) => {
      if (item.percentage > 50) {
        risks.push(`تمرکز بالا روی ${item.name} (${item.percentage.toFixed(1)}٪)`);
        riskScore += 2;
      } else if (item.percentage > 35) {
        risks.push(`تمرکز متوسط روی ${item.name} (${item.percentage.toFixed(1)}٪)`);
        riskScore += 1;
      }
    });

    // Check diversification
    if (allocationData.length === 1) {
      risks.push("فقط یک نوع دارایی دارید - تنوع‌بخشی پیشنهاد می‌شود");
      riskScore += 2;
    } else if (allocationData.length === 2) {
      risks.push("تنوع کم - افزودن دارایی‌های دیگر پیشنهاد می‌شود");
      riskScore += 1;
    }

    // Check for individual asset concentration
    items.forEach((item) => {
      const value = item.currentValue || item.quantity * item.buyPrice;
      const percentage = (value / totalValue) * 100;
      if (percentage > 40) {
        risks.push(`${item.assetName} بیش از ۴۰٪ پرتفوی است`);
        riskScore += 1;
      }
    });

    setConcentrationRisk(risks);
    setRiskLevel(riskScore >= 3 ? "high" : riskScore >= 1 ? "medium" : "low");
  };

  const totalValue = data.reduce((sum, item) => sum + (item.currentValue || item.quantity * item.buyPrice), 0);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-stone-200">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-stone-200">
        <div className="text-center py-8">
          <PieChart className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <div className="text-stone-500">پرتفویی برای تحلیل وجود ندارد</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pie Chart Visual */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200">
        <div className="flex items-center gap-2 mb-6">
          <PieChart className="w-5 h-5 text-stone-600" />
          <h3 className="font-bold text-stone-800">تخصیص دارایی‌ها</h3>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Custom Pie Chart */}
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {allocation.reduce<{ elements: JSX.Element[]; offset: number }>(
                (acc, item, index) => {
                  const percentage = item.percentage;
                  const circumference = 2 * Math.PI * 40;
                  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -acc.offset * (circumference / 100);
                  
                  acc.elements.push(
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={item.color}
                      strokeWidth="20"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-500"
                    />
                  );
                  acc.offset += percentage;
                  return acc;
                },
                { elements: [], offset: 0 }
              ).elements}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-black text-stone-800">{formatNumber(totalValue)}</div>
              <div className="text-xs text-stone-500">تومان</div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-3">
            {allocation.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-stone-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-stone-600">
                    {formatNumber(item.value)}
                  </span>
                  <span className="text-sm font-bold text-stone-800 w-16 text-left">
                    {item.percentage.toFixed(1)}٪
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Analysis */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-5 h-5 text-stone-600" />
          <h3 className="font-bold text-stone-800">تحلیل ریسک تمرکز</h3>
        </div>

        {/* Risk Level Indicator */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                riskLevel === "low" ? "w-1/3 bg-emerald-500" :
                riskLevel === "medium" ? "w-2/3 bg-amber-500" :
                "w-full bg-red-500"
              }`}
            />
          </div>
          <div className={`text-sm font-bold px-3 py-1 rounded-full ${
            riskLevel === "low" ? "bg-emerald-100 text-emerald-700" :
            riskLevel === "medium" ? "bg-amber-100 text-amber-700" :
            "bg-red-100 text-red-700"
          }`}>
            {riskLevel === "low" ? "ریسک کم" : riskLevel === "medium" ? "ریسک متوسط" : "ریسک بالا"}
          </div>
        </div>

        {/* Risk Items */}
        {concentrationRisk.length > 0 ? (
          <div className="space-y-2">
            {concentrationRisk.map((risk, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100"
              >
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="text-sm text-amber-800">{risk}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span className="text-sm text-emerald-800">
              پرتفوی شما از نظر تنوع‌بخشی در وضعیت مناسبی قرار دارد
            </span>
          </div>
        )}

        {/* Recommendations */}
        <div className="mt-6 p-4 bg-stone-50 rounded-xl">
          <div className="text-sm font-bold text-stone-700 mb-2">پیشنهادات:</div>
          <ul className="text-sm text-stone-600 space-y-1 list-disc list-inside">
            <li>حداکثر ۳۰٪ پرتفوی را به یک نوع دارایی اختصاص دهید</li>
            <li>حداقل ۳ نوع دارایی مختلف داشته باشید</li>
            <li>ترکیب دارایی‌های پرریسک و کم‌ریسک را حفظ کنید</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
