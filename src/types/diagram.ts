import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

export type NormalizedZoomValue = number & { readonly _brand: "normalizedZoom" };

export function toNormalizedZoom(value: number): NormalizedZoomValue {
  return value as NormalizedZoomValue;
}

export interface AppStatePersisted {
  viewBackgroundColor: string;
  gridSize: number | null;
  zoom: { value: NormalizedZoomValue };
  scrollX: number;
  scrollY: number;
}

export interface FileReference {
  fileId: string;
  gcsPath: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface DiagramDocument {
  id: string;
  title: string;
  notionPageId: string;
  elements: readonly ExcalidrawElement[];
  appState: AppStatePersisted;
  fileRefs: Record<string, FileReference>;
  createdAt: string;
  updatedAt: string;
}

export interface DiagramCreateInput {
  title: string;
  notionPageId: string;
  elements?: readonly ExcalidrawElement[];
  appState?: Partial<AppStatePersisted>;
}

export interface DiagramUpdateInput {
  title?: string;
  elements?: readonly ExcalidrawElement[];
  appState?: Partial<AppStatePersisted>;
  fileRefs?: Record<string, FileReference>;
}
