import { NextResponse } from "next/server";
import { diagramService } from "@/lib/diagram-service";
import { getNotionPageDetail, updateNotionPageContent } from "@/lib/notion";

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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch Notion page";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;

  try {
    const body = (await req.json()) as {
      title?: string;
      blocks?: Array<{ id: string; type: string; content: string }>;
    };

    const result = await updateNotionPageContent(pageId, body);

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update Notion page";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
