import { Suspense } from "react";
import { BottomNav } from "@/components/app/bottom-nav";
import { SideNav } from "@/components/app/side-nav";

export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <>
      <Suspense fallback={null}>
        <SideNav />
      </Suspense>
      <div className="lg:pl-60">
        <main className="mx-auto max-w-content px-4 pt-8 pb-32 lg:pt-12 lg:pb-16">{children}</main>
      </div>
      <Suspense fallback={<div className="fixed inset-x-0 bottom-0 h-16 border-t border-border bg-bg lg:hidden" />}>
        <BottomNav />
      </Suspense>
    </>
  );
}
