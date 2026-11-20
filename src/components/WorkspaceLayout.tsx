"use client";

import { useState } from "react";
import { ExcalidrawWrapper } from "@/components/ExcalidrawWrapper";
import { NotionReader } from "@/components/NotionReader";
import type { DiagramDocument } from "@/types/diagram";
import type { NotionPageDetail } from "@/types/notion";

interface WorkspaceLayoutProps {
  pageDetail: NotionPageDetail;
  diagram: DiagramDocument;
}

export function WorkspaceLayout({ pageDetail, diagram }: WorkspaceLayoutProps) {
  const [splitRatio, setSplitRatio] = useState<number>(40);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-zinc-950">
      <div style={{ width: `${splitRatio}%` }} className="h-full flex-shrink-0">
        <NotionReader pageDetail={pageDetail} diagramId={diagram.id} />
      </div>

      <div
        className="w-1.5 cursor-col-resize bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-400 dark:hover:bg-zinc-600 transition flex-shrink-0"
        onMouseDown={(_e) => {
          const handleMouseMove = (moveEvent: MouseEvent) => {
            const newRatio = (moveEvent.clientX / window.innerWidth) * 100;
            if (newRatio >= 20 && newRatio <= 70) {
              setSplitRatio(newRatio);
            }
          };

          const handleMouseUp = () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
          };

          window.addEventListener("mousemove", handleMouseMove);
          window.addEventListener("mouseup", handleMouseUp);
        }}
      />

      <div style={{ width: `${100 - splitRatio}%` }} className="h-full flex-1">
        <ExcalidrawWrapper
          diagramId={diagram.id}
          initialElements={diagram.elements}
          initialAppState={diagram.appState}
        />
      </div>
    </div>
  );
}
