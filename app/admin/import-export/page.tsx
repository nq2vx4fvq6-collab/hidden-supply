import ExcelImportForm from "@/components/ExcelImportForm";
import { excelColumnsConfig } from "@/lib/excelColumnsConfig";

export default function ImportExportPage() {
  const required = ["brand", "name"];

  return (
    <div className="max-w-2xl space-y-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Import / Export
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Sync your inventory with Excel
        </p>
      </div>

      {/* Export */}
      <section className="space-y-4">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-400">
          Export to Excel
        </h2>
        <p className="text-sm text-zinc-500">
          Download your full inventory as an .xlsx file formatted to match your
          tracking spreadsheet columns.
        </p>
        <a
          href="/api/export"
          download
          className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-6 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-black transition-colors hover:bg-white"
        >
          Download Inventory.xlsx
        </a>
      </section>

      {/* Import */}
      <section className="space-y-4">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-400">
          Import from Excel
        </h2>
        <p className="text-sm text-zinc-500">
          Upload your tracking sheet to sync inventory. Existing items (matched
          by SKU) will be updated; new rows will be added as new items.
        </p>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6">
          <ExcelImportForm />
        </div>
      </section>

      {/* Column reference */}
      <section className="space-y-4">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-400">
          Column Reference
        </h2>
        <p className="text-sm text-zinc-500">
          Your Excel file&apos;s first row must contain these exact column
          headers for import to work correctly.
        </p>
        <div className="overflow-hidden rounded-2xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/50">
              <tr>
                {["Field", "Excel Column Header", "Required"].map((h) => (
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
                  <td className="px-4 py-2.5 font-mono text-[11px] text-zinc-500">
                    {key}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-zinc-200">{label}</td>
                  <td className="px-4 py-2.5 text-xs">
                    {required.includes(key) ? (
                      <span className="text-amber-500">Required</span>
                    ) : (
                      <span className="text-zinc-600">Optional</span>
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
