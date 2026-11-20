import { NextResponse } from "next/server";
import { diagramService } from "@/lib/diagram_service";
import { auth, isAdminUser } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const diagram = await diagramService.getById(id);

  if (!diagram) {
    return NextResponse.json({ error: "Diagram not found" }, { status: 404 });
  }

  return NextResponse.json(diagram, { status: 200 });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (process.env.ADMIN_EMAIL && (!session || !isAdminUser(session.user?.email))) {
    return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const updated = await diagramService.update(id, body);

    if (!updated) {
      return NextResponse.json({ error: "Diagram not found" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update diagram";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
