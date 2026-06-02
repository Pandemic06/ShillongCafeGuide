import { Plus, Trash2 } from "lucide-react";
import ImageUrlField from "./ImageUrlField";

/**
 * Array editor for any string[] field that holds image URLs (gallery,
 * photos, etc.). Each row: ImageUrlField (URL paste OR upload) + ▲ ▼ ✕.
 * Top-of-list = displayed first on the public site.
 */
interface Props {
  value: string[];
  onChange: (next: string[]) => void;
  folder?: "cafes" | "guides" | "misc";
  title?: string;
  helpText?: string;
}

export default function GalleryEditor({
  value, onChange, folder = "cafes", title = "Gallery", helpText,
}: Props) {
  const list = value || [];

  const setAt = (i: number, url: string) => {
    const next = [...list];
    next[i] = url;
    onChange(next);
  };

  const add = () => onChange([...list, ""]);
  const remove = (i: number) => onChange(list.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-xs uppercase tracking-wider font-bold text-stone-500">
            {title} ({list.length})
          </h3>
          {helpText && <p className="text-[11px] text-stone-500 mt-0.5">{helpText}</p>}
        </div>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 px-2 py-1 border border-stone-300 rounded text-xs hover:bg-stone-50"
        >
          <Plus className="w-3 h-3" /> Add image
        </button>
      </div>

      {list.length === 0 ? (
        <p className="text-xs text-stone-400 italic py-2">No images yet. Click "Add image" to start.</p>
      ) : (
        <div className="space-y-2">
          {list.map((url, i) => (
            <div key={i} className="flex gap-2 items-start border border-stone-200 rounded-lg p-2 bg-stone-50">
              <div className="flex flex-col gap-1 shrink-0 pt-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="px-2 text-xs text-stone-500 hover:text-stone-900 disabled:opacity-30"
                  title="Move up"
                >▲</button>
                <span className="text-[10px] font-mono text-stone-400 text-center">{i + 1}</span>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === list.length - 1}
                  className="px-2 text-xs text-stone-500 hover:text-stone-900 disabled:opacity-30"
                  title="Move down"
                >▼</button>
              </div>
              <div className="flex-1 min-w-0">
                <ImageUrlField value={url} onChange={(v) => setAt(i, v)} folder={folder} />
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded shrink-0"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
