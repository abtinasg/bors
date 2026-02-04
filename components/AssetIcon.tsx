"use client";

interface AssetIconProps {
  assetSlug: string;
  assetType: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Country codes for flag CDN
const currencyToCountry: Record<string, string> = {
  USD: "us",
  EUR: "eu",
  GBP: "gb",
  AED: "ae",
  TRY: "tr",
  CHF: "ch",
  CNY: "cn",
  JPY: "jp",
  CAD: "ca",
  AUD: "au",
  SEK: "se",
  NOK: "no",
  DKK: "dk",
  INR: "in",
  KWD: "kw",
  QAR: "qa",
  SAR: "sa",
  RUB: "ru",
  AFN: "af",
  IQD: "iq",
  PKR: "pk",
  OMR: "om",
  BHD: "bh",
  NZD: "nz",
  HKD: "hk",
  SGD: "sg",
  MYR: "my",
  THB: "th",
  KRW: "kr",
  GEL: "ge",
  AZN: "az",
  AMD: "am",
  KGS: "kg",
  TJS: "tj",
  TMT: "tm",
  SYP: "sy",
};

// Currency symbol icons (shown on top of flag)
const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CHF: "₣",
  CNY: "¥",
  INR: "₹",
  RUB: "₽",
  KRW: "₩",
  TRY: "₺",
  THB: "฿",
};

// تنظیمات آیکون برای دارایی‌های غیر ارزی
const assetEmoji: Record<string, { emoji: string; bgColor: string }> = {
  // طلا
  geram18: { emoji: "🥇", bgColor: "bg-gradient-to-br from-yellow-400 to-amber-500" },
  geram24: { emoji: "🥇", bgColor: "bg-gradient-to-br from-yellow-400 to-amber-500" },
  mesghal: { emoji: "⚖️", bgColor: "bg-gradient-to-br from-yellow-400 to-amber-500" },
  ons: { emoji: "🏆", bgColor: "bg-gradient-to-br from-yellow-400 to-amber-500" },
  ONS: { emoji: "🏆", bgColor: "bg-gradient-to-br from-yellow-400 to-amber-500" },
  ONSNOGHRE: { emoji: "🥈", bgColor: "bg-gradient-to-br from-gray-300 to-gray-400" },
  TALA_18: { emoji: "🥇", bgColor: "bg-gradient-to-br from-yellow-400 to-amber-500" },
  TALA_24: { emoji: "🥇", bgColor: "bg-gradient-to-br from-yellow-400 to-amber-500" },
  TALA_MESGHAL: { emoji: "⚖️", bgColor: "bg-gradient-to-br from-yellow-400 to-amber-500" },
  
  // سکه
  sekee: { emoji: "🪙", bgColor: "bg-gradient-to-br from-amber-500 to-orange-500" },
  sekeb: { emoji: "🪙", bgColor: "bg-gradient-to-br from-amber-500 to-orange-500" },
  nim: { emoji: "🪙", bgColor: "bg-gradient-to-br from-amber-500 to-orange-500" },
  rob: { emoji: "🪙", bgColor: "bg-gradient-to-br from-amber-500 to-orange-500" },
  gerami: { emoji: "🪙", bgColor: "bg-gradient-to-br from-amber-500 to-orange-500" },
  emami: { emoji: "🪙", bgColor: "bg-gradient-to-br from-amber-500 to-orange-500" },
  bahar: { emoji: "🪙", bgColor: "bg-gradient-to-br from-amber-500 to-orange-500" },
  SEKE_EMAMI: { emoji: "🪙", bgColor: "bg-gradient-to-br from-amber-500 to-orange-500" },
  SEKE_BAHAR: { emoji: "🪙", bgColor: "bg-gradient-to-br from-amber-500 to-orange-500" },
  SEKE_NIM: { emoji: "🪙", bgColor: "bg-gradient-to-br from-amber-500 to-orange-500" },
  SEKE_ROB: { emoji: "🪙", bgColor: "bg-gradient-to-br from-amber-500 to-orange-500" },
  SEKE_GERAMI: { emoji: "🪙", bgColor: "bg-gradient-to-br from-amber-500 to-orange-500" },
  
  // کریپتو
  BTC: { emoji: "₿", bgColor: "bg-gradient-to-br from-orange-400 to-orange-600" },
  ETH: { emoji: "Ξ", bgColor: "bg-gradient-to-br from-violet-500 to-purple-600" },
  USDT: { emoji: "₮", bgColor: "bg-gradient-to-br from-green-400 to-emerald-600" },
  TETHER: { emoji: "₮", bgColor: "bg-gradient-to-br from-green-400 to-emerald-600" },
  BNB: { emoji: "◆", bgColor: "bg-gradient-to-br from-yellow-400 to-yellow-600" },
  XRP: { emoji: "✕", bgColor: "bg-gradient-to-br from-blue-400 to-blue-600" },
  SOL: { emoji: "◎", bgColor: "bg-gradient-to-br from-purple-400 to-violet-600" },
  DOGE: { emoji: "🐕", bgColor: "bg-gradient-to-br from-amber-400 to-yellow-500" },
  
  // نفت و کامودیتی
  OIL: { emoji: "🛢️", bgColor: "bg-gradient-to-br from-stone-600 to-stone-800" },
  PALA: { emoji: "⬜", bgColor: "bg-gradient-to-br from-gray-400 to-gray-500" },
  ONSPALA: { emoji: "⬜", bgColor: "bg-gradient-to-br from-gray-400 to-gray-500" },
};

