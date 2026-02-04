import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.SOURCEARENA_API_TOKEN;
  
  if (!token) {
    return NextResponse.json({ error: "No token configured" });
  }

  const url = `https://apis.sourcearena.ir/api/?token=${token}&currency`;
  
  try {
    const response = await fetch(url, { cache: "no-store" });
    const data = await response.json();
    
    return NextResponse.json({
      url,
      status: response.status,
      data,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
