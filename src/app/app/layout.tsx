import { Suspense } from "react";
import { BottomNav } from "@/components/app/bottom-nav";

export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <>
      <main className="mx-auto max-w-content px-4 pt-8 pb-32">{children}</main>
      <Suspense fallback={<div className="fixed inset-x-0 bottom-0 h-18 border-t border-border bg-bg" />}>
        <BottomNav />
      </Suspense>
    </>
  );
}
