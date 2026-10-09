import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Badge } from "@/components/ui/chip";

// F2 (fase 2, flag studyInvites): convite para estudo de eficácia patrocinado. Sempre marcado como patrocinado.
export function StudyInvite() {
  return (
    <section aria-labelledby="study-title" className="space-y-3 rounded-[24px] border-[1.5px] border-info-line bg-info-soft p-5">
      <div className="flex items-center justify-between">
        <Badge tone="study"><FlaskConical className="size-4" aria-hidden /> Estudo</Badge>
        <Badge tone="sponsored">Patrocinado</Badge>
      </div>
      <h2 id="study-title" className="font-display text-xl">Teste um produto por 4 semanas</h2>
      <p className="text-sm">
        Uma marca parceira quer medir um hidratante com análises semanais. Você recebe o produto e decide se participa.
        Suas fotos nunca são compartilhadas — só métricas anônimas, com sua autorização.
      </p>
      <Link href="/app/perfil" className={buttonClasses("dark", "sm")}>Quero saber mais</Link>
    </section>
  );
}
