import { useEffect, useState } from "react";
import { NeighborhoodInfo } from "../../types";
import { NEIGHBORHOODS } from "../../data";
import { listNeighborhoodOverrides, saveNeighborhood } from "../../services/admin-db";
import ImageUrlField from "./ImageUrlField";
import { Save, ArrowLeft, Plus, Trash2 } from "lucide-react";

/**
 * District Walks editor. Base list is the static NEIGHBORHOODS; Firestore
 * `neighborhoods/{id}` docs override per-field. Edits merge, so leaving a
 * field untouched keeps the static value on the public site.
 */
export default function NeighborhoodManager() {
  const [items, setItems] = useState<NeighborhoodInfo[]>(NEIGHBORHOODS);
  const [editing, setEditing] = useState<NeighborhoodInfo | null>(null);
  const [status, setStatus] = useState("");

  const load = async () => {
    const overrides = await listNeighborhoodOverrides().catch(() => []);
    const map = new Map(NEIGHBORHOODS.map((n) => [n.id, n]));
    overrides.forEach((o) => map.set(o.id, { ...map.get(o.id), ...o } as NeighborhoodInfo));
    setItems(Array.from(map.values()));
  };
  useEffect(() => { load(); }, []);

  const onSave = async () => {
    if (!editing) return;
    setStatus("Saving…");
    try {
      await saveNeighborhood(editing);
      setStatus("Saved");
      await load();
      setTimeout(() => setStatus(""), 1500);
    } catch (err: any) {
      setStatus("Error: " + (err.message || "save failed"));
    }
  };

  if (editing) {
    const set = <K extends keyof NeighborhoodInfo>(k: K, v: NeighborhoodInfo[K]) =>
      setEditing({ ...editing, [k]: v });
    const setVitals = (k: string, v: string) =>
      setEditing({ ...editing, vitals: { ...editing.vitals, [k]: v } });
    const setStep = (i: number, field: string, v: string) => {
      const steps = [...(editing.itinerary?.steps || [])];
      steps[i] = { ...steps[i], [field]: v };
      setEditing({ ...editing, itinerary: { ...editing.itinerary, steps } });
    };
    const addStep = () =>
      setEditing({
        ...editing,
        itinerary: {
          ...editing.itinerary,
          steps: [...(editing.itinerary?.steps || []), { time: "", title: "", description: "" }],
        },
      });
    const removeStep = (i: number) =>
      setEditing({
        ...editing,
        itinerary: { ...editing.itinerary, steps: (editing.itinerary?.steps || []).filter((_, idx) => idx !== i) },
      });

    return (
      <div className="max-w-3xl">
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
          <Lbl t="Name"><input value={editing.name || ""} onChange={(e) => set("name", e.target.value)} className={inp} /></Lbl>
          <Lbl t="Title (headline)"><input value={editing.title || ""} onChange={(e) => set("title", e.target.value)} className={inp} /></Lbl>
          <Lbl t="Description"><textarea value={editing.description || ""} onChange={(e) => set("description", e.target.value)} rows={3} className={inp} /></Lbl>
          <Lbl t="Hero image"><ImageUrlField value={editing.image || ""} onChange={(v) => set("image", v)} folder="misc" /></Lbl>
          <Lbl t="Listing thumbnail (accent)"><ImageUrlField value={editing.vitals?.accentUrl || ""} onChange={(v) => setVitals("accentUrl", v)} folder="misc" /></Lbl>
          <div className="grid grid-cols-2 gap-3">
            <Lbl t="Vibe"><input value={editing.vitals?.vibe || ""} onChange={(e) => setVitals("vibe", e.target.value)} className={inp} /></Lbl>
            <Lbl t="Best time"><input value={editing.vitals?.bestTime || ""} onChange={(e) => setVitals("bestTime", e.target.value)} className={inp} /></Lbl>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-bold text-stone-500">Itinerary steps</span>
              <button onClick={addStep} className="inline-flex items-center gap-1 px-2 py-1 border border-stone-300 rounded text-xs hover:bg-stone-50"><Plus className="w-3 h-3" /> Add step</button>
            </div>
            {(editing.itinerary?.steps || []).map((s, i) => (
              <div key={i} className="border border-stone-200 rounded-lg p-3 mb-2 bg-stone-50">
                <div className="grid grid-cols-3 gap-2">
                  <input placeholder="Time" value={s.time} onChange={(e) => setStep(i, "time", e.target.value)} className={inp} />
                  <input placeholder="Title" value={s.title} onChange={(e) => setStep(i, "title", e.target.value)} className={`${inp} col-span-2`} />
                </div>
                <textarea placeholder="Description" value={s.description} onChange={(e) => setStep(i, "description", e.target.value)} rows={2} className={`${inp} mt-2`} />
                <button onClick={() => removeStep(i)} className="text-rose-600 hover:text-rose-800 text-xs mt-2 inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remove</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-stone-900 mb-6">District Walks ({items.length})</h1>
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-600 text-xs uppercase">
            <tr><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Title</th><th className="text-right px-4 py-3">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {items.map((n) => (
              <tr key={n.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 font-medium text-stone-900">{n.name}</td>
                <td className="px-4 py-3 text-stone-600 text-xs">{n.title}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => setEditing(n)} className="text-amber-700 hover:text-amber-900 text-xs font-medium">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inp = "w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500";
function Lbl({ t, children }: { t: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-medium text-stone-700 mb-1">{t}</span>{children}</label>;
}
