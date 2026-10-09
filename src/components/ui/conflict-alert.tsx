import { clsx } from "clsx";
import { Check, Info, OctagonAlert } from "lucide-react";
import type { ReactNode } from "react";
import { RESOLVED_LABEL, SEVERITY_LABELS } from "@/lib/copy";

export type AlertLevel = "critical" | "warn" | "info" | "resolved";

const LEVEL_STYLES: Record<AlertLevel, string> = {
  critical: "bg-danger-soft border-danger-line text-danger",
  warn: "bg-warning-soft border-warning-line text-warning",
  info: "bg-info-soft border-info-line text-info",
  resolved: "bg-success-soft border-success-line text-success",
};

const LEVEL_TITLES: Record<AlertLevel, string> = { ...SEVERITY_LABELS, resolved: RESOLVED_LABEL };

// A forma do ícone muda por nível — status nunca só por cor.
function LevelIcon({ level }: { level: AlertLevel }) {
  if (level === "critical") return <OctagonAlert className="size-6 shrink-0" strokeWidth={2} aria-hidden />;
  if (level === "info") return <Info className="size-6 shrink-0" strokeWidth={2} aria-hidden />;
  return (
    <span className={clsx("grid size-6 shrink-0 place-items-center rounded-pill text-bg", level === "warn" ? "bg-warning" : "bg-success")} aria-hidden>
      {level === "warn" ? <span className="text-sm font-extrabold leading-none">!</span> : <Check className="size-4" strokeWidth={3} />}
    </span>
  );
}

type ConflictAlertProps = { level: AlertLevel; title?: string; children: ReactNode; action?: ReactNode };

export function ConflictAlert({ level, title, children, action }: ConflictAlertProps) {
  return (
    <div role={level === "critical" ? "alert" : "note"} className={clsx("flex gap-3 rounded-[18px] border-[1.5px] p-4", LEVEL_STYLES[level])}>
      <LevelIcon level={level} />
      <div className="min-w-0 space-y-1">
        <p className="font-bold">{title ?? LEVEL_TITLES[level]}</p>
        <div className="text-sm text-text">{children}</div>
        {action && <div className="pt-2">{action}</div>}
      </div>
    </div>
  );
}
