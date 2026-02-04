"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Layers,
  AlertTriangle,
} from "lucide-react";

interface PricePoint {
  date: string;
  price: number;
  high?: number;
  low?: number;
}

interface FibonacciLevel {
  level: number;
  price: number;
  label: string;
  type: "retracement" | "extension";
}

interface GannLevel {
  angle: number;
  price: number;
  label: string;
}

interface PRZZone {
  low: number;
  high: number;
  strength: "weak" | "medium" | "strong";
  confluences: string[];
}

interface TechnicalAnalysis {
  fibonacci: {
    retracement: FibonacciLevel[];
    extension: FibonacciLevel[];
  };
  gann: GannLevel[];
  prz: PRZZone[];
  swing: {
    high: number;
    low: number;
    highDate: string;
    lowDate: string;
  };
  trend: "bullish" | "bearish" | "neutral";
}

interface TechnicalChartProps {
  prices: PricePoint[];
  analysis: TechnicalAnalysis;
  currentPrice: number;
  assetName: string;
  showFibonacci?: boolean;
  showGann?: boolean;
  showPRZ?: boolean;
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("fa-IR").format(Math.round(num));
};

const formatShortNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return num.toFixed(0);
};

// Fibonacci colors
const FIB_COLORS: Record<number, string> = {
  0: "#94a3b8",
  0.236: "#a855f7",
  0.382: "#3b82f6",
  0.5: "#22c55e",
  0.618: "#f59e0b",
  0.786: "#ef4444",
  1: "#94a3b8",
};

