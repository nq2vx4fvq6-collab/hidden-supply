"use client";

import { useState, useRef } from "react";

const inputClass =
  "flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-zinc-600 transition-colors";
const labelClass =
  "block text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2";

export default function ItemImageEditor({
  defaultImages = [],
  name = "images",
}: {
  defaultImages?: string[];
  name?: string;
}) {
  const [images, setImages] = useState<string[]>(
    defaultImages.length > 0 ? defaultImages : [""]
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addSlot = () => setImages((prev) => [...prev, ""]);
  const remove = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index));
  const setUrl = (index: number, url: string) =>
    setImages((prev) => {
      const next = [...prev];
      next[index] = url;
      return next;
    });
  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= images.length) return;
    setImages((prev) => {
      const arr = [...prev];
      [arr[index], arr[next]] = [arr[next], arr[index]];
      return arr;
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (data && typeof data.error === "string" && data.error) ||
            `Upload failed (${res.status}). Check server logs.`
        );
      }
      const url = data.url as string;
      if (!url || typeof url !== "string") {
        throw new Error("Server did not return an image URL.");
      }
      setImages((prev) => {
        const emptyIdx = prev.findIndex((u) => !u.trim());
        if (emptyIdx >= 0) {
          const next = [...prev];
          next[emptyIdx] = url;
          return next;
        }
        return [...prev, url];
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Controlled hidden input — React keeps DOM value in sync with state.
  // Use newline as delimiter so URLs containing commas (e.g. query params) don't break parsing.
  const hiddenValue = images.filter(Boolean).join("\n");

  return (
    <div className="space-y-3">
      <label className={labelClass}>Catalog images</label>
      {/* Controlled hidden input — value always reflects current images state */}
      <input type="hidden" name={name} value={hiddenValue} readOnly />
      <div className="space-y-3">
        {images.map((url, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-3"
          >
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
              {url.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-600">
                  —
                </div>
              )}
            </div>
            <input
              type="url"
              placeholder="https://… or upload below"
              value={url}
              onChange={(e) => setUrl(index, e.target.value)}
              className={inputClass}
            />
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="rounded-lg border border-zinc-800 p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-40 disabled:hover:bg-transparent"
                title="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === images.length - 1}
                className="rounded-lg border border-zinc-800 p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-40 disabled:hover:bg-transparent"
                title="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                className="rounded-lg border border-zinc-800 p-1.5 text-zinc-500 transition hover:bg-red-900/40 hover:border-red-800 hover:text-red-400"
                title="Remove"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.img"
          className="hidden"
          onChange={handleFileSelect}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded-xl border-2 border-zinc-500 bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white hover:border-zinc-400 disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload image file"}
        </button>
        <button
          type="button"
          onClick={addSlot}
          className="rounded-xl border border-dashed border-zinc-700 px-4 py-2 text-xs text-zinc-500 transition hover:border-zinc-600 hover:text-zinc-300"
        >
          + Add image URL
        </button>
        {uploading && (
          <span className="text-xs text-amber-400">
            Upload in progress — wait before saving
          </span>
        )}
      </div>
      {uploadError && (
        <p className="text-xs text-red-400">{uploadError}</p>
      )}
      <p className="text-[10px] text-zinc-600">
        Upload an image file (max 5MB) or paste a URL. First image is the main
        catalog thumbnail. Save changes below to apply.
      </p>
    </div>
  );
}
