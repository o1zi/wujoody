import * as React from "react";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mono mb-1.5 block text-[11px] uppercase tracking-wider text-muted">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent " +
        (props.className ?? "")
      }
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={
        "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent " +
        (props.className ?? "")
      }
    />
  );
}

export function Button({
  loading,
  variant = "primary",
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: "primary" | "ghost" | "danger";
}) {
  const variants = {
    primary: "bg-accent text-[#0b0d10] hover:bg-accent-soft",
    ghost: "border border-border bg-transparent text-foreground hover:bg-surface-2",
    danger: "border border-red-500/40 bg-transparent text-red-400 hover:bg-red-500/10",
  } as const;
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {loading ? "…" : children}
    </button>
  );
}

export function Alert({ kind = "error", children }: { kind?: "error" | "success" | "info"; children: React.ReactNode }) {
  const styles = {
    error: "border-red-500/40 bg-red-500/10 text-red-300",
    success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    info: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  } as const;
  return (
    <div className={`rounded-lg border px-3.5 py-2.5 text-sm ${styles[kind]}`}>{children}</div>
  );
}

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border border-border bg-surface ${className}`}>{children}</div>
  );
}
