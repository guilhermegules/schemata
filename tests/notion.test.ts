import { describe, it, expect } from "vitest";
import { formatRichText, parseBlockContent } from "@/lib/notion";

describe("Notion SDK Client Utilities", () => {
  it("should extract plain text from rich_text array", () => {
    // Arrange
    const richText = [
      { plain_text: "System " },
      { plain_text: "Architecture" },
    ];

    // Act
    const result = formatRichText(richText);

    // Assert
    expect(result).toBe("System Architecture");
  });

  it("should parse paragraph block correctly", () => {
    // Arrange
    const block = {
      type: "paragraph",
      paragraph: {
        rich_text: [{ plain_text: "Clean Architecture principles applied." }],
      },
    };

    // Act
    const parsed = parseBlockContent(block);

    // Assert
    expect(parsed.type).toBe("paragraph");
    expect(parsed.content).toBe("Clean Architecture principles applied.");
  });

  it("should parse embed block correctly", () => {
    // Arrange
    const block = {
      type: "embed",
      embed: {
        url: "https://schemata.run.app/embed/diag-1234",
      },
    };

    // Act
    const parsed = parseBlockContent(block);

    // Assert
    expect(parsed.type).toBe("embed");
    expect(parsed.content).toBe("https://schemata.run.app/embed/diag-1234");
  });
});
