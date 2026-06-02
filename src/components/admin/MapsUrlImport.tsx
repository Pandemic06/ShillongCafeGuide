import { useState } from "react";
import { Download, Loader2, Link as LinkIcon, CheckCircle2, AlertTriangle } from "lucide-react";
import { Cafe } from "../../types";

/**
 * One-input widget: paste a Google Maps URL → calls
 * /api/cafes/import-from-maps-url → returns a partial Cafe shape that the
 * parent merges into the editor. Parent decides merge strategy (overwrite
 * vs preserve-non-empty).
 *
 * Why parent owns the merge: only the parent knows which fields the user
 * has already manually edited and should not be clobbered.
 */
interface Props {
  onImport: (partial: Partial<Cafe>) => void;
}

export default function MapsUrlImport({ onImport }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onFetch = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/cafes/import-from-maps-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Import failed");
        return;
      }
      onImport(data.cafe);
      setSuccess(`Imported. ${data.photoCount || 0} photos pulled.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <LinkIcon className="w-4 h-4 text-amber-700" />
        <h3 className="text-sm font-bold text-stone-900">Import from Google Maps URL</h3>
      </div>
      <p className="text-xs text-stone-600 mb-3">
        Paste the cafe's Google Maps share link. Pulls address, hours, phone, rating, photos, service options, and price tier.
      </p>
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://maps.app.goo.gl/… or https://www.google.com/maps/place/…"
          className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          onKeyDown={(e) => { if (e.key === "Enter") onFetch(); }}
        />
        <button
          onClick={onFetch}
          disabled={loading || !url.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 text-sm font-medium disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Fetch
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded px-2 py-1 inline-flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> {error}
        </p>
      )}
      {success && (
        <p className="mt-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-1 inline-flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> {success}
        </p>
      )}
    </div>
  );
}
