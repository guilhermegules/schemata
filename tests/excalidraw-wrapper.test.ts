import React from "react";
import ReactDOMServer from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ExcalidrawWrapper } from "@/components/ExcalidrawWrapper";

describe("ExcalidrawWrapper Theme Forwarding", () => {
  it("test_should_render_excalidraw_wrapper_element_with_default_theme", () => {
    // Act
    const html = ReactDOMServer.renderToString(
      React.createElement(ExcalidrawWrapper, { diagramId: "diag-theme-1" })
    );

    // Assert
    expect(html).toContain("Loading Canvas...");
  });

  it("test_should_render_excalidraw_wrapper_element_with_dark_theme", () => {
    // Act
    const html = ReactDOMServer.renderToString(
      React.createElement(ExcalidrawWrapper, {
        diagramId: "diag-theme-2",
        theme: "dark",
      })
    );

    // Assert
    expect(html).toContain("Loading Canvas...");
  });
});
