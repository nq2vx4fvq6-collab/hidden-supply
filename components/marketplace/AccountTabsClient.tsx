"use client";

import { useRouter, usePathname } from "next/navigation";
import type { ReactNode } from "react";

const TABS = [
  { key: "overview",     label: "Overview" },
  { key: "credentials",  label: "Credentials" },
  { key: "sales",        label: "Sales" },
  { key: "logs",         label: "Activity" },
];

interface Props {
  activeTab: string;
  accountId: string;
  children: Record<string, ReactNode>;
}

export default function AccountTabsClient({ activeTab, accountId, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  function goToTab(tab: string) {
    router.push(`${pathname}?tab=${tab}`, { scroll: false });
  }

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-zinc-800 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => goToTab(tab.key)}
            className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? "border-accent text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      {children[activeTab] ?? children["overview"]}
    </div>
  );
}
