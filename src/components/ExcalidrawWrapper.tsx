"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { AppStatePersisted } from "@/types/diagram";
import { sanitizeAppState } from "@/lib/sanitizer";

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-zinc-500 text-sm">
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-zinc-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading Canvas...
        </div>
      </div>
    ),
  }
);

interface ExcalidrawWrapperProps {
  diagramId: string;
  initialElements?: readonly any[];
  initialAppState?: Partial<AppStatePersisted>;
  isReadOnly?: boolean;
}

export function ExcalidrawWrapper({
  diagramId,
  initialElements = [],
  initialAppState,
  isReadOnly = false,
}: ExcalidrawWrapperProps) {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestDataRef = useRef<{ elements: readonly any[]; appState: any }>({
    elements: initialElements,
    appState: initialAppState || {},
  });
  const hasPendingChangesRef = useRef<boolean>(false);

  const saveDiagram = useCallback(
    async (elements: readonly any[], appState: any) => {
      if (isReadOnly) return;
      setSaveStatus("saving");

      const sanitizedState = sanitizeAppState(appState);
      const payload = {
        elements,
        appState: sanitizedState,
      };

      try {
        const res = await fetch(`/api/diagrams/${diagramId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error("Failed to save diagram");
        }

        hasPendingChangesRef.current = false;
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } catch {
        setSaveStatus("error");
      }
    },
    [diagramId, isReadOnly]
  );

  const flushViaBeacon = useCallback(() => {
    if (!hasPendingChangesRef.current || isReadOnly) return;
    const { elements, appState } = latestDataRef.current;
    const sanitizedState = sanitizeAppState(appState);
    const payload = JSON.stringify({
      elements,
      appState: sanitizedState,
    });

    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon(`/api/diagrams/${diagramId}`, blob);
    hasPendingChangesRef.current = false;
  }, [diagramId, isReadOnly]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushViaBeacon();
      }
    };

    const handleBeforeUnload = () => {
      flushViaBeacon();
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [flushViaBeacon]);

  const handleChange = (elements: readonly any[], appState: any) => {
    if (isReadOnly) return;

    latestDataRef.current = { elements, appState };
    hasPendingChangesRef.current = true;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      saveDiagram(elements, appState);
    }, 2000);
  };

  return (
    <div className="relative h-full w-full">
      {!isReadOnly && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2 rounded-md bg-white/90 dark:bg-zinc-800/90 px-2.5 py-1 text-xs shadow backdrop-blur-sm border border-zinc-200 dark:border-zinc-700">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Saving...
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Saved
            </span>
          )}
          {saveStatus === "error" && (
            <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Save error
            </span>
          )}
          {saveStatus === "idle" && (
            <span className="text-zinc-400 dark:text-zinc-500">Auto-save (2s)</span>
          )}
        </div>
      )}

      <Excalidraw
        initialData={{
          elements: initialElements,
          appState: sanitizeAppState(initialAppState) as any,
        }}
        onChange={handleChange}
        viewModeEnabled={isReadOnly}
        zenModeEnabled={isReadOnly}
        gridModeEnabled={false}
      />
    </div>
  );
}
