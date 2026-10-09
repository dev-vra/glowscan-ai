import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-content flex-col justify-center gap-8 px-5 py-16">
      <div className="space-y-3">
        <p className="font-display text-[44px] font-extrabold tracking-[-0.05em]">viço</p>
        <h1 className="font-display text-[26px]">Sua pele lida, sua rotina na ordem certa.</h1>
        <p className="text-muted">Sem senha: a gente manda um link de acesso pro seu e-mail.</p>
      </div>
      <SignInForm />
      <p className="text-xs text-muted">Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade.</p>
    </main>
  );
}
