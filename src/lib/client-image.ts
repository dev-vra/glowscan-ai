const MAX_SIDE = 1280;
const JPEG_QUALITY = 0.85;

// Redimensiona no navegador antes do upload: menos custo de IA e cabe no limite do body.
export function toJpegDataUrl(source: CanvasImageSource, width: number, height: number, mirror: boolean) {
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_UNAVAILABLE");
  if (mirror) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

export async function fileToJpegDataUrl(file: File) {
  const bitmap = await createImageBitmap(file);
  return toJpegDataUrl(bitmap, bitmap.width, bitmap.height, false);
}
