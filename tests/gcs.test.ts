import { describe, it, expect } from "vitest";
import { uploadBinaryAsset, getBinaryAsset } from "@/lib/gcs";

describe("Google Cloud Storage Client (with local memory fallback)", () => {
  it("should upload binary asset buffer and return valid metadata", async () => {
    // Arrange
    const sampleBuffer = Buffer.from("fake-png-binary-data");
    const params = {
      buffer: sampleBuffer,
      mimeType: "image/png",
      originalFilename: "architecture.png",
      diagramId: "diag-1234",
    };

    // Act
    const result = await uploadBinaryAsset(params);

    // Assert
    expect(result.fileId).toBeDefined();
    expect(result.gcsPath).toContain("diagrams/diag-1234/");
    expect(result.sizeBytes).toBe(sampleBuffer.byteLength);
    expect(result.mimeType).toBe("image/png");
  });

  it("should retrieve uploaded asset by gcsPath", async () => {
    // Arrange
    const payload = Buffer.from("vector-data");
    const uploaded = await uploadBinaryAsset({
      buffer: payload,
      mimeType: "image/svg+xml",
      diagramId: "diag-5678",
    });

    // Act
    const retrieved = await getBinaryAsset(uploaded.gcsPath);

    // Assert
    expect(retrieved).not.toBeNull();
    expect(retrieved?.buffer.toString()).toBe("vector-data");
    expect(retrieved?.mimeType).toBe("image/svg+xml");
  });
});
