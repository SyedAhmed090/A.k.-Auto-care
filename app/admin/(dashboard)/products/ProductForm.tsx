"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Trash2, Loader2 } from "lucide-react";

const CATEGORIES = [
  { slug: "cleaners-degreasers",  label: "Cleaners & Degreasers" },
  { slug: "polishes-compounds",   label: "Polishes & Compounds" },
  { slug: "waxes-sealants",       label: "Waxes & Sealants" },
  { slug: "ceramic-coatings",     label: "Ceramic Coatings" },
  { slug: "towels-applicators",   label: "Towels & Applicators" },
  { slug: "kits-bundles",         label: "Kits & Bundles" },
];

export type FormValues = {
  id?:           string;
  name:          string;
  slug:          string;
  category_slug: string;
  tagline:       string;
  badge:         string;
  description:   string;
  how_to_use:    string;
  price:         number;
  stock:         number | null;
  in_stock:      boolean;
  featured:      boolean;
  sort_order:    number;
  specs:         { label: string; value: string }[];
  images:        { url: string }[];
  variants:      { label: string; price: number; sku: string; sort_order: number }[];
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const inputCls = "w-full px-4 py-2.5 rounded-[10px] text-sm outline-none transition-all";
const inputStyle = {
  background: "var(--bg)",
  border: "1px solid var(--line-2)",
  color: "var(--text)",
  fontFamily: "var(--font-hanken)",
};

const labelCls = "block text-[.72rem] tracking-[.12em] uppercase mb-1.5 font-semibold";
const labelStyle = { fontFamily: "var(--font-space-mono)", color: "var(--muted)" };

export default function ProductForm({
  defaultValues,
  productId,
}: {
  defaultValues?: Partial<FormValues>;
  productId?: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const isEdit = !!productId;

  const { register, control, handleSubmit, watch, setValue, formState: { isSubmitting, errors } } = useForm<FormValues>({
    defaultValues: {
      name: "", slug: "", category_slug: "cleaners-degreasers",
      tagline: "", badge: "", description: "", how_to_use: "",
      price: 0, stock: null, in_stock: true, featured: false, sort_order: 0,
      specs: [], images: [], variants: [{ label: "Standard", price: 0, sku: "", sort_order: 0 }],
      ...defaultValues,
    },
  });

  const { fields: specFields,    append: appendSpec,    remove: removeSpec }    = useFieldArray({ control, name: "specs" });
  const { fields: imageFields,   append: appendImage,   remove: removeImage }   = useFieldArray({ control, name: "images" });
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({ control, name: "variants" });

  const nameVal = watch("name");

  const onSubmit = async (values: FormValues) => {
    setServerError("");
    const payload = {
      ...values,
      id:       isEdit ? undefined : (values.id || undefined),
      badge:    values.badge || null,
      stock:    values.stock === null || values.stock === undefined ? null : Number(values.stock),
      images:   values.images.map((img) => img.url).filter(Boolean),
      variants: values.variants.map((v, i) => ({ ...v, price: Number(v.price), sort_order: i })),
    };

    const url    = isEdit ? `/api/admin/products/${productId}` : "/api/admin/products";
    const method = isEdit ? "PATCH" : "POST";

    const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const json = await res.json();

    if (!res.ok) {
      setServerError(json.error ?? "Something went wrong.");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  };

  const Toggle = ({ name }: { name: "in_stock" | "featured" }) => {
    const val = watch(name);
    return (
      <button
        type="button"
        onClick={() => setValue(name, !val)}
        className="relative w-11 h-6 rounded-full transition-all"
        style={{ background: val ? "var(--accent)" : "var(--line-2)" }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-all"
          style={{ background: "#fff", transform: val ? "translateX(20px)" : "translateX(0)" }}
        />
      </button>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      {/* Basic Info */}
      <section className="rounded-[14px] p-6 space-y-5" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
        <h2 className="text-[.8rem] tracking-[.16em] uppercase font-bold" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Basic Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelCls} style={labelStyle}>Name *</label>
            <input
              {...register("name", { required: true, onChange: (e) => { if (!isEdit) setValue("slug", slugify(e.target.value)); } })}
              className={inputCls} style={{ ...inputStyle, borderColor: errors.name ? "#ef4444" : "var(--line-2)" }}
              placeholder="Product name"
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Slug *</label>
            <input
              {...register("slug", { required: true, pattern: /^[a-z0-9-]+$/ })}
              className={inputCls} style={{ ...inputStyle, borderColor: errors.slug ? "#ef4444" : "var(--line-2)" }}
              placeholder="auto-generated-slug"
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Category *</label>
            <select
              {...register("category_slug", { required: true })}
              className={inputCls} style={{ ...inputStyle, cursor: "pointer" }}
            >
              {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Badge (optional)</label>
            <input {...register("badge")} className={inputCls} style={inputStyle} placeholder='e.g. "Best Seller"' />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls} style={labelStyle}>Tagline *</label>
            <input
              {...register("tagline", { required: true })}
              className={inputCls} style={{ ...inputStyle, borderColor: errors.tagline ? "#ef4444" : "var(--line-2)" }}
              placeholder="Short compelling tagline"
            />
          </div>
        </div>
      </section>

      {/* Pricing & Stock */}
      <section className="rounded-[14px] p-6 space-y-5" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
        <h2 className="text-[.8rem] tracking-[.16em] uppercase font-bold" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Pricing & Stock</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <div>
            <label className={labelCls} style={labelStyle}>Base Price (Rs) *</label>
            <input
              type="number" min={0}
              {...register("price", { required: true, valueAsNumber: true })}
              className={inputCls} style={inputStyle} placeholder="0"
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Stock Qty</label>
            <input
              type="number" min={0}
              {...register("stock", { valueAsNumber: true, setValueAs: (v) => v === "" ? null : Number(v) })}
              className={inputCls} style={inputStyle} placeholder="(unlimited)"
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Sort Order</label>
            <input
              type="number"
              {...register("sort_order", { valueAsNumber: true })}
              className={inputCls} style={inputStyle} placeholder="0"
            />
          </div>
        </div>
        <div className="flex gap-8">
          <label className="flex items-center gap-3 cursor-pointer">
            <Toggle name="in_stock" />
            <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>In Stock</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <Toggle name="featured" />
            <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>Featured</span>
          </label>
        </div>
      </section>

      {/* Content */}
      <section className="rounded-[14px] p-6 space-y-5" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
        <h2 className="text-[.8rem] tracking-[.16em] uppercase font-bold" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Content</h2>
        <div>
          <label className={labelCls} style={labelStyle}>Description *</label>
          <textarea
            {...register("description", { required: true })}
            rows={5} className={inputCls} style={{ ...inputStyle, resize: "vertical" }}
            placeholder="Full product description…"
          />
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>How to Use *</label>
          <textarea
            {...register("how_to_use", { required: true })}
            rows={4} className={inputCls} style={{ ...inputStyle, resize: "vertical" }}
            placeholder="Application instructions…"
          />
        </div>
      </section>

      {/* Specs */}
      <section className="rounded-[14px] p-6 space-y-4" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-[.8rem] tracking-[.16em] uppercase font-bold" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Specs</h2>
          <button type="button" onClick={() => appendSpec({ label: "", value: "" })}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-[8px] transition-all cursor-pointer"
            style={{ border: "1px solid var(--line-2)", color: "var(--accent)" }}>
            <Plus className="w-3.5 h-3.5" /> Add Spec
          </button>
        </div>
        {specFields.map((f, i) => (
          <div key={f.id} className="flex gap-3 items-start">
            <input {...register(`specs.${i}.label`)} placeholder="Label" className={`${inputCls} flex-1`} style={inputStyle} />
            <input {...register(`specs.${i}.value`)} placeholder="Value" className={`${inputCls} flex-1`} style={inputStyle} />
            <button type="button" onClick={() => removeSpec(i)} className="mt-0.5 p-2.5 rounded-[8px] cursor-pointer transition-all hover:bg-red-500/10" style={{ color: "#ef4444" }}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {!specFields.length && <p className="text-xs" style={{ color: "var(--muted)" }}>No specs added yet.</p>}
      </section>

      {/* Images */}
      <section className="rounded-[14px] p-6 space-y-4" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-[.8rem] tracking-[.16em] uppercase font-bold" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Images (URLs)</h2>
          <button type="button" onClick={() => appendImage({ url: "" })}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-[8px] transition-all cursor-pointer"
            style={{ border: "1px solid var(--line-2)", color: "var(--accent)" }}>
            <Plus className="w-3.5 h-3.5" /> Add Image
          </button>
        </div>
        {imageFields.map((f, i) => (
          <div key={f.id} className="flex gap-3 items-center">
            <input {...register(`images.${i}.url`)} placeholder="https://…" className={`${inputCls} flex-1`} style={inputStyle} />
            <button type="button" onClick={() => removeImage(i)} className="p-2.5 rounded-[8px] cursor-pointer transition-all hover:bg-red-500/10" style={{ color: "#ef4444" }}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {!imageFields.length && <p className="text-xs" style={{ color: "var(--muted)" }}>No images added yet.</p>}
      </section>

      {/* Variants */}
      <section className="rounded-[14px] p-6 space-y-4" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-[.8rem] tracking-[.16em] uppercase font-bold" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Variants *</h2>
          <button type="button" onClick={() => appendVariant({ label: "", price: 0, sku: "", sort_order: variantFields.length })}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-[8px] transition-all cursor-pointer"
            style={{ border: "1px solid var(--line-2)", color: "var(--accent)" }}>
            <Plus className="w-3.5 h-3.5" /> Add Variant
          </button>
        </div>
        {variantFields.map((f, i) => (
          <div key={f.id} className="grid grid-cols-3 gap-3 items-start">
            <div>
              <label className={labelCls} style={labelStyle}>Label</label>
              <input {...register(`variants.${i}.label`, { required: true })} placeholder="e.g. 500ml" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Price (Rs)</label>
              <input type="number" min={0} {...register(`variants.${i}.price`, { valueAsNumber: true })} className={inputCls} style={inputStyle} />
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className={labelCls} style={labelStyle}>SKU</label>
                <input {...register(`variants.${i}.sku`, { required: true })} placeholder="PROD-001-500" className={inputCls} style={inputStyle} />
              </div>
              {variantFields.length > 1 && (
                <button type="button" onClick={() => removeVariant(i)} className="mb-0.5 p-2.5 rounded-[8px] cursor-pointer transition-all hover:bg-red-500/10" style={{ color: "#ef4444" }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </section>

      {serverError && (
        <p className="text-sm px-4 py-3 rounded-[10px]" style={{ color: "#ef4444", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)" }}>
          {serverError}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-7 py-3.5 rounded-[12px] font-semibold text-sm cursor-pointer disabled:opacity-60 transition-all hover:-translate-y-0.5"
          style={{ background: "var(--accent)", color: "#000" }}
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="px-7 py-3.5 rounded-[12px] font-semibold text-sm cursor-pointer transition-all"
          style={{ border: "1px solid var(--line-2)", color: "var(--muted)" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
