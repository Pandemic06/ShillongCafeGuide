import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Strikethrough, Heading2, Heading3, List, ListOrdered,
  Quote, Image as ImageIcon, Link as LinkIcon, Undo, Redo, Minus,
} from "lucide-react";

/**
 * Thin TipTap wrapper for admin guide/article body editing.
 * Stores HTML in the parent — keeps the export shape compatible with
 * `dangerouslySetInnerHTML` rendering on the public site.
 */

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, HTMLAttributes: { class: "rounded-lg my-4 max-w-full" } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-amber-700 underline" } }),
      Placeholder.configure({ placeholder: placeholder || "Write the article…" }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-stone max-w-none min-h-[400px] focus:outline-none p-4 bg-white",
      },
    },
  });

  if (!editor) return null;

  const Btn = ({
    onClick, active, label, children,
  }: { onClick: () => void; active?: boolean; label: string; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`p-2 rounded hover:bg-stone-200 transition-colors ${active ? "bg-stone-200 text-amber-800" : "text-stone-600"}`}
    >
      {children}
    </button>
  );

  const addImage = () => {
    const url = window.prompt("Image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addLink = () => {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("Link URL", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="border border-stone-300 rounded-lg overflow-hidden bg-white">
      <div className="flex flex-wrap gap-1 p-2 border-b border-stone-200 bg-stone-50">
        <Btn label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}><Bold className="w-4 h-4" /></Btn>
        <Btn label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}><Italic className="w-4 h-4" /></Btn>
        <Btn label="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}><Strikethrough className="w-4 h-4" /></Btn>
        <span className="w-px bg-stone-300 mx-1" />
        <Btn label="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}><Heading2 className="w-4 h-4" /></Btn>
        <Btn label="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}><Heading3 className="w-4 h-4" /></Btn>
        <span className="w-px bg-stone-300 mx-1" />
        <Btn label="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}><List className="w-4 h-4" /></Btn>
        <Btn label="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}><ListOrdered className="w-4 h-4" /></Btn>
        <Btn label="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}><Quote className="w-4 h-4" /></Btn>
        <span className="w-px bg-stone-300 mx-1" />
        <Btn label="Image" onClick={addImage}><ImageIcon className="w-4 h-4" /></Btn>
        <Btn label="Link" onClick={addLink} active={editor.isActive("link")}><LinkIcon className="w-4 h-4" /></Btn>
        <Btn label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus className="w-4 h-4" /></Btn>
        <span className="w-px bg-stone-300 mx-1" />
        <Btn label="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo className="w-4 h-4" /></Btn>
        <Btn label="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo className="w-4 h-4" /></Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
