import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = { icon: LucideIcon; title: string; text: string; action?: ReactNode };

export function EmptyState({ icon: Icon, title, text, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <div className="grid size-14 place-items-center rounded-pill bg-accent-soft text-accent">
        <Icon className="size-6" strokeWidth={1.5} aria-hidden />
      </div>
      <h2 className="font-display text-xl">{title}</h2>
      <p className="max-w-xs text-sm text-muted">{text}</p>
      {action}
    </div>
  );
}
