import { clsx } from "clsx";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "dark" | "secondary" | "ghost" | "danger" | "locked";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:brightness-95",
  dark: "bg-text text-bg hover:brightness-110",
  secondary: "bg-surface-raised text-text border-[1.5px] border-[#E2D5CA] hover:bg-surface",
  ghost: "text-text hover:bg-surface",
  danger: "bg-danger text-white hover:brightness-95",
  locked: "bg-[#4A3A31] text-[#BFAEA2] pointer-events-none",
};

const sizes: Record<Size, string> = {
  sm: "h-11 px-4 text-sm",
  md: "h-12 px-5 text-[15px]",
  lg: "h-14 px-6 text-[17px] w-full",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return clsx(
    "press inline-flex items-center justify-center gap-2 rounded-pill font-bold disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    extra,
  );
}

export function Button({ variant = "primary", size = "md", loading = false, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button className={buttonClasses(variant, size, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <Loader2 className="size-5 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
