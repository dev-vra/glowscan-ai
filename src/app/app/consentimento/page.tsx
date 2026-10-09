import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { Button } from "@/components/ui/button";
import { Card, Eyebrow } from "@/components/ui/card";
import { requirePageUser } from "@/lib/auth";
import { grantConsentAction } from "./actions";

const COMMITMENTS = [
  "Suas fotos ficam em armazenamento privado, acessíveis só por você.",
  "Usamos a imagem apenas para gerar a sua análise.",
  "Nunca usamos suas fotos para treinar modelos de IA.",
  "Você pode excluir fotos e conta a qualquer momento, em Perfil.",
];

async function ConsentForm() {
  await requirePageUser();
  return (
    <form action={grantConsentAction} className="space-y-6">
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="accept" required className="mt-0.5 size-5 accent-accent" />
        Autorizo o tratamento das fotos do meu rosto para a análise estética da pele, conforme a LGPD (dado pessoal sensível).
      </label>
      <Button type="submit" size="lg">Concordar e continuar</Button>
    </form>
  );
}

export default function ConsentPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Eyebrow>Privacidade</Eyebrow>
        <h1 className="font-display text-xl">Sua imagem, suas regras.</h1>
        <p className="text-sm text-muted">Antes da primeira análise, precisamos da sua autorização explícita.</p>
      </header>
      <Card>
        <ul className="space-y-3">
          {COMMITMENTS.map((item) => (
            <li key={item} className="flex gap-3 text-sm">
              <ShieldCheck className="size-5 shrink-0 text-success" strokeWidth={1.5} aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </Card>
      <Suspense fallback={<PageSkeleton />}>
        <ConsentForm />
      </Suspense>
    </div>
  );
}
