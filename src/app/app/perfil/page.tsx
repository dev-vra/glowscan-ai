import { Suspense } from "react";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { Button } from "@/components/ui/button";
import { Card, Eyebrow } from "@/components/ui/card";
import { requirePageUser } from "@/lib/auth";
import { hasConsent, hasFacialConsent } from "@/lib/data";
import { portalAction } from "@/app/assinar/actions";
import { deleteAccountAction, revokeConsentAction, signOutAction, toggleResearchConsentAction } from "./actions";

async function Profile() {
  const user = await requirePageUser();
  const [consented, research] = await Promise.all([hasFacialConsent(user.id), hasConsent(user.id, "research_data")]);
  return (
    <div className="space-y-6">
      <Card className="space-y-1">
        <Eyebrow>Conta</Eyebrow>
        <p className="truncate text-sm">{user.email}</p>
      </Card>

      <Card className="space-y-3">
        <Eyebrow>Assinatura</Eyebrow>
        <p className="text-sm text-muted">Troque de plano, atualize o cartão ou cancele em um clique.</p>
        <form action={portalAction}><Button variant="secondary">Gerenciar assinatura</Button></form>
      </Card>

      <Card className="space-y-3">
        <Eyebrow>Privacidade</Eyebrow>
        <p className="text-sm text-muted">
          {consented ? "Você autorizou a análise das fotos do seu rosto." : "Análise facial desativada. Novas análises pedirão sua autorização."}
        </p>
        {consented && <form action={revokeConsentAction}><Button variant="secondary">Revogar autorização</Button></form>}
      </Card>

      <Card className="space-y-3">
        <Eyebrow>Pesquisa (opcional)</Eyebrow>
        <p className="text-sm text-muted">
          Compartilhar dados anonimizados e agregados (tipo de pele, métricas, produtos — nunca fotos, nome ou e-mail) para estudos sobre a pele do brasileiro. Você pode desligar quando quiser.
        </p>
        <form action={toggleResearchConsentAction}>
          <input type="hidden" name="enable" value={research ? "0" : "1"} />
          <Button variant="secondary">{research ? "Parar de compartilhar" : "Quero participar"}</Button>
        </form>
      </Card>

      <Card className="space-y-3">
        <Eyebrow>Excluir conta</Eyebrow>
        <p className="text-sm text-muted">Apaga para sempre fotos, análises, produtos e rotinas. A assinatura deve ser cancelada antes.</p>
        <form action={deleteAccountAction} className="space-y-3">
          <label htmlFor="confirm" className="block text-sm">Digite <strong>EXCLUIR</strong> para confirmar</label>
          <input id="confirm" name="confirm" autoComplete="off" className="h-11 w-full rounded-md border border-border-input bg-surface-raised px-4" />
          <Button variant="danger">Excluir minha conta</Button>
        </form>
      </Card>

      <form action={signOutAction}><Button variant="ghost">Sair de todos os dispositivos</Button></form>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-xl">Perfil</h1>
      <Suspense fallback={<PageSkeleton />}>
        <Profile />
      </Suspense>
    </div>
  );
}
