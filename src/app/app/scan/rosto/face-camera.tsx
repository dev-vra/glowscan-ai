"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useEffect, useRef, useState, useTransition } from "react";
import { Camera, CameraOff, Check, CircleHelp, ImageUp, X } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";
import { toJpegDataUrl } from "@/lib/client-image";
import { SCAN_COPY } from "@/lib/copy";
import { submitFaceScanAction } from "./actions";

type CameraStatus = "starting" | "ready" | "denied" | "unavailable";
type Light = "ok" | "low" | "high";
type Frame = "ok" | "out";

const SAMPLE_MS = 400;
const MIN_LUMINANCE = 70;
const MAX_LUMINANCE = 215;
const SAMPLE_WIDTH = 32;
const STABLE_MS = 3000;
const READING_STEP_MS = 2500;
const FLASH_MS = 240;
const HAPTIC_MS = 12;
const LIGHT_BARS = 5;
// Rosto precisa ocupar uma fração razoável do quadro e estar perto do centro.
const MIN_FACE_RATIO = 0.22;
const MAX_CENTER_OFFSET = 0.18;

type FaceBox = { x: number; y: number; width: number; height: number };
type FaceDetectorLike = { detect: (source: HTMLVideoElement) => Promise<{ boundingBox: FaceBox }[]> };
type FaceDetectorCtor = new (opts: { fastMode: boolean; maxDetectedFaces: number }) => FaceDetectorLike;

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

const toLight = (luminance: number): Light => (luminance < MIN_LUMINANCE ? "low" : luminance > MAX_LUMINANCE ? "high" : "ok");

function faceInFrame(box: FaceBox, video: HTMLVideoElement): Frame {
  const ratio = box.width / video.videoWidth;
  const dx = Math.abs(box.x + box.width / 2 - video.videoWidth / 2) / video.videoWidth;
  const dy = Math.abs(box.y + box.height / 2 - video.videoHeight / 2) / video.videoHeight;
  return ratio >= MIN_FACE_RATIO && dx <= MAX_CENTER_OFFSET && dy <= MAX_CENTER_OFFSET ? "ok" : "out";
}

// FaceDetector só existe em alguns navegadores; sem ele, o enquadramento fica a cargo da pessoa.
function createFaceDetector(): FaceDetectorLike | null {
  const Ctor = (window as unknown as { FaceDetector?: FaceDetectorCtor }).FaceDetector;
  try {
    return Ctor ? new Ctor({ fastMode: true, maxDetectedFaces: 1 }) : null;
  } catch {
    return null;
  }
}

