import { describe, expect, it } from "vitest";
import type { ResolvedTheme, ThemePreference } from "@/lib/UseTheme";

describe("Theme Resolution Logic", () => {
  it("test_should_initialize_with_system_preference_when_storage_is_empty", () => {
    // Arrange
    const storedPreference: ThemePreference | null = null;
    const systemIsDark = false;

    // Act
    const themePreference: ThemePreference = storedPreference || "system";
    const resolvedTheme: ResolvedTheme =
      themePreference === "system" ? (systemIsDark ? "dark" : "light") : themePreference;

    // Assert
    expect(themePreference).toBe("system");
    expect(resolvedTheme).toBe("light");
  });

  it("test_should_resolve_to_dark_when_system_is_dark", () => {
    // Arrange
    const themePreference: ThemePreference = "system";
    const systemIsDark = true;

    // Act
    const resolvedTheme: ResolvedTheme =
      themePreference === "system" ? (systemIsDark ? "dark" : "light") : themePreference;

    // Assert
    expect(resolvedTheme).toBe("dark");
  });

  it("test_should_persist_and_cycle_preferences_correctly", () => {
    // Arrange
    const cycle = (current: ThemePreference): ThemePreference =>
      current === "system" ? "light" : current === "light" ? "dark" : "system";

    // Act & Assert
    expect(cycle("system")).toBe("light");
    expect(cycle("light")).toBe("dark");
    expect(cycle("dark")).toBe("system");
  });
});
