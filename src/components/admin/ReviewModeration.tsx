import { useEffect, useState } from "react";
import { Review } from "../../types";
import { listReviews, approveReview, deleteReview } from "../../services/admin-db";
import { Check, Trash2, Star } from "lucide-react";

interface ReviewWithMeta extends Review {
  approved?: boolean;
}

export default function ReviewModeration() {
  const [reviews, setReviews] = useState<ReviewWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");

  const load = async () => {
    setLoading(true);
    try {
      setReviews(await listReviews() as ReviewWithMeta[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onApprove = async (id: string) => {
    await approveReview(id);
    await load();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await deleteReview(id);
    await load();
  };

  const filtered = reviews.filter((r) => {
    if (filter === "pending") return !r.approved;
    if (filter === "approved") return !!r.approved;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-display font-bold text-stone-900">Reviews ({reviews.length})</h1>
        <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
          {(["pending", "approved", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                filter === f ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-stone-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-8 text-center text-stone-500">
          No {filter} reviews.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white border border-stone-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-stone-900">{r.userName}</span>
                    <span className="text-xs text-stone-500">on {r.cafeId}</span>
                    {r.isLocalGuide && <span className="text-xs bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded">Local Guide</span>}
                    {r.approved && <span className="text-xs bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded">Approved</span>}
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "fill-amber-500 text-amber-500" : "text-stone-300"}`} />
                    ))}
                    <span className="text-xs text-stone-500 ml-2">{r.date}</span>
                  </div>
                  <p className="text-sm text-stone-700">{r.comment}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {!r.approved && (
                    <button
                      onClick={() => onApprove(r.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-medium"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(r.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 text-xs font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
