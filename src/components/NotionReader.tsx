"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { NotionBlockItem, NotionPageDetail } from "@/types/notion";

interface NotionReaderProps {
  pageDetail: NotionPageDetail;
  diagramId?: string;
  onCollapse?: () => void;
}

export function NotionReader({ pageDetail, diagramId, onCollapse }: NotionReaderProps) {
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");
  const [syncMessage, setSyncMessage] = useState<string>("");

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>(pageDetail.page.title);
  const [blocks, setBlocks] = useState<NotionBlockItem[]>(pageDetail.blocks);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    setEditTitle(pageDetail.page.title);
    setBlocks(pageDetail.blocks);
  }, [pageDetail]);

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

  const handleBlockChange = (id: string, newContent: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content: newContent } : b)));
  };

  const handleSaveChanges = async () => {
    setSaveStatus("saving");
    setSyncMessage("");

    try {
      const res = await fetch(`/api/notion/${pageDetail.page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          blocks: blocks.map((b) => ({ id: b.id, type: b.type, content: b.content })),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update page content");
      }

      setSaveStatus("saved");
      setIsEditing(false);
      setSyncMessage("Page content updated successfully.");
      setTimeout(() => setSyncMessage(""), 4000);
    } catch {
      setSaveStatus("error");
      setSyncMessage("Error updating page content.");
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(pageDetail.page.title);
    setBlocks(pageDetail.blocks);
    setIsEditing(false);
  };

  return (
    <div className="flex h-full flex-col bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-2.5 bg-white dark:bg-zinc-950 gap-2">
        <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
          <span className="text-lg flex-shrink-0">{pageDetail.page.icon || "📄"}</span>
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="text-sm font-semibold truncate text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 rounded px-2 py-0.5 border border-zinc-300 dark:border-zinc-700 w-full focus:outline-none focus:ring-1 focus:ring-zinc-400"
              placeholder="Page title..."
            />
          ) : (
            <h2 className="text-sm font-semibold truncate text-zinc-900 dark:text-zinc-100">
              {editTitle}
            </h2>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <ThemeToggle />

          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saveStatus === "saving"}
                className="px-2.5 py-1 text-xs font-medium rounded border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={saveStatus === "saving"}
                className="px-2.5 py-1 text-xs font-medium rounded bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50"
              >
                {saveStatus === "saving" ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-2.5 py-1 text-xs font-medium rounded border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                title="Edit document blocks directly"
              >
                Edit
              </button>
              {diagramId && (
                <button
                  type="button"
                  onClick={handleSyncToNotion}
                  disabled={syncStatus === "syncing"}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 px-2.5 py-1 text-xs font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition"
                >
                  {syncStatus === "syncing" ? "Syncing..." : "Sync Embed"}
                </button>
              )}
            </>
          )}

          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              title="Hide Document Pane (Ctrl+\)"
              className="p-1 rounded text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {syncMessage && (
        <div
          className={`px-4 py-2 text-xs font-medium ${
            syncMessage.includes("Error")
              ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          }`}
        >
          {syncMessage}
        </div>
      )}

      {/* Main Blocks View / Edit View */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {blocks.length === 0 ? (
          <p className="text-xs text-zinc-400">No content blocks found for this Notion page.</p>
        ) : (
          blocks.map((block) => (
            <div
              key={block.id}
              className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200"
            >
              {isEditing ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 dark:text-zinc-500">
                      {block.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  {block.type === "divider" ? (
                    <hr className="border-zinc-200 dark:border-zinc-800 my-2" />
                  ) : block.type === "embed" ? (
                    <div className="rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 p-2 text-xs truncate font-mono text-zinc-600 dark:text-zinc-400">
                      Embed: {block.content}
                    </div>
                  ) : (
                    <textarea
                      rows={block.type.startsWith("heading") ? 1 : 2}
                      value={block.content}
                      onChange={(e) => handleBlockChange(block.id, e.target.value)}
                      className={`w-full rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 ${
                        block.type === "heading_1"
                          ? "text-xl font-bold"
                          : block.type === "heading_2"
                            ? "text-lg font-semibold"
                            : block.type === "heading_3"
                              ? "text-base font-medium"
                              : "text-sm"
                      }`}
                    />
                  )}
                </div>
              ) : (
                <>
                  {block.type === "heading_1" && (
                    <h1 className="text-xl font-bold text-zinc-950 dark:text-zinc-50 pt-2">
                      {block.content}
                    </h1>
                  )}
                  {block.type === "heading_2" && (
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 pt-1.5">
                      {block.content}
                    </h2>
                  )}
                  {block.type === "heading_3" && (
                    <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                      {block.content}
                    </h3>
                  )}
                  {block.type === "paragraph" && (
                    <p className="text-zinc-700 dark:text-zinc-300">{block.content}</p>
                  )}
                  {block.type === "bulleted_list_item" && (
                    <li className="ml-4 list-disc text-zinc-700 dark:text-zinc-300">
                      {block.content}
                    </li>
                  )}
                  {block.type === "numbered_list_item" && (
                    <li className="ml-4 list-decimal text-zinc-700 dark:text-zinc-300">
                      {block.content}
                    </li>
                  )}
                  {block.type === "divider" && (
                    <hr className="border-zinc-200 dark:border-zinc-800 my-3" />
                  )}
                  {block.type === "embed" && (
                    <div className="rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 p-2 text-xs truncate font-mono text-zinc-600 dark:text-zinc-400">
                      Embed: {block.content}
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
