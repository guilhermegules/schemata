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
});