// Default configs
const defaultConfig: Record<string, { emoji: string; bgColor: string }> = {
  currency: { emoji: "💱", bgColor: "bg-gradient-to-br from-emerald-400 to-teal-500" },
  gold: { emoji: "🥇", bgColor: "bg-gradient-to-br from-yellow-400 to-amber-500" },
  coin: { emoji: "🪙", bgColor: "bg-gradient-to-br from-amber-500 to-orange-500" },
  crypto: { emoji: "🔗", bgColor: "bg-gradient-to-br from-violet-500 to-purple-600" },
  car: { emoji: "🚗", bgColor: "bg-gradient-to-br from-stone-500 to-stone-700" },
};

const sizeClasses = {
  sm: { container: "w-8 h-8", text: "text-sm", symbol: "text-[10px]", symbolBg: "w-4 h-4 -bottom-0.5 -right-0.5" },
  md: { container: "w-10 h-10", text: "text-lg", symbol: "text-xs", symbolBg: "w-5 h-5 -bottom-0.5 -right-0.5" },
  lg: { container: "w-12 h-12", text: "text-xl", symbol: "text-sm", symbolBg: "w-6 h-6 -bottom-1 -right-1" },
};

export default function AssetIcon({ assetSlug, assetType, size = "md", className = "" }: AssetIconProps) {
  const sizeClass = sizeClasses[size];
  
  // Check if it's a currency with a country flag
  const countryCode = currencyToCountry[assetSlug] || currencyToCountry[assetSlug.toUpperCase()];
  const symbol = currencySymbols[assetSlug] || currencySymbols[assetSlug.toUpperCase()];
  
  if (countryCode) {
    // Use flag CDN for currencies with symbol overlay
    return (
      <div className={`relative ${sizeClass.container} ${className}`}>
        {/* Flag background */}
        <div className="w-full h-full rounded-full overflow-hidden shadow-lg border-2 border-white">
          <img
            src={`https://flagcdn.com/w80/${countryCode}.png`}
            alt={assetSlug}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
        {/* Currency symbol badge */}
        {symbol && (
          <div className={`absolute ${sizeClass.symbolBg} bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-md border border-white`}>
            <span className={`${sizeClass.symbol} font-bold text-white`}>{symbol}</span>
          </div>
        )}
      </div>
    );
  }
  
  // Use emoji for non-currency assets
  const config = assetEmoji[assetSlug] || assetEmoji[assetSlug.toUpperCase()] || defaultConfig[assetType] || defaultConfig.currency;
  
  return (
    <div className={`${sizeClass.container} ${config.bgColor} rounded-full flex items-center justify-center shadow-lg border-2 border-white ${className}`}>
      <span className={`${sizeClass.text} text-white`} role="img" aria-label={assetSlug}>
        {config.emoji}
      </span>
    </div>
  );
}

// Export for external use
export { currencyToCountry, assetEmoji, defaultConfig };
