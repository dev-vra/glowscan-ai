"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Camera, ImageUp, Sun } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";
import { submitFaceScanAction } from "./actions";

type CameraStatus = "starting" | "ready" | "denied" | "unavailable";

const MAX_SIDE = 1280;
const JPEG_QUALITY = 0.85;
const LIGHT_SAMPLE_MS = 600;
const MIN_LUMINANCE = 70;
const MAX_LUMINANCE = 215;
const SAMPLE_WIDTH = 32;

function averageLuminance(source: CanvasImageSource, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_WIDTH;
  canvas.height = Math.max(1, Math.round((SAMPLE_WIDTH * height) / width));
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  return sum / (data.length / 4);
}

function toJpegDataUrl(source: CanvasImageSource, width: number, height: number, mirror: boolean) {
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

function lightingHint(luminance: number | null) {
  if (luminance === null) return null;
  if (luminance < MIN_LUMINANCE) return "Pouca luz. Vire-se para uma janela.";
  if (luminance > MAX_LUMINANCE) return "Luz forte demais. Evite sol direto ou flash.";
  return null;
}

export function FaceCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<CameraStatus>("starting");
  const [luminance, setLuminance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: number | undefined;
    const request = navigator.mediaDevices?.getUserMedia
      ? navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1920 } }, audio: false })
      : Promise.reject(new Error("CAMERA_UNSUPPORTED"));
    request
      .then((s) => {
        stream = s;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = s;
        setStatus("ready");
        timer = window.setInterval(() => {
          if (video.videoWidth) setLuminance(averageLuminance(video, video.videoWidth, video.videoHeight));
        }, LIGHT_SAMPLE_MS);
      })
      .catch((e: unknown) => setStatus(e instanceof DOMException && e.name === "NotAllowedError" ? "denied" : "unavailable"));
    return () => {
      window.clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const submit = (dataUrl: string) => {
    setError(null);
    startTransition(async () => {
      const result = await submitFaceScanAction(dataUrl);
      if (result?.error) setError(result.error);
    });
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    submit(toJpegDataUrl(video, video.videoWidth, video.videoHeight, true));
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const bitmap = await createImageBitmap(file);
    submit(toJpegDataUrl(bitmap, bitmap.width, bitmap.height, false));
  };

  const hint = lightingHint(luminance);

  if (pending) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center" role="status" aria-live="polite">
        <div className="size-24 animate-pulse rounded-pill border-2 border-gold" />
        <p className="font-display text-xl">Lendo sua pele…</p>
        <p className="text-sm text-muted">Textura, vermelhidão, poros, linhas e manchas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(status === "starting" || status === "ready") && (
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-text">
          <video ref={videoRef} autoPlay playsInline muted className="size-full -scale-x-100 object-cover" aria-label="Pré-visualização da câmera frontal" />
          <svg viewBox="0 0 300 400" className="pointer-events-none absolute inset-0 size-full" aria-hidden>
            <defs>
              <mask id="face-guide">
                <rect width="300" height="400" fill="white" />
                <ellipse cx="150" cy="190" rx="105" ry="140" fill="black" />
              </mask>
            </defs>
            <rect width="300" height="400" className="fill-text/55" mask="url(#face-guide)" />
            <ellipse cx="150" cy="190" rx="105" ry="140" fill="none" strokeWidth="2" className={hint ? "stroke-warning" : "stroke-on-accent"} />
          </svg>
          <p aria-live="polite" className="absolute inset-x-4 bottom-4 flex items-center justify-center gap-2 rounded-pill bg-bg/90 px-4 py-2 text-sm">
            <Sun className="size-4" aria-hidden />
            {status === "starting" ? "Abrindo a câmera…" : (hint ?? "Luz boa. Centralize o rosto no oval.")}
          </p>
        </div>
      )}

      {status === "denied" && (
        <p role="alert" className="rounded-md bg-surface p-4 text-sm">
          A câmera foi bloqueada. Libere o acesso nas configurações do navegador ou envie uma foto da galeria.
        </p>
      )}
      {status === "unavailable" && (
        <p className="rounded-md bg-surface p-4 text-sm">Câmera indisponível neste dispositivo. Envie uma foto da galeria.</p>
      )}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}

      <div className="space-y-3">
        {status === "ready" && (
          <Button size="lg" onClick={capture}><Camera className="size-5" aria-hidden /> Analisar agora</Button>
        )}
        <label className={buttonClasses("secondary", "lg", "cursor-pointer focus-within:outline-2 focus-within:outline-accent")}>
          <ImageUp className="size-5" aria-hidden /> Enviar da galeria
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
      </div>
    </div>
  );
}
