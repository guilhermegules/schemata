import { NextResponse } from "next/server";
import { auth, isAdminUser } from "@/lib/auth";
import { upsertNotionEmbedBlock } from "@/lib/notion";

export async function POST(req: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const session = await auth();
  if (process.env.ADMIN_EMAIL && (!session || !isAdminUser(session.user?.email))) {
    return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
  }

  const { pageId } = await params;

  try {
    const body = await req.json();
    const { diagramId } = body;

    if (!diagramId) {
      return NextResponse.json({ error: "Missing diagramId" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const embedUrl = `${baseUrl}/embed/${diagramId}`;

    const result = await upsertNotionEmbedBlock(pageId, embedUrl);

    return NextResponse.json(
      {
        success: true,
        action: result.action,
        blockId: result.blockId,
        embedUrl,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to sync embed to Notion";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
