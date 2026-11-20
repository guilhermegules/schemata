"use client";

import React, { useState } from "react";
import { NotionPageDetail } from "@/types/notion";

interface NotionReaderProps {
  pageDetail: NotionPageDetail;
  diagramId?: string;
}

export function NotionReader({ pageDetail, diagramId }: NotionReaderProps) {
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");
  const [syncMessage, setSyncMessage] = useState<string>("");

  const handleSyncToNotion = async () => {
    if (!diagramId) return;

    setSyncStatus("syncing");
    setSyncMessage("");

    try {
      const res = await fetch(`/api/notion/${pageDetail.page.id}/sync-embed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diagramId }),
      });

      if (!res.ok) {
        throw new Error("Failed to sync embed block");
      }

      const data = await res.json();
      setSyncStatus("synced");
      setSyncMessage(`Embed ${data.action} successfully on Notion page.`);
      setTimeout(() => setSyncStatus("idle"), 4000);
    } catch {
      setSyncStatus("error");
      setSyncMessage("Error syncing embed to Notion.");
    }
  };

  return (
    <div className="flex h-full flex-col bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-lg">{pageDetail.page.icon || "📄"}</span>
          <h2 className="text-sm font-semibold truncate text-zinc-900 dark:text-zinc-100">
            {pageDetail.page.title}
          </h2>
        </div>
        {diagramId && (
          <button
            onClick={handleSyncToNotion}
            disabled={syncStatus === "syncing"}
            className="flex items-center gap-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 px-3 py-1.5 text-xs font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition"
          >
            {syncStatus === "syncing" ? "Syncing..." : "Sync Embed to Notion"}
          </button>
        )}
      </div>

      {syncMessage && (
        <div
          className={`px-4 py-2 text-xs font-medium ${
            syncStatus === "synced"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
          }`}
        >
          {syncMessage}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {pageDetail.blocks.length === 0 ? (
          <p className="text-xs text-zinc-400">No content blocks found for this Notion page.</p>
        ) : (
          pageDetail.blocks.map((block) => (
            <div key={block.id} className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
              {block.type === "heading_1" && (
                <h1 className="text-xl font-bold text-zinc-950 dark:text-zinc-50 pt-2">{block.content}</h1>
              )}
              {block.type === "heading_2" && (
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 pt-1.5">{block.content}</h2>
              )}
              {block.type === "heading_3" && (
                <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">{block.content}</h3>
              )}
              {block.type === "paragraph" && <p className="text-zinc-700 dark:text-zinc-300">{block.content}</p>}
              {block.type === "bulleted_list_item" && (
                <li className="ml-4 list-disc text-zinc-700 dark:text-zinc-300">{block.content}</li>
              )}
              {block.type === "numbered_list_item" && (
                <li className="ml-4 list-decimal text-zinc-700 dark:text-zinc-300">{block.content}</li>
              )}
              {block.type === "divider" && <hr className="border-zinc-200 dark:border-zinc-800 my-3" />}
              {block.type === "embed" && (
                <div className="rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 p-2 text-xs truncate font-mono text-zinc-600 dark:text-zinc-400">
                  Embed: {block.content}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
