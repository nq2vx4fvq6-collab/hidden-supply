import type { Item, ItemFilters } from "@/lib/models";

export function applyItemFilters(items: Item[], filters: ItemFilters): Item[] {
  return items.filter((item) => {
    if (filters.status && item.status !== filters.status) return false;
    if (filters.brand && item.brand.toLowerCase() !== filters.brand.toLowerCase()) return false;
    if (filters.category && item.category.toLowerCase() !== filters.category.toLowerCase()) return false;
    if (filters.size && item.size.toLowerCase() !== filters.size.toLowerCase()) return false;

    if (filters.minPrice !== undefined && (item.listPrice ?? 0) < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && (item.listPrice ?? 0) > filters.maxPrice) return false;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      const searchable = [
        item.brand,
        item.name,
        item.colorway ?? "",
        item.sku,
        item.category,
      ]
        .join(" ")
        .toLowerCase();

      if (!searchable.includes(q)) return false;
    }

    return true;
  });
}

