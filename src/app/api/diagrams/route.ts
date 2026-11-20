import { NextResponse } from "next/server";
import { diagramService } from "@/lib/diagram_service";
import { auth, isAdminUser } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (process.env.ADMIN_EMAIL && (!session || !isAdminUser(session.user?.email))) {
    return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const diagram = await diagramService.create(body);
    return NextResponse.json(diagram, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create diagram" }, { status: 400 });
  }
}
