import { NextResponse } from "next/server";
import { uploadBinaryAsset } from "@/lib/gcs";
import { auth, isAdminUser } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (process.env.ADMIN_EMAIL && (!session || !isAdminUser(session.user?.email))) {
    return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const diagramId = formData.get("diagramId") as string | null;

    if (!file || !diagramId) {
      return NextResponse.json({ error: "Missing file or diagramId" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const asset = await uploadBinaryAsset({
      buffer,
      mimeType: file.type || "application/octet-stream",
      originalFilename: file.name,
      diagramId,
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to upload asset" }, { status: 500 });
  }
}
