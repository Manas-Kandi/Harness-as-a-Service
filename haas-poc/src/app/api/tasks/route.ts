import { NextRequest } from "next/server";
import { store } from "@/lib/store";
import { submitTask, approveTask } from "@/lib/harness";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ tasks: store.getTasks() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "submit") {
      const { type, description, mode, priority, requestedBy } = body;
      if (!type || !description || !mode || !priority || !requestedBy) {
        return Response.json({ error: "Missing required fields" }, { status: 400 });
      }
      const result = submitTask(type, description, mode, priority, requestedBy);
      return Response.json(result);
    }

    if (action === "approve") {
      const { taskId, approved, notes } = body;
      if (!taskId) {
        return Response.json({ error: "Missing taskId" }, { status: 400 });
      }
      const result = approveTask(taskId, approved, notes);
      return Response.json(result);
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
