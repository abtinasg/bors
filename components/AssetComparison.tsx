"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown, RefreshCw, ChevronDown } from "lucide-react";

interface PricePoint {
  date: string;
  price: number;
}

interface AssetData {
  slug: string;
  name: string;
  color: string;
  data: PricePoint[];
  currentPrice: number;
  change: number;
  changePercent: number;
}

const COMPARISON_ASSETS = [
  { slug: "USD", name: "دلار", color: "#3B82F6" },
  { slug: "EUR", name: "یورو", color: "#8B5CF6" },
  { slug: "TALA_18", name: "طلا ۱۸ عیار", color: "#F59E0B" },
  { slug: "SEKE_EMAMI", name: "سکه امامی", color: "#EAB308" },
  { slug: "GBP", name: "پوند", color: "#10B981" },
  { slug: "AED", name: "درهم", color: "#EC4899" },
];

const TIME_RANGES = [
  { label: "۷ روز", days: 7 },
  { label: "۳۰ روز", days: 30 },
  { label: "۹۰ روز", days: 90 },
];

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("fa-IR").format(Math.round(num));
};

export default function AssetComparison() {
  const [selectedAssets, setSelectedAssets] = useState<string[]>(["USD", "EUR", "TALA_18"]);
  const [timeRange, setTimeRange] = useState(30);
  const [loading, setLoading] = useState(true);
  const [assetsData, setAssetsData] = useState<AssetData[]>([]);
  const [showAssetSelector, setShowAssetSelector] = useState(false);

  const fetchAssetData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch current prices
      const currencyRes = await fetch("/api/currency");
      const currencyJson = await currencyRes.json();
      
      if (!currencyJson.success) {
        console.error("Failed to fetch currency data");
        return;
      }

      const data: AssetData[] = [];
      
      for (const slug of selectedAssets) {
        const assetConfig = COMPARISON_ASSETS.find(a => a.slug === slug);
        if (!assetConfig) continue;
        
        const currentData = currencyJson.data[slug];
        if (!currentData) continue;

        // Generate mock historical data based on current price and change
        // In production, you'd fetch real historical data from API
        const historicalData: PricePoint[] = [];
        const basePrice = currentData.price;
        const dailyChange = (currentData.change_percent || 0) / 100;
        
        for (let i = timeRange; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          
          // Simulate price history with some randomness
          const randomFactor = 1 + (Math.random() - 0.5) * 0.02;
          const trendFactor = 1 + (dailyChange * (timeRange - i) / timeRange);
          const price = basePrice / trendFactor * randomFactor;
          
          historicalData.push({
            date: date.toISOString().split("T")[0],
            price: Math.round(price),
          });
        }

        data.push({
          slug,
          name: assetConfig.name,
          color: assetConfig.color,
          data: historicalData,
          currentPrice: currentData.price,
          change: currentData.change || 0,
          changePercent: currentData.change_percent || 0,
        });
      }

      setAssetsData(data);
    } catch (error) {
      console.error("Error fetching asset data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedAssets, timeRange]);

  useEffect(() => {
    fetchAssetData();
  }, [fetchAssetData]);

  const toggleAsset = (slug: string) => {
    setSelectedAssets(prev => {
      if (prev.includes(slug)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(s => s !== slug);
      }
      if (prev.length >= 4) return prev; // Max 4 assets
      return [...prev, slug];
    });
  };

  // Calculate chart dimensions
  const allPrices = assetsData.flatMap(a => a.data.map(d => d.price));
  const minPrice = Math.min(...allPrices) * 0.98;
  const maxPrice = Math.max(...allPrices) * 1.02;
  const priceRange = maxPrice - minPrice;

  const normalizePrice = (price: number): number => {
    return ((price - minPrice) / priceRange) * 100;
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-stone-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-stone-800">مقایسه دارایی‌ها</h3>
              <p className="text-xs text-stone-500">روند قیمت در بازه زمانی</p>
            </div>
          </div>
          <button
            onClick={fetchAssetData}
            disabled={loading}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Asset Selector */}
          <div className="relative">
            <button
              onClick={() => setShowAssetSelector(!showAssetSelector)}
              className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-sm transition-all"
            >
              <span>انتخاب دارایی</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showAssetSelector ? "rotate-180" : ""}`} />
            </button>
            
            {showAssetSelector && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-stone-200 p-3 z-10 min-w-[200px]">
                {COMPARISON_ASSETS.map(asset => (
                  <label
                    key={asset.slug}
                    className="flex items-center gap-3 p-2 hover:bg-stone-50 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAssets.includes(asset.slug)}
                      onChange={() => toggleAsset(asset.slug)}
                      className="w-4 h-4 rounded"
                    />
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: asset.color }}
                    />
                    <span className="text-sm text-stone-700">{asset.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Time Range */}
          <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1">
            {TIME_RANGES.map(range => (
              <button
                key={range.days}
                onClick={() => setTimeRange(range.days)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  timeRange === range.days
                    ? "bg-white text-stone-800 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
          </div>
        ) : assetsData.length === 0 ? (
          <div className="text-center py-12 text-stone-500">داده‌ای یافت نشد</div>
        ) : (
          <>
            {/* SVG Chart */}
            <div className="relative h-64 mb-6">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map(y => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="100"
                    y2={y}
                    stroke="#E7E5E4"
                    strokeWidth="0.2"
                  />
                ))}
                
                {/* Lines for each asset */}
                {assetsData.map((asset) => {
                  const points = asset.data
                    .map((point, index) => {
                      const x = (index / (asset.data.length - 1)) * 100;
                      const y = 100 - normalizePrice(point.price);
                      return `${x},${y}`;
                    })
                    .join(" ");

                  return (
                    <polyline
                      key={asset.slug}
                      points={points}
                      fill="none"
                      stroke={asset.color}
                      strokeWidth="0.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                })}
              </svg>

              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-stone-400 py-2">
                <span>{formatNumber(maxPrice)}</span>
                <span>{formatNumber((maxPrice + minPrice) / 2)}</span>
                <span>{formatNumber(minPrice)}</span>
              </div>
            </div>

            {/* Legend & Current Prices */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {assetsData.map((asset) => (
                <div
                  key={asset.slug}
                  className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl"
                >
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: asset.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-stone-800 truncate">{asset.name}</div>
                    <div className="text-sm text-stone-600">{formatNumber(asset.currentPrice)}</div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold ${
                    asset.changePercent >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}>
                    {asset.changePercent >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(asset.changePercent).toFixed(2)}٪
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
