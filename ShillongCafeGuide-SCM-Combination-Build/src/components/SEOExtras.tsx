import React from "react";

/**
 * Compact, design-aligned FAQ block using native <details><summary>.
 * Native semantics: collapsible, accessible, indexed by Google.
 * Companion JSON-LD FAQPage schema emitted via the parent SEO component
 * (pass the same items via SEO `schema` prop).
 */
export interface FAQItem {
  q: string;
  a: string;
}

export function FAQBlock({ items, title = "Frequently asked" }: { items: FAQItem[]; title?: string }) {
  if (!items?.length) return null;
  return (
    <section
      aria-labelledby="faq-heading"
      className="mt-12 mb-6 bg-[#FAF8F5] border border-stone-200 rounded-2xl p-6 md:p-8 max-w-4xl mx-auto"
    >
      <p className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold mb-3">
        Reader Questions
      </p>
      <h2
        id="faq-heading"
        className="text-xl md:text-2xl font-display font-medium text-stone-900 mb-5"
      >
        {title}
      </h2>
      <div className="divide-y divide-stone-200/80">
        {items.map((item, i) => (
          <details key={i} className="group py-3">
            <summary className="cursor-pointer list-none flex items-start justify-between gap-3 text-sm font-sans font-medium text-stone-800 hover:text-amber-800 transition-colors">
              <span>{item.q}</span>
              <span className="text-stone-400 text-xs font-mono shrink-0 mt-1 group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="mt-2 text-sm text-stone-600 font-sans leading-relaxed pr-8">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function faqPageSchema(items: FAQItem[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

/**
 * Crawlable companion text for an interactive module (map / planner).
 * Renders as a small editorial aside under the visual block so Google sees
 * the topic, the included neighborhoods/categories/cafés, and the user
 * intent the module serves — without breaking the visual rhythm.
 */
export function ModuleSummary({
  topic,
  body,
  links,
}: {
  topic: string;
  body: string;
  links?: { label: string; href?: string; onClick?: () => void }[];
}) {
  return (
    <aside className="mt-4 mb-2 text-xs text-stone-500 font-sans leading-relaxed max-w-3xl mx-auto px-4">
      <p>
        <span className="text-stone-700 font-semibold">{topic}.</span> {body}
      </p>
      {links && links.length > 0 && (
        <p className="mt-2">
          {links.map((l, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-stone-300"> · </span>}
              {l.href ? (
                <a href={l.href} className="text-amber-700 hover:text-amber-900 underline decoration-amber-300/60 underline-offset-2">
                  {l.label}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={l.onClick}
                  className="text-amber-700 hover:text-amber-900 underline decoration-amber-300/60 underline-offset-2 bg-transparent border-0 p-0 cursor-pointer font-sans text-xs"
                >
                  {l.label}
                </button>
              )}
            </React.Fragment>
          ))}
        </p>
      )}
    </aside>
  );
}
