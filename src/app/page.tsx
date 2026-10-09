import Link from "next/link";
import { Sparkles } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-content flex-col justify-center gap-8 px-6 py-16">
      <Eyebrow className="flex items-center gap-2"><Sparkles className="size-3.5" aria-hidden /> GlowScan AI</Eyebrow>
      <h1 className="font-display text-display">Seus cosméticos, finalmente trabalhando juntos.</h1>
      <p className="text-muted">
        Uma foto do rosto e dos rótulos do seu armário. Em segundos você sabe o estado da sua pele, a ordem certa de cada produto e quais ativos não devem se encontrar.
      </p>
      <div className="flex flex-col gap-3">
        <Link href="/entrar" className={buttonClasses("primary", "lg")}>Começar teste grátis</Link>
        <Link href="/entrar" className={buttonClasses("ghost", "md")}>Já tenho conta</Link>
      </div>
    </main>
  );
}
