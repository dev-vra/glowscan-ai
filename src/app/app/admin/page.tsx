import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/card";
import { requirePageUser } from "@/lib/auth";
import { isAdmin, listTesters, type Tester } from "@/lib/data/admin";
import { env } from "@/lib/env";
import { toggleBetaAction } from "./actions";
import { CreateTesterForm, ResetPasswordForm } from "./credential-forms";

const shortDate = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

const ACCESS_LABEL: Record<Tester["access"], { label: string; tone: string }> = {
  beta: { label: "Beta liberado", tone: "bg-success-soft text-success" },
  beta_off: { label: "Beta revogado", tone: "bg-[#F1E7DE] text-muted dark:bg-surface" },
  paid: { label: "Assinante", tone: "bg-info-soft text-info" },
  none: { label: "Sem acesso", tone: "bg-warning-soft text-warning" },
};

async function Admin() {
  const user = await requirePageUser();
  if (!isAdmin(user.email)) notFound();
  const testers = await listTesters();
  const siteUrl = env().NEXT_PUBLIC_SITE_URL;
  const active = testers.filter((t) => t.access === "beta" || t.access === "paid").length;

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <Eyebrow>Novo acesso</Eyebrow>
        <p className="text-sm text-muted">Cria login com senha, já com acesso beta grátis. Nenhum e-mail é enviado: você manda o convite.</p>
        <CreateTesterForm siteUrl={siteUrl} />
      </section>

      <section className="space-y-3">
        <Eyebrow>Pessoas · {active} com acesso de {testers.length}</Eyebrow>
        <ul className="divide-y divide-[#F1E7DE] rounded-[24px] bg-surface-raised px-4">
          {testers.map((t) => {
            const access = ACCESS_LABEL[t.access];
            const canToggle = t.access !== "paid" && t.id !== user.id;
            const on = t.access === "beta";
            return (
              <li key={t.id} className="space-y-2 py-3">
                <div className="flex items-center gap-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{t.email}</span>
                    <span className="text-[13px] text-muted">
                      desde {shortDate.format(t.createdAt)} · {t.scans} análises · {t.products} produtos
                    </span>
                  </span>
                  <span className={`shrink-0 rounded-pill px-2.5 py-1 text-xs font-bold ${access.tone}`}>{access.label}</span>
                </div>
                <div className="flex flex-wrap items-start gap-2">
                  {canToggle && (
                    <form action={toggleBetaAction}>
                      <input type="hidden" name="userId" value={t.id} />
                      <input type="hidden" name="enable" value={on ? "0" : "1"} />
                      <Button type="submit" variant={on ? "ghost" : "secondary"} size="sm" className={on ? "text-danger" : undefined}>
                        {on ? "Revogar acesso" : "Liberar beta"}
                      </Button>
                    </form>
                  )}
                  <ResetPasswordForm userId={t.id} siteUrl={siteUrl} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

export default function AdminPage() {
  return (
    <div className="space-y-4">
      <h1 className="pb-2 font-display text-[28px]">Admin</h1>
      <Suspense fallback={<PageSkeleton />}>
        <Admin />
      </Suspense>
    </div>
  );
}
