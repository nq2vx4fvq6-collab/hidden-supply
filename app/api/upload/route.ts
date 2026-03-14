import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const contentType = file.type || "application/octet-stream";

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const pathname = `products/${filename}`;

    // Prefer Vercel Blob when token is set (production or dev with token)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(pathname, file, {
          access: "public",
          addRandomSuffix: false,
          contentType,
        });
        return NextResponse.json({ url: blob.url });
      } catch (blobErr) {
        // On Vercel, Blob is required; locally fall back to filesystem if Blob fails (e.g. invalid token)
        if (process.env.VERCEL) {
          console.error("[upload] Blob failed", blobErr);
          return NextResponse.json(
            {
              error:
                blobErr instanceof Error
                  ? blobErr.message
                  : "Upload failed. If deploying to Vercel, add a Blob store and set BLOB_READ_WRITE_TOKEN.",
            },
            { status: 500 }
          );
        }
        // Fall through to filesystem fallback
      }
    }

    // Vercel without Blob token: ask them to configure it
    if (process.env.VERCEL) {
      return NextResponse.json(
        {
          error:
            "Image upload is not configured. In Vercel, go to Storage → Create Blob store, then add BLOB_READ_WRITE_TOKEN to your project environment variables. Redeploy and try again.",
        },
        { status: 503 }
      );
    }

    // Local dev: save to public/uploads so images are visible
    const dir = path.join(process.cwd(), "public", "uploads", "products");
    await fs.mkdir(dir, { recursive: true });
    const filePath = path.join(dir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);
    const url = `/uploads/products/${filename}`;
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Upload failed. Check the server logs.",
      },
      { status: 500 }
    );
  }
}
