"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAccount,
  updateAccount,
  deleteAccount,
  createPlatformSale,
} from "@/lib/services/marketplaceStore";
import type { Platform } from "@/lib/marketplaceModels";

const ACCOUNTS_PATH = "/admin/accounts";
const ACCOUNTS_LIST_PATH = "/admin/accounts/accounts";
const SALES_PATH = "/admin/accounts/sales";

export async function createAccountAction(formData: FormData) {
  const platform = formData.get("platform") as Platform;
  const displayName = (formData.get("displayName") as string)?.trim() || "Unnamed";
  await createAccount({
    platform,
    displayName,
    isConnected: false,
  });
  revalidatePath(ACCOUNTS_PATH);
  revalidatePath(ACCOUNTS_LIST_PATH);
  redirect(ACCOUNTS_LIST_PATH);
}

export async function updateAccountAction(id: string, formData: FormData) {
  const displayName = (formData.get("displayName") as string)?.trim();
  await updateAccount(id, { displayName: displayName || undefined });
  revalidatePath(ACCOUNTS_PATH);
  revalidatePath(ACCOUNTS_LIST_PATH);
  revalidatePath(`${ACCOUNTS_LIST_PATH}/${id}`);
  redirect(`${ACCOUNTS_LIST_PATH}/${id}`);
}

export async function deleteAccountAction(id: string) {
  await deleteAccount(id);
  revalidatePath(ACCOUNTS_PATH);
  revalidatePath(ACCOUNTS_LIST_PATH);
  redirect(ACCOUNTS_LIST_PATH);
}

export async function createSaleAction(formData: FormData) {
  const accountId = formData.get("accountId") as string;
  const platform = formData.get("platform") as Platform;
  const title = (formData.get("title") as string)?.trim() || "Untitled";
  const amount = Number(formData.get("amount"));
  const currency = (formData.get("currency") as string)?.trim() || "USD";
  const soldAt = (formData.get("soldAt") as string)?.trim() || new Date().toISOString().slice(0, 10);
  const sku = (formData.get("sku") as string)?.trim() || undefined;
  const brand = (formData.get("brand") as string)?.trim() || undefined;
  const size = (formData.get("size") as string)?.trim() || undefined;

  await createPlatformSale({
    accountId,
    platform,
    title,
    amount: Number.isFinite(amount) ? amount : 0,
    currency,
    soldAt,
    sku,
    brand,
    size,
  });
  revalidatePath(ACCOUNTS_PATH);
  revalidatePath(SALES_PATH);
  revalidatePath("/admin/accounts/supply");
  redirect(SALES_PATH);
}
