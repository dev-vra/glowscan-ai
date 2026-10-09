-- Segurança e integridade que o Prisma não expressa. Idempotente.

-- Usuário do app = usuário do Supabase Auth; apagar no Auth apaga tudo em cascata (LGPD).
DO $$ BEGIN
  ALTER TABLE "User" ADD CONSTRAINT "User_auth_fk" FOREIGN KEY ("id") REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ConflictRule" ADD CONSTRAINT "ConflictRule_ordered_pair" CHECK ("familyA"::text <= "familyB"::text);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ScanMetric" ADD CONSTRAINT "ScanMetric_score_range" CHECK ("score" BETWEEN 0 AND 100);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_feeling_range" CHECK ("feeling" BETWEEN 1 AND 5);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS ligada sem policies: a API pública (anon/authenticated) não lê nada.
-- O app acessa via Prisma com role privilegiada e filtra por userId na camada de dados.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SkinProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Consent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FaceScan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ScanMetric" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ingredient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductIngredient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConflictRule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Routine" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RoutineStep" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RoutineLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CheckIn" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StripeEvent" ENABLE ROW LEVEL SECURITY;

-- Bucket privado para fotos (rosto e rótulos). Sem policies: só service role acessa; leitura via URL assinada.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('private-photos', 'private-photos', false, 4194304, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;
