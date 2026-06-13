"use client";
import { useEffect, useState, useCallback } from "react";
import { Star, CheckCircle, Trash2, MessageSquare } from "lucide-react";

type Review = {
  id: string;
  product_id: string;
  user_name: string;
  user_email: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  approved: boolean;
  created_at: string;
  products: { name: string } | null;
};

type Tab = "pending" | "approved" | "all";

const TABS: { key: Tab; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "all", label: "All" },
];

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          style={{
            width: "12px",
            height: "12px",
            color: s <= rating ? "#fbbf24" : "var(--line-2)",
            fill: s <= rating ? "#fbbf24" : "var(--line-2)",
          }}
        />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async (tab: Tab) => {
    setLoading(true);
    try {
      const approvedParam =
        tab === "pending" ? "false" : tab === "approved" ? "true" : "all";
      const res = await fetch(`/api/admin/reviews?approved=${approvedParam}`);
      const json = await res.json();
      setReviews(json.reviews ?? []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(activeTab); }, [activeTab, load]);

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true }),
      });
      await load(activeTab);
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete review by "${name}"? This cannot be undone.`)) return;
    setActionId(id);
    try {
      await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      await load(activeTab);
    } finally {
      setActionId(null);
    }
  };

  const thStyle: React.CSSProperties = {
    color: "var(--muted)",
    fontFamily: "var(--font-space-mono)",
    fontSize: ".68rem",
    letterSpacing: ".14em",
    textTransform: "uppercase",
    textAlign: "left",
    padding: "14px 20px",
  };

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontFamily: "var(--font-anton)",
            fontSize: "1.8rem",
            textTransform: "uppercase",
            color: "var(--text)",
            letterSpacing: ".03em",
          }}
        >
          Reviews
        </h1>
        <p style={{ fontSize: ".85rem", marginTop: "2px", color: "var(--muted)", fontFamily: "var(--font-hanken)" }}>
          {reviews.length} {activeTab === "all" ? "total" : activeTab}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "24px",
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: "12px",
          padding: "4px",
          width: "fit-content",
        }}
      >
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              padding: "8px 20px",
              borderRadius: "9px",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-space-mono)",
              fontSize: ".75rem",
              letterSpacing: ".1em",
              textTransform: "uppercase",
              background: activeTab === key ? "var(--accent)" : "transparent",
              color: activeTab === key ? "#000" : "var(--muted)",
              transition: "background .15s, color .15s",
              fontWeight: activeTab === key ? 700 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 0",
            color: "var(--muted)",
            gap: "12px",
            fontFamily: "var(--font-hanken)",
            fontSize: ".9rem",
          }}
        >
          <MessageSquare style={{ width: "20px", height: "20px", opacity: 0.5 }} />
          Loading reviews…
        </div>
      ) : reviews.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "64px 24px",
            borderRadius: "16px",
            border: "1px solid var(--line)",
            background: "var(--surface)",
          }}
        >
          <MessageSquare style={{ width: "36px", height: "36px", margin: "0 auto 12px", opacity: 0.25 }} />
          <p style={{ fontFamily: "var(--font-hanken)", color: "var(--muted)", fontSize: ".95rem" }}>
            No {activeTab === "all" ? "" : activeTab} reviews yet.
          </p>
        </div>
      ) : (
        <div
          style={{
            borderRadius: "14px",
            border: "1px solid var(--line)",
            background: "var(--surface)",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".875rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)" }}>
                {["Product", "Reviewer", "Rating", "Title", "Date", ""].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr
                  key={r.id}
                  style={{ borderBottom: "1px solid var(--line)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ fontFamily: "var(--font-hanken)", color: "var(--text)", fontWeight: 600, fontSize: ".85rem" }}>
                      {r.products?.name ?? r.product_id}
                    </div>
                    {r.approved && (
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "3px",
                          fontSize: ".65rem",
                          fontFamily: "var(--font-space-mono)",
                          padding: "2px 7px",
                          borderRadius: "20px",
                          background: "rgba(34,197,94,.1)",
                          color: "#22c55e",
                        }}
                      >
                        Approved
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ fontFamily: "var(--font-hanken)", color: "var(--text)", fontSize: ".85rem" }}>{r.user_name}</div>
                    <div
                      style={{
                        fontSize: ".72rem",
                        fontFamily: "var(--font-space-mono)",
                        color: "var(--muted)",
                        marginTop: "2px",
                      }}
                    >
                      {r.user_email}
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <StarDisplay rating={r.rating} />
                    <div
                      style={{
                        fontSize: ".72rem",
                        fontFamily: "var(--font-space-mono)",
                        color: "var(--muted)",
                        marginTop: "3px",
                      }}
                    >
                      {r.rating}/5
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px", maxWidth: "220px" }}>
                    <div
                      style={{
                        fontFamily: "var(--font-hanken)",
                        color: "var(--text)",
                        fontSize: ".85rem",
                        fontWeight: 600,
                        marginBottom: "3px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.title}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-hanken)",
                        color: "var(--muted)",
                        fontSize: ".78rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.body}
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span
                      style={{
                        fontSize: ".72rem",
                        fontFamily: "var(--font-space-mono)",
                        color: "var(--muted)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {new Date(r.created_at).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-end" }}>
                      {!r.approved && (
                        <button
                          onClick={() => handleApprove(r.id)}
                          disabled={actionId === r.id}
                          title="Approve"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            border: "1px solid rgba(34,197,94,.3)",
                            background: "rgba(34,197,94,.08)",
                            color: "#22c55e",
                            cursor: actionId === r.id ? "not-allowed" : "pointer",
                            opacity: actionId === r.id ? 0.5 : 1,
                            fontSize: ".75rem",
                            fontFamily: "var(--font-space-mono)",
                            letterSpacing: ".06em",
                            textTransform: "uppercase",
                          }}
                        >
                          <CheckCircle style={{ width: "13px", height: "13px" }} />
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(r.id, r.user_name)}
                        disabled={actionId === r.id}
                        title="Delete"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "6px 8px",
                          borderRadius: "8px",
                          border: "none",
                          background: "transparent",
                          color: "#ef4444",
                          cursor: actionId === r.id ? "not-allowed" : "pointer",
                          opacity: actionId === r.id ? 0.5 : 1,
                          transition: "background .15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,.1)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <Trash2 style={{ width: "15px", height: "15px" }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
