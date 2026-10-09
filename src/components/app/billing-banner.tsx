import { buttonClasses } from "@/components/ui/button";
import { ConflictAlert } from "@/components/ui/conflict-alert";
import type { BillingBanner as Banner } from "@/lib/billing";
import { BILLING_COPY } from "@/lib/copy";
import { portalAction } from "@/app/assinar/actions";

// A1: aviso de assinatura entre a saudação e o score. Ação leva ao portal do Stripe.
export function BillingBanner({ banner }: { banner: Banner }) {
  if (!banner) return null;
  const action = (
    <form action={portalAction}>
      <button type="submit" className={buttonClasses("secondary", "sm")}>
        {banner.kind === "payment_failed" ? "Atualizar cartão" : "Ver assinatura"}
      </button>
    </form>
  );
  if (banner.kind === "payment_failed") {
    return (
      <ConflictAlert level="warn" title={BILLING_COPY.paymentFailed} action={action}>
        Atualize o cartão pra continuar com as análises e a rotina.
      </ConflictAlert>
    );
  }
  const when = banner.daysLeft === 0 ? "hoje" : `em ${banner.daysLeft} dia${banner.daysLeft > 1 ? "s" : ""}`;
  return (
    <ConflictAlert level="info" title={`Seu teste acaba ${when}`} action={action}>
      Depois disso a assinatura começa sozinha. Cancele quando quiser.
    </ConflictAlert>
  );
}
