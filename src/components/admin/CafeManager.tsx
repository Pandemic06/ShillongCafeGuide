import { useEffect, useState } from "react";
import { Cafe } from "../../types";
import { getCustomCafesFromFirestore } from "../../services/db";
import { saveCafe, deleteCafe } from "../../services/admin-db";
import { Plus, Trash2, Save, X, ArrowLeft, Sparkles } from "lucide-react";
import ImageUrlField from "./ImageUrlField";
import MapsUrlImport from "./MapsUrlImport";
import MenuSuggester from "./MenuSuggester";
import GalleryEditor from "./GalleryEditor";

/**
 * Café CRUD.
 * - List: loads /api/cafes (static + cafes_db.json) + Firestore overrides, merged.
 * - Edit: writes to Firestore `cafes/{id}` with merge. Public site already
 *   reads Firestore overrides on top of API cafes (see App.tsx loadCafes), so
 *   saves appear live on next page load.
 */

const NEIGHBORHOODS: Cafe["neighborhood"][] = [
  "Laitumkhrah", "Police Bazaar", "Golf Links", "Boyce Road",
  "Nongkynrih", "Kench's Trace", "Dhankheti", "Mawroh",
  "Nongrim Hills", "Oakland", "Cleve Colony", "MG Road", "Mawlai",
  "Nongthymmai",
];

