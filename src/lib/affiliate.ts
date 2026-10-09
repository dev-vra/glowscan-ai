import "server-only";
import { env } from "@/lib/env";

export type BuyLink = { store: string; url: string };

// Links de busca nas lojas; a tag de afiliado entra só se configurada. Nunca altera ranking ou recomendação.
export function buyLinks(brand: string, name: string): BuyLink[] {
  const query = encodeURIComponent(`${brand} ${name}`.trim());
  const amazon = new URL(`https://www.amazon.com.br/s?k=${query}`);
  const amazonTag = env().AFFILIATE_AMAZON_TAG;
  if (amazonTag) amazon.searchParams.set("tag", amazonTag);
  return [
    { store: "Amazon", url: amazon.toString() },
    { store: "Mercado Livre", url: `https://lista.mercadolivre.com.br/${query}` },
  ];
}
