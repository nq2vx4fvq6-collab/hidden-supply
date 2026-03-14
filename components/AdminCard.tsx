import type { ReactNode } from "react";

interface AdminCardProps {
  children: ReactNode;
  className?: string;
}

/** Shared card style for admin stat cards and content blocks. */
export default function AdminCard({ children, className = "" }: AdminCardProps) {
  return (
    <div
      className={`rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 ${className}`}
    >
      {children}
    </div>
  );
}
