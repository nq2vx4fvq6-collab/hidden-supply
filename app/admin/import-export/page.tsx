import ExcelImportForm from "@/components/admin/ExcelImportForm";
import { excelColumnsConfig } from "@/lib/config/excelColumns";

export default function ImportExportPage() {
  const required = ["sku", "brand", "name", "category", "size", "condition", "status"];

  return (
    <div className="max-w-2xl space-y-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Excel Sync</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Import your tracking sheet or export a full snapshot
        </p>
      </div>

      {/* Two-column action row */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Export */}
        <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/20 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">Export</p>
              <p className="text-[11px] text-zinc-600">Full inventory snapshot</p>
            </div>
          </div>
          <p className="text-xs text-zinc-500">
            Downloads your entire inventory as an .xlsx file, formatted to match your tracking spreadsheet columns.
          </p>
          <a
            href="/api/export"
            download
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-accent-foreground transition-opacity hover:opacity-90"
          >
            Download .xlsx
          </a>
        </div>

        {/* Workflow tip */}
        <div className="space-y-3 rounded-2xl border border-zinc-800/50 bg-zinc-900/10 p-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">Workflow tip</p>
          <ol className="space-y-2 text-xs text-zinc-400">
            <li className="flex gap-2">
              <span className="shrink-0 font-mono text-zinc-600">1.</span>
              Export your current inventory to Excel
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 font-mono text-zinc-600">2.</span>
              Edit it in your tracking spreadsheet
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 font-mono text-zinc-600">3.</span>
              Import back — existing SKUs update, new rows are added
            </li>
          </ol>
        </div>
      </div>

      {/* Import */}
      <section className="space-y-4">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-400">
          Import from Excel
        </h2>
        <ExcelImportForm />
      </section>

      {/* Column reference */}
      <section className="space-y-4">
        <div>
          <h2 className="text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-400">
            Column Reference
          </h2>
          <p className="mt-1.5 text-xs text-zinc-600">
            First row of your Excel file must use these exact column headers.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/50">
              <tr>
                {["Excel Column Header", "Field", "Required"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[10px] font-normal uppercase tracking-[0.25em] text-zinc-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(excelColumnsConfig).map(([key, label], i, arr) => (
                <tr
                  key={key}
                  className={i < arr.length - 1 ? "border-b border-zinc-900" : ""}
                >
                  <td className="px-4 py-2.5 text-xs font-medium text-zinc-200">
                    {label}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-zinc-600">
                    {key}
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    {required.includes(key) ? (
                      <span className="text-amber-500">Required</span>
                    ) : (
                      <span className="text-zinc-700">Optional</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
