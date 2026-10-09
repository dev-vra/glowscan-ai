import { Suspense, type ReactNode } from "react";
import { ChevronRight, Lock } from "lucide-react";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/card";
import { requirePageUser } from "@/lib/auth";
import { hasConsent, hasFacialConsent } from "@/lib/data";
import { getAccountSummary, getSkinProfile } from "@/lib/data/profile";
import { isEnabled } from "@/lib/flags";
import { portalAction } from "@/app/assinar/actions";
import type { SkinType } from "@/generated/prisma/enums";
import {
  deleteAccountAction, revokeConsentAction, signOutAction, togglePregnantAction, toggleResearchConsentAction,
} from "./actions";

const SKIN_LABELS: Record<SkinType, string> = { dry: "Seca", oily: "Oleosa", combination: "Mista", normal: "Normal", sensitive: "Sensível" };
const PLAN_LABELS: Record<string, string> = { monthly: "Plano mensal", yearly: "Plano anual" };
const longDate = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long" });

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <Eyebrow>{title}</Eyebrow>
      <div className="divide-y divide-[#F1E7DE] rounded-[24px] bg-surface-raised px-4">{children}</div>
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children?: ReactNode }) {
  return (
    <div className="flex min-h-14 items-center gap-3 py-2">
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold">{label}</span>
        {hint && <span className="block text-[13px] text-muted">{hint}</span>}
      </span>
      {children}
    </div>
  );
}

// Toggle como form: funciona sem JS e mantém o estado no servidor.
function Toggle({ action, on, label }: { action: (fd: FormData) => Promise<void>; on: boolean; label: string }) {
  return (
    <form action={action}>
      <input type="hidden" name="enable" value={on ? "0" : "1"} />
      <button
        type="submit" role="switch" aria-checked={on} aria-label={label}
        className={on ? "relative h-8 w-[52px] rounded-pill bg-accent" : "relative h-8 w-[52px] rounded-pill bg-border"}
      >
        <span className={on ? "toggle-knob absolute top-1 left-1 size-6 translate-x-5 rounded-pill bg-white" : "toggle-knob absolute top-1 left-1 size-6 rounded-pill bg-white"} />
      </button>
    </form>
  );
}

async function Profile() {
  const user = await requirePageUser();
  const [consented, research, profile, { subscription, photoCount }] = await Promise.all([
    hasFacialConsent(user.id), hasConsent(user.id, "research_data"), getSkinProfile(user.id), getAccountSummary(user.id),
  ]);
  const initial = user.email.charAt(0).toUpperCase();
  const plan = subscription ? (PLAN_LABELS[subscription.plan] ?? "Assinatura") : "Sem assinatura";
  const renewal = subscription?.currentPeriodEnd ? `Renova em ${longDate.format(subscription.currentPeriodEnd)}` : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-pill bg-accent font-display text-[28px] font-extrabold text-on-accent" aria-hidden>{initial}</span>
        <span className="min-w-0">
          <span className="block truncate font-bold">{user.email}</span>
          <span className="block text-sm text-muted">{plan}{renewal && ` · ${renewal}`}</span>
        </span>
      </div>

      <Group title="Sua pele">
        <Row label="Tipo de pele" hint={profile ? SKIN_LABELS[profile.skinType] : "Não informado"} />
        {profile && (
          <Row label="Gestante ou amamentando" hint="A rotina evita ativos não recomendados.">
            <Toggle action={togglePregnantAction} on={profile.pregnantOrNursing} label="Gestante ou amamentando" />
          </Row>
        )}
      </Group>

      <Group title="Assinatura">
        <form action={portalAction}>
          <button type="submit" className="flex min-h-14 w-full items-center gap-3 py-2 text-left">
            <span className="flex-1">
              <span className="block text-[15px] font-semibold">Gerenciar assinatura</span>
              <span className="block text-[13px] text-muted">Trocar plano, cartão ou cancelar.</span>
            </span>
            <ChevronRight className="size-5 text-muted" aria-hidden />
          </button>
        </form>
      </Group>

      <Group title="Privacidade">
        <Row label="Análise facial" hint={consented ? "Autorizada." : "Desativada. A próxima análise pede autorização."}>
          {consented && (
            <form action={revokeConsentAction}><Button variant="secondary" size="sm">Revogar</Button></form>
          )}
        </Row>
        {isEnabled("researchConsent") && (
          <Row label="Pesquisa anônima" hint="Dados agregados, nunca fotos, nome ou e-mail.">
            <Toggle action={toggleResearchConsentAction} on={research} label="Participar da pesquisa anônima" />
          </Row>
        )}
        <Row label="Fotos guardadas" hint={`${photoCount} ${photoCount === 1 ? "foto" : "fotos"} em armazenamento privado`}>
          <Lock className="size-5 text-muted" aria-hidden />
        </Row>
      </Group>

      <details className="group rounded-[24px] border-[1.5px] border-danger-line bg-danger-soft px-4">
        <summary className="flex min-h-14 cursor-pointer list-none items-center font-bold text-danger">Excluir conta</summary>
        <form action={deleteAccountAction} className="space-y-3 pb-4">
          <p className="text-sm">Apaga para sempre fotos, análises, produtos e rotinas. Cancele a assinatura antes.</p>
          <label htmlFor="confirm" className="block text-sm">Digite <strong>EXCLUIR</strong> para confirmar</label>
          <input id="confirm" name="confirm" autoComplete="off" className="h-[52px] w-full rounded-[14px] border-[1.5px] border-border-input bg-surface-raised px-4" />
          <Button variant="danger" size="lg">Excluir minha conta</Button>
        </form>
      </details>

      <form action={signOutAction}><Button variant="ghost" size="lg">Sair</Button></form>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="space-y-4">
      <h1 className="pb-2 font-display text-[28px]">Perfil</h1>
      <Suspense fallback={<PageSkeleton />}>
        <Profile />
      </Suspense>
    </div>
  );
}
