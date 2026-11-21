import { Client } from "@notionhq/client";
import type {
  NotionBlockItem,
  NotionPageDetail,
  NotionPageSummary,
  NotionUpdatePagePayload,
  NotionUpdatePageResult,
} from "@/types/notion";

interface MinimalRichTextItem {
  plain_text?: string;
  type?: string;
  text?: {
    content?: string;
  };
}

interface RawNotionPage {
  id: string;
  url?: string;
  last_edited_time?: string;
  icon?: {
    type?: string;
    emoji?: string;
  };
  properties?: Record<
    string,
    {
      type?: string;
      title?: MinimalRichTextItem[];
      [key: string]: unknown;
    }
  >;
}

interface RawNotionBlock {
  id: string;
  type: string;
  has_children?: boolean;
  paragraph?: { rich_text?: MinimalRichTextItem[] };
  heading_1?: { rich_text?: MinimalRichTextItem[] };
  heading_2?: { rich_text?: MinimalRichTextItem[] };
  heading_3?: { rich_text?: MinimalRichTextItem[] };
  bulleted_list_item?: { rich_text?: MinimalRichTextItem[] };
  numbered_list_item?: { rich_text?: MinimalRichTextItem[] };
  to_do?: { rich_text?: MinimalRichTextItem[] };
  toggle?: { rich_text?: MinimalRichTextItem[] };
  quote?: { rich_text?: MinimalRichTextItem[] };
  callout?: { rich_text?: MinimalRichTextItem[] };
  code?: { rich_text?: MinimalRichTextItem[] };
  divider?: Record<string, never>;
  embed?: { url?: string };
  image?: {
    type?: "file" | "external";
    file?: { url?: string };
    external?: { url?: string };
  };
}

function getNotionClient(): Client | null {
  const token = process.env.NOTION_API_KEY || process.env.NOTION_TOKEN;
  if (!token) {
    return null;
  }
  return new Client({
    auth: token,
    notionVersion: "2026-03-11",
  });
}

function normalizeNotionId(id: string): string {
  const clean = id.replace(/-/g, "");
  if (clean.length === 32) {
    return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
  }
  return id;
}

export function formatRichText(richTextArray?: readonly MinimalRichTextItem[]): string {
  if (!Array.isArray(richTextArray)) return "";
  return richTextArray.map((t) => t.plain_text || t.text?.content || "").join("");
}

export function parseBlockContent(block: RawNotionBlock): { type: string; content: string } {
  switch (block.type) {
    case "paragraph":
      return {
        type: block.type,
        content: formatRichText(block.paragraph?.rich_text),
      };
    case "heading_1":
      return {
        type: block.type,
        content: formatRichText(block.heading_1?.rich_text),
      };
    case "heading_2":
      return {
        type: block.type,
        content: formatRichText(block.heading_2?.rich_text),
      };
    case "heading_3":
      return {
        type: block.type,
        content: formatRichText(block.heading_3?.rich_text),
      };
    case "bulleted_list_item":
      return {
        type: block.type,
        content: formatRichText(block.bulleted_list_item?.rich_text),
      };
    case "numbered_list_item":
      return {
        type: block.type,
        content: formatRichText(block.numbered_list_item?.rich_text),
      };
    case "to_do":
      return {
        type: block.type,
        content: formatRichText(block.to_do?.rich_text),
      };
    case "toggle":
      return {
        type: block.type,
        content: formatRichText(block.toggle?.rich_text),
      };
    case "quote":
      return {
        type: block.type,
        content: formatRichText(block.quote?.rich_text),
      };
    case "callout":
      return {
        type: block.type,
        content: formatRichText(block.callout?.rich_text),
      };
    case "code":
      return {
        type: block.type,
        content: formatRichText(block.code?.rich_text),
      };
    case "divider":
      return { type: block.type, content: "---" };
    case "embed":
      return { type: block.type, content: block.embed?.url || "" };
    case "image":
      if (block.image?.type === "file") {
        return { type: block.type, content: block.image.file?.url || "" };
      }
      return { type: block.type, content: block.image?.external?.url || "" };
    default:
      return { type: block.type, content: "" };
  }
}

function extractPageTitle(properties?: RawNotionPage["properties"]): string {
  if (!properties) return "Untitled";
  for (const key of Object.keys(properties)) {
    const prop = properties[key];
    if (prop.type === "title" && Array.isArray(prop.title) && prop.title.length > 0) {
      return formatRichText(prop.title);
    }
  }
  return "Untitled";
}

