/**
 * Technical Analysis Library
 * Fibonacci, Gann, and PRZ calculations
 */

export interface PricePoint {
  date: string;
  price: number;
  high?: number;
  low?: number;
}

export interface FibonacciLevel {
  level: number;
  price: number;
  label: string;
  type: "retracement" | "extension";
}

export interface GannLevel {
  angle: number;
  price: number;
  label: string;
}

export interface PRZZone {
  low: number;
  high: number;
  strength: "weak" | "medium" | "strong";
  confluences: string[];
}

export interface TechnicalAnalysis {
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

// Fibonacci ratios
const FIB_RETRACEMENT_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
const FIB_EXTENSION_LEVELS = [1, 1.272, 1.414, 1.618, 2, 2.618, 3.618];

// Gann angles (1x1, 1x2, 2x1, etc.)
const GANN_ANGLES = [
  { ratio: 1 / 8, label: "1×8", angle: 82.5 },
  { ratio: 1 / 4, label: "1×4", angle: 75 },
  { ratio: 1 / 3, label: "1×3", angle: 71.25 },
  { ratio: 1 / 2, label: "1×2", angle: 63.75 },
  { ratio: 1, label: "1×1", angle: 45 },
  { ratio: 2, label: "2×1", angle: 26.25 },
  { ratio: 3, label: "3×1", angle: 18.75 },
  { ratio: 4, label: "4×1", angle: 15 },
  { ratio: 8, label: "8×1", angle: 7.5 },
];

/**
 * Find swing high and low from price data
 */
export function findSwingPoints(prices: PricePoint[]): {
  high: number;
  low: number;
  highDate: string;
  lowDate: string;
  highIndex: number;
  lowIndex: number;
} {
  if (prices.length === 0) {
    return { high: 0, low: 0, highDate: "", lowDate: "", highIndex: 0, lowIndex: 0 };
  }

  let high = prices[0].price;
  let low = prices[0].price;
  let highDate = prices[0].date;
  let lowDate = prices[0].date;
  let highIndex = 0;
  let lowIndex = 0;

  prices.forEach((p, index) => {
    const priceValue = p.high || p.price;
    const lowValue = p.low || p.price;
    
    if (priceValue > high) {
      high = priceValue;
      highDate = p.date;
      highIndex = index;
    }
    if (lowValue < low) {
      low = lowValue;
      lowDate = p.date;
      lowIndex = index;
    }
  });

  return { high, low, highDate, lowDate, highIndex, lowIndex };
}

/**
 * Determine trend based on swing points
 */
export function determineTrend(
  prices: PricePoint[],
  swingHigh: number,
  swingLow: number
): "bullish" | "bearish" | "neutral" {
  if (prices.length < 2) return "neutral";

  const currentPrice = prices[prices.length - 1].price;
  const midPoint = (swingHigh + swingLow) / 2;
  const range = swingHigh - swingLow;
  
  // Check if price is in upper or lower half
  if (currentPrice > midPoint + range * 0.1) return "bullish";
  if (currentPrice < midPoint - range * 0.1) return "bearish";
  return "neutral";
}

/**
 * Calculate Fibonacci retracement levels
 */
export function calculateFibonacciRetracement(
  swingHigh: number,
  swingLow: number,
  isUptrend: boolean
): FibonacciLevel[] {
  const range = swingHigh - swingLow;
  
  return FIB_RETRACEMENT_LEVELS.map((level) => {
    const price = isUptrend
      ? swingHigh - range * level // In uptrend, retrace from high
      : swingLow + range * level; // In downtrend, retrace from low
    
    return {
      level,
      price: Math.round(price),
      label: `${(level * 100).toFixed(1)}%`,
      type: "retracement" as const,
    };
  });
}

/**
 * Calculate Fibonacci extension levels
 */
export function calculateFibonacciExtension(
  swingHigh: number,
  swingLow: number,
  isUptrend: boolean
): FibonacciLevel[] {
  const range = swingHigh - swingLow;
  
  return FIB_EXTENSION_LEVELS.map((level) => {
    const price = isUptrend
      ? swingLow + range * level // In uptrend, extend from low
      : swingHigh - range * level; // In downtrend, extend from high
    
    return {
      level,
      price: Math.round(price),
      label: `${(level * 100).toFixed(1)}%`,
      type: "extension" as const,
    };
  });
}

/**
 * Calculate Gann levels
 */
export function calculateGannLevels(
  swingHigh: number,
  swingLow: number,
  barsCount: number,
  isUptrend: boolean
): GannLevel[] {
  const priceRange = swingHigh - swingLow;
  const basePrice = isUptrend ? swingLow : swingHigh;
  
  // Calculate price per bar (time unit)
  const pricePerBar = priceRange / barsCount;
  
  return GANN_ANGLES.map(({ ratio, label, angle }) => {
    // Gann level at current time
    const priceMove = pricePerBar * barsCount * ratio;
    const price = isUptrend
      ? basePrice + priceMove
      : basePrice - priceMove;
    
    return {
      angle,
      price: Math.round(price),
      label,
    };
  });
}

/**
 * Calculate Gann Square of 9 levels
 */
export function calculateGannSquareOf9(basePrice: number): number[] {
  const sqrt = Math.sqrt(basePrice);
  const levels: number[] = [];
  
  // Calculate levels at 45°, 90°, 135°, 180°, 225°, 270°, 315°, 360°
  for (let i = 1; i <= 8; i++) {
    const increment = i * 0.125; // Each 45° = 0.125 of full rotation
    levels.push(Math.round(Math.pow(sqrt + increment, 2)));
    levels.push(Math.round(Math.pow(sqrt - increment, 2)));
  }
  
  return [...new Set(levels)].sort((a, b) => a - b);
}

/**
 * Find PRZ (Potential Reversal Zone) - confluence of Fibonacci levels
 */
export function findPRZ(
  fibRetracement: FibonacciLevel[],
  fibExtension: FibonacciLevel[],
  gannLevels: GannLevel[],
  tolerance: number = 0.02 // 2% tolerance
): PRZZone[] {
  const allLevels: { price: number; source: string }[] = [
    ...fibRetracement.map((f) => ({ price: f.price, source: `فیبو ${f.label}` })),
    ...fibExtension.map((f) => ({ price: f.price, source: `اکستنشن ${f.label}` })),
    ...gannLevels.map((g) => ({ price: g.price, source: `گن ${g.label}` })),
  ];

  // Sort by price
  allLevels.sort((a, b) => a.price - b.price);

  const przZones: PRZZone[] = [];
  let i = 0;

  while (i < allLevels.length) {
    const basePrice = allLevels[i].price;
    const toleranceRange = basePrice * tolerance;
    const confluences: string[] = [allLevels[i].source];
    
    // Find all levels within tolerance
    let j = i + 1;
    while (j < allLevels.length && allLevels[j].price - basePrice <= toleranceRange) {
      confluences.push(allLevels[j].source);
      j++;
    }

    // If we have confluence (2+ levels), create PRZ
    if (confluences.length >= 2) {
      const prices = allLevels.slice(i, j).map((l) => l.price);
      const low = Math.min(...prices);
      const high = Math.max(...prices);
      
      let strength: "weak" | "medium" | "strong" = "weak";
      if (confluences.length >= 4) strength = "strong";
      else if (confluences.length >= 3) strength = "medium";

      przZones.push({
        low,
        high,
        strength,
        confluences,
      });
    }

    i = j > i ? j : i + 1;
  }

  return przZones;
}

/**
 * Calculate support and resistance levels
 */
export function calculateSupportResistance(
  prices: PricePoint[],
  currentPrice: number
): { support: number[]; resistance: number[] } {
  const allPrices = prices.map((p) => p.price);
  const support: number[] = [];
  const resistance: number[] = [];

  // Simple pivot points
  const high = Math.max(...allPrices);
  const low = Math.min(...allPrices);
  const close = allPrices[allPrices.length - 1];

  const pivot = (high + low + close) / 3;
  const r1 = 2 * pivot - low;
  const r2 = pivot + (high - low);
  const s1 = 2 * pivot - high;
  const s2 = pivot - (high - low);

  if (r1 > currentPrice) resistance.push(Math.round(r1));
  if (r2 > currentPrice) resistance.push(Math.round(r2));
  if (s1 < currentPrice) support.push(Math.round(s1));
  if (s2 < currentPrice) support.push(Math.round(s2));

  return {
    support: support.sort((a, b) => b - a),
    resistance: resistance.sort((a, b) => a - b),
  };
}

/**
 * Full technical analysis
 */
export function performTechnicalAnalysis(prices: PricePoint[]): TechnicalAnalysis {
  const swing = findSwingPoints(prices);
  const trend = determineTrend(prices, swing.high, swing.low);
  const isUptrend = trend === "bullish" || swing.highIndex > swing.lowIndex;

  const fibRetracement = calculateFibonacciRetracement(swing.high, swing.low, isUptrend);
  const fibExtension = calculateFibonacciExtension(swing.high, swing.low, isUptrend);
  const gannLevels = calculateGannLevels(swing.high, swing.low, prices.length, isUptrend);
  const prz = findPRZ(fibRetracement, fibExtension, gannLevels);

  return {
    fibonacci: {
      retracement: fibRetracement,
      extension: fibExtension,
    },
    gann: gannLevels,
    prz,
    swing: {
      high: swing.high,
      low: swing.low,
      highDate: swing.highDate,
      lowDate: swing.lowDate,
    },
    trend,
  };
}

/**
 * Format price for display
 */
export function formatAnalysisPrice(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(2)} M`;
  }
  if (price >= 1000) {
    return `${(price / 1000).toFixed(1)} K`;
  }
  return price.toFixed(0);
}
