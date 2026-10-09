import { Suspense } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requirePageUser } from "@/lib/auth";
import { grantConsentAction } from "./actions";

const COMMITMENTS = [
  "Fica em armazenamento privado, só você acessa.",
  "Serve só pra gerar a sua análise. Nunca treina IA.",
  "Você apaga fotos e conta quando quiser, em Perfil.",
];

const checkboxClass = "mt-0.5 size-6 shrink-0 accent-accent";

async function ConsentForm() {
  await requirePageUser();
  return (
    <form action={grantConsentAction} className="space-y-5">
      <label className="flex items-start gap-3">
        <input type="checkbox" name="accept" required className={checkboxClass} />
        <span>
          <span className="block font-semibold">Autorizo a análise das fotos do meu rosto</span>
          <span className="text-sm text-muted">Obrigatório. Dado pessoal sensível, conforme a LGPD.</span>
        </span>
      </label>
      <Button type="submit" size="lg">Concordar e continuar</Button>
    </form>
  );
}

export default function ConsentPage() {
  return (
    <div className="space-y-6 pt-4">
      <header className="space-y-3">
        <span className="grid size-14 place-items-center rounded-pill bg-accent-soft text-accent"><Lock className="size-6" strokeWidth={2} aria-hidden /></span>
        <h1 className="font-display text-[30px] leading-9">Sua foto é sua.</h1>
        <p className="text-muted">Antes da primeira análise, a gente precisa da sua autorização.</p>
      </header>
      <Card>
        <ul className="space-y-4">
          {COMMITMENTS.map((item) => (
            <li key={item} className="flex gap-3">
              <ShieldCheck className="size-6 shrink-0 text-success" strokeWidth={2} aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </Card>
      <Suspense fallback={<PageSkeleton />}>
        <ConsentForm />
      </Suspense>
      <p className="text-sm text-muted">A pesquisa anônima é opcional e fica em Perfil, desligada por padrão.</p>
    </div>
  );
}
