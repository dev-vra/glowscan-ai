-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SkinType" AS ENUM ('dry', 'oily', 'combination', 'normal', 'sensitive');

-- CreateEnum
CREATE TYPE "ConsentKind" AS ENUM ('facial_photo', 'marketing');

-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('pending', 'done', 'rejected');

-- CreateEnum
CREATE TYPE "SkinMetric" AS ENUM ('texture', 'redness', 'pores', 'fine_lines', 'spots', 'oiliness', 'hydration');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('cleanser', 'toner', 'essence', 'serum', 'treatment', 'eye', 'moisturizer', 'oil', 'spf', 'mask', 'exfoliant', 'other');

-- CreateEnum
CREATE TYPE "Period" AS ENUM ('am', 'pm', 'both');

-- CreateEnum
CREATE TYPE "IngredientFamily" AS ENUM ('retinoid', 'aha', 'bha', 'pha', 'vitamin_c', 'niacinamide', 'benzoyl_peroxide', 'peptide', 'copper_peptide', 'azelaic_acid', 'ceramide', 'hyaluronic', 'sunscreen_filter', 'fragrance', 'alcohol_drying', 'other');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('info', 'warn', 'critical');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('trialing', 'active', 'past_due', 'canceled');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkinProfile" (
    "userId" UUID NOT NULL,
    "skinType" "SkinType" NOT NULL,
    "concerns" TEXT[],
    "ageRange" TEXT NOT NULL,
    "city" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "pregnantOrNursing" BOOLEAN NOT NULL DEFAULT false,
    "monthlyBudgetCents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "SkinProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Consent" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "kind" "ConsentKind" NOT NULL,
    "grantedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMPTZ,

    CONSTRAINT "Consent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaceScan" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "imagePath" TEXT NOT NULL,
    "takenAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ScanStatus" NOT NULL DEFAULT 'pending',
    "rejectReason" TEXT,
    "lightingQuality" INTEGER,
    "makeupDetected" BOOLEAN NOT NULL DEFAULT false,
    "overallScore" INTEGER,
    "modelVersion" TEXT,
    "summary" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "FaceScan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanMetric" (
    "id" UUID NOT NULL,
    "scanId" UUID NOT NULL,
    "metric" "SkinMetric" NOT NULL,
    "score" INTEGER NOT NULL,
    "zones" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "ScanMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "brand" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "imagePath" TEXT,
    "barcode" TEXT,
    "inciRaw" TEXT,
    "period" "Period" NOT NULL DEFAULT 'both',
    "openedAt" DATE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" UUID NOT NULL,
    "inciName" TEXT NOT NULL,
    "aliases" TEXT[],
    "family" "IngredientFamily" NOT NULL DEFAULT 'other',
    "photosensitizing" BOOLEAN NOT NULL DEFAULT false,
    "pregnancyCaution" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductIngredient" (
    "productId" UUID NOT NULL,
    "ingredientId" UUID NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ProductIngredient_pkey" PRIMARY KEY ("productId","ingredientId")
);

-- CreateTable
CREATE TABLE "ConflictRule" (
    "id" UUID NOT NULL,
    "familyA" "IngredientFamily" NOT NULL,
    "familyB" "IngredientFamily" NOT NULL,
    "severity" "Severity" NOT NULL,
    "advice" TEXT NOT NULL,

    CONSTRAINT "ConflictRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Routine" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "period" "Period" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "generatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Routine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineStep" (
    "id" UUID NOT NULL,
    "routineId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "daysOfWeek" INTEGER[] DEFAULT ARRAY[0, 1, 2, 3, 4, 5, 6]::INTEGER[],

    CONSTRAINT "RoutineStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "period" "Period" NOT NULL,
    "stepIdsDone" UUID[],

    CONSTRAINT "RoutineLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckIn" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "feeling" INTEGER NOT NULL,
    "reactions" TEXT[],
    "notes" TEXT,

    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "userId" UUID NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT,
    "status" "SubscriptionStatus" NOT NULL,
    "plan" TEXT NOT NULL,
    "currentPeriodEnd" TIMESTAMPTZ,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "StripeEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Consent_userId_kind_idx" ON "Consent"("userId", "kind");

-- CreateIndex
CREATE INDEX "FaceScan_userId_takenAt_idx" ON "FaceScan"("userId", "takenAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ScanMetric_scanId_metric_key" ON "ScanMetric"("scanId", "metric");

-- CreateIndex
CREATE INDEX "Product_userId_category_idx" ON "Product"("userId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_inciName_key" ON "Ingredient"("inciName");

-- CreateIndex
CREATE INDEX "ProductIngredient_ingredientId_idx" ON "ProductIngredient"("ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "ConflictRule_familyA_familyB_key" ON "ConflictRule"("familyA", "familyB");

-- CreateIndex
CREATE UNIQUE INDEX "Routine_userId_period_key" ON "Routine"("userId", "period");

-- CreateIndex
CREATE INDEX "RoutineStep_routineId_order_idx" ON "RoutineStep"("routineId", "order");

-- CreateIndex
CREATE INDEX "RoutineStep_productId_idx" ON "RoutineStep"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "RoutineLog_userId_date_period_key" ON "RoutineLog"("userId", "date", "period");

-- CreateIndex
CREATE UNIQUE INDEX "CheckIn_userId_date_key" ON "CheckIn"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- AddForeignKey
ALTER TABLE "SkinProfile" ADD CONSTRAINT "SkinProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consent" ADD CONSTRAINT "Consent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaceScan" ADD CONSTRAINT "FaceScan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanMetric" ADD CONSTRAINT "ScanMetric_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "FaceScan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductIngredient" ADD CONSTRAINT "ProductIngredient_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductIngredient" ADD CONSTRAINT "ProductIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routine" ADD CONSTRAINT "Routine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineStep" ADD CONSTRAINT "RoutineStep_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineStep" ADD CONSTRAINT "RoutineStep_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineLog" ADD CONSTRAINT "RoutineLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

