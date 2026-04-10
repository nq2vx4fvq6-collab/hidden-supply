import { NextResponse } from "next/server";
import { getAllItems } from "@/lib/services/inventory";
import { exportItemsToExcel } from "@/lib/services/excel";

export async function GET() {
  const items = await getAllItems();
  const buf = exportItemsToExcel(items);
  const date = new Date().toISOString().split("T")[0];

  return new NextResponse(buf as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="urban-supply-inventory-${date}.xlsx"`,
    },
  });
}
