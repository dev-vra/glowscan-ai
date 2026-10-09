import "server-only";
import { db } from "@/lib/db";
import type { Period } from "@/generated/prisma/enums";

const DEFAULT_TZ = "America/Sao_Paulo";
const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

// "Hoje" no fuso do usuário: data local (YYYY-MM-DD) e dia da semana.
export function localToday(timezone = DEFAULT_TZ, now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return { date: new Date(`${parts.year}-${parts.month}-${parts.day}T00:00:00Z`), weekday: WEEKDAY_INDEX[parts.weekday] };
}

export async function getTodayChecklist(userId: string) {
  const profile = await db().skinProfile.findUnique({ where: { userId } });
  const { date, weekday } = localToday(profile?.timezone);
  const [routines, logs, checkIn] = await Promise.all([
    db().routine.findMany({
      where: { userId, period: { in: ["am", "pm"] } },
      include: { steps: { include: { product: true }, orderBy: { order: "asc" } } },
    }),
    db().routineLog.findMany({ where: { userId, date } }),
    db().checkIn.findUnique({ where: { userId_date: { userId, date } } }),
  ]);
  const periods = (["am", "pm"] as const).map((period) => {
    const routine = routines.find((r) => r.period === period);
    const done = new Set(logs.find((l) => l.period === period)?.stepIdsDone ?? []);
    const steps = (routine?.steps ?? [])
      .filter((s) => s.daysOfWeek.includes(weekday))
      .map((s) => ({ id: s.id, order: s.order, name: s.product.name, brand: s.product.brand, done: done.has(s.id) }));
    return { period, steps };
  });
  return { periods, checkIn };
}

export async function toggleRoutineStep(userId: string, period: Exclude<Period, "both">, stepId: string, done: boolean) {
  const owned = await db().routineStep.findFirst({ where: { id: stepId, routine: { userId, period } } });
  if (!owned) throw new Error("NOT_FOUND");
  const profile = await db().skinProfile.findUnique({ where: { userId } });
  const { date } = localToday(profile?.timezone);
  await db().$transaction(async (tx) => {
    const log = await tx.routineLog.upsert({
      where: { userId_date_period: { userId, date, period } },
      create: { userId, date, period, stepIdsDone: [] },
      update: {},
    });
    const next = new Set(log.stepIdsDone);
    if (done) next.add(stepId);
    else next.delete(stepId);
    await tx.routineLog.update({ where: { id: log.id }, data: { stepIdsDone: [...next] } });
  });
}

export async function saveCheckIn(userId: string, feeling: number, reactions: string[], notes: string | null) {
  const profile = await db().skinProfile.findUnique({ where: { userId } });
  const { date } = localToday(profile?.timezone);
  await db().checkIn.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, feeling, reactions, notes },
    update: { feeling, reactions, notes },
  });
}

export async function getEvolution(userId: string) {
  return db().faceScan.findMany({
    where: { userId, status: "done" },
    select: { id: true, takenAt: true, overallScore: true, imagePath: true, metrics: { select: { metric: true, score: true } } },
    orderBy: { takenAt: "asc" },
  });
}
