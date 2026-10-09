import { Suspense } from "react";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { requirePageUser } from "@/lib/auth";
import { Quiz } from "./quiz";

async function GuardedQuiz() {
  await requirePageUser();
  return <Quiz />;
}

export default function OnboardingPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-content px-6 py-10">
      <Suspense fallback={<PageSkeleton />}>
        <GuardedQuiz />
      </Suspense>
    </main>
  );
}
