"use client";

import { useState, useEffect, useMemo } from "react";
import {
  DollarSign,
  Gem,
  Coins,
  Bitcoin,
  TrendingUp,
  Car,
  Building2,
  Search,
  ChevronLeft,
  X,
} from "lucide-react";

interface Asset {
  slug: string;
  name: string;
  price: number;
  change_percent: number;
  type: string;
}

interface AssetSelectorProps {
  onSelect: (asset: Asset) => void;
  onClose?: () => void;
}

type CategoryType = "currency" | "gold" | "coin" | "crypto" | "stock" | "car" | null;

const CATEGORIES = [
  {
    id: "currency" as CategoryType,
    name: "ارز",
    icon: DollarSign,
    description: "دلار، یورو، پوند و سایر ارزها",
  },
  {
    id: "gold" as CategoryType,
    name: "طلا",
    icon: Gem,
    description: "طلای ۱۸ عیار، انس جهانی و...",
  },
  {
    id: "coin" as CategoryType,
    name: "سکه",
    icon: Coins,
    description: "سکه امامی، بهار آزادی و...",
  },
  {
    id: "car" as CategoryType,
    name: "خودرو",
    icon: Car,
    description: "پراید، پژو، سمند، دنا و...",
  },
  {
    id: "stock" as CategoryType,
    name: "بورس",
    icon: TrendingUp,
    description: "سهام و صندوق‌ها",
  },
  {
    id: "crypto" as CategoryType,
    name: "ارز دیجیتال",
    icon: Bitcoin,
    description: "تتر و رمزارزها",
  },
];

// Stock sub-categories
const STOCK_SUBCATEGORIES = [
  { id: "popular", name: "نمادهای پرطرفدار", icon: TrendingUp },
  { id: "auto", name: "خودرو", icon: Car },
  { id: "bank", name: "بانک‌ها", icon: Building2 },
  { id: "petro", name: "پالایشی و پتروشیمی", icon: Building2 },
  { id: "metal", name: "فلزات و معدن", icon: Gem },
  { id: "investment", name: "سرمایه‌گذاری و صندوق", icon: Building2 },
];

// Category mapping for currency assets
const CURRENCY_CATEGORY_SLUGS: Record<string, CategoryType> = {
  // Currencies
  USD: "currency", EUR: "currency", GBP: "currency", AED: "currency", TRY: "currency",
  CHF: "currency", CAD: "currency", AUD: "currency", CNY: "currency", JPY: "currency",
  SAR: "currency", KWD: "currency", QAR: "currency", RUB: "currency", INR: "currency",
  PKR: "currency", AFN: "currency", IQD: "currency", OMR: "currency", BHD: "currency",
  NZD: "currency", NOK: "currency", SEK: "currency", DKK: "currency", HKD: "currency",
  SGD: "currency", MYR: "currency", THB: "currency", KRW: "currency", GEL: "currency",
  AZN: "currency", AMD: "currency", KGS: "currency", TJS: "currency", TMT: "currency",
  SYP: "currency",
  // Gold
  TALA_18: "gold", TALA_24: "gold", TALA_MESGHAL: "gold", ONS: "gold",
  ONSNOGHRE: "gold", PALA: "gold", ONSPALA: "gold", OIL: "gold",
  // Coins
  SEKE_EMAMI: "coin", SEKE_BAHAR: "coin", SEKE_NIM: "coin", SEKE_ROB: "coin", SEKE_GERAMI: "coin",
  // Crypto
  TETHER: "crypto",
};

