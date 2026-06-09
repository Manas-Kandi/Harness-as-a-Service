import { NextRequest } from "next/server";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ config: store.getConfig(), monthlySpend: store.getMonthlySpend() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config = store.updateConfig(body);
    return Response.json({ config, monthlySpend: store.getMonthlySpend() });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
