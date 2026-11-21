import { Storage } from "@google-cloud/storage";
import crypto from "crypto";

export interface UploadAssetParams {
  buffer: Buffer;
  mimeType: string;
  originalFilename?: string;
  diagramId: string;
}

export interface UploadAssetResult {
  fileId: string;
  gcsPath: string;
  publicUrl?: string;
  sizeBytes: number;
  mimeType: string;
}

const memoryStorage = new Map<string, { buffer: Buffer; mimeType: string }>();

function getStorageClient(): Storage | null {
  if (process.env.GCP_PROJECT_ID || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      return new Storage({
        projectId: process.env.GCP_PROJECT_ID,
      });
    } catch {
      return null;
    }
  }
  return null;
}

export async function uploadBinaryAsset(params: UploadAssetParams): Promise<UploadAssetResult> {
  const fileId = crypto.randomUUID();
  const extension = params.mimeType.split("/")[1] || "bin";
  const gcsPath = `diagrams/${params.diagramId}/${fileId}.${extension}`;
  const bucketName = process.env.GCS_BUCKET_NAME || "schemata-assets";

  const storage = getStorageClient();
  if (storage && process.env.NODE_ENV === "production") {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(gcsPath);

    await file.save(params.buffer, {
      contentType: params.mimeType,
      resumable: false,
    });

    return {
      fileId,
      gcsPath,
      sizeBytes: params.buffer.byteLength,
      mimeType: params.mimeType,
    };
  }

  memoryStorage.set(gcsPath, {
    buffer: params.buffer,
    mimeType: params.mimeType,
  });

  return {
    fileId,
    gcsPath,
    sizeBytes: params.buffer.byteLength,
    mimeType: params.mimeType,
  };
}

export async function getBinaryAsset(
  gcsPath: string
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  const storage = getStorageClient();
  const bucketName = process.env.GCS_BUCKET_NAME || "schemata-assets";

  if (storage && process.env.NODE_ENV === "production") {
    try {
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(gcsPath);
      const [buffer] = await file.download();
      const [metadata] = await file.getMetadata();

      return {
        buffer,
        mimeType: metadata.contentType || "application/octet-stream",
      };
    } catch {
      return null;
    }
  }

  const asset = memoryStorage.get(gcsPath);
  return asset || null;
}