export function FaceCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<CameraStatus>("starting");
  const [light, setLight] = useState<Light>("ok");
  const [luminance, setLuminance] = useState(MIN_LUMINANCE);
  const [frame, setFrame] = useState<Frame>("ok");
  const [countingDown, setCountingDown] = useState(false);
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canCapture = status === "ready" && light === "ok" && frame === "ok";

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: number | undefined;
    const detector = createFaceDetector();
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
        timer = window.setInterval(async () => {
          if (!video.videoWidth) return;
          const lum = averageLuminance(video, video.videoWidth, video.videoHeight);
          if (lum !== null) {
            setLuminance(lum);
            setLight(toLight(lum));
          }
          if (detector) {
            const faces = await detector.detect(video).catch(() => null);
            if (faces) setFrame(faces[0] ? faceInFrame(faces[0].boundingBox, video) : "out");
          }
        }, SAMPLE_MS);
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
    setFlash(true);
    window.setTimeout(() => setFlash(false), FLASH_MS);
    navigator.vibrate?.(HAPTIC_MS);
    submit(toJpegDataUrl(video, video.videoWidth, video.videoHeight, true));
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const bitmap = await createImageBitmap(file);
    submit(toJpegDataUrl(bitmap, bitmap.width, bitmap.height, false));
  };

  // Captura automática: 3s estável com todas as checagens ok.
  const captureRef = useRef(capture);
  useEffect(() => {
    captureRef.current = capture;
  });
  useEffect(() => {
    const ready = canCapture && !pending;
    const toggle = window.setTimeout(() => setCountingDown(ready), 0);
    const shoot = ready ? window.setTimeout(() => captureRef.current(), STABLE_MS) : undefined;
    return () => {
      window.clearTimeout(toggle);
      window.clearTimeout(shoot);
    };
  }, [canCapture, pending]);

  if (pending) return <ReadingScreen />;

  const blocked = status === "denied" || status === "unavailable";
  const guardState = frame === "out" ? "out" : light !== "ok" ? "adjust" : "ok";
  const message = status === "starting" ? { title: SCAN_COPY.starting, body: "" }
    : frame === "out" ? SCAN_COPY.outOfFrame
    : light === "low" ? SCAN_COPY.lowLight
    : light === "high" ? SCAN_COPY.highLight
    : { title: SCAN_COPY.ready, body: "" };
  const lightBars = Math.max(1, Math.min(LIGHT_BARS, Math.round((luminance / MIN_LUMINANCE) * 2)));

  return (
    <div className="fixed inset-0 z-20 flex flex-col bg-[#1A1310] text-white">
      <div className="relative flex-1 overflow-hidden">
        {!blocked && (
          <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 size-full -scale-x-100 object-cover" aria-label="Pré-visualização da câmera frontal" />
        )}

        <header className="relative z-10 flex items-center justify-between px-4 pt-[max(16px,env(safe-area-inset-top))]">
          <Link href="/app" aria-label="Fechar" className="press grid size-11 place-items-center rounded-pill bg-black/45">
            <X className="size-5" strokeWidth={2} aria-hidden />
          </Link>
          {light === "low" && status === "ready" ? (
            <div className="flex items-end gap-1" role="meter" aria-label="Nível de luz" aria-valuemin={1} aria-valuemax={LIGHT_BARS} aria-valuenow={lightBars}>
              {Array.from({ length: LIGHT_BARS }, (_, i) => (
                <span key={i} className={clsx("w-1.5 rounded-pill", i < lightBars ? "bg-gold" : "bg-white/30")} style={{ height: 8 + i * 4 }} />
              ))}
            </div>
          ) : (
            <p className="font-bold">Nova análise</p>
          )}
          <details className="relative">
            <summary className="press grid size-11 cursor-pointer list-none place-items-center rounded-pill bg-black/45" aria-label="Ajuda">
              <CircleHelp className="size-5" strokeWidth={2} aria-hidden />
            </summary>
            <div className="absolute right-0 mt-2 w-64 rounded-[18px] bg-surface-raised p-4 text-sm text-text">
              <p className="mb-2 font-bold">{SCAN_COPY.rejected.tipsTitle}</p>
              <ul className="list-disc space-y-1 pl-4">{SCAN_COPY.rejected.tips.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          </details>
        </header>

        {!blocked && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden>
            <div className="relative h-[360px] w-[270px] max-w-[72vw]">
              <div className="absolute inset-0 rounded-[50%] shadow-[0_0_0_9999px_rgba(26,19,16,.6)]" />
              <div data-state={guardState} className="face-guide absolute inset-0 rounded-[50%] border-4" />
              {countingDown && (
                <svg viewBox="0 0 270 360" className="absolute inset-0 size-full">
                  <ellipse cx="135" cy="180" rx="133" ry="178" fill="none" stroke="#FFFFFF" strokeWidth="4" pathLength={100} className="countdown-ring" />
                </svg>
              )}
            </div>
          </div>
        )}

        {blocked && (
          <div className="relative z-10 mx-auto mt-24 max-w-xs space-y-3 px-6 text-center">
            <CameraOff className="mx-auto size-10 text-[#BFAEA2]" strokeWidth={2} aria-hidden />
            <p className="font-display text-xl font-bold">{status === "denied" ? SCAN_COPY.denied.title : SCAN_COPY.unavailable.title}</p>
            <p className="text-[#BFAEA2]">{status === "denied" ? SCAN_COPY.denied.body : SCAN_COPY.unavailable.body}</p>
          </div>
        )}
      </div>

      <div className="space-y-4 px-4 pt-4 pb-[max(24px,env(safe-area-inset-bottom))]">
        {!blocked && (
          <>
            <div aria-live="polite" className="min-h-12 text-center">
              <p className="font-bold">{message.title}</p>
              {message.body && <p className="text-sm text-[#BFAEA2]">{message.body}</p>}
            </div>
            <ul className="flex flex-wrap justify-center gap-2" aria-label="Checagens">
              <GuardChip ok={light === "ok"} label={light === "ok" ? SCAN_COPY.chips.light : SCAN_COPY.chips.lightBad} />
              <GuardChip ok={frame === "ok"} label={frame === "ok" ? SCAN_COPY.chips.frame : SCAN_COPY.chips.frameBad} />
              <GuardChip ok label={SCAN_COPY.chips.filter} />
            </ul>
          </>
        )}
        {error && <p role="alert" className="text-center text-sm text-[#FF9C8F]">{error}</p>}
        {!blocked && (
          <Button size="lg" variant={canCapture ? "primary" : "locked"} onClick={capture} aria-disabled={!canCapture}>
            <Camera className="size-5" aria-hidden />
            {canCapture ? SCAN_COPY.cta : light !== "ok" ? SCAN_COPY.ctaWaitingLight : SCAN_COPY.ctaFraming}
          </Button>
        )}
        <label className={buttonClasses(blocked ? "primary" : "ghost", "lg", clsx("cursor-pointer focus-within:outline-2 focus-within:outline-accent", !blocked && "text-white hover:bg-white/10"))}>
          <ImageUp className="size-5" aria-hidden /> {SCAN_COPY.gallery}
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
      </div>

      {flash && <div className="capture-flash" aria-hidden />}
    </div>
  );
}

function GuardChip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={clsx("inline-flex h-9 items-center gap-1.5 rounded-pill px-3 text-[13px] font-semibold", ok ? "bg-white/15" : "bg-gold text-[#2A1B14]")}>
      {ok ? <Check className="size-4 text-[#8FD6A8]" strokeWidth={3} aria-hidden /> : <span aria-hidden className="font-extrabold">!</span>}
      {label}
    </li>
  );
}

function ReadingScreen() {
  const [step, setStep] = useState(0);
  const steps = SCAN_COPY.reading.steps;
  useEffect(() => {
    const timer = window.setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), READING_STEP_MS);
    return () => window.clearInterval(timer);
  }, [steps.length]);
  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center gap-8 bg-bg px-6" role="status" aria-live="polite">
      <div className="relative grid size-40 place-items-center">
        <div className="reading-ring absolute inset-0 rounded-pill border-[6px] border-[#EFE5DC] border-t-accent" />
        <div className="size-[132px] rounded-pill bg-accent-soft" />
      </div>
      <div className="space-y-1 text-center">
        <p className="font-display text-[26px] font-bold tracking-[-0.02em]">{SCAN_COPY.reading.title}</p>
        <p className="text-muted">{SCAN_COPY.reading.sub}</p>
      </div>
      <ul className="w-full max-w-xs space-y-3">
        {steps.map((label, i) => (
          <li key={label} className={clsx("flex items-center gap-3 text-[15px] font-semibold", i > step && "text-muted")}>
            <span className={clsx("grid size-6 place-items-center rounded-pill", i < step ? "bg-accent text-on-accent" : "border-2 border-border")}>
              {i < step && <Check className="size-4" strokeWidth={3} aria-hidden />}
            </span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
