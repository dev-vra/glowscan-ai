import { Suspense } from "react";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { requireConsentedUser } from "@/lib/auth";
import { FaceCamera } from "./face-camera";

async function GuardedCamera() {
  await requireConsentedUser();
  return <FaceCamera />;
}

export default function FaceScanPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <GuardedCamera />
    </Suspense>
  );
}
