import { notFound } from "next/navigation";
import { ExcalidrawWrapper } from "@/components/ExcalidrawWrapper";
import { diagramService } from "@/lib/diagram_service";

export default async function EmbedPage({ params }: { params: Promise<{ diagramId: string }> }) {
  const { diagramId } = await params;
  const diagram = await diagramService.getById(diagramId);

  if (!diagram) {
    notFound();
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-white dark:bg-zinc-950">
      <ExcalidrawWrapper
        diagramId={diagram.id}
        initialElements={diagram.elements}
        initialAppState={diagram.appState}
        isReadOnly={false}
      />
    </div>
  );
}
