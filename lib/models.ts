export type InventoryStatus =
  | "available"
  | "reserved"
  | "sold"
  | "archived"
  | "consigned"
  | "in_transit";

export interface Item {
  id: string;
  sku: string;
  brand: string;
  name: string;
  category: string;
  size: string;
  condition: string;
  colorway?: string;
  cost?: number;
  listPrice?: number;
  salePrice?: number;
  status: InventoryStatus;
  images: string[];
  acquisitionDate?: string;
  soldDate?: string;
  soldTo?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ItemFilters {
  search?: string;
  brand?: string;
  category?: string;
  size?: string;
  status?: InventoryStatus;
  minPrice?: number;
  maxPrice?: number;
}

export interface ExcelColumnMapping {
  id: string;
  sku: string;
  brand: string;
  name: string;
  category: string;
  size: string;
  condition: string;
  colorway: string;
  cost: string;
  listPrice: string;
  salePrice: string;
  status: string;
  images: string;
  acquisitionDate: string;
  soldDate: string;
  soldTo: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

