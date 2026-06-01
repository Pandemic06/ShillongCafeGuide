import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { uploadImage } from "../../services/storage";

/**
 * Hybrid image input: type a URL or upload a file to Firebase Storage.
 * Uploaded files return a permanent download URL that replaces the field
 * value, so callers stay URL-string-based and Firestore docs don't change
 * shape.
 */

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: "cafes" | "guides" | "misc";
  placeholder?: string;
}

export default function ImageUrlField({ value, onChange, folder = "misc", placeholder }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "https://… or upload"}
          className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
        />
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1 px-3 py-2 border border-stone-300 rounded-lg text-xs font-medium hover:bg-stone-50 disabled:opacity-50"
        >
          <Upload className={`w-3.5 h-3.5 ${uploading ? "animate-pulse" : ""}`} />
          {uploading ? "Uploading…" : "Upload"}
        </button>
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={onPick} />
      </div>
      {error && <p className="text-xs text-rose-700 mt-1">{error}</p>}
      {value && (
        <img
          src={value}
          alt=""
          className="mt-2 max-h-24 rounded border border-stone-200 object-cover"
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}
