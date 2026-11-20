import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateNotionPageContent } from "@/lib/notion";

describe("Notion Update Service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.NOTION_TOKEN;
  });

  it("test_should_update_page_title_and_blocks_in_mock_mode", async () => {
    // Arrange
    const pageId = "mock-page-123";
    const updates = {
      title: "Updated Architecture Title",
      blocks: [
        { id: "b1", type: "heading_1", content: "New System Heading" },
        { id: "b2", type: "paragraph", content: "New paragraph description" },
      ],
    };

    // Act
    const result = await updateNotionPageContent(pageId, updates);

    // Assert
    expect(result.updatedTitle).toBe("Updated Architecture Title");
    expect(result.updatedBlockCount).toBe(2);
  });

  it("test_should_handle_empty_updates_gracefully", async () => {
    // Arrange
    const pageId = "mock-page-empty";

    // Act
    const result = await updateNotionPageContent(pageId, {});

    // Assert
    expect(result.updatedTitle).toBeUndefined();
    expect(result.updatedBlockCount).toBe(0);
  });
});
