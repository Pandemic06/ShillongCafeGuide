import { useRef, useState } from "react";
import { Sparkles, Loader2, Upload, Link as LinkIcon, AlertTriangle, Check, X as XIcon } from "lucide-react";
import { MenuItem } from "../../types";

/**
 * Three-mode AI menu suggester:
 *   1. Google search (default) — server uses Gemini + Search grounding
 *   2. Menu URL (Zomato/Swiggy/cafe site) — server fetches HTML + Gemini parse
 *   3. PDF upload — client base64 → server Gemini multimodal
 *
 * Suggestions land in a review panel. User ticks which to keep and clicks
 * "Add selected" — only ticked items get sent to the parent's mustTry list.
 *
 * Every suggested item is marked `ai_suggested: true` on the server so a
 * downstream renderer can badge them if needed.
 */
interface Props {
  cafeName: string;
  address?: string;
  websiteUrl?: string;
  onAdd: (items: MenuItem[]) => void;
}

type Mode = "search" | "url" | "pdf";
type Suggestion = MenuItem & { ai_suggested?: boolean; category?: string };

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const result = String(reader.result || "");
      // Strip "data:application/pdf;base64," prefix
      resolve(result.split(",")[1] || result);
    };
    reader.readAsDataURL(file);
  });
}

export default function MenuSuggester({ cafeName, address, websiteUrl, onAdd }: Props) {
  const [mode, setMode] = useState<Mode>("search");
  const [menuUrl, setMenuUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const pdfRef = useRef<HTMLInputElement>(null);

  const reset = () => { setSuggestions([]); setPicked(new Set()); setError(""); };

  const runSearch = async () => {
    if (!cafeName) { setError("Set the cafe Name first."); return; }
    setLoading(true); reset();
    try {
      const res = await fetch("/api/cafes/suggest-menu", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cafeName, address, websiteUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Suggest failed");
      setSuggestions(data.items || []);
      setPicked(new Set((data.items || []).map((_: any, i: number) => i)));
      if (!data.items?.length) setError("No menu items found. Try the URL or PDF mode for more reliable results.");
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const runUrlParse = async () => {
    if (!menuUrl.trim()) { setError("Paste a menu URL first."); return; }
    setLoading(true); reset();
    try {
      const res = await fetch("/api/cafes/suggest-menu-from-url", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuUrl: menuUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "URL parse failed");
      setSuggestions(data.items || []);
      setPicked(new Set((data.items || []).map((_: any, i: number) => i)));
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const onPdfPicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") { setError("PDF only."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("PDF too large (>10MB)."); return; }
    setLoading(true); reset();
    try {
      const pdfBase64 = await fileToBase64(file);
      const res = await fetch("/api/cafes/suggest-menu-from-pdf", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "PDF parse failed");
      setSuggestions(data.items || []);
      setPicked(new Set((data.items || []).map((_: any, i: number) => i)));
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const togglePick = (i: number) => {
    const next = new Set(picked);
    next.has(i) ? next.delete(i) : next.add(i);
    setPicked(next);
  };

  const addSelected = () => {
    const items = suggestions.filter((_, i) => picked.has(i));
    if (!items.length) return;
    onAdd(items);
    reset();
  };

  return (
    <div className="border border-purple-200 bg-purple-50/30 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-purple-700" />
        <h3 className="text-sm font-bold text-stone-900">AI menu suggester</h3>
        <span className="text-[10px] uppercase tracking-wider bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">Beta — review before adding</span>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 bg-white border border-stone-200 rounded-lg p-1 mb-3 w-fit">
        {(["search", "url", "pdf"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); reset(); }}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              mode === m ? "bg-purple-700 text-white" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {m === "search" ? "Google search" : m === "url" ? "Menu URL" : "PDF upload"}
          </button>
        ))}
      </div>

      {/* Mode-specific input */}
      {mode === "search" && (
        <button
          onClick={runSearch}
          disabled={loading || !cafeName}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 text-sm font-medium disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Find menu for "{cafeName || "(set name first)"}"
        </button>
      )}
      {mode === "url" && (
        <div className="flex gap-2">
          <input
            type="url"
            value={menuUrl}
            onChange={(e) => setMenuUrl(e.target.value)}
            placeholder="https://www.zomato.com/…  or  https://cafesite.com/menu"
            className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm"
          />
          <button
            onClick={runUrlParse}
            disabled={loading || !menuUrl.trim()}
            className="inline-flex items-center gap-1 px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 text-sm font-medium disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
            Parse
          </button>
        </div>
      )}
      {mode === "pdf" && (
        <div>
          <button
            onClick={() => pdfRef.current?.click()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 text-sm font-medium disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {loading ? "Parsing PDF…" : "Pick menu PDF"}
          </button>
          <input ref={pdfRef} type="file" accept="application/pdf" className="hidden" onChange={onPdfPicked} />
          <p className="text-[11px] text-stone-500 mt-1">Max 10MB. Most accurate option.</p>
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded px-2 py-1 inline-flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> {error}
        </p>
      )}

      {/* Suggestion review panel */}
      {suggestions.length > 0 && (
        <div className="mt-4 border border-stone-200 bg-white rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-stone-600">
              <strong>{suggestions.length}</strong> suggestions — {picked.size} selected
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPicked(new Set(suggestions.map((_, i) => i)))} className="text-xs text-stone-600 hover:text-stone-900">All</button>
              <button onClick={() => setPicked(new Set())} className="text-xs text-stone-600 hover:text-stone-900">None</button>
            </div>
          </div>
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {suggestions.map((it, i) => (
              <label key={i} className="flex items-start gap-2 p-2 rounded hover:bg-stone-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={picked.has(i)}
                  onChange={() => togglePick(i)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-stone-900 truncate">{it.name}</span>
                    <span className="text-xs font-mono text-amber-900 shrink-0">{it.price}</span>
                  </div>
                  {it.description && <p className="text-xs text-stone-600">{it.description}</p>}
                  {it.category && <span className="text-[9px] uppercase tracking-wider text-stone-400">{it.category}</span>}
                </div>
              </label>
            ))}
          </div>
          <div className="flex gap-2 mt-3 pt-3 border-t border-stone-100">
            <button
              onClick={addSelected}
              disabled={picked.size === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium disabled:opacity-50"
            >
              <Check className="w-4 h-4" /> Add {picked.size} to menu
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center gap-1 px-3 py-2 text-stone-600 hover:text-stone-900 text-sm"
            >
              <XIcon className="w-4 h-4" /> Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
