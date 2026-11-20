import { NextResponse } from "next/server";
import { auth, isAdminUser } from "@/lib/auth";
import { diagramService } from "@/lib/diagram_service";

export async function POST(req: Request) {
  const session = await auth();
  if (process.env.ADMIN_EMAIL && (!session || !isAdminUser(session.user?.email))) {
    return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const diagram = await diagramService.create(body);
    return NextResponse.json(diagram, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create diagram";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
