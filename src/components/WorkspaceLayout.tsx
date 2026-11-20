"use client";

import { useEffect, useState } from "react";
import { ExcalidrawWrapper } from "@/components/ExcalidrawWrapper";
import { NotionReader } from "@/components/NotionReader";
import { useTheme } from "@/lib/UseTheme";
import type { DiagramDocument } from "@/types/diagram";
import type { NotionPageDetail } from "@/types/notion";

interface WorkspaceLayoutProps {
  pageDetail: NotionPageDetail;
  diagram: DiagramDocument;
}

export function WorkspaceLayout({ pageDetail, diagram }: WorkspaceLayoutProps) {
  const [splitRatio, setSplitRatio] = useState<number>(40);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const { resolvedTheme } = useTheme();

  // Keyboard shortcut: Ctrl+\ or Cmd+\ to toggle sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "\\") {
        e.preventDefault();
        setIsSidebarCollapsed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-white dark:bg-zinc-950">
      {/* Floating Edge Trigger when Sidebar is Collapsed */}
      {isSidebarCollapsed && (
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(false)}
          title="Show Document Pane (Ctrl+\)"
          className="absolute left-3 top-3 z-30 flex items-center gap-1.5 rounded-md bg-white/90 dark:bg-zinc-800/90 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 shadow-md backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <span className="hidden sm:inline">Show Document</span>
        </button>
      )}

      {/* Notion Document Sidebar Pane */}
      {!isSidebarCollapsed && (
        <>
          <div style={{ width: `${splitRatio}%` }} className="h-full flex-shrink-0">
            <NotionReader
              pageDetail={pageDetail}
              diagramId={diagram.id}
              onCollapse={() => setIsSidebarCollapsed(true)}
            />
          </div>

          {/* Draggable Divider */}
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
        </>
      )}

      {/* Excalidraw Canvas Pane */}
      <div className="h-full flex-1">
        <ExcalidrawWrapper
          diagramId={diagram.id}
          initialElements={diagram.elements}
          initialAppState={diagram.appState}
          theme={resolvedTheme}
        />
      </div>
    </div>
  );
}
