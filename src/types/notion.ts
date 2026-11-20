export interface NotionPageSummary {
  id: string;
  title: string;
  icon?: string;
  lastEditedTime: string;
  url: string;
}

export interface NotionBlockItem {
  id: string;
  type: string;
  content: string;
  hasChildren: boolean;
}

export interface NotionPageDetail {
  page: NotionPageSummary;
  blocks: NotionBlockItem[];
  linkedDiagramId?: string;
}

export interface NotionSyncEmbedResponse {
  success: boolean;
  action: "updated" | "appended";
  blockId: string;
  embedUrl: string;
}
