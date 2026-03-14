import type { Item } from "@/lib/models";
import ItemImageEditor from "@/components/admin/ItemImageEditor";

const BRANDS = [
  "Supreme",
  "BAPE",
  "Gallery Dept",
  "Off-White",
  "Stussy",
  "Palace",
  "Kith",
  "Fear of God",
  "Essentials",
  "Rhude",
  "Amiri",
  "Chrome Hearts",
  "Corteiz",
  "Travis Scott",
  "Nike",
  "Jordan Brand",
  "Adidas",
  "New Balance",
  "Stone Island",
  "C.P. Company",
];

const CATEGORIES = [
  "Hoodie",
  "Tee",
  "Jeans",
  "Jacket",
  "Shorts",
  "Fleece",
  "Sweatpants",
  "Accessories",
  "Footwear",
  "Shirt",
  "Pants",
  "Hat",
  "Bag",
  "Vest",
];

const STATUSES = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
  { value: "consigned", label: "Consigned" },
  { value: "in_transit", label: "In Transit" },
  { value: "archived", label: "Archived" },
] as const;

const inputClass =
  "w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-zinc-600 transition-colors";

const labelClass =
  "block text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-1.5";

export default function ItemFormFields({ item }: { item?: Partial<Item> }) {
  return (
    <div className="space-y-5">
      {/* SKU + Brand */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>SKU *</label>
          <input
            name="sku"
            required
            defaultValue={item?.sku}
            placeholder="SUP-HOOD-001"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Brand *</label>
          <input
            name="brand"
            required
            defaultValue={item?.brand}
            list="brands-list"
            placeholder="Supreme"
            className={inputClass}
          />
          <datalist id="brands-list">
            {BRANDS.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Item Name */}
      <div>
        <label className={labelClass}>Item Name *</label>
        <input
          name="name"
          required
          defaultValue={item?.name}
          placeholder="Box Logo Hoodie FW18"
          className={inputClass}
        />
      </div>

      {/* Category + Size + Condition */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Category *</label>
          <select
            name="category"
            required
            defaultValue={item?.category ?? ""}
            className={inputClass}
          >
            <option value="">Select...</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Size *</label>
          <input
            name="size"
            required
            defaultValue={item?.size}
            placeholder="L · M · 32"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Condition *</label>
          <input
            name="condition"
            required
            defaultValue={item?.condition}
            placeholder="DS · 9/10 · 8/10"
            className={inputClass}
          />
        </div>
      </div>

      {/* Status + Colorway */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Status *</label>
          <select
            name="status"
            required
            defaultValue={item?.status ?? "available"}
            className={inputClass}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Colorway</label>
          <input
            name="colorway"
            defaultValue={item?.colorway}
            placeholder="Grey/Red"
            className={inputClass}
          />
        </div>
      </div>

      {/* Pricing */}
      <div>
        <p className={labelClass + " mb-3"}>Pricing</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Cost ($)</label>
            <input
              name="cost"
              type="number"
              min="0"
              step="0.01"
              defaultValue={item?.cost}
              placeholder="0.00"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>List Price ($)</label>
            <input
              name="listPrice"
              type="number"
              min="0"
              step="0.01"
              defaultValue={item?.listPrice}
              placeholder="0.00"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Sale Price ($)</label>
            <input
              name="salePrice"
              type="number"
              min="0"
              step="0.01"
              defaultValue={item?.salePrice}
              placeholder="—"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Acquisition Date */}
      <div>
        <label className={labelClass}>Acquisition Date</label>
        <input
          name="acquisitionDate"
          type="date"
          defaultValue={item?.acquisitionDate}
          className={inputClass}
        />
      </div>

      {/* Notes */}
      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          name="notes"
          defaultValue={item?.notes}
          rows={3}
          placeholder="Condition details, history, client holds..."
          className={inputClass + " resize-none"}
        />
      </div>

      {/* Image URLs */}
      <ItemImageEditor defaultImages={item?.images ?? []} />
    </div>
  );
}
