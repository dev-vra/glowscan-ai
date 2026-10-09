"use client";

import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { googleSignInAction, passwordSignInAction, signInAction, type SignInState } from "./actions";

const initialState: SignInState = { error: null, sentTo: null };

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);
  const [pwState, pwAction, pwPending] = useActionState(passwordSignInAction, initialState);

  if (state.sentTo) {
    return (
      <div role="status" className="space-y-3 rounded-[24px] bg-surface-raised p-6 text-center">
        <MailCheck className="mx-auto size-8 text-accent" strokeWidth={2} aria-hidden />
        <p className="font-display text-xl">Confira seu e-mail</p>
        <p className="text-sm text-muted">Enviamos um link de acesso para <strong className="text-text">{state.sentTo}</strong>. Ele vale por 1 hora.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4" noValidate>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold">E-mail</label>
          <input
            id="email" name="email" type="email" autoComplete="email" required
            aria-invalid={state.error ? true : undefined} aria-describedby={state.error ? "email-error" : undefined}
            className="h-[52px] w-full rounded-[14px] border-[1.5px] border-border-input bg-surface-raised px-4 text-base outline-none focus-visible:border-accent"
            placeholder="voce@email.com"
          />
          {state.error && <p id="email-error" role="alert" className="text-sm text-danger">{state.error}</p>}
        </div>
        <Button type="submit" size="lg" loading={pending}>Receber link</Button>
      </form>
      <details className="rounded-[18px] border-[1.5px] border-[#E2D5CA] px-4" open={Boolean(pwState.error)}>
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-center font-bold">Entrar com senha</summary>
        <form action={pwAction} className="space-y-3 pb-4">
          <label htmlFor="pw-email" className="sr-only">E-mail</label>
          <input id="pw-email" name="email" type="email" autoComplete="email" required placeholder="voce@email.com" className="h-[52px] w-full rounded-[14px] border-[1.5px] border-border-input bg-surface-raised px-4 text-base outline-none focus-visible:border-accent" />
          <label htmlFor="pw-password" className="sr-only">Senha</label>
          <input id="pw-password" name="password" type="password" autoComplete="current-password" required placeholder="Senha" className="h-[52px] w-full rounded-[14px] border-[1.5px] border-border-input bg-surface-raised px-4 text-base outline-none focus-visible:border-accent" />
          {pwState.error && <p role="alert" className="text-sm text-danger">{pwState.error}</p>}
          <Button type="submit" variant="dark" size="lg" loading={pwPending}>Entrar</Button>
        </form>
      </details>
      <form action={googleSignInAction}>
        <Button type="submit" variant="secondary" size="lg">Continuar com Google</Button>
      </form>
    </div>
  );
}
