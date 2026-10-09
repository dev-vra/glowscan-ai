import Link from "next/link";
import { Suspense } from "react";
import { ScanFace } from "lucide-react";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { buttonClasses } from "@/components/ui/button";
import { Card, Eyebrow } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ScoreRing } from "@/components/ui/score-ring";
import { requirePageUser } from "@/lib/auth";
import { listFaceScans } from "@/lib/data";

const dateFormat = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long" });

async function Today() {
  const user = await requirePageUser();
  const [latest] = await listFaceScans(user.id);

  if (!latest) {
    return (
      <EmptyState
        icon={ScanFace}
        title="Vamos conhecer sua pele"
        text="Sua primeira análise leva menos de um minuto. Use luz natural e o rosto sem maquiagem."
        action={<Link href="/app/scan/rosto" className={buttonClasses("primary", "md")}>Fazer primeira análise</Link>}
      />
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <Eyebrow>Hoje</Eyebrow>
        <h1 className="font-display text-xl">Sua pele em resumo</h1>
      </header>
      <div className="flex justify-center"><ScoreRing score={latest.overallScore} /></div>
      <Card className="space-y-3">
        <Eyebrow>Última análise · {dateFormat.format(latest.takenAt)}</Eyebrow>
        <p className="text-sm">{latest.summary}</p>
        <Link href={`/app/scan/${latest.id}`} className="text-sm font-semibold text-accent underline-offset-4 hover:underline">Ver detalhes</Link>
      </Card>
    </div>
  );
}

export default function TodayPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Today />
    </Suspense>
  );
}
