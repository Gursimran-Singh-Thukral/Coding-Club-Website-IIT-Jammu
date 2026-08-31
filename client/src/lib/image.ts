// Client-side image downscale/compress before upload. Photos are stored as
// base64 data URIs directly in Postgres (no object storage bucket in this
// project), so keeping the payload small here matters.

export async function fileToCompressedDataUrl(file: File, maxSize = 320, quality = 0.82): Promise<string> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas isn't supported in this browser");
  ctx.drawImage(bitmap, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", quality);
}
