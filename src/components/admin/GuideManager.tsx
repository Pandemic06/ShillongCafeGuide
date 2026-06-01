import { useEffect, useState } from "react";
import { GuideArticle } from "../../types";
import { listGuides, saveGuide, deleteGuide } from "../../services/admin-db";
import RichEditor from "./RichEditor";
import { Plus, Save, ArrowLeft, X, Trash2 } from "lucide-react";

const CATEGORIES: GuideArticle["category"][] = [
  "reviews", "khasi-food", "area-guides", "itineraries", "culture",
];

const STATUSES: NonNullable<GuideArticle["status"]>[] = ["draft", "scheduled", "published"];

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

export default function GuideManager() {
  const [guides, setGuides] = useState<GuideArticle[]>([]);
  const [editing, setEditing] = useState<GuideArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setGuides(await listGuides());
    } catch (err) {
      console.error(err);
      setGuides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onNew = () => {
    setEditing({
      id: `guide-${Date.now()}`,
      title: "",
      excerpt: "",
      content: "",
      category: "reviews",
      image: "",
      author: "Editorial",
      date: new Date().toISOString().slice(0, 10),
      readTime: "5 min",
      status: "draft",
      tags: [],
    });
  };

  const onSave = async () => {
    if (!editing) return;
    if (!editing.title) { setStatus("Title required"); return; }
    // Auto-slug if id still default
    const g = editing.id.startsWith("guide-") && editing.title
      ? { ...editing, id: slugify(editing.title) || editing.id }
      : editing;
    setStatus("Saving…");
    try {
      await saveGuide(g);
      setStatus("Saved");
      await load();
      setTimeout(() => setStatus(""), 1500);
      setEditing(g);
    } catch (err: any) {
      setStatus("Error: " + (err.message || "save failed"));
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm(`Delete guide ${id}?`)) return;
    await deleteGuide(id);
    if (editing?.id === id) setEditing(null);
    await load();
  };

  if (editing) {
    const set = <K extends keyof GuideArticle>(k: K, v: GuideArticle[K]) =>
      setEditing({ ...editing, [k]: v });

    return (
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => { setEditing(null); setStatus(""); }} className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            {status && <span className="text-sm text-stone-600">{status}</span>}
            <button onClick={onSave} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 text-sm font-medium">
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
          <label className="block">
            <span className="block text-xs font-medium text-stone-700 mb-1">Title</span>
            <input value={editing.title} onChange={(e) => set("title", e.target.value)} className={inp} />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-stone-700 mb-1">Excerpt (1–2 sentences)</span>
            <textarea value={editing.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={2} className={inp} />
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="block">
              <span className="block text-xs font-medium text-stone-700 mb-1">Category</span>
              <select value={editing.category} onChange={(e) => set("category", e.target.value as any)} className={inp}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-stone-700 mb-1">Status</span>
              <select value={editing.status || "draft"} onChange={(e) => set("status", e.target.value as any)} className={inp}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-stone-700 mb-1">Read time</span>
              <input value={editing.readTime} onChange={(e) => set("readTime", e.target.value)} className={inp} placeholder="5 min" />
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-medium text-stone-700 mb-1">Author</span>
              <input value={editing.author} onChange={(e) => set("author", e.target.value)} className={inp} />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-stone-700 mb-1">Date</span>
              <input type="date" value={editing.date} onChange={(e) => set("date", e.target.value)} className={inp} />
            </label>
          </div>
          <label className="block">
            <span className="block text-xs font-medium text-stone-700 mb-1">Hero image URL</span>
            <input value={editing.image} onChange={(e) => set("image", e.target.value)} className={inp} />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-stone-700 mb-1">Tags (comma-separated)</span>
            <input
              value={(editing.tags || []).join(", ")}
              onChange={(e) => set("tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              className={inp}
            />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!editing.featured} onChange={(e) => set("featured", e.target.checked)} />
            <span className="text-sm text-stone-700">Featured (homepage)</span>
          </label>

          <div>
            <span className="block text-xs font-medium text-stone-700 mb-2">Body</span>
            <RichEditor
              value={editing.content || ""}
              onChange={(html) => set("content", html)}
              placeholder="Write the article…"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-stone-900">Guides ({guides.length})</h1>
        <button onClick={onNew} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 text-sm font-medium">
          <Plus className="w-4 h-4" /> New guide
        </button>
      </div>

      {loading ? (
        <p className="text-stone-500">Loading…</p>
      ) : guides.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-8 text-center text-stone-500">
          No guides yet. Click "New guide" to write your first.
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {guides.map((g) => (
                <tr key={g.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium text-stone-900">{g.title}</td>
                  <td className="px-4 py-3 text-stone-600">{g.category}</td>
                  <td className="px-4 py-3"><StatusPill status={g.status} /></td>
                  <td className="px-4 py-3 text-stone-600">{g.date}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setEditing(g)} className="text-amber-700 hover:text-amber-900 text-xs font-medium mr-3">Edit</button>
                    <button onClick={() => onDelete(g.id)} className="text-rose-600 hover:text-rose-800 text-xs font-medium">Delete</button>
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

const inp = "w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500";

function StatusPill({ status }: { status?: GuideArticle["status"] }) {
  const map: Record<string, string> = {
    draft: "bg-stone-100 text-stone-700",
    scheduled: "bg-blue-50 text-blue-800",
    published: "bg-emerald-50 text-emerald-800",
  };
  const s = status || "draft";
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${map[s]}`}>{s}</span>;
}