export default function TechnicalChart({
  prices,
  analysis,
  currentPrice,
  assetName,
  showFibonacci = true,
  showGann = false,
  showPRZ = true,
}: TechnicalChartProps) {
  // Prepare chart data
  const chartData = useMemo(() => {
    return prices.map((p, index) => ({
      ...p,
      index,
      displayDate: p.date.split("/").slice(1).join("/"), // Show only month/day
    }));
  }, [prices]);

  // Calculate Y-axis domain
  const yDomain = useMemo(() => {
    const allPrices = prices.flatMap((p) => [p.price, p.high || p.price, p.low || p.price]);
    const fibPrices = showFibonacci
      ? [...analysis.fibonacci.retracement, ...analysis.fibonacci.extension].map((f) => f.price)
      : [];
    const przPrices = showPRZ ? analysis.prz.flatMap((p) => [p.low, p.high]) : [];
    
    const all = [...allPrices, ...fibPrices, ...przPrices].filter(Boolean);
    const min = Math.min(...all) * 0.98;
    const max = Math.max(...all) * 1.02;
    
    return [min, max];
  }, [prices, analysis, showFibonacci, showPRZ]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: PricePoint & { displayDate: string } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg">
          <p className="text-xs text-slate-500 mb-1">{data.date}</p>
          <p className="font-bold text-slate-900">{formatNumber(data.price)} تومان</p>
          {data.high && data.low && (
            <div className="flex gap-3 mt-1 text-xs">
              <span className="text-emerald-600">بالا: {formatNumber(data.high)}</span>
              <span className="text-red-600">پایین: {formatNumber(data.low)}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={analysis.trend === "bullish" ? "#10b981" : "#ef4444"}
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor={analysis.trend === "bullish" ? "#10b981" : "#ef4444"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              
              <YAxis
                domain={yDomain}
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickFormatter={formatShortNumber}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                width={60}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* PRZ Zones */}
              {showPRZ &&
                analysis.prz.map((zone, index) => (
                  <ReferenceArea
                    key={`prz-${index}`}
                    y1={zone.low}
                    y2={zone.high}
                    fill={
                      zone.strength === "strong"
                        ? "#fef08a"
                        : zone.strength === "medium"
                        ? "#fde68a"
                        : "#fef9c3"
                    }
                    fillOpacity={0.5}
                    stroke="#f59e0b"
                    strokeDasharray="3 3"
                  />
                ))}

              {/* Fibonacci Retracement Lines */}
              {showFibonacci &&
                analysis.fibonacci.retracement.map((fib) => (
                  <ReferenceLine
                    key={`fib-ret-${fib.level}`}
                    y={fib.price}
                    stroke={FIB_COLORS[fib.level] || "#94a3b8"}
                    strokeDasharray="5 5"
                    strokeWidth={1}
                    label={{
                      value: fib.label,
                      position: "right",
                      fontSize: 9,
                      fill: FIB_COLORS[fib.level] || "#94a3b8",
                    }}
                  />
                ))}

              {/* Swing High/Low */}
              <ReferenceLine
                y={analysis.swing.high}
                stroke="#ef4444"
                strokeWidth={2}
                label={{
                  value: `سقف: ${formatShortNumber(analysis.swing.high)}`,
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: "#ef4444",
                }}
              />
              <ReferenceLine
                y={analysis.swing.low}
                stroke="#10b981"
                strokeWidth={2}
                label={{
                  value: `کف: ${formatShortNumber(analysis.swing.low)}`,
                  position: "insideBottomRight",
                  fontSize: 10,
                  fill: "#10b981",
                }}
              />

              {/* Current Price */}
              <ReferenceLine
                y={currentPrice}
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{
                  value: `فعلی: ${formatShortNumber(currentPrice)}`,
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: "#3b82f6",
                }}
              />

              {/* Price Area */}
              <Area
                type="monotone"
                dataKey="price"
                stroke={analysis.trend === "bullish" ? "#10b981" : "#ef4444"}
                strokeWidth={2}
                fill="url(#priceGradient)"
              />

              {/* High/Low Range */}
              {prices[0]?.high && (
                <>
                  <Line
                    type="monotone"
                    dataKey="high"
                    stroke="#10b981"
                    strokeWidth={1}
                    dot={false}
                    strokeDasharray="2 2"
                  />
                  <Line
                    type="monotone"
                    dataKey="low"
                    stroke="#ef4444"
                    strokeWidth={1}
                    dot={false}
                    strokeDasharray="2 2"
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Trend Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                analysis.trend === "bullish"
                  ? "bg-emerald-100 text-emerald-600"
                  : analysis.trend === "bearish"
                  ? "bg-red-100 text-red-600"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {analysis.trend === "bullish" ? (
                <TrendingUp className="w-5 h-5" strokeWidth={1.5} />
              ) : analysis.trend === "bearish" ? (
                <TrendingDown className="w-5 h-5" strokeWidth={1.5} />
              ) : (
                <Layers className="w-5 h-5" strokeWidth={1.5} />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900">روند بازار</h3>
              <p
                className={`text-sm font-medium ${
                  analysis.trend === "bullish"
                    ? "text-emerald-600"
                    : analysis.trend === "bearish"
                    ? "text-red-600"
                    : "text-slate-500"
                }`}
              >
                {analysis.trend === "bullish"
                  ? "صعودی"
                  : analysis.trend === "bearish"
                  ? "نزولی"
                  : "خنثی"}
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">سقف</span>
              <span className="font-medium text-red-600">{formatNumber(analysis.swing.high)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">کف</span>
              <span className="font-medium text-emerald-600">{formatNumber(analysis.swing.low)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">دامنه</span>
              <span className="font-medium">
                {formatNumber(analysis.swing.high - analysis.swing.low)}
              </span>
            </div>
          </div>
        </div>

        {/* Fibonacci Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
              <Target className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">سطوح فیبوناچی</h3>
              <p className="text-xs text-slate-500">نقاط اصلاحی</p>
            </div>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {analysis.fibonacci.retracement
              .filter((f) => f.level > 0 && f.level < 1)
              .map((fib) => (
                <div
                  key={fib.level}
                  className="flex justify-between items-center text-sm"
                >
                  <span
                    className="font-medium"
                    style={{ color: FIB_COLORS[fib.level] }}
                  >
                    {fib.label}
                  </span>
                  <span className="text-slate-700">{formatNumber(fib.price)}</span>
                </div>
              ))}
          </div>
        </div>

        {/* PRZ Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">مناطق PRZ</h3>
              <p className="text-xs text-slate-500">نقاط احتمال بازگشت</p>
            </div>
          </div>
          {analysis.prz.length > 0 ? (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {analysis.prz.map((zone, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg text-xs ${
                    zone.strength === "strong"
                      ? "bg-amber-100 border border-amber-300"
                      : zone.strength === "medium"
                      ? "bg-amber-50 border border-amber-200"
                      : "bg-slate-50 border border-slate-200"
                  }`}
                >
                  <div className="flex justify-between font-medium">
                    <span>
                      {formatNumber(zone.low)} - {formatNumber(zone.high)}
                    </span>
                    <span
                      className={
                        zone.strength === "strong"
                          ? "text-amber-700"
                          : zone.strength === "medium"
                          ? "text-amber-600"
                          : "text-slate-500"
                      }
                    >
                      {zone.strength === "strong"
                        ? "قوی"
                        : zone.strength === "medium"
                        ? "متوسط"
                        : "ضعیف"}
                    </span>
                  </div>
                  <div className="text-slate-500 mt-1">
                    {zone.confluences.slice(0, 3).join(" • ")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">
              منطقه PRZ شناسایی نشد
            </p>
          )}
        </div>
      </div>

      {/* Gann Levels (if enabled) */}
      {showGann && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-bold text-slate-900 mb-3">سطوح گن</h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {analysis.gann.slice(0, 5).map((level) => (
              <div
                key={level.label}
                className="bg-slate-50 rounded-lg p-2 text-center"
              >
                <div className="text-xs text-slate-500">{level.label}</div>
                <div className="font-bold text-slate-900 text-sm">
                  {formatNumber(level.price)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
