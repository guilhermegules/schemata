import { describe, it, expect, beforeEach } from "vitest";
import { createDiagram, getDiagramById, getDiagramByNotionPageId, updateDiagram } from "@/lib/firestore";

describe("Firestore Data Access Layer (with memory mock)", () => {
  beforeEach(() => {
    delete process.env.NODE_ENV;
  });

  it("should create and retrieve a diagram document", async () => {
    // Arrange
    const input = {
      title: "System Architecture",
      notionPageId: "notion-page-12345",
      elements: [{ id: "rect-1", type: "rectangle" }],
      appState: { viewBackgroundColor: "#f0f0f0" },
    };

    // Act
    const created = await createDiagram(input);
    const fetched = await getDiagramById(created.id);

    // Assert
    expect(created.id).toBeDefined();
    expect(created.title).toBe("System Architecture");
    expect(created.elements).toHaveLength(1);
    expect(fetched).toEqual(created);
  });

  it("should look up diagram by notionPageId", async () => {
    // Arrange
    const pageId = "unique-notion-page-xyz";
    const created = await createDiagram({
      title: "Service Map",
      notionPageId: pageId,
    });

    // Act
    const found = await getDiagramByNotionPageId(pageId);

    // Assert
    expect(found).not.toBeNull();
    expect(found?.id).toBe(created.id);
  });

  it("should update diagram elements and sanitize appState", async () => {
    // Arrange
    const created = await createDiagram({
      title: "Initial Draft",
      notionPageId: "page-edit-1",
    });

    // Act
    const updated = await updateDiagram(created.id, {
      title: "Updated Architecture",
      appState: {
        viewBackgroundColor: "#222222",
        cursorX: 999, // Should be stripped by sanitizer
      } as any,
    });

    // Assert
    expect(updated).not.toBeNull();
    expect(updated?.title).toBe("Updated Architecture");
    expect(updated?.appState.viewBackgroundColor).toBe("#222222");
    expect((updated?.appState as any).cursorX).toBeUndefined();
  });
});
