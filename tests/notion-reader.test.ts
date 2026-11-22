import React from "react";
import ReactDOMServer from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NotionReader } from "@/components/NotionReader";
import type { NotionPageDetail } from "@/types/notion";

describe("NotionReader Component", () => {
  const mockPageDetail: NotionPageDetail = {
    page: {
      id: "page-test",
      title: "System Spec Document",
      icon: "📄",
      lastEditedTime: "2026-11-20T12:00:00Z",
      url: "https://notion.so/page-test",
    },
    blocks: [
      {
        id: "b1",
        type: "paragraph",
        content: "Overview of platform architecture.",
        hasChildren: false,
      },
    ],
  };

  it("test_should_render_notion_reader_view_mode", () => {
    // Act
    const html = ReactDOMServer.renderToString(
      React.createElement(NotionReader, { pageDetail: mockPageDetail })
    );

    // Assert
    expect(html).toContain("System Spec Document");
    expect(html).toContain("Overview of platform architecture.");
    expect(html).toContain("Edit");
  });
});
