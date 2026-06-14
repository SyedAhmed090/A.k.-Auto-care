"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, CheckCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ProfileData {
  full_name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postcode: string;
  country: string;
}

export default function AccountClient({
  email,
  initialProfile,
  userId,
}: {
  email: string;
  initialProfile: ProfileData;
  userId: string;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  const update = (k: keyof ProfileData, v: string) => {
    setProfile((p) => ({ ...p, [k]: v }));
    if (state !== "idle") setState("idle");
  };

  const save = async () => {
    setState("saving");
    setError("");
    try {
      const supabase = createClient();
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        ...profile,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        setError(error.message);
        setState("error");
        return;
      }
      setState("saved");
      setTimeout(() => setState("idle"), 5000);
    } catch {
      setError("Could not save. Please try again.");
      setState("error");
    }
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const field = "w-full px-4 py-2.5 rounded-[11px] text-sm outline-none";
  const fieldStyle = { background: "var(--bg)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-hanken)" };
  const lbl = "block text-[.7rem] tracking-[.14em] uppercase mb-1.5";
  const lblStyle = { fontFamily: "var(--font-space-mono)", color: "var(--muted)" } as const;

  return (
    <div className="rounded-[16px] p-6" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
      <h2 className="uppercase mb-1" style={{ fontFamily: "var(--font-anton)", fontSize: "1.4rem", color: "var(--text)" }}>
        My Details
      </h2>
      <p className="text-xs mb-5 truncate" style={{ color: "var(--muted)" }}>{email}</p>

      <div className="space-y-3">
        <div>
          <label className={lbl} style={lblStyle}>Full Name <span style={{ color: "var(--accent)" }}>*</span></label>
          <input className={field} style={fieldStyle} required value={profile.full_name} onChange={(e) => update("full_name", e.target.value)} />
        </div>
        <div>
          <label className={lbl} style={lblStyle}>Phone</label>
          <input className={field} style={fieldStyle} value={profile.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+92 300 0000000" />
        </div>
        <div>
          <label className={lbl} style={lblStyle}>Address</label>
          <input className={field} style={fieldStyle} value={profile.address} onChange={(e) => update("address", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl} style={lblStyle}>City</label>
            <input className={field} style={fieldStyle} value={profile.city} onChange={(e) => update("city", e.target.value)} />
          </div>
          <div>
            <label className={lbl} style={lblStyle}>Province</label>
            <input className={field} style={fieldStyle} value={profile.province} onChange={(e) => update("province", e.target.value)} />
          </div>
          <div>
            <label className={lbl} style={lblStyle}>Postcode</label>
            <input className={field} style={fieldStyle} value={profile.postcode} onChange={(e) => update("postcode", e.target.value)} />
          </div>
          <div>
            <label className={lbl} style={lblStyle}>Country</label>
            <input className={field} style={fieldStyle} value={profile.country} onChange={(e) => update("country", e.target.value)} />
          </div>
        </div>
      </div>

      {state === "error" && <p className="text-xs mt-3" style={{ color: "#ef4444" }}>{error}</p>}

      {state === "saved" && (
        <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-[11px] text-sm"
          style={{ color: "#4ade80", background: "rgba(74,222,128,.08)", border: "1px solid rgba(74,222,128,.22)" }}>
          <CheckCircle className="w-4 h-4 shrink-0" />
          Your details have been saved.
        </div>
      )}

      <button onClick={save} disabled={state === "saving"}
        className="w-full mt-5 py-3 rounded-[12px] font-semibold cursor-pointer disabled:opacity-60"
        style={{ background: "var(--accent)", color: "#000" }}>
        {state === "saving" ? "Saving…" : state === "saved" ? "Saved ✓" : "Save Details"}
      </button>

      <button onClick={signOut}
        className="w-full mt-3 py-3 rounded-[12px] font-semibold flex items-center justify-center gap-2 cursor-pointer"
        style={{ background: "transparent", border: "1px solid var(--line-2)", color: "var(--muted)" }}>
        <LogOut className="w-4 h-4" /> Sign Out
      </button>
    </div>
  );
}
