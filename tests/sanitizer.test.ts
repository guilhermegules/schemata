import { describe, it, expect } from "vitest";
import { sanitizeAppState, DEFAULT_APP_STATE } from "@/lib/sanitizer";

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
    const dirtyState = {
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

    // Assert
    expect(sanitized).toEqual({
      viewBackgroundColor: "#1e1e1e",
      gridSize: 20,
      zoom: { value: 1.5 },
      scrollX: 120,
      scrollY: -45,
    });
    expect((sanitized as any).selectedElementIds).toBeUndefined();
    expect((sanitized as any).editingElement).toBeUndefined();
    expect((sanitized as any).cursorX).toBeUndefined();
  });

  it("should handle numeric zoom values correctly", () => {
    // Arrange
    const stateWithNumericZoom = {
      viewBackgroundColor: "#ffffff",
      zoom: 2,
    };

    // Act
    const sanitized = sanitizeAppState(stateWithNumericZoom);

    // Assert
    expect(sanitized.zoom).toEqual({ value: 2 });
  });
});
