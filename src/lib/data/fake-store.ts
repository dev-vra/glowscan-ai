import "server-only";
import type { FaceScan, User } from "./types";

type Store = {
  users: Map<string, User>;
  consents: Map<string, Date>;
  scans: Map<string, FaceScan>;
};

const globalForStore = globalThis as unknown as { glowscanStore?: Store };

// Persistência em memória do processo: some ao reiniciar o dev server. Trocada por Prisma no replica-backend.
export const store: Store = (globalForStore.glowscanStore ??= {
  users: new Map(),
  consents: new Map(),
  scans: new Map(),
});
