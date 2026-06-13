"use client";
import { useEffect, useState, useCallback } from "react";
import { Star } from "lucide-react";
import StarRating from "@/components/ui/StarRating";

type Review = {
  id: string;
  user_name: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  created_at: string;
};

type Props = {
  productId: string;
  initialRating: number;
  initialCount: number;
};

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
        >
          <Star
            style={{
              width: "24px",
              height: "24px",
              color: s <= (hovered || value) ? "#fbbf24" : "var(--line-2)",
              fill: s <= (hovered || value) ? "#fbbf24" : "var(--line-2)",
              transition: "color .15s, fill .15s",
            }}
          />
        </button>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        borderRadius: "14px",
        border: "1px solid var(--line)",
        background: "var(--surface)",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {[80, 60, 100, 40].map((w, i) => (
        <div
          key={i}
          style={{
            height: i === 2 ? "40px" : "14px",
            width: `${w}%`,
            borderRadius: "6px",
            background: "var(--line)",
            opacity: 0.5,
          }}
        />
      ))}
    </div>
  );
}

export default function ReviewsSection({ productId, initialRating, initialCount }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [titleVal, setTitleVal] = useState("");
  const [bodyVal, setBodyVal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const avgRating = reviews.length
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : initialRating;
  const totalCount = reviews.length || initialCount;

  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?product_id=${encodeURIComponent(productId)}`);
      const json = await res.json();
      setReviews(json.reviews ?? []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (rating < 1) { setFormError("Please select a star rating."); return; }
    if (name.trim().length < 2) { setFormError("Name must be at least 2 characters."); return; }
    if (titleVal.trim().length < 3) { setFormError("Title must be at least 3 characters."); return; }
    if (bodyVal.trim().length < 10) { setFormError("Review must be at least 10 characters."); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          user_name: name.trim(),
          user_email: "anonymous@placeholder.com",
          rating,
          title: titleVal.trim(),
          body: bodyVal.trim(),
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        setFormError(json.error ?? "Failed to submit. Try again.");
        return;
      }
      setSubmitted(true);
      setShowForm(false);
      setName(""); setRating(0); setTitleVal(""); setBodyVal("");
      await fetchReviews();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const labelStyle: React.CSSProperties = {
    fontSize: ".7rem",
    letterSpacing: ".12em",
    textTransform: "uppercase",
    fontFamily: "var(--font-space-mono)",
    color: "var(--muted)",
    display: "block",
    marginBottom: "6px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--bg-2)",
    border: "1px solid var(--line)",
    borderRadius: "10px",
    padding: "10px 14px",
    color: "var(--text)",
    fontFamily: "var(--font-hanken)",
    fontSize: ".9rem",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <section style={{ marginTop: "64px" }}>
      <h2
        style={{
          fontFamily: "var(--font-anton)",
          fontSize: "1.6rem",
          textTransform: "uppercase",
          color: "var(--text)",
          marginBottom: "32px",
          letterSpacing: ".04em",
        }}
      >
        Customer Reviews
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "40px",
          alignItems: "start",
          marginBottom: "40px",
        }}
      >
        <div style={{ textAlign: "center", minWidth: "120px" }}>
          <div
            style={{
              fontFamily: "var(--font-anton)",
              fontSize: "4rem",
              lineHeight: 1,
              color: "var(--text)",
            }}
          >
            {avgRating.toFixed(1)}
          </div>
          <div style={{ marginTop: "8px" }}>
            <StarRating rating={avgRating} size="md" />
          </div>
          <div
            style={{
              marginTop: "6px",
              fontSize: ".75rem",
              fontFamily: "var(--font-space-mono)",
              color: "var(--muted)",
            }}
          >
            {totalCount} {totalCount === 1 ? "review" : "reviews"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "8px" }}>
          {breakdown.map(({ star, count }) => {
            const pct = reviews.length ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    fontSize: ".72rem",
                    fontFamily: "var(--font-space-mono)",
                    color: "var(--muted)",
                    width: "24px",
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  {star}★
                </span>
                <div
                  style={{
                    flex: 1,
                    height: "8px",
                    borderRadius: "4px",
                    background: "var(--line)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: "var(--accent)",
                      borderRadius: "4px",
                      transition: "width .4s ease",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: ".72rem",
                    fontFamily: "var(--font-space-mono)",
                    color: "var(--muted)",
                    width: "28px",
                    flexShrink: 0,
                  }}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {submitted && (
        <div
          style={{
            marginBottom: "24px",
            padding: "14px 18px",
            borderRadius: "12px",
            background: "rgba(34,197,94,.08)",
            border: "1px solid rgba(34,197,94,.2)",
            color: "#22c55e",
            fontSize: ".88rem",
            fontFamily: "var(--font-hanken)",
          }}
        >
          Thank you — your review has been submitted and is pending approval.
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            marginBottom: "36px",
            padding: "11px 28px",
            borderRadius: "12px",
            background: "var(--accent)",
            color: "#000",
            fontFamily: "var(--font-hanken)",
            fontWeight: 700,
            fontSize: ".9rem",
            border: "none",
            cursor: "pointer",
          }}
        >
          Write a Review
        </button>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            marginBottom: "40px",
            padding: "28px",
            borderRadius: "16px",
            border: "1px solid var(--line)",
            background: "var(--surface)",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-anton)",
              fontSize: "1.1rem",
              textTransform: "uppercase",
              color: "var(--text)",
              margin: 0,
            }}
          >
            Write a Review
          </h3>

          <div>
            <span style={labelStyle}>Your Rating</span>
            <StarSelector value={rating} onChange={setRating} />
          </div>

          <div>
            <label style={labelStyle}>Your Name</label>
            <input
              style={inputStyle}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              maxLength={80}
            />
          </div>

          <div>
            <label style={labelStyle}>Review Title</label>
            <input
              style={inputStyle}
              type="text"
              value={titleVal}
              onChange={(e) => setTitleVal(e.target.value)}
              placeholder="Sum it up in a line"
              maxLength={120}
            />
          </div>

          <div>
            <label style={labelStyle}>Your Review</label>
            <textarea
              style={{ ...inputStyle, minHeight: "110px", resize: "vertical" }}
              value={bodyVal}
              onChange={(e) => setBodyVal(e.target.value)}
              placeholder="Tell others what you think about this product…"
              maxLength={2000}
            />
          </div>

          {formError && (
            <p style={{ color: "#ef4444", fontSize: ".85rem", margin: 0, fontFamily: "var(--font-hanken)" }}>
              {formError}
            </p>
          )}

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "11px 28px",
                borderRadius: "12px",
                background: "var(--accent)",
                color: "#000",
                fontFamily: "var(--font-hanken)",
                fontWeight: 700,
                fontSize: ".9rem",
                border: "none",
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? "Submitting…" : "Submit Review"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setFormError(""); }}
              style={{
                padding: "11px 20px",
                borderRadius: "12px",
                background: "transparent",
                color: "var(--muted)",
                fontFamily: "var(--font-hanken)",
                fontWeight: 600,
                fontSize: ".9rem",
                border: "1px solid var(--line)",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : reviews.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "56px 24px",
            borderRadius: "16px",
            border: "1px solid var(--line)",
            background: "var(--surface)",
          }}
        >
          <div
            style={{ fontSize: "2.5rem", marginBottom: "12px", opacity: 0.3 }}
          >
            ★
          </div>
          <p
            style={{
              fontFamily: "var(--font-hanken)",
              color: "var(--muted)",
              fontSize: ".95rem",
              marginBottom: "16px",
            }}
          >
            No reviews yet — be the first to share your experience.
          </p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: "9px 22px",
                borderRadius: "10px",
                background: "var(--accent)",
                color: "#000",
                fontFamily: "var(--font-hanken)",
                fontWeight: 700,
                fontSize: ".85rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              Write the First Review
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {reviews.map((r) => (
            <div
              key={r.id}
              style={{
                borderRadius: "14px",
                border: "1px solid var(--line)",
                background: "var(--surface)",
                padding: "24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <div>
                  <StarRating rating={r.rating} size="sm" />
                  <div
                    style={{
                      marginTop: "8px",
                      fontFamily: "var(--font-hanken)",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "var(--text)",
                    }}
                  >
                    {r.title}
                  </div>
                </div>
                {r.verified && (
                  <span
                    style={{
                      fontSize: ".68rem",
                      fontFamily: "var(--font-space-mono)",
                      padding: "3px 10px",
                      borderRadius: "20px",
                      background: "rgba(34,197,94,.1)",
                      color: "#22c55e",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    Verified Purchase
                  </span>
                )}
              </div>

              <p
                style={{
                  marginTop: "12px",
                  fontFamily: "var(--font-hanken)",
                  fontSize: ".9rem",
                  color: "var(--muted)",
                  lineHeight: 1.65,
                }}
              >
                {r.body}
              </p>

              <div
                style={{
                  marginTop: "14px",
                  display: "flex",
                  gap: "12px",
                  fontSize: ".72rem",
                  fontFamily: "var(--font-space-mono)",
                  color: "var(--muted-2)",
                }}
              >
                <span>{r.user_name}</span>
                <span>·</span>
                <span>
                  {new Date(r.created_at).toLocaleDateString("en-PK", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
