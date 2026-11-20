import { Client } from "@notionhq/client";
import { NotionPageSummary, NotionBlockItem, NotionPageDetail } from "@/types/notion";

function getNotionClient(): Client | null {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    return null;
  }
  return new Client({ auth: token });
}

export function formatRichText(richTextArray?: any[]): string {
  if (!Array.isArray(richTextArray)) return "";
  return richTextArray.map((t) => t.plain_text || "").join("");
}

export function parseBlockContent(block: any): { type: string; content: string } {
  const type = block.type;
  const data = block[type];
  if (!data) return { type, content: "" };

  if (data.rich_text) {
    return { type, content: formatRichText(data.rich_text) };
  }
  if (type === "divider") {
    return { type, content: "---" };
  }
  if (type === "embed") {
    return { type, content: data.url || "" };
  }
  if (type === "image") {
    return { type, content: data.file?.url || data.external?.url || "" };
  }
  return { type, content: "" };
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

    return response.results.map((page: any) => {
      let title = "Untitled";
      if (page.properties) {
        for (const key of Object.keys(page.properties)) {
          const prop = page.properties[key];
          if (prop.type === "title" && prop.title?.length > 0) {
            title = formatRichText(prop.title);
            break;
          }
        }
      }

      return {
        id: page.id,
        title,
        icon: page.icon?.emoji || "📄",
        lastEditedTime: page.last_edited_time,
        url: page.url,
      };
    });
  } catch (err: any) {
    throw new Error(`Failed to query Notion database: ${err.message}`);
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
          content: "This document describes the high-level service interaction and component boundary contracts.",
          hasChildren: false,
        },
        { id: "b3", type: "heading_2", content: "Component Boundaries", hasChildren: false },
        { id: "b4", type: "bulleted_list_item", content: "Edge Gateway Router", hasChildren: false },
        { id: "b5", type: "bulleted_list_item", content: "Async Worker Ingestion Pool", hasChildren: false },
      ],
    };
  }

  const [page, blocksResponse] = await Promise.all([
    client.pages.retrieve({ page_id: pageId }) as any,
    client.blocks.children.list({ block_id: pageId, page_size: 100 }),
  ]);

  let title = "Untitled";
  if (page.properties) {
    for (const key of Object.keys(page.properties)) {
      const prop = page.properties[key];
      if (prop.type === "title" && prop.title?.length > 0) {
        title = formatRichText(prop.title);
        break;
      }
    }
  }

  const blocks: NotionBlockItem[] = blocksResponse.results.map((b: any) => {
    const { type, content } = parseBlockContent(b);
    return {
      id: b.id,
      type,
      content,
      hasChildren: b.has_children,
    };
  });

  return {
    page: {
      id: page.id,
      title,
      icon: page.icon?.emoji || "📄",
      lastEditedTime: page.last_edited_time,
      url: page.url,
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
  const existingEmbed = children.results.find((b: any) => {
    return b.type === "embed" && (b.embed?.url?.includes("/embed/") || b.embed?.url === embedUrl);
  });

  if (existingEmbed) {
    await (client.blocks.update as any)({
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
      } as any,
    ],
  });

  const createdBlock = appendResponse.results[0];
  return { action: "appended", blockId: createdBlock.id };
}
