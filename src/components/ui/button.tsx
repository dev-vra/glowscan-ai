import { clsx } from "clsx";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:brightness-95",
  secondary: "bg-surface-raised text-text border border-border hover:bg-surface",
  ghost: "text-text hover:bg-surface",
  danger: "bg-danger text-on-accent hover:brightness-95",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-6 text-base w-full",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return clsx(
    "inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition duration-150 ease-lux active:scale-[.98] disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    extra,
  );
}

export function Button({ variant = "primary", size = "md", loading = false, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button className={buttonClasses(variant, size, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
