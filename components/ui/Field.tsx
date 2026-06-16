"use client";
import React from "react";

/**
 * Accessible form field wrapper. Ties the visible <label> to its control via
 * htmlFor/id, and points the control at its error message (aria-describedby) so
 * screen readers announce both. The single child control is cloned with the
 * generated id; pass exactly one form element as `children`.
 */
export default function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const id = React.useId();
  const errId = `${id}-err`;
  const control = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<{ id?: string; "aria-describedby"?: string }>, {
        id,
        "aria-describedby": error ? errId : undefined,
      })
    : children;
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[.82rem] tracking-[.01em] font-medium mb-2"
        style={{ fontFamily: "var(--font-hanken)", color: "var(--muted)" }}
      >
        {label}
        {required && (
          <span aria-hidden="true" style={{ color: "var(--accent)", marginLeft: "3px" }}>
            *
          </span>
        )}
      </label>
      {control}
      {error && (
        <p id={errId} role="alert" className="text-xs mt-1" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}
    </div>
  );
}
