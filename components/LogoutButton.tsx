"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={pending}
      className="text-[11px] text-zinc-600 transition-all duration-200 hover:text-accent active:scale-[0.95] disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
