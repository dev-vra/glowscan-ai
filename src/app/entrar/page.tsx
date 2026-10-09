import { Eyebrow } from "@/components/ui/card";
import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-content flex-col justify-center gap-8 px-6 py-16">
      <div className="space-y-3">
        <Eyebrow>Entrar</Eyebrow>
        <h1 className="font-display text-xl">Boas-vindas ao seu ritual.</h1>
        <p className="text-sm text-muted">Sem senha: enviamos um link de acesso para o seu e-mail.</p>
      </div>
      <SignInForm />
      <p className="text-xs text-muted">Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade.</p>
    </main>
  );
}
