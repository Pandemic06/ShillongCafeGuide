import { useEffect, useState } from "react";
import { FoodDish } from "../../types";
import { DISHES } from "../../data";
import { listDishOverrides, saveDish } from "../../services/admin-db";
import ImageUrlField from "./ImageUrlField";
import { Save, ArrowLeft } from "lucide-react";

/**
 * Khasi Cuisine editor. Base = static DISHES; Firestore `dishes/{id}`
 * overrides per-field (image, descriptions, pairing). Public CuisineGuide
 * merges these over the static list.
 */
export default function CuisineManager() {
  const [items, setItems] = useState<FoodDish[]>(DISHES);
  const [editing, setEditing] = useState<FoodDish | null>(null);
  const [status, setStatus] = useState("");

  const load = async () => {
    const overrides = await listDishOverrides().catch(() => []);
    const map = new Map(DISHES.map((d) => [d.id, d]));
    overrides.forEach((o) => map.set(o.id, { ...map.get(o.id), ...o } as FoodDish));
    setItems(Array.from(map.values()));
  };
  useEffect(() => { load(); }, []);

  const onSave = async () => {
    if (!editing) return;
    setStatus("Saving…");
    try {
      await saveDish(editing);
      setStatus("Saved");
      await load();
      setTimeout(() => setStatus(""), 1500);
    } catch (err: any) {
      setStatus("Error: " + (err.message || "save failed"));
    }
  };

  if (editing) {
    const set = <K extends keyof FoodDish>(k: K, v: FoodDish[K]) => setEditing({ ...editing, [k]: v });
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
          <Lbl t="Dish name"><input value={editing.name || ""} onChange={(e) => set("name", e.target.value)} className={inp} /></Lbl>
          <Lbl t="Dish photo"><ImageUrlField value={editing.image || ""} onChange={(v) => set("image", v)} folder="misc" /></Lbl>
          <Lbl t="Philosophy (short tagline)"><input value={editing.philosophy || ""} onChange={(e) => set("philosophy", e.target.value)} className={inp} /></Lbl>
          <Lbl t="Description"><textarea value={editing.description || ""} onChange={(e) => set("description", e.target.value)} rows={3} className={inp} /></Lbl>
          <Lbl t="Flavour profile"><input value={editing.profile || ""} onChange={(e) => set("profile", e.target.value)} className={inp} /></Lbl>
          <Lbl t="Pairing"><input value={editing.pairing || ""} onChange={(e) => set("pairing", e.target.value)} className={inp} /></Lbl>
          <Lbl t="Match cafés (comma-separated ids)">
            <input
              value={(editing.matchCafes || []).join(", ")}
              onChange={(e) => set("matchCafes", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              className={inp}
            />
          </Lbl>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-stone-900 mb-6">Khasi Cuisine ({items.length})</h1>
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-600 text-xs uppercase">
            <tr><th className="text-left px-4 py-3">Dish</th><th className="text-left px-4 py-3">Philosophy</th><th className="text-right px-4 py-3">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {items.map((d) => (
              <tr key={d.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 font-medium text-stone-900">{d.name}</td>
                <td className="px-4 py-3 text-stone-600 text-xs">{d.philosophy}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => setEditing(d)} className="text-amber-700 hover:text-amber-900 text-xs font-medium">Edit</button></td>
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
