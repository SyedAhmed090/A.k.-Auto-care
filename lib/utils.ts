import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return `Rs ${Math.round(price).toLocaleString("en-PK")}`;
}

export function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

/**
 * Sanitize a user search term before interpolating it into a PostgREST
 * `.or("col.ilike.%term%,...")` filter string. Strips the structural
 * characters that delimit PostgREST filter syntax (`,` `(` `)` `:` `"` `\`),
 * which would otherwise let a term inject extra conditions, then escapes the
 * SQL LIKE wildcards `%` and `_`. The `.` is preserved so email search works.
 */
export function sanitizeSearchTerm(raw: string): string {
  return raw
    .replace(/[,():"\\]/g, " ")
    .replace(/[%_]/g, "\\$&")
    .trim();
}
