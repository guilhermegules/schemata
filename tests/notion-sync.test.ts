import { describe, expect, it } from "vitest";
import { upsertNotionEmbedBlock } from "@/lib/notion";

describe("Notion Embed Synchronizer", () => {
  it("should simulate appending embed block when running in mock environment", async () => {
    // Arrange
    const pageId = "mock-page-id";
    const embedUrl = "https://schemata.run.app/embed/diagram-uuid-456";

    // Act
    const result = await upsertNotionEmbedBlock(pageId, embedUrl);

    // Assert
    expect(result.action).toBe("appended");
    expect(result.blockId).toBe("mock-embed-block-id");
  });
});
