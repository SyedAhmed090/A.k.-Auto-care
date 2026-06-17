import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ProductForm from "../ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="p-2 rounded-[8px] transition-all hover:bg-black/10" style={{ color: "var(--muted)" }}>
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="uppercase text-[1.8rem]" style={{ fontFamily: "var(--font-anton)" }}>New Product</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>Fill in the details below and click Create Product.</p>
        </div>
      </div>
      <ProductForm />
    </div>
  );
}
