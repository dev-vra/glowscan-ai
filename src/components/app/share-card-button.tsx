"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Compartilha o PNG pelo menu nativo; sem suporte (desktop), baixa o arquivo.
export function ShareCardButton({ cardUrl }: { cardUrl: string }) {
  const [busy, setBusy] = useState(false);

  async function share() {
    setBusy(true);
    try {
      const blob = await (await fetch(cardUrl)).blob();
      const file = new File([blob], "minha-pele.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Minha pele hoje" });
        return;
      }
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      // usuário cancelou o compartilhamento
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="secondary" onClick={share} disabled={busy}>
      <Share2 className="size-4" aria-hidden /> {busy ? "Gerando…" : "Compartilhar resultado"}
    </Button>
  );
}
