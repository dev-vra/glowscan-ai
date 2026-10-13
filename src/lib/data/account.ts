import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";

// Tudo que os guards de página precisam (perfil, assinatura, consentimento facial) em uma ida ao banco.
// cache() do React: uma consulta por render, por mais que a página e os guards perguntem.
export const loadAccount = cache(async (userId: string) =>
  db().user.findUnique({
    where: { id: userId },
    select: {
      profile: true,
      subscription: true,
      consents: { where: { kind: "facial_photo", revokedAt: null }, select: { id: true }, take: 1 },
    },
  }),
);
