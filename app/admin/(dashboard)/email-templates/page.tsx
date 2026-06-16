"use client";
import { useEffect, useState, useCallback } from "react";
import { Loader2, Check, Send, Mail, RotateCcw } from "lucide-react";

type Template = {
  key: string;
  label: string;
  subject: string;
  body: string;
  isDefault: boolean;
};

// Sample values mirror the server's test-send SAMPLE, for an accurate preview.
const SAMPLE: Record<string, string> = {
  name: "Asad",
  order_id: "AK-12AB34CD",
  total: "Rs 4,999",
  tracking_number: "TRK123456789",
};

const VARIABLES = ["name", "order_id", "total", "tracking_number", "status"];

function interpolate(text: string, status: string): string {
  const vars: Record<string, string> = { ...SAMPLE, status };
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k: string) => vars[k] ?? "");
}

const labelCls = "block text-[.72rem] tracking-[.14em] uppercase mb-2";
const labelStyle: React.CSSProperties = { fontFamily: "var(--font-space-mono)", color: "var(--muted)" };
const inputCls = "w-full px-4 py-2.5 rounded-[10px] text-sm outline-none";
const inputStyle: React.CSSProperties = { background: "var(--bg-2)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-hanken)" };

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeKey, setActiveKey] = useState<string>("");
  const [draft, setDraft] = useState<{ subject: string; body: string }>({ subject: "", body: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState("");

  const active = templates.find((t) => t.key === activeKey) ?? null;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/email-templates");
      const json = await res.json();
      const list: Template[] = json.templates ?? [];
      setTemplates(list);
      if (list.length > 0) {
        setActiveKey((prev) => prev || list[0].key);
      }
    } catch {
      setError("Failed to load templates.");
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Sync the editable draft whenever the selected template changes.
  useEffect(() => {
    if (active) setDraft({ subject: active.subject, body: active.body });
    setSaved(false);
    setError("");
    setTestMsg("");
  }, [activeKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = active ? draft.subject !== active.subject || draft.body !== active.body : false;
  const status = activeKey.replace(/^status_/, "");

  const save = async () => {
    if (!active) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/admin/email-templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: active.key, subject: draft.subject, body: draft.body }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      setTemplates((prev) => prev.map((t) =>
        t.key === active.key ? { ...t, subject: draft.subject, body: draft.body, isDefault: false } : t
      ));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    }
    setSaving(false);
  };

  const sendTest = async () => {
    if (!active) return;
    setTesting(true);
    setTestMsg("");
    try {
      const res = await fetch("/api/admin/email-templates/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: active.key, to: testEmail, subject: draft.subject, body: draft.body }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Send failed");
      setTestMsg(`Test sent to ${json.to}`);
    } catch (e) {
      setTestMsg(e instanceof Error ? e.message : "Send failed.");
    }
    setTesting(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="uppercase text-[1.8rem]" style={{ fontFamily: "var(--font-anton)" }}>Email Templates</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>Edit transactional order emails &amp; send tests</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20" style={{ color: "var(--muted)" }}>
          <Loader2 className="w-6 h-6 animate-spin mr-3" /> Loading templates…
        </div>
      ) : (
        <div className="grid gap-5" style={{ gridTemplateColumns: "220px 1fr" }}>
          {/* Template selector */}
          <div className="rounded-[14px] overflow-hidden h-fit" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
            {templates.map((t) => {
              const isActive = t.key === activeKey;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveKey(t.key)}
                  className="w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer flex items-center justify-between gap-2"
                  style={{
                    borderBottom: "1px solid var(--line)",
                    background: isActive ? "var(--bg-2)" : "transparent",
                    color: isActive ? "var(--text)" : "var(--muted)",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {t.label}</span>
                  {!t.isDefault && (
                    <span className="text-[.55rem] uppercase px-1.5 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,.15)", color: "#22c55e", fontFamily: "var(--font-space-mono)" }}>Edited</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Editor + preview */}
          {active && (
            <div className="space-y-5">
              <div className="rounded-[14px] p-6 space-y-5" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
                <div>
                  <label className={labelCls} style={labelStyle}>Subject</label>
                  <input type="text" value={draft.subject} onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))} className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Message body (HTML allowed)</label>
                  <textarea
                    value={draft.body}
                    onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
                    rows={5}
                    className={inputCls}
                    style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-space-mono)", fontSize: ".8rem" }}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[.68rem] uppercase tracking-[.12em]" style={labelStyle}>Variables:</span>
                  {VARIABLES.map((v) => (
                    <code
                      key={v}
                      className="text-[.7rem] px-2 py-1 rounded-[6px] cursor-pointer"
                      style={{ background: "var(--bg-2)", border: "1px solid var(--line-2)", color: "var(--accent)" }}
                      onClick={() => setDraft((d) => ({ ...d, body: d.body + ` {{${v}}}` }))}
                      title="Click to insert into body"
                    >{`{{${v}}}`}</code>
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={save}
                    disabled={saving || !dirty}
                    className="px-5 py-2.5 rounded-[10px] text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "var(--accent)", color: "var(--bg)" }}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
                    {saved ? "Saved" : "Save"}
                  </button>
                  {dirty && (
                    <button
                      onClick={() => active && setDraft({ subject: active.subject, body: active.body })}
                      className="px-3 py-2.5 rounded-[10px] text-sm transition-colors cursor-pointer flex items-center gap-2"
                      style={{ color: "var(--muted)", border: "1px solid var(--line)" }}
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Revert
                    </button>
                  )}
                  {error && <span className="text-sm" style={{ color: "#ef4444" }}>{error}</span>}
                </div>
              </div>

              {/* Live preview */}
              <div className="rounded-[14px] p-6" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
                <h3 className="text-[.68rem] uppercase tracking-[.14em] mb-3 font-semibold" style={labelStyle}>Preview (sample data)</h3>
                <div className="text-xs mb-3" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                  Subject: <span style={{ color: "var(--text)" }}>{interpolate(draft.subject, status)}</span>
                </div>
                <div className="rounded-[10px] p-5 bg-white text-black" style={{ maxWidth: 580 }}>
                  <div dangerouslySetInnerHTML={{ __html:
                    `<p style="font-size:16px;">Hi ${SAMPLE.name},</p>` +
                    `<p>${interpolate(draft.body, status)}</p>` +
                    `<p><strong>Order:</strong> ${SAMPLE.order_id}</p>` +
                    `<p><strong>Total:</strong> ${SAMPLE.total}</p>`
                  }} />
                </div>
              </div>

              {/* Test send */}
              <div className="rounded-[14px] p-6" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
                <h3 className="text-[.68rem] uppercase tracking-[.14em] mb-3 font-semibold" style={labelStyle}>Send test</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}

                    className={inputCls}
                    style={{ ...inputStyle, maxWidth: 280 }}
                  />
                  <button
                    onClick={sendTest}
                    disabled={testing || !testEmail}
                    className="px-5 py-2.5 rounded-[10px] text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ border: "1px solid var(--line)", color: "var(--text)" }}
                  >
                    {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send test
                  </button>
                  {testMsg && <span className="text-sm" style={{ color: "var(--muted)" }}>{testMsg}</span>}
                </div>
                <p className="text-[.7rem] mt-3" style={{ color: "var(--muted)" }}>
                  Sends the current (unsaved) draft with sample data, subject prefixed <code>[TEST]</code>.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
