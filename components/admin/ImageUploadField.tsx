"use client";

import { useState } from "react";

type ImageUploadFieldProps = {
  name?: string;
  defaultValue?: string;
};

export function ImageUploadField({ name = "images", defaultValue = "" }: ImageUploadFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFilesSelected(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("files", file));
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Upload failed");
      }
      const urls = (data.urls as string[]).join("\n");
      setValue((prev) => (prev ? `${prev}\n${urls}` : urls));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-800">
        Product images (URLs, one per line)
        <textarea
          name={name}
          rows={4}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-normal"
        />
      </label>
      <div>
        <label className="inline-flex cursor-pointer items-center rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50">
          {uploading ? "Uploading…" : "Upload images"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => void onFilesSelected(e.target.files)}
          />
        </label>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
