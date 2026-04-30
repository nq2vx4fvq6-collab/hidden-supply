import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSupabaseClient } from "@/lib/supabase";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const BUCKET = "product-images";

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
    const storagePath = `products/${filename}`;

    if (process.env.VERCEL) {
      // Production: upload to Supabase Storage
      const buffer = Buffer.from(await file.arrayBuffer());
      const sb = getSupabaseClient();
      const { error } = await sb.storage
        .from(BUCKET)
        .upload(storagePath, buffer, {
          contentType,
          upsert: false,
        });

      if (error) {
        console.error("[upload] Supabase Storage upload failed:", error);
        return NextResponse.json(
          { error: error.message || "Upload failed." },
          { status: 500 }
        );
      }

      const { data } = sb.storage.from(BUCKET).getPublicUrl(storagePath);
      return NextResponse.json({ url: data.publicUrl });
    }

    // Local dev: save to public/uploads so images are visible
    const dir = path.join(process.cwd(), "public", "uploads", "products");
    await fs.mkdir(dir, { recursive: true });
    const filePath = path.join(dir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);
    return NextResponse.json({ url: `/uploads/products/${filename}` });
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
