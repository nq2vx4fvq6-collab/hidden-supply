"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={pending}
      className="text-[11px] text-zinc-600 transition-colors hover:text-zinc-400 disabled:opacity-40"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
