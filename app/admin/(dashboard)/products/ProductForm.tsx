"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Trash2, Loader2, UploadCloud, ChevronUp, ChevronDown, ImageOff } from "lucide-react";

const CATEGORIES = [
  { slug: "surface-correction", label: "Surface Correction" },
  { slug: "refinement-polish",  label: "Refinement & Polish" },
  { slug: "automotive-utility", label: "Automotive Utility" },
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
  sample_price:  number | null;
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

const Req = () => <span style={{ color: "#ef4444" }}> *</span>;
const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p className="mt-1 text-[.68rem]" style={{ color: "#ef4444", fontFamily: "var(--font-space-mono)" }}>{msg}</p> : null;

export default function ProductForm({
  defaultValues,
  productId,
}: {
  defaultValues?: Partial<FormValues>;
  productId?: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!productId;

  const { register, control, handleSubmit, watch, setValue, formState: { isSubmitting, errors } } = useForm<FormValues>({
    defaultValues: {
      name: "", slug: "", category_slug: "surface-correction",
      tagline: "", badge: "", description: "", how_to_use: "",
      price: 0, sample_price: null, stock: null, in_stock: true, featured: true, sort_order: 0,
      specs: [], images: [], variants: [{ label: "Standard", price: 0, sku: "", sort_order: 0 }],
      ...defaultValues,
    },
  });

  const { fields: specFields,    append: appendSpec,    remove: removeSpec }    = useFieldArray({ control, name: "specs" });
  const { fields: imageFields,   append: appendImage,   remove: removeImage, move: moveImage } = useFieldArray({ control, name: "images" });
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({ control, name: "variants" });

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) {
      setUploadError("Only image files can be uploaded.");
      return;
    }
    setUploadError("");
    setUploading(true);
    try {
      for (const file of list) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.url) {
          setUploadError(json.error ?? "Upload failed.");
          continue;
        }
        appendImage({ url: json.url });
      }
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) void uploadFiles(e.dataTransfer.files);
  };

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
            <label className={labelCls} style={labelStyle}>Name<Req /></label>
            <input
              {...register("name", { required: "Name is required.", onChange: (e) => { if (!isEdit) setValue("slug", slugify(e.target.value)); } })}
              className={inputCls} style={{ ...inputStyle, borderColor: errors.name ? "#ef4444" : "var(--line-2)" }}

            />
            <FieldError msg={errors.name?.message} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Slug<Req /></label>
            <input
              {...register("slug", { required: "Slug is required.", pattern: { value: /^[a-z0-9-]+$/, message: "Use lowercase letters, numbers and hyphens only." } })}
              className={inputCls} style={{ ...inputStyle, borderColor: errors.slug ? "#ef4444" : "var(--line-2)" }}

            />
            <FieldError msg={errors.slug?.message} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Category<Req /></label>
            <select
              {...register("category_slug", { required: "Category is required." })}
              className={inputCls} style={{ ...inputStyle, cursor: "pointer" }}
            >
              {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
            <FieldError msg={errors.category_slug?.message} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Badge (optional)</label>
            <input {...register("badge")} className={inputCls} style={inputStyle} placeholder='e.g. "Best Seller"' />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls} style={labelStyle}>Tagline<Req /></label>
            <input
              {...register("tagline", { required: "Tagline is required." })}
              className={inputCls} style={{ ...inputStyle, borderColor: errors.tagline ? "#ef4444" : "var(--line-2)" }}

            />
            <FieldError msg={errors.tagline?.message} />
          </div>
        </div>
      </section>

      {/* Pricing & Stock */}
      <section className="rounded-[14px] p-6 space-y-5" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
        <h2 className="text-[.8rem] tracking-[.16em] uppercase font-bold" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Pricing & Stock</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <div>
            <label className={labelCls} style={labelStyle}>Base Price (Rs)<Req /></label>
            <input
              type="number" min={0}
              {...register("price", { required: "Price is required.", valueAsNumber: true, min: { value: 0, message: "Must be 0 or more." } })}
              className={inputCls} style={{ ...inputStyle, borderColor: errors.price ? "#ef4444" : "var(--line-2)" }}
            />
            <FieldError msg={errors.price?.message} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Sample Price (Rs)</label>
            <input
              type="number" min={0}
              {...register("sample_price", { setValueAs: (v) => v === "" || v === null || v === undefined ? null : Number(v) })}
              className={inputCls} style={inputStyle}
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Stock Qty</label>
            <input
              type="number" min={0}
              {...register("stock", { valueAsNumber: true, setValueAs: (v) => v === "" ? null : Number(v) })}
              className={inputCls} style={inputStyle}
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Sort Order</label>
            <input
              type="number"
              {...register("sort_order", { valueAsNumber: true })}
              className={inputCls} style={inputStyle}
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
          <label className={labelCls} style={labelStyle}>Description<Req /></label>
          <textarea
            {...register("description", { required: "Description is required." })}
            rows={5} className={inputCls} style={{ ...inputStyle, resize: "vertical", borderColor: errors.description ? "#ef4444" : "var(--line-2)" }}

          />
          <FieldError msg={errors.description?.message} />
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>How to Use<Req /></label>
          <textarea
            {...register("how_to_use", { required: "Usage instructions are required." })}
            rows={4} className={inputCls} style={{ ...inputStyle, resize: "vertical", borderColor: errors.how_to_use ? "#ef4444" : "var(--line-2)" }}

          />
          <FieldError msg={errors.how_to_use?.message} />
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
            <input {...register(`specs.${i}.label`)} className={`${inputCls} flex-1`} style={inputStyle} />
            <input {...register(`specs.${i}.value`)} className={`${inputCls} flex-1`} style={inputStyle} />
            <button type="button" onClick={() => removeSpec(i)} className="mt-0.5 p-2.5 rounded-[8px] cursor-pointer transition-all hover:bg-red-500/10" style={{ color: "#ef4444" }}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {!specFields.length && <p className="text-xs" style={{ color: "var(--muted)" }}>No specs added yet.</p>}
      </section>

      {/* Images */}
      <section className="rounded-[14px] p-6 space-y-5" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-[.8rem] tracking-[.16em] uppercase font-bold" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Images</h2>
          <button type="button" onClick={() => appendImage({ url: "" })}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-[8px] transition-all cursor-pointer"
            style={{ border: "1px solid var(--line-2)", color: "var(--accent)" }}>
            <Plus className="w-3.5 h-3.5" /> Add URL
          </button>
        </div>

        {/* Drag & drop / file picker */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-[12px] py-8 px-4 text-center cursor-pointer transition-all"
          style={{
            border: `1.5px dashed ${dragActive ? "var(--accent)" : "var(--line-2)"}`,
            background: dragActive ? "var(--bg-2)" : "var(--bg)",
          }}
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--accent)" }} />
          ) : (
            <UploadCloud className="w-6 h-6" style={{ color: "var(--accent)" }} />
          )}
          <p className="text-sm font-semibold" style={{ color: "var(--text)", fontFamily: "var(--font-hanken)" }}>
            {uploading ? "Uploading…" : "Drag & drop images here, or click to browse"}
          </p>
          <p className="text-[.68rem]" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
            JPEG, PNG, WebP, GIF or AVIF · up to 5MB each
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) void uploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        {uploadError && (
          <p className="text-[.68rem]" style={{ color: "#ef4444", fontFamily: "var(--font-space-mono)" }}>{uploadError}</p>
        )}

        {/* Current images: previews, reorder, delete + URL fallback input */}
        {imageFields.map((f, i) => (
          <div key={f.id} className="flex gap-3 items-center">
            <div
              className="flex-shrink-0 w-14 h-14 rounded-[10px] overflow-hidden flex items-center justify-center"
              style={{ border: "1px solid var(--line-2)", background: "var(--bg-2)" }}
            >
              {watch(`images.${i}.url`) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={watch(`images.${i}.url`)} alt={`Product image ${i + 1} preview`} className="w-full h-full object-cover" />
              ) : (
                <ImageOff className="w-5 h-5" style={{ color: "var(--muted)" }} />
              )}
            </div>
            <input {...register(`images.${i}.url`)} className={`${inputCls} flex-1`} style={inputStyle} />
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => moveImage(i, i - 1)}
                disabled={i === 0}
                className="p-1 rounded-[6px] cursor-pointer transition-all disabled:opacity-30 disabled:cursor-default hover:bg-[var(--bg-2)]"
                style={{ color: "var(--muted)" }}
                aria-label="Move image up"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveImage(i, i + 1)}
                disabled={i === imageFields.length - 1}
                className="p-1 rounded-[6px] cursor-pointer transition-all disabled:opacity-30 disabled:cursor-default hover:bg-[var(--bg-2)]"
                style={{ color: "var(--muted)" }}
                aria-label="Move image down"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <button type="button" onClick={() => removeImage(i)} className="p-2.5 rounded-[8px] cursor-pointer transition-all hover:bg-red-500/10" style={{ color: "#ef4444" }} aria-label="Remove image">
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
              <label className={labelCls} style={labelStyle}>Label<Req /></label>
              <input {...register(`variants.${i}.label`, { required: "Required." })} className={inputCls} style={{ ...inputStyle, borderColor: errors.variants?.[i]?.label ? "#ef4444" : "var(--line-2)" }} />
              <FieldError msg={errors.variants?.[i]?.label?.message} />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Price (Rs)</label>
              <input type="number" min={0} {...register(`variants.${i}.price`, { valueAsNumber: true })} className={inputCls} style={inputStyle} />
            </div>
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <label className={labelCls} style={labelStyle}>SKU<Req /></label>
                <input {...register(`variants.${i}.sku`, { required: "Required." })} className={inputCls} style={{ ...inputStyle, borderColor: errors.variants?.[i]?.sku ? "#ef4444" : "var(--line-2)" }} />
                <FieldError msg={errors.variants?.[i]?.sku?.message} />
              </div>
              {variantFields.length > 1 && (
                <button type="button" onClick={() => removeVariant(i)} className="mt-[1.55rem] p-2.5 rounded-[8px] cursor-pointer transition-all hover:bg-red-500/10" style={{ color: "#ef4444" }}>
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
