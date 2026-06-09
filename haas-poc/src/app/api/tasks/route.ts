import { NextRequest } from "next/server";
import { store } from "@/lib/store";
import { submitTask, approveTask } from "@/lib/harness";
import { SubmitTaskSchema, ApproveTaskSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ tasks: store.getTasks() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const submitResult = SubmitTaskSchema.safeParse(body);
    if (submitResult.success) {
      const { type, description, mode, priority, requestedBy } = submitResult.data;
      const result = submitTask(type, description, mode, priority, requestedBy);
      return Response.json(result);
    }

    const approveResult = ApproveTaskSchema.safeParse(body);
    if (approveResult.success) {
      const { taskId, approved, notes } = approveResult.data;
      const result = approveTask(taskId, approved, notes);
      return Response.json(result);
    }

    const allErrors = [
      ...(submitResult.error?.errors || []),
      ...(approveResult.error?.errors || []),
    ];
    return Response.json({ error: "Invalid request", details: allErrors.map((e) => e.message) }, { status: 400 });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