// Stock category mapping
const STOCK_CATEGORY_SYMBOLS: Record<string, string[]> = {
  popular: ["فملی", "شپنا", "فولاد", "شبندر", "خودرو", "خساپا", "وبملت", "وتجارت", "شستا", "کگل", "پارس", "فخوز", "شتران", "کچاد", "وپاسار"],
  auto: ["خودرو", "خساپا", "خزامیا", "خپارس", "خبهمن", "خگستر", "خکاوه", "خمحرکه", "خمهر", "خنصیر", "خوساز", "خکمک"],
  bank: ["وبملت", "وتجارت", "وپاسار", "وبصادر", "وسینا", "وپست", "وکار", "وخاور", "دی", "وآیند"],
  petro: ["شپنا", "شبندر", "شتران", "شبریز", "شسپا", "شاوان", "شراز", "شنفت", "پارس", "جم"],
  metal: ["فملی", "فولاد", "فخوز", "کگل", "کچاد", "فخاس", "فباهنر", "فسرب", "هرمز", "فسازان"],
  investment: ["شستا", "وغدیر", "وبانک", "وصندوق", "وامید", "وسپه", "واتی", "وکغدیر"],
};

// Format number to Persian
const formatPersianNumber = (num: number): string => {
  return new Intl.NumberFormat("fa-IR").format(Math.round(num));
};

