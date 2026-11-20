import { NextResponse } from "next/server";
import { diagramService } from "@/lib/diagram_service";

export async function GET(_req: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const diagram = await diagramService.getByNotionPageId(pageId);

  if (!diagram) {
    return NextResponse.json({ error: "Diagram not found for page" }, { status: 404 });
  }

  return NextResponse.json(diagram, { status: 200 });
}
