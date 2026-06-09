import { NextRequest } from "next/server";
import { store } from "@/lib/store";
import { UpdateHarnessConfigSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ config: store.getConfig(), monthlySpend: store.getMonthlySpend() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = UpdateHarnessConfigSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid config", details: parsed.error.errors.map((e) => e.message) },
        { status: 400 }
      );
    }
    const config = store.updateConfig(parsed.data);
    return Response.json({ config, monthlySpend: store.getMonthlySpend() });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
