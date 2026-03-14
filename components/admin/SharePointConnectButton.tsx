"use client";

interface Props {
  authUrl: string;
  hasConfig: boolean;
}

export default function SharePointConnectButton({ authUrl, hasConfig }: Props) {
  if (!hasConfig) {
    return (
      <span className="rounded-full border border-zinc-700 px-4 py-2 text-[11px] uppercase tracking-wider text-zinc-500">
        Set SHAREPOINT_CLIENT_ID and SHAREPOINT_CLIENT_SECRET in env
      </span>
    );
  }

  return (
    <a
      href={authUrl}
      className="rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground transition-opacity hover:opacity-90"
    >
      Connect SharePoint
    </a>
  );
}
