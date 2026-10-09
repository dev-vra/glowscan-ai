"use client";

import { useActionState, useState } from "react";
import { Check, Copy, KeyRound, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createTesterAction, resetPasswordAction, type CredentialState } from "./actions";

const initial: CredentialState = { error: null, credential: null };
const COPIED_MS = 2000;

function inviteText(siteUrl: string, email: string, password: string) {
  return `Oi! Seu acesso ao beta do Viço:\n\n${siteUrl}/entrar\nE-mail: ${email}\nSenha: ${password}\n\nEntre em "Entrar com senha".`;
}

function CredentialCard({ email, password, siteUrl }: { email: string; password: string; siteUrl: string }) {
  const [copied, setCopied] = useState(false);
  const text = inviteText(siteUrl, email, password);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), COPIED_MS);
  };
  return (
    <div role="status" className="space-y-3 rounded-[18px] border-[1.5px] border-success-line bg-success-soft p-4">
      <p className="font-bold text-success">Acesso pronto — a senha só aparece agora</p>
      <pre className="overflow-x-auto rounded-[14px] bg-surface-raised p-3 text-sm whitespace-pre-wrap">{text}</pre>
      <div className="flex gap-2">
        <Button type="button" variant="dark" size="sm" onClick={copy}>
          {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />} {copied ? "Copiado" : "Copiar convite"}
        </Button>
        <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center rounded-pill border-[1.5px] border-[#E2D5CA] bg-surface-raised px-4 text-sm font-bold">
          WhatsApp
        </a>
      </div>
    </div>
  );
}

export function CreateTesterForm({ siteUrl }: { siteUrl: string }) {
  const [state, action, pending] = useActionState(createTesterAction, initial);
  return (
    <div className="space-y-3">
      <form action={action} className="flex gap-2">
        <label htmlFor="tester-email" className="sr-only">E-mail do tester</label>
        <input
          id="tester-email" name="email" type="email" required placeholder="email@tester.com" autoComplete="off"
          className="h-12 min-w-0 flex-1 rounded-[14px] border-[1.5px] border-border-input bg-surface-raised px-4 outline-none focus-visible:border-accent"
        />
        <Button type="submit" loading={pending}><UserPlus className="size-5" aria-hidden /> Criar</Button>
      </form>
      {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state.credential && <CredentialCard {...state.credential} siteUrl={siteUrl} />}
    </div>
  );
}

export function ResetPasswordForm({ userId, siteUrl }: { userId: string; siteUrl: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);
  return (
    <div className="space-y-2">
      <form action={action}>
        <input type="hidden" name="userId" value={userId} />
        <Button type="submit" variant="ghost" size="sm" loading={pending}><KeyRound className="size-4" aria-hidden /> Nova senha</Button>
      </form>
      {state.credential && <CredentialCard {...state.credential} siteUrl={siteUrl} />}
    </div>
  );
}
