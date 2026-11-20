export interface AppStatePersisted {
  viewBackgroundColor: string;
  gridSize: number | null;
  zoom: { value: number };
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
  elements: readonly any[];
  appState: AppStatePersisted;
  fileRefs: Record<string, FileReference>;
  createdAt: string;
  updatedAt: string;
}

export interface DiagramCreateInput {
  title: string;
  notionPageId: string;
  elements?: readonly any[];
  appState?: Partial<AppStatePersisted>;
}

export interface DiagramUpdateInput {
  title?: string;
  elements?: readonly any[];
  appState?: Partial<AppStatePersisted>;
  fileRefs?: Record<string, FileReference>;
}