export default function CafeManager() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [editing, setEditing] = useState<Cafe | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [status, setStatus] = useState<string>("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cafes");
      const apiCafes: Cafe[] = res.ok ? await res.json() : [];
      const fsCafes = await getCustomCafesFromFirestore().catch(() => []);
      const merged = [...fsCafes];
      apiCafes.forEach((c) => {
        if (!merged.some((m) => m.id === c.id)) merged.push(c);
      });
      merged.sort((a, b) => a.name.localeCompare(b.name));
      setCafes(merged);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onNew = () => {
    setEditing({
      id: `cafe-${Date.now()}`,
      name: "",
      tagline: "",
      theme: "",
      introduction: "",
      whyVisit: "",
      hours: "10:30 AM — 8:30 PM",
      address: "Shillong, Meghalaya 793001",
      neighborhood: "Laitumkhrah",
      images: { hero: "", card: "" },
      mustTry: [],
      gallery: [],
      vibeTags: [],
    });
  };

  const onSave = async () => {
    if (!editing) return;
    if (!editing.name) { setStatus("Name required"); return; }
    setStatus("Saving…");
    try {
      await saveCafe(editing);
      setStatus("Saved");
      await load();
      setTimeout(() => setStatus(""), 1500);
    } catch (err: any) {
      setStatus("Error: " + (err.message || "save failed"));
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm(`Delete cafe ${id}? This removes the Firestore override only; static DB entries will reappear.`)) return;
    await deleteCafe(id);
    if (editing?.id === id) setEditing(null);
    await load();
  };

  const filtered = cafes.filter(
    (c) =>
      !filter ||
      c.name.toLowerCase().includes(filter.toLowerCase()) ||
      c.neighborhood.toLowerCase().includes(filter.toLowerCase())
  );

  if (editing) return (
    <CafeEditor
      cafe={editing}
      onChange={setEditing}
      onSave={onSave}
      onCancel={() => { setEditing(null); setStatus(""); }}
      status={status}
    />
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-display font-bold text-stone-900">Cafés ({cafes.length})</h1>
        <div className="flex gap-2 items-center">
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by name or neighborhood"
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm w-72"
          />
          <button
            onClick={onNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> New café
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-stone-500">Loading…</p>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Neighborhood</th>
                <th className="text-left px-4 py-3">Theme</th>
                <th className="text-left px-4 py-3">Price/person</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium text-stone-900">{c.name}</td>
                  <td className="px-4 py-3 text-stone-600">{c.neighborhood}</td>
                  <td className="px-4 py-3 text-stone-600 text-xs">{c.theme}</td>
                  <td className="px-4 py-3 text-stone-600">{c.price_per_person ? `₹${c.price_per_person}` : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setEditing(c)} className="text-amber-700 hover:text-amber-900 text-xs font-medium mr-3">Edit</button>
                    <button onClick={() => onDelete(c.id)} className="text-rose-600 hover:text-rose-800 text-xs font-medium">Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-stone-500">No matches.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Inline editor ─────────────────────────────────────────────────────────

function CafeEditor({
  cafe, onChange, onSave, onCancel, status,
}: {
  cafe: Cafe;
  onChange: (c: Cafe) => void;
  onSave: () => void;
  onCancel: () => void;
  status: string;
}) {
  const set = <K extends keyof Cafe>(k: K, v: Cafe[K]) => onChange({ ...cafe, [k]: v });

  const updateMustTry = (i: number, field: string, val: string) => {
    const next = [...(cafe.mustTry || [])];
    next[i] = { ...next[i], [field]: val };
    set("mustTry", next);
  };

  const addMustTry = () => set("mustTry", [...(cafe.mustTry || []), { name: "", description: "", price: "" }]);
  const removeMustTry = (i: number) => set("mustTry", (cafe.mustTry || []).filter((_, idx) => idx !== i));

  /**
   * Merge a partial Cafe (from Maps URL import) over the current editor
   * state. Strategy: only overwrite a field if its current value is empty
   * (string blank, undefined, or empty array). Prevents the import from
   * clobbering admin-authored copy.
   */
  const applyImport = (partial: Partial<Cafe>) => {
    const merged: Cafe = { ...cafe };
    const isEmpty = (v: any): boolean =>
      v == null || v === "" || (Array.isArray(v) && v.length === 0);

    (Object.keys(partial) as (keyof Cafe)[]).forEach((k) => {
      const incoming = partial[k];
      if (incoming == null) return;
      if (k === "images") {
        // Nested merge: fill in only empty image slots.
        merged.images = {
          hero: cafe.images?.hero || (incoming as any).hero || "",
          card: cafe.images?.card || (incoming as any).card || "",
          interior: cafe.images?.interior || (incoming as any).interior,
          details: cafe.images?.details,
        };
        return;
      }
      if (isEmpty((cafe as any)[k])) {
        (merged as any)[k] = incoming;
      }
    });
    onChange(merged);
  };

  const addSuggestedMenuItems = (items: any[]) => {
    set("mustTry", [...(cafe.mustTry || []), ...items]);
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onCancel} className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to list
        </button>
        <div className="flex items-center gap-3">
          {status && <span className="text-sm text-stone-600">{status}</span>}
          <button onClick={onCancel} className="px-4 py-2 text-stone-600 hover:text-stone-900 text-sm">
            <X className="inline w-4 h-4 mr-1" /> Cancel
          </button>
          <button onClick={onSave} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 text-sm font-medium">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-5">
        <MapsUrlImport onImport={applyImport} />

        <Section title="Identity">
          <Field label="ID (slug)"><input value={cafe.id} onChange={(e) => set("id", e.target.value)} className={inp} /></Field>
          <Field label="Name"><input value={cafe.name} onChange={(e) => set("name", e.target.value)} className={inp} /></Field>
          <Field label="Tagline"><input value={cafe.tagline} onChange={(e) => set("tagline", e.target.value)} className={inp} /></Field>
          <Field label="Theme"><input value={cafe.theme} onChange={(e) => set("theme", e.target.value)} className={inp} /></Field>
          <Field label="Neighborhood">
            <select value={cafe.neighborhood} onChange={(e) => set("neighborhood", e.target.value as any)} className={inp}>
              {NEIGHBORHOODS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
        </Section>

        <Section title="Content">
          <Field label="Introduction"><textarea value={cafe.introduction} onChange={(e) => set("introduction", e.target.value)} rows={3} className={inp} /></Field>
          <Field label="Why visit"><textarea value={cafe.whyVisit} onChange={(e) => set("whyVisit", e.target.value)} rows={2} className={inp} /></Field>
          <Field label="Hours"><input value={cafe.hours} onChange={(e) => set("hours", e.target.value)} className={inp} /></Field>
          <Field label="Address"><input value={cafe.address} onChange={(e) => set("address", e.target.value)} className={inp} /></Field>
          <Field label="Price per person (₹)">
            <input type="number" value={cafe.price_per_person ?? ""} onChange={(e) => set("price_per_person", e.target.value ? Number(e.target.value) : undefined)} className={inp} />
          </Field>
          <Field label="Vibe tags (comma-separated)">
            <input
              value={(cafe.vibeTags || []).join(", ")}
              onChange={(e) => set("vibeTags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              className={inp}
            />
          </Field>
        </Section>

        <Section title="Card images (hero / card / interior)">
          <Field label="Hero (top of detail modal)">
            <ImageUrlField value={cafe.images?.hero || ""} onChange={(v) => set("images", { ...cafe.images, hero: v })} folder="cafes" />
          </Field>
          <Field label="Card (in the listing grid)">
            <ImageUrlField value={cafe.images?.card || ""} onChange={(v) => set("images", { ...cafe.images, card: v })} folder="cafes" />
          </Field>
          <Field label="Interior">
            <ImageUrlField value={cafe.images?.interior || ""} onChange={(v) => set("images", { ...cafe.images, interior: v })} folder="cafes" />
          </Field>
          <Field label="Details (Details & Vibe section)">
            <ImageUrlField value={cafe.images?.details || ""} onChange={(v) => set("images", { ...cafe.images, details: v })} folder="cafes" />
          </Field>
        </Section>

        <Section title="Google Shared Photos">
          <GalleryEditor
            value={cafe.photos || []}
            onChange={(v) => set("photos", v)}
            folder="cafes"
            title="Photos"
            helpText="Shown in the 'Google Shared Photos' section. Order matters — top of list shows first. Auto-populated by the Maps URL import; add or rearrange here."
          />
        </Section>

        <Section title="Extra gallery">
          <GalleryEditor
            value={cafe.gallery || []}
            onChange={(v) => set("gallery", v)}
            folder="cafes"
            title="Gallery"
            helpText="Optional secondary gallery, used by some detail sections."
          />
        </Section>

        <Section title="Menu & Bites (Must-try)">
          <MenuSuggester
            cafeName={cafe.name}
            address={cafe.formatted_address || cafe.address}
            websiteUrl={cafe.website}
            onAdd={addSuggestedMenuItems}
          />
          {(cafe.mustTry || []).map((item, i) => (
            <div key={i} className="border border-stone-200 rounded-lg p-3 mb-2 bg-stone-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input placeholder="Name" value={item.name} onChange={(e) => updateMustTry(i, "name", e.target.value)} className={inp} />
                <input placeholder="Price (₹180)" value={item.price || ""} onChange={(e) => updateMustTry(i, "price", e.target.value)} className={inp} />
              </div>
              <textarea placeholder="Description" value={item.description} onChange={(e) => updateMustTry(i, "description", e.target.value)} rows={2} className={`${inp} mt-2`} />
              <div className="mt-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500 mb-1 block">Dish image</span>
                <ImageUrlField value={item.image || ""} onChange={(v) => updateMustTry(i, "image", v)} folder="cafes" />
              </div>
              {(item as any).ai_suggested && (
                <span className="inline-flex items-center gap-1 text-[10px] mt-2 px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                  <Sparkles className="w-2.5 h-2.5" /> AI suggested
                </span>
              )}
              <button onClick={() => removeMustTry(i)} className="text-rose-600 hover:text-rose-800 text-xs mt-2 inline-flex items-center gap-1 ml-2">
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            </div>
          ))}
          <button onClick={addMustTry} className="inline-flex items-center gap-2 px-3 py-2 border border-stone-300 rounded-lg hover:bg-stone-50 text-sm">
            <Plus className="w-4 h-4" /> Add menu item
          </button>
        </Section>
      </div>
    </div>
  );
}

const inp = "w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider font-bold text-stone-500 mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-stone-700 mb-1">{label}</span>
      {children}
    </label>
  );
}
