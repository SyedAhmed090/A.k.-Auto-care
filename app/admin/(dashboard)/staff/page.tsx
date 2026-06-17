"use client";
import { useEffect, useState, useCallback } from "react";
import { ShieldCheck, Loader2, Plus, Trash2, X } from "lucide-react";

type StaffUser = {
  id: string;
  email: string;
  role: "owner" | "manager" | "staff";
  active: boolean;
  created_at: string;
};

const ROLES = ["owner", "manager", "staff"] as const;

const roleColors: Record<string, { bg: string; color: string }> = {
  owner:   { bg: "rgba(234,179,8,.15)",  color: "#eab308" },
  manager: { bg: "rgba(59,130,246,.15)", color: "#3b82f6" },
  staff:   { bg: "var(--surface-2)", color: "var(--muted)" },
};

const thStyle: React.CSSProperties = {
  color: "var(--muted)", fontFamily: "var(--font-space-mono)", fontSize: ".68rem", letterSpacing: ".14em",
};
const inputCls = "px-4 py-2.5 rounded-[10px] text-sm outline-none";
const inputStyle: React.CSSProperties = { background: "var(--bg-2)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-hanken)" };

export default function StaffPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", role: "staff" as StaffUser["role"] });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/staff");
      if (res.status === 403) { setForbidden(true); setLoading(false); return; }
      const json = await res.json();
      setUsers(json.users ?? []);
    } catch {
      setError("Failed to load staff.");
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addUser = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add");
      setUsers((prev) => [...prev, json.user]);
      setShowAdd(false);
      setForm({ email: "", password: "", role: "staff" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add staff.");
    }
    setSaving(false);
  };

  const patchUser = async (id: string, body: Record<string, unknown>) => {
    setError("");
    const res = await fetch(`/api/admin/staff/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error || "Update failed"); return; }
    setUsers((prev) => prev.map((u) => (u.id === id ? json.user : u)));
  };

  const deleteUser = async (id: string, email: string) => {
    if (!confirm(`Delete staff account ${email}? This cannot be undone.`)) return;
    setError("");
    const res = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) { setError(json.error || "Delete failed"); return; }
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  if (forbidden) {
    return (
      <div className="text-center py-20 rounded-[16px]" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
        <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-semibold">Owner access only</p>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Staff management is restricted to owner accounts.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="uppercase text-[1.8rem]" style={{ fontFamily: "var(--font-anton)" }}>Staff</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>{users.length} account{users.length === 1 ? "" : "s"}</p>
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="px-4 py-2.5 rounded-[10px] text-sm font-semibold cursor-pointer flex items-center gap-2"
          style={{ background: "var(--accent)", color: "var(--bg)" }}
        >
          <Plus className="w-4 h-4" /> Add staff
        </button>
      </div>

      <div className="rounded-[10px] px-4 py-3 mb-5 text-xs" style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--muted)" }}>
        The shared admin password always works as an <strong style={{ color: "var(--text)" }}>owner</strong>. Accounts below are individual logins (email + password) with roles:
        <strong style={{ color: "var(--text)" }}> owner</strong> (full access incl. staff), <strong style={{ color: "var(--text)" }}>manager</strong>, <strong style={{ color: "var(--text)" }}>staff</strong>.
      </div>

      {showAdd && (
        <div className="rounded-[14px] p-5 mb-5 flex flex-wrap items-end gap-3" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[.7rem] uppercase mb-1.5" style={{ ...thStyle }}>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputCls + " w-full"} style={inputStyle} />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[.7rem] uppercase mb-1.5" style={{ ...thStyle }}>Password (min 8)</label>
            <input type="text" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className={inputCls + " w-full"} style={inputStyle} />
          </div>
          <div className="min-w-[130px]">
            <label className="block text-[.7rem] uppercase mb-1.5" style={{ ...thStyle }}>Role</label>
            <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as StaffUser["role"] }))} className={inputCls + " w-full cursor-pointer"} style={inputStyle}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <button onClick={addUser} disabled={saving || !form.email || form.password.length < 8} className="px-5 py-2.5 rounded-[10px] text-sm font-semibold cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: "var(--accent)", color: "var(--bg)" }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Create
          </button>
          <button onClick={() => setShowAdd(false)} className="p-2.5 rounded-[10px] cursor-pointer" style={{ color: "var(--muted)", border: "1px solid var(--line)" }}><X className="w-4 h-4" /></button>
        </div>
      )}

      {error && <p className="text-sm mb-4" style={{ color: "#ef4444" }}>{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-20" style={{ color: "var(--muted)" }}>
          <Loader2 className="w-6 h-6 animate-spin mr-3" /> Loading staff…
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 rounded-[16px]" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
          <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No individual staff accounts yet</p>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>You&apos;re signed in with the shared owner password. Add accounts to give people their own logins.</p>
        </div>
      ) : (
        <div className="rounded-[14px] overflow-x-auto" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)" }}>
                {["Email", "Role", "Status", "Added", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 uppercase" style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const rc = roleColors[u.role];
                return (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td className="px-5 py-4 font-semibold" style={{ fontFamily: "var(--font-space-mono)", fontSize: ".82rem" }}>{u.email}</td>
                    <td className="px-5 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => patchUser(u.id, { role: e.target.value })}
                        className="px-2.5 py-1 rounded-[8px] text-xs font-bold uppercase cursor-pointer outline-none"
                        style={{ background: rc.bg, color: rc.color, fontFamily: "var(--font-space-mono)", border: "none" }}
                      >
                        {ROLES.map((r) => <option key={r} value={r} style={{ background: "var(--bg-2)", color: "var(--text)" }}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => patchUser(u.id, { active: !u.active })}
                        className="text-[.62rem] px-2.5 py-1 rounded-full uppercase font-bold cursor-pointer"
                        style={{ background: u.active ? "rgba(34,197,94,.15)" : "rgba(239,68,68,.15)", color: u.active ? "#22c55e" : "#ef4444", fontFamily: "var(--font-space-mono)" }}
                      >
                        {u.active ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                      {new Date(u.created_at).toLocaleDateString("en-PK")}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => deleteUser(u.id, u.email)} className="p-2 rounded-[8px] cursor-pointer transition-colors hover:bg-red-500/10 hover:text-red-400" style={{ color: "var(--muted)" }} aria-label="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
