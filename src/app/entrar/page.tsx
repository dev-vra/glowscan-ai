import { headers } from "next/headers";
import { Suspense } from "react";
import { SignInForm } from "./sign-in-form";

// No app nativo (WebView) o Google bloqueia o login: lá só e-mail e senha.
async function Form() {
  const isNativeApp = (await headers()).get("user-agent")?.includes("VicoApp") ?? false;
  return <SignInForm showGoogle={!isNativeApp} />;
}

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-content flex-col justify-center gap-8 px-5 py-16">
      <div className="space-y-3">
        <p className="font-display text-[44px] font-extrabold tracking-[-0.05em]">viço</p>
        <h1 className="font-display text-[26px]">Sua pele lida, sua rotina na ordem certa.</h1>
        <p className="text-muted">Entre com o link por e-mail ou com a senha do seu convite.</p>
      </div>
      <Suspense fallback={<div className="h-64" />}>
        <Form />
      </Suspense>
      <p className="text-xs text-muted">Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade.</p>
    </main>
  );
}
