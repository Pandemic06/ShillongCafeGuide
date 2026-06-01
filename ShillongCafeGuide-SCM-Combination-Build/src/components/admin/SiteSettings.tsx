import { useEffect, useState } from "react";
import { Cafe } from "../../types";
import { getSiteSettings, saveSiteSettings, SiteSettings as Settings } from "../../services/admin-db";
import { Save, X, GripVertical } from "lucide-react";

export default function SiteSettings() {
  const [settings, setSettings] = useState<Settings>({ featuredCafes: [], bannerEnabled: false });
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [s, res] = await Promise.all([
          getSiteSettings(),
          fetch("/api/cafes").then((r) => r.ok ? r.json() : []),
        ]);
        setSettings(s);
        setCafes(res);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async () => {
    setStatus("Saving…");
    try {
      await saveSiteSettings(settings);
      setStatus("Saved");
      setTimeout(() => setStatus(""), 1500);
    } catch (err: any) {
      setStatus("Error: " + (err.message || "save failed"));
    }
  };

  const addFeatured = (id: string) => {
    if (settings.featuredCafes.includes(id)) return;
    setSettings({ ...settings, featuredCafes: [...settings.featuredCafes, id] });
  };
  const removeFeatured = (id: string) => {
    setSettings({ ...settings, featuredCafes: settings.featuredCafes.filter((x) => x !== id) });
  };
  const move = (i: number, dir: -1 | 1) => {
    const next = [...settings.featuredCafes];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setSettings({ ...settings, featuredCafes: next });
  };

  if (loading) return <p className="text-stone-500">Loading…</p>;

  const cafeById = new Map(cafes.map((c) => [c.id, c]));
  const unfeatured = cafes.filter((c) => !settings.featuredCafes.includes(c.id));

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-stone-900">Site settings</h1>
        <div className="flex items-center gap-3">
          {status && <span className="text-sm text-stone-600">{status}</span>}
          <button onClick={onSave} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 text-sm font-medium">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-6">
        {/* Banner */}
        <section>
          <h3 className="text-xs uppercase tracking-wider font-bold text-stone-500 mb-3">Top banner</h3>
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={!!settings.bannerEnabled}
              onChange={(e) => setSettings({ ...settings, bannerEnabled: e.target.checked })}
            />
            <span className="text-sm text-stone-700">Show banner</span>
          </label>
          <input
            type="text"
            value={settings.bannerText || ""}
            onChange={(e) => setSettings({ ...settings, bannerText: e.target.value })}
            placeholder="e.g. New: Cherrapunji monsoon route now live"
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </section>

        {/* Hero cafe */}
        <section>
          <h3 className="text-xs uppercase tracking-wider font-bold text-stone-500 mb-3">Homepage hero café</h3>
          <select
            value={settings.homepageHeroCafeId || ""}
            onChange={(e) => setSettings({ ...settings, homepageHeroCafeId: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
          >
            <option value="">— None (use default) —</option>
            {cafes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </section>

        {/* Featured carousel */}
        <section>
          <h3 className="text-xs uppercase tracking-wider font-bold text-stone-500 mb-3">
            Featured cafés ({settings.featuredCafes.length})
          </h3>
          <p className="text-xs text-stone-500 mb-3">Drag-free reorder using arrows. Top of list shows first.</p>

          <div className="space-y-1 mb-4">
            {settings.featuredCafes.length === 0 && (
              <p className="text-sm text-stone-400 italic">No featured cafés yet.</p>
            )}
            {settings.featuredCafes.map((id, i) => {
              const c = cafeById.get(id);
              return (
                <div key={id} className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2">
                  <GripVertical className="w-4 h-4 text-stone-400" />
                  <span className="flex-1 text-sm">{c?.name || id}</span>
                  <button onClick={() => move(i, -1)} className="text-stone-500 hover:text-stone-900 px-2 text-xs">▲</button>
                  <button onClick={() => move(i, 1)} className="text-stone-500 hover:text-stone-900 px-2 text-xs">▼</button>
                  <button onClick={() => removeFeatured(id)} className="text-rose-600 hover:text-rose-800 ml-2"><X className="w-4 h-4" /></button>
                </div>
              );
            })}
          </div>

          <details className="text-sm">
            <summary className="cursor-pointer text-amber-700 hover:text-amber-900 font-medium">+ Add a café</summary>
            <div className="mt-2 max-h-60 overflow-y-auto border border-stone-200 rounded-lg divide-y divide-stone-100">
              {unfeatured.map((c) => (
                <button
                  key={c.id}
                  onClick={() => addFeatured(c.id)}
                  className="w-full text-left px-3 py-2 hover:bg-stone-50 text-sm"
                >
                  {c.name} <span className="text-stone-400 text-xs">— {c.neighborhood}</span>
                </button>
              ))}
            </div>
          </details>
        </section>
      </div>
    </div>
  );
}
