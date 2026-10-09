import { Suspense } from "react";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { Eyebrow } from "@/components/ui/card";
import { requireSubscriber } from "@/lib/auth";
import { LabelCapture } from "./label-capture";

async function Guarded() {
  await requireSubscriber();
  return <LabelCapture />;
}

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Eyebrow>Armário</Eyebrow>
        <h1 className="font-display text-xl">Novo produto</h1>
      </header>
      <Suspense fallback={<PageSkeleton />}>
        <Guarded />
      </Suspense>
    </div>
  );
}
