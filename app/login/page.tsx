import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "Admin Login — Urban Supply",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold tracking-widest text-zinc-100">
            US
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-50">
            Admin Access
          </h1>
          <p className="text-sm text-zinc-500">Urban Supply</p>
        </div>

        <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-zinc-900" />}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-[10px] uppercase tracking-[0.25em] text-zinc-700">
          Set <code className="font-mono text-zinc-600">ADMIN_PASSWORD</code> in Vercel env
        </p>
      </div>
    </div>
  );
}
