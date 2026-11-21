import { describe, expect, it } from "vitest";
import { DEFAULT_APP_STATE, sanitizeAppState } from "@/lib/sanitizer";

describe("sanitizeAppState", () => {
  it("should return default app state when input is null or undefined", () => {
    // Arrange
    const nullInput = null;
    const undefinedInput = undefined;

    // Act
    const resultNull = sanitizeAppState(nullInput);
    const resultUndefined = sanitizeAppState(undefinedInput);

    // Assert
    expect(resultNull).toEqual(DEFAULT_APP_STATE);
    expect(resultUndefined).toEqual(DEFAULT_APP_STATE);
  });

  it("should strip transient properties and preserve visual properties", () => {
    // Arrange
    const dirtyState: Record<string, unknown> = {
      viewBackgroundColor: "#1e1e1e",
      gridSize: 20,
      zoom: { value: 1.5 },
      scrollX: 120,
      scrollY: -45,
      selectedElementIds: { "el-1": true },
      editingElement: { id: "el-2" },
      cursorX: 500,
      cursorY: 300,
      collaborators: [{ id: "user-1" }],
    };

    // Act
    const sanitized = sanitizeAppState(dirtyState);
    const untyped = sanitized as unknown as Record<string, unknown>;

    // Assert
    expect(sanitized.viewBackgroundColor).toBe("#1e1e1e");
    expect(sanitized.gridSize).toBe(20);
    expect(sanitized.zoom.value).toBe(1.5);
    expect(sanitized.scrollX).toBe(120);
    expect(sanitized.scrollY).toBe(-45);
    expect(untyped.selectedElementIds).toBeUndefined();
    expect(untyped.editingElement).toBeUndefined();
    expect(untyped.cursorX).toBeUndefined();
  });

  it("should handle numeric zoom values correctly", () => {
    // Arrange
    const stateWithNumericZoom: Record<string, unknown> = {
      viewBackgroundColor: "#ffffff",
      zoom: 2,
    };

    // Act
    const sanitized = sanitizeAppState(stateWithNumericZoom);

    // Assert
    expect(sanitized.zoom.value).toBe(2);
  });
});
