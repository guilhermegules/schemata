import { notFound } from "next/navigation";
import { WorkspaceLayout } from "@/components/WorkspaceLayout";
import { diagramService } from "@/lib/diagram_service";
import { getNotionPageDetail } from "@/lib/notion";

export default async function WorkspacePage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;

  try {
    const pageDetail = await getNotionPageDetail(pageId);
    let diagram = await diagramService.getByNotionPageId(pageId);

    if (!diagram) {
      diagram = await diagramService.create({
        title: `${pageDetail.page.title} Architecture`,
        notionPageId: pageId,
      });
    }

    return <WorkspaceLayout pageDetail={pageDetail} diagram={diagram} />;
  } catch {
    notFound();
  }
}
