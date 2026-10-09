import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-content flex-col justify-center gap-8 px-5 py-16">
      <p className="font-display text-[32px] font-extrabold tracking-[-0.05em] text-accent">viço</p>
      <h1 className="font-display text-[44px] leading-[46px] font-extrabold tracking-[-0.035em]">Seus cosméticos, finalmente trabalhando juntos.</h1>
      <p className="text-muted">
        Uma foto do rosto e dos rótulos do seu armário. Em segundos você sabe o estado da sua pele, a ordem certa de cada produto e quais ativos não devem se encontrar.
      </p>
      <div className="flex flex-col gap-3">
        <Link href="/entrar" className={buttonClasses("primary", "lg")}>Começar teste grátis</Link>
        <Link href="/entrar" className={buttonClasses("ghost", "lg")}>Já tenho conta</Link>
      </div>
    </main>
  );
}