function findTitlePropertyName(properties?: RawNotionPage["properties"]): string {
  if (!properties) return "title";
  for (const key of Object.keys(properties)) {
    const prop = properties[key];
    if (prop.type === "title") {
      return key;
    }
  }
  return "title";
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

  const cleanDbId = normalizeNotionId(databaseId);
  const response = await client.request<{ results?: RawNotionPage[] }>({
    path: `databases/${cleanDbId}/query`,
    method: "post",
    body: { page_size: 50 },
  });

  const pages: NotionPageSummary[] = [];

  for (const item of response.results || []) {
    const title = extractPageTitle(item.properties);
    const iconEmoji = item.icon?.type === "emoji" ? item.icon.emoji : "📄";

    pages.push({
      id: item.id,
      title,
      icon: iconEmoji,
      lastEditedTime: item.last_edited_time || new Date().toISOString(),
      url: item.url || `https://notion.so/${item.id}`,
    });
  }

  return pages;
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

  const cleanPageId = normalizeNotionId(pageId);

  const [rawPage, blocksResponse] = await Promise.all([
    client.pages.retrieve({ page_id: cleanPageId }) as Promise<RawNotionPage>,
    client.blocks.children.list({
      block_id: cleanPageId,
      page_size: 100,
    }) as Promise<{ results?: RawNotionBlock[] }>,
  ]);

  const title = extractPageTitle(rawPage.properties);
  const iconEmoji = rawPage.icon?.type === "emoji" ? rawPage.icon.emoji : "📄";
  const pageUrl = rawPage.url || `https://notion.so/${cleanPageId}`;
  const lastEditedTime = rawPage.last_edited_time || new Date().toISOString();

  const blocks: NotionBlockItem[] = [];
  for (const b of blocksResponse.results || []) {
    const { type, content } = parseBlockContent(b);
    blocks.push({
      id: b.id,
      type,
      content,
      hasChildren: Boolean(b.has_children),
    });
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

  const cleanPageId = normalizeNotionId(pageId);
  const listData = (await client.blocks.children.list({
    block_id: cleanPageId,
    page_size: 100,
  })) as { results?: RawNotionBlock[] };

  const existingEmbed = (listData.results || []).find((b) => {
    return (
      b.type === "embed" &&
      Boolean(b.embed?.url && (b.embed.url.includes("/embed/") || b.embed.url === embedUrl))
    );
  });

  if (existingEmbed) {
    await client.blocks.update({
      block_id: existingEmbed.id,
      embed: { url: embedUrl } as unknown as never,
    });
    return { action: "updated", blockId: existingEmbed.id };
  }

  const appendResponse = (await client.blocks.children.append({
    block_id: cleanPageId,
    children: [
      {
        object: "block",
        type: "embed",
        embed: {
          url: embedUrl,
        },
      } as unknown as never,
    ],
  })) as { results?: Array<{ id: string }> };

  const createdBlock = appendResponse.results?.[0];
  return { action: "appended", blockId: createdBlock?.id || "appended-block-id" };
}

export async function updateNotionPageContent(
  pageId: string,
  updates: NotionUpdatePagePayload
): Promise<NotionUpdatePageResult> {
  const client = getNotionClient();
  if (!client) {
    return {
      updatedTitle: updates.title,
      updatedBlockCount: updates.blocks?.length || 0,
    };
  }

  const cleanPageId = normalizeNotionId(pageId);
  let updatedTitle: string | undefined;

  if (updates.title !== undefined) {
    const rawPage = (await client.pages.retrieve({
      page_id: cleanPageId,
    })) as RawNotionPage;

    const titlePropName = findTitlePropertyName(rawPage.properties);

    await client.pages.update({
      page_id: cleanPageId,
      properties: {
        [titlePropName]: {
          title: [{ type: "text", text: { content: updates.title } }],
        },
      } as unknown as never,
    });

    updatedTitle = updates.title;
  }

  let updatedBlockCount = 0;
  if (Array.isArray(updates.blocks)) {
    for (const b of updates.blocks) {
      const richText = [{ type: "text", text: { content: b.content } }];
      const allowedTextTypes = [
        "paragraph",
        "heading_1",
        "heading_2",
        "heading_3",
        "bulleted_list_item",
        "numbered_list_item",
        "to_do",
        "toggle",
        "quote",
        "callout",
        "code",
      ];

      if (!allowedTextTypes.includes(b.type)) {
        continue;
      }

      try {
        await client.blocks.update({
          block_id: b.id,
          [b.type]: { rich_text: richText },
        } as unknown as never);
        updatedBlockCount++;
      } catch (err) {
        console.warn(`Failed to update block ${b.id}:`, err);
      }
    }
  }

  return { updatedTitle, updatedBlockCount };
}
