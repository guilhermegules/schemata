import { describe, it, expect } from "vitest";
import { diagramService } from "@/lib/diagram_service";

describe("DiagramService", () => {
  it("should validate and create a diagram with sanitized appState", async () => {
    // Arrange
    const input = {
      title: "Service Boundaries",
      notionPageId: "page-abc-123",
      elements: [{ id: "arrow-1", type: "arrow" }],
      appState: {
        viewBackgroundColor: "#ffffff",
        zoom: { value: 1.25 },
        selectedElementIds: { "arrow-1": true },
      } as any,
    };

    // Act
    const diagram = await diagramService.create(input);

    // Assert
    expect(diagram.id).toBeDefined();
    expect(diagram.title).toBe("Service Boundaries");
    expect(diagram.appState.viewBackgroundColor).toBe("#ffffff");
    expect(diagram.appState.zoom).toEqual({ value: 1.25 });
    expect((diagram.appState as any).selectedElementIds).toBeUndefined();
  });

  it("should throw error when required fields are missing", async () => {
    // Arrange
    const invalidInput = {
      title: "",
      notionPageId: "page-xyz",
    };

    // Act & Assert
    await expect(diagramService.create(invalidInput)).rejects.toThrow("Missing required fields");
  });

  it("should update diagram elements and merge fileRefs", async () => {
    // Arrange
    const diagram = await diagramService.create({
      title: "Initial Topology",
      notionPageId: "page-topology-1",
    });

    const fileRef = {
      fileId: "file-99",
      gcsPath: "diagrams/123/file-99.png",
      mimeType: "image/png",
      sizeBytes: 1024,
      createdAt: new Date().toISOString(),
    };

    // Act
    const updated = await diagramService.update(diagram.id, {
      title: "Refined Topology",
      fileRefs: { "file-99": fileRef },
    });

    // Assert
    expect(updated).not.toBeNull();
    expect(updated?.title).toBe("Refined Topology");
    expect(updated?.fileRefs["file-99"]).toEqual(fileRef);
  });
});
