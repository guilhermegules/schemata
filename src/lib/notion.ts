import { Client } from "@notionhq/client";
import type {
  BlockObjectResponse,
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { NotionBlockItem, NotionPageDetail, NotionPageSummary } from "@/types/notion";

function getNotionClient(): Client | null {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    return null;
  }
  return new Client({ auth: token });
}

function isFullPage(item: unknown): item is PageObjectResponse {
  return typeof item === "object" && item !== null && "properties" in item;
}

function isFullBlock(block: unknown): block is BlockObjectResponse {
  return typeof block === "object" && block !== null && "type" in block;
}

export interface MinimalRichTextItem {
  plain_text?: string;
}

export interface ParagraphBlock {
  type: "paragraph";
  paragraph: { rich_text?: readonly MinimalRichTextItem[] };
}
export interface Heading1Block {
  type: "heading_1";
  heading_1: { rich_text?: readonly MinimalRichTextItem[] };
}
export interface Heading2Block {
  type: "heading_2";
  heading_2: { rich_text?: readonly MinimalRichTextItem[] };
}
export interface Heading3Block {
  type: "heading_3";
  heading_3: { rich_text?: readonly MinimalRichTextItem[] };
}
export interface BulletedListItemBlock {
  type: "bulleted_list_item";
  bulleted_list_item: { rich_text?: readonly MinimalRichTextItem[] };
}
export interface NumberedListItemBlock {
  type: "numbered_list_item";
  numbered_list_item: { rich_text?: readonly MinimalRichTextItem[] };
}
export interface DividerBlock {
  type: "divider";
}
export interface EmbedBlock {
  type: "embed";
  embed: { url: string };
}
export interface ImageBlock {
  type: "image";
  image: { type: "file"; file: { url: string } } | { type: "external"; external: { url: string } };
}
export interface FallbackBlock {
  type: string;
}

export type MinimalBlock =
  | ParagraphBlock
  | Heading1Block
  | Heading2Block
  | Heading3Block
  | BulletedListItemBlock
  | NumberedListItemBlock
  | DividerBlock
  | EmbedBlock
  | ImageBlock
  | FallbackBlock;

export function formatRichText(richTextArray?: readonly MinimalRichTextItem[]): string {
  if (!Array.isArray(richTextArray)) return "";
  return richTextArray.map((t) => t.plain_text || "").join("");
}

export function parseBlockContent(block: MinimalBlock): { type: string; content: string } {
  switch (block.type) {
    case "paragraph":
      return {
        type: block.type,
        content: "paragraph" in block ? formatRichText(block.paragraph.rich_text) : "",
      };
    case "heading_1":
      return {
        type: block.type,
        content: "heading_1" in block ? formatRichText(block.heading_1.rich_text) : "",
      };
    case "heading_2":
      return {
        type: block.type,
        content: "heading_2" in block ? formatRichText(block.heading_2.rich_text) : "",
      };
    case "heading_3":
      return {
        type: block.type,
        content: "heading_3" in block ? formatRichText(block.heading_3.rich_text) : "",
      };
    case "bulleted_list_item":
      return {
        type: block.type,
        content:
          "bulleted_list_item" in block ? formatRichText(block.bulleted_list_item.rich_text) : "",
      };
    case "numbered_list_item":
      return {
        type: block.type,
        content:
          "numbered_list_item" in block ? formatRichText(block.numbered_list_item.rich_text) : "",
      };
    case "divider":
      return { type: block.type, content: "---" };
    case "embed":
      return { type: block.type, content: "embed" in block ? block.embed.url : "" };
    case "image":
      if ("image" in block) {
        if (block.image.type === "file") {
          return { type: block.type, content: block.image.file.url };
        }
        return { type: block.type, content: block.image.external.url };
      }
      return { type: block.type, content: "" };
    default:
      return { type: block.type, content: "" };
  }
}