export default function AssetSelector({ onSelect, onClose }: AssetSelectorProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);
  const [selectedStockSubcategory, setSelectedStockSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currencyAssets, setCurrencyAssets] = useState<Asset[]>([]);
  const [cryptoAssets, setCryptoAssets] = useState<Asset[]>([]);
  const [stockAssets, setStockAssets] = useState<Asset[]>([]);
  const [carAssets, setCarAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch currency assets
  useEffect(() => {
    if (selectedCategory && ["currency", "gold", "coin"].includes(selectedCategory)) {
      setLoading(true);
      fetch("/api/currency")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            const assetList = Object.values(data.data).map((item: any) => ({
              ...item,
              type: CURRENCY_CATEGORY_SLUGS[item.slug] || "currency",
            })) as Asset[];
            setCurrencyAssets(assetList);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedCategory]);

  // Fetch crypto assets
  useEffect(() => {
    if (selectedCategory === "crypto") {
      setLoading(true);
      fetch("/api/crypto")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            const assetList = (data.data as any[]).map((item) => ({
              ...item,
              type: "crypto",
            })) as Asset[];
            setCryptoAssets(assetList);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedCategory]);

  // Fetch car assets
  useEffect(() => {
    if (selectedCategory === "car") {
      setLoading(true);
      fetch("/api/car")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            // data.data is Record<string, CarPriceItem>, not array
            const assetList = Object.values(data.data).map((car: any) => ({
              slug: car.unique_id,
              name: car.name,
              price: car.price,
              change_percent: car.change_percent || 0,
              type: "car",
            })) as Asset[];
            setCarAssets(assetList);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedCategory]);

  // Fetch stock assets
  useEffect(() => {
    if (selectedCategory === "stock" && selectedStockSubcategory) {
      setLoading(true);
      fetch(`/api/stock?category=${selectedStockSubcategory}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            const assetList = Object.values(data.data).map((stock: any) => ({
              slug: stock.slug || stock.name,
              name: stock.fullName || stock.name,
              price: stock.finalPrice || stock.closePrice || 0,
              change_percent: stock.finalPriceChangePercent || stock.closePriceChangePercent || 0,
              type: "stock",
            })) as Asset[];
            setStockAssets(assetList);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedCategory, selectedStockSubcategory]);

  // Filter assets
  const filteredAssets = useMemo(() => {
    if (selectedCategory === "stock") {
      if (!selectedStockSubcategory) return [];
      
      const allowedSymbols = STOCK_CATEGORY_SYMBOLS[selectedStockSubcategory] || [];
      let filtered = stockAssets.filter((asset) => 
        allowedSymbols.includes(asset.slug) || allowedSymbols.length === 0
      );

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (asset) =>
            asset.name.toLowerCase().includes(query) ||
            asset.slug.toLowerCase().includes(query)
        );
      }
      return filtered;
    } else if (selectedCategory === "crypto") {
      let filtered = cryptoAssets;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (asset) =>
            asset.name.toLowerCase().includes(query) ||
            asset.slug.toLowerCase().includes(query)
        );
      }
      return filtered;
    } else if (selectedCategory === "car") {
      let filtered = carAssets;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (asset) =>
            asset.name.toLowerCase().includes(query) ||
            asset.slug.toLowerCase().includes(query)
        );
      }
      return filtered;
    } else {
      if (!selectedCategory) return [];

      return currencyAssets.filter((asset) => {
        const assetCategory = CURRENCY_CATEGORY_SLUGS[asset.slug];
        if (assetCategory !== selectedCategory) return false;

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            asset.name.toLowerCase().includes(query) ||
            asset.slug.toLowerCase().includes(query)
          );
        }
        return true;
      });
    }
  }, [currencyAssets, cryptoAssets, stockAssets, carAssets, selectedCategory, selectedStockSubcategory, searchQuery]);

  const handleCategorySelect = (category: CategoryType) => {
    setSelectedCategory(category);
    if (category === "stock") {
      setStep(2); // Go to stock subcategory selection
    } else {
      setStep(3); // Go directly to asset selection
    }
  };

  const handleStockSubcategorySelect = (subcategoryId: string) => {
    setSelectedStockSubcategory(subcategoryId);
    setStep(3);
  };

  const handleBack = () => {
    if (step === 3 && selectedCategory === "stock") {
      setStep(2);
      setSelectedStockSubcategory(null);
      setSearchQuery("");
    } else if (step === 3) {
      setStep(1);
      setSelectedCategory(null);
      setSearchQuery("");
    } else {
      setStep(1);
      setSelectedCategory(null);
    }
  };

  const handleAssetSelect = (asset: Asset) => {
    onSelect({
      ...asset,
      type: selectedCategory || "currency",
    });
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="p-1 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="font-bold text-stone-900">
              {step === 1 && "انتخاب نوع دارایی"}
              {step === 2 && selectedCategory === "stock" && "انتخاب دسته‌بندی بورس"}
              {step === 3 && "انتخاب دارایی"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {step === 1 && (
            /* Step 1: Select Category */
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className="flex flex-col items-center gap-2 p-4 bg-stone-50 hover:bg-stone-100 rounded-xl transition-colors text-center"
                  >
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Icon className="w-6 h-6 text-stone-700" />
                    </div>
                    <div>
                      <div className="font-bold text-stone-900">{category.name}</div>
                      <div className="text-xs text-stone-500">{category.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && selectedCategory === "stock" && (
            /* Step 2: Select Stock Subcategory */
            <div className="grid grid-cols-2 gap-3">
              {STOCK_SUBCATEGORIES.map((subcategory) => {
                const Icon = subcategory.icon;
                return (
                  <button
                    key={subcategory.id}
                    onClick={() => handleStockSubcategorySelect(subcategory.id)}
                    className="flex flex-col items-center gap-2 p-4 bg-stone-50 hover:bg-stone-100 rounded-xl transition-colors text-center"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Icon className="w-5 h-5 text-stone-700" />
                    </div>
                    <div className="font-medium text-stone-900 text-sm">{subcategory.name}</div>
                  </button>
                );
              })}
            </div>
          )}

          {step === 3 && (
            /* Step 3: Search and Select Asset */
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  placeholder="جستجو..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 bg-stone-100 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>

              {/* Asset List */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAssets.length === 0 ? (
                    <div className="text-center py-8 text-stone-500">
                      داده‌ای یافت نشد
                    </div>
                  ) : (
                    filteredAssets.map((asset) => (
                      <button
                        key={asset.slug}
                        onClick={() => handleAssetSelect(asset)}
                        className="w-full flex items-center justify-between p-3 bg-stone-50 hover:bg-stone-100 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                            {selectedCategory === "stock" ? (
                              <TrendingUp className="w-5 h-5 text-stone-600" />
                            ) : selectedCategory === "car" ? (
                              <Car className="w-5 h-5 text-stone-600" />
                            ) : (
                              <DollarSign className="w-5 h-5 text-stone-600" />
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-stone-900">{asset.name}</div>
                            <div className="text-xs text-stone-500">{asset.slug}</div>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-stone-900">
                            {formatPersianNumber(asset.price)}
                          </div>
                          <div
                            className={`text-xs font-medium ${
                              asset.change_percent >= 0
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {asset.change_percent >= 0 ? "+" : ""}
                            {(asset.change_percent || 0).toFixed(2)}٪
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
