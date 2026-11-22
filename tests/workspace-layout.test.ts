import React from "react";
import ReactDOMServer from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WorkspaceLayout } from "@/components/WorkspaceLayout";
import type { DiagramDocument } from "@/types/diagram";
import { toNormalizedZoom } from "@/types/diagram";
import type { NotionPageDetail } from "@/types/notion";

describe("WorkspaceLayout Component", () => {
  const mockPageDetail: NotionPageDetail = {
    page: {
      id: "ws-page-1",
      title: "Workspace Test Doc",
      icon: "🏗️",
      lastEditedTime: "2026-11-20T12:00:00Z",
      url: "https://notion.so/ws-page-1",
    },
    blocks: [],
  };

  const mockDiagram: DiagramDocument = {
    id: "diag-1",
    title: "Test Diagram",
    notionPageId: "ws-page-1",
    elements: [],
    appState: {
      viewBackgroundColor: "#ffffff",
      gridSize: null,
      zoom: { value: toNormalizedZoom(1) },
      scrollX: 0,
      scrollY: 0,
    },
    fileRefs: {},
    createdAt: "2026-11-20T12:00:00Z",
    updatedAt: "2026-11-20T12:00:00Z",
  };

  it("test_should_render_workspace_layout_markup", () => {
    // Act
    const html = ReactDOMServer.renderToString(
      React.createElement(WorkspaceLayout, {
        pageDetail: mockPageDetail,
        diagram: mockDiagram,
      })
    );

    // Assert
    expect(html).toContain("Workspace Test Doc");
  });
});
