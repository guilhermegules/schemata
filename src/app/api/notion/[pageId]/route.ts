import { NextResponse } from "next/server";
import { getNotionPageDetail } from "@/lib/notion";
import { diagramService } from "@/lib/diagram_service";

export async function GET(_req: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;

  try {
    const pageDetail = await getNotionPageDetail(pageId);
    const linkedDiagram = await diagramService.getByNotionPageId(pageId);

    return NextResponse.json(
      {
        ...pageDetail,
        linkedDiagramId: linkedDiagram?.id,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch Notion page" }, { status: 502 });
  }
}