export async function listNotionDatabasePages(): Promise<NotionPageSummary[]> {
  const client = getNotionClient();
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!client || !databaseId) {
    return [
      {
        id: "mock-page-1",
        title: "Platform Core Architecture",
        icon: "🏗️",
        lastEditedTime: new Date().toISOString(),
        url: "https://notion.so/mock-page-1",
      },
      {
        id: "mock-page-2",
        title: "Ingestion Pipeline ADR",
        icon: "⚡",
        lastEditedTime: new Date().toISOString(),
        url: "https://notion.so/mock-page-2",
      },
    ];
  }

  try {
    const response = await client.databases.query({
      database_id: databaseId,
      page_size: 50,
    });

    const pages: NotionPageSummary[] = [];

    for (const item of response.results) {
      if (!isFullPage(item)) continue;

      let title = "Untitled";
      for (const key of Object.keys(item.properties)) {
        const prop = item.properties[key];
        if (prop.type === "title" && prop.title.length > 0) {
          title = formatRichText(prop.title as RichTextItemResponse[]);
          break;
        }
      }

      const iconEmoji = item.icon?.type === "emoji" ? item.icon.emoji : "📄";

      pages.push({
        id: item.id,
        title,
        icon: iconEmoji,
        lastEditedTime: item.last_edited_time,
        url: item.url,
      });
    }

    return pages;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Database query failed";
    throw new Error(`Failed to query Notion database: ${message}`);
  }
}

export async function getNotionPageDetail(pageId: string): Promise<NotionPageDetail> {
  const client = getNotionClient();

  if (!client) {
    return {
      page: {
        id: pageId,
        title: "Sample Notion Document",
        icon: "📝",
        lastEditedTime: new Date().toISOString(),
        url: `https://notion.so/${pageId}`,
      },
      blocks: [
        { id: "b1", type: "heading_1", content: "System Overview", hasChildren: false },
        {
          id: "b2",
          type: "paragraph",
          content:
            "This document describes the high-level service interaction and component boundary contracts.",
          hasChildren: false,
        },
        { id: "b3", type: "heading_2", content: "Component Boundaries", hasChildren: false },
        {
          id: "b4",
          type: "bulleted_list_item",
          content: "Edge Gateway Router",
          hasChildren: false,
        },
        {
          id: "b5",
          type: "bulleted_list_item",
          content: "Async Worker Ingestion Pool",
          hasChildren: false,
        },
      ],
    };
  }

  const [rawPage, blocksResponse] = await Promise.all([
    client.pages.retrieve({ page_id: pageId }),
    client.blocks.children.list({ block_id: pageId, page_size: 100 }),
  ]);

  let title = "Untitled";
  let iconEmoji = "📄";
  let pageUrl = `https://notion.so/${pageId}`;
  let lastEditedTime = new Date().toISOString();

  if (isFullPage(rawPage)) {
    pageUrl = rawPage.url;
    lastEditedTime = rawPage.last_edited_time;
    if (rawPage.icon?.type === "emoji") {
      iconEmoji = rawPage.icon.emoji;
    }
    for (const key of Object.keys(rawPage.properties)) {
      const prop = rawPage.properties[key];
      if (prop.type === "title" && prop.title.length > 0) {
        title = formatRichText(prop.title as RichTextItemResponse[]);
        break;
      }
    }
  }

  const blocks: NotionBlockItem[] = [];
  for (const b of blocksResponse.results) {
    if (isFullBlock(b)) {
      const { type, content } = parseBlockContent(b);
      blocks.push({
        id: b.id,
        type,
        content,
        hasChildren: b.has_children,
      });
    }
  }

  return {
    page: {
      id: rawPage.id,
      title,
      icon: iconEmoji,
      lastEditedTime,
      url: pageUrl,
    },
    blocks,
  };
}

export async function upsertNotionEmbedBlock(
  pageId: string,
  embedUrl: string
): Promise<{ action: "updated" | "appended"; blockId: string }> {
  const client = getNotionClient();
  if (!client) {
    return { action: "appended", blockId: "mock-embed-block-id" };
  }

  const children = await client.blocks.children.list({ block_id: pageId, page_size: 100 });
  const existingEmbed = children.results.find((b) => {
    return (
      isFullBlock(b) &&
      b.type === "embed" &&
      (b.embed.url.includes("/embed/") || b.embed.url === embedUrl)
    );
  });

  if (existingEmbed && isFullBlock(existingEmbed)) {
    await client.blocks.update({
      block_id: existingEmbed.id,
      embed: { url: embedUrl },
    });
    return { action: "updated", blockId: existingEmbed.id };
  }

  const appendResponse = await client.blocks.children.append({
    block_id: pageId,
    children: [
      {
        object: "block",
        type: "embed",
        embed: {
          url: embedUrl,
        },
      },
    ],
  });

  const createdBlock = appendResponse.results[0];
  return { action: "appended", blockId: createdBlock.id };
}
