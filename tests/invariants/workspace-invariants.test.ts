import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PATCH } from "@/app/api/notion/[pageId]/route";

describe("Workspace Architecture Invariants", () => {
  it("test_invariant_no_snake_case_files_in_src_or_tests", () => {
    // Arrange
    const scanDir = (dir: string): string[] => {
      const results: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results.push(...scanDir(fullPath));
        } else if (entry.isFile()) {
          results.push(entry.name);
        }
      }
      return results;
    };

    // Act
    const srcFiles = scanDir(path.resolve(process.cwd(), "src"));
    const testFiles = scanDir(path.resolve(process.cwd(), "tests"));
    const allFiles = [...srcFiles, ...testFiles];

    const snakeCaseFiles = allFiles.filter(
      (fileName) => fileName.includes("_") && !fileName.startsWith(".")
    );

    // Assert
    expect(snakeCaseFiles).toEqual([]);
  });

  it("test_invariant_notion_patch_route_rejects_malformed_bodies", async () => {
    // Arrange
    const invalidBodies = [
      null,
      "plain-string",
      123,
      { title: 999 },
      { blocks: "not-an-array" },
      { blocks: 123 },
    ];

    // Act & Assert
    for (const body of invalidBodies) {
      const req = new Request("http://localhost/api/notion/page-test", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const res = await PATCH(req, {
        params: Promise.resolve({ pageId: "page-test" }),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json).toHaveProperty("error");
    }
  });

  it("test_invariant_no_narrative_step_comments_in_lib", () => {
    // Arrange
    const libDir = path.resolve(process.cwd(), "src/lib");
    const files = fs.readdirSync(libDir).filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));

    // Act & Assert
    for (const file of files) {
      const content = fs.readFileSync(path.join(libDir, file), "utf-8");
      expect(content).not.toMatch(/\/\/\s*\d+\.\s+/);
      expect(content).not.toMatch(/\/\/\s*Step\s*\d+/i);
    }
  });
});
