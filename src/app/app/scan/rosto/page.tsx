import { Suspense } from "react";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { Eyebrow } from "@/components/ui/card";
import { Disclaimer } from "@/components/ui/disclaimer";
import { requireConsentedUser } from "@/lib/auth";
import { FaceCamera } from "./face-camera";

async function GuardedCamera() {
  await requireConsentedUser();
  return <FaceCamera />;
}

export default function FaceScanPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Eyebrow>Nova análise</Eyebrow>
        <h1 className="font-display text-xl">Rosto limpo, luz natural.</h1>
        <p className="text-sm text-muted">
          Sem maquiagem, cabelo preso, de frente para uma janela. Repita sempre nas mesmas condições para comparar a evolução.
        </p>
      </header>
      <Suspense fallback={<PageSkeleton />}>
        <GuardedCamera />
      </Suspense>
      <Disclaimer />
    </div>
  );
}
