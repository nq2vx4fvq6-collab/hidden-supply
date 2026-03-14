"use server";

import { revalidatePath } from "next/cache";
import { invalidateSheetsCache } from "@/lib/services/googleSheetsService";

export async function refreshSheetsCacheAction() {
  invalidateSheetsCache();
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/items");
  revalidatePath("/admin/import-export");
}
