import { NextResponse } from "next/server";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

const COINS = [
  { id: "bitcoin", symbol: "BTC", name: "بیت‌کوین" },
  { id: "ethereum", symbol: "ETH", name: "اتریوم" },
  { id: "tether", symbol: "USDT", name: "تتر" },
  { id: "binancecoin", symbol: "BNB", name: "بایننس کوین" },
  { id: "ripple", symbol: "XRP", name: "ریپل" },
  { id: "cardano", symbol: "ADA", name: "کاردانو" },
  { id: "solana", symbol: "SOL", name: "سولانا" },
  { id: "dogecoin", symbol: "DOGE", name: "دوج‌کوین" },
  { id: "tron", symbol: "TRX", name: "ترون" },
  { id: "polkadot", symbol: "DOT", name: "پولکادات" },
  { id: "shiba-inu", symbol: "SHIB", name: "شیبا اینو" },
  { id: "avalanche-2", symbol: "AVAX", name: "آوالانچ" },
];

export async function GET() {
  try {
    const ids = COINS.map((coin) => coin.id).join(",");
    const url = `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;

    const response = await fetch(url, { next: { revalidate: 60 } });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "خطا در دریافت اطلاعات رمزارز" },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Format for market page
    const crypto = COINS.map((coin) => ({
      id: coin.id,
      name: coin.id,
      symbol: coin.symbol,
      nameFa: coin.name,
      price: data[coin.id]?.usd || 0,
      change24h: data[coin.id]?.usd_24h_change || 0,
      marketCap: data[coin.id]?.usd_market_cap || 0,
      volume24h: data[coin.id]?.usd_24h_vol || 0,
    }));

    // Also provide legacy format for AssetSelector
    const legacyData = COINS.map((coin) => ({
      slug: coin.symbol,
      name: coin.name,
      price: data[coin.id]?.usd || 0,
      change_percent: data[coin.id]?.usd_24h_change || 0,
    }));

    return NextResponse.json({
      success: true,
      crypto, // for market page
      data: legacyData, // for AssetSelector
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Crypto API Error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت اطلاعات رمزارز" },
      { status: 500 }
    );
  }
}
