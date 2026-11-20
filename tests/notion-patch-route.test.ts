import { describe, expect, it } from "vitest";
import { PATCH } from "@/app/api/notion/[pageId]/route";

describe("Notion PATCH Route Handler", () => {
  it("test_should_handle_patch_request_successfully", async () => {
    // Arrange
    const payload = {
      title: "New Spec Title",
      blocks: [{ id: "b1", type: "heading_1", content: "New Heading" }],
    };
    const req = new Request("http://localhost/api/notion/page-123", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Act
    const res = await PATCH(req, {
      params: Promise.resolve({ pageId: "page-123" }),
    });
    const data = await res.json();

    // Assert
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.updatedTitle).toBe("New Spec Title");
    expect(data.updatedBlockCount).toBe(1);
  });

  it("test_should_reject_non_string_title_with_400", async () => {
    // Arrange
    const req = new Request("http://localhost/api/notion/page-123", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: 12345 }),
    });

    // Act
    const res = await PATCH(req, {
      params: Promise.resolve({ pageId: "page-123" }),
    });
    const data = await res.json();

    // Assert
    expect(res.status).toBe(400);
    expect(data.error).toContain("Invalid title");
  });

  it("test_should_reject_non_array_blocks_with_400", async () => {
    // Arrange
    const req = new Request("http://localhost/api/notion/page-123", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks: "invalid-blocks-payload" }),
    });

    // Act
    const res = await PATCH(req, {
      params: Promise.resolve({ pageId: "page-123" }),
    });
    const data = await res.json();

    // Assert
    expect(res.status).toBe(400);
    expect(data.error).toContain("Invalid blocks");
  });
});
