import { NextResponse } from "next/server";
import { diagramService } from "@/lib/diagram-service";
import { getNotionPageDetail, updateNotionPageContent } from "@/lib/notion";
import type { NotionUpdateBlockItem, NotionUpdatePagePayload } from "@/types/notion";

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
    const body = (await req.json()) as unknown;
    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { error: "Invalid request payload: must be an object" },
        { status: 400 }
      );
    }

    const payload = body as {
      title?: unknown;
      blocks?: unknown;
    };

    if (payload.title !== undefined && typeof payload.title !== "string") {
      return NextResponse.json({ error: "Invalid title: must be a string" }, { status: 400 });
    }

    if (payload.blocks !== undefined && !Array.isArray(payload.blocks)) {
      return NextResponse.json({ error: "Invalid blocks: must be an array" }, { status: 400 });
    }

    const validatedPayload: NotionUpdatePagePayload = {
      ...(typeof payload.title === "string" ? { title: payload.title } : {}),
      ...(Array.isArray(payload.blocks)
        ? { blocks: payload.blocks as NotionUpdateBlockItem[] }
        : {}),
    };

    const result = await updateNotionPageContent(pageId, validatedPayload);

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
