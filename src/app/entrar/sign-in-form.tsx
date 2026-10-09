"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { signInAction, type SignInState } from "./actions";

const initialState: SignInState = { error: null };

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);
  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold">E-mail</label>
        <input
          id="email" name="email" type="email" autoComplete="email" required
          aria-invalid={state.error ? true : undefined} aria-describedby={state.error ? "email-error" : undefined}
          className="h-12 w-full rounded-md border border-border-input bg-surface-raised px-4 text-base outline-none focus-visible:border-accent"
          placeholder="voce@email.com"
        />
        {state.error && <p id="email-error" role="alert" className="text-sm text-danger">{state.error}</p>}
      </div>
      <Button type="submit" size="lg" loading={pending}>Receber link de acesso</Button>
      <Button type="button" variant="secondary" size="lg" disabled>Continuar com Google (em breve)</Button>
    </form>
  );
}
