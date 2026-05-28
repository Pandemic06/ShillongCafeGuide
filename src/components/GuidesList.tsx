import React, { useState } from "react";
import { ARTICLES } from "../data";
import { GuideArticle } from "../types";
import { BookOpen, Calendar, Mail, ArrowLeft, ArrowUpRight, Compass, Filter } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function GuidesList() {
  const [selectedArticle, setSelectedArticle] = useState<GuideArticle | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);

  const categories = [
    { key: "all", label: "All Stories" },
    { key: "culture", label: "Local Culture" },
    { key: "reviews", label: "Reviews" },
    { key: "area-guides", label: "Area Walks" }
  ];

  const filteredArticles = activeCategory === "all"
    ? ARTICLES
    : ARTICLES.filter((a) => a.category === activeCategory);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberEmail.trim()) return;
    setSubscriptionSuccess(true);
    setSubscriberEmail("");
    setTimeout(() => setSubscriptionSuccess(false), 5000);
  };

  return (
    <div id="guides-tab-layout" className="space-y-12 max-w-5xl mx-auto">
      <AnimatePresence mode="wait">
        {selectedArticle ? (
          /* FULL ARTICLE VIEW */
          <motion.div
            key="article-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="max-w-3xl mx-auto space-y-8"
          >
            {/* Back Button */}
            <button
              onClick={() => setSelectedArticle(null)}
              className="inline-flex items-center gap-2 text-xs font-sans font-medium text-stone-600 hover:text-amber-800 transition-colors uppercase tracking-wider cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Editorial Stories
            </button>

            {/* Article Header */}
            <div className="space-y-4">
              <span className="inline-block text-[10px] font-mono tracking-widest text-amber-800 uppercase font-bold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                {selectedArticle.category.replace("-", " ")}
              </span>
              <h1 className="text-3xl md:text-5xl font-display font-bold text-stone-900 tracking-tight leading-tight">
                {selectedArticle.title}
              </h1>

              <div className="flex flex-wrap gap-4 items-center text-xs text-stone-550 font-mono py-2 border-y border-stone-200">
                <span>By {selectedArticle.author}</span>
                <span className="text-stone-300">•</span>
                <span>{selectedArticle.date}</span>
                <span className="text-stone-300">•</span>
                <span>{selectedArticle.readTime}</span>
              </div>
            </div>

            {/* Banner Image */}
            <div className="h-96 w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Article Content Layout */}
            <div className="prose prose-stone max-w-none text-stone-800 font-sans text-sm md:text-base leading-relaxed font-light space-y-6">
              {/* Parse paragraph strings formatted as markdown */}
              {selectedArticle.content.split("\n\n").map((para, idx) => {
                const trimmed = para.trim();
                if (!trimmed) return null;

                // Simple custom parsing matching standard headers markdown patterns
                if (trimmed.startsWith("# ")) {
                  return (
                    <h2 key={idx} className="text-2xl mt-8 font-display font-bold text-stone-900">
                      {trimmed.replace("# ", "")}
                    </h2>
                  );
                }
                if (trimmed.startsWith("### ")) {
                  return (
                    <h3 key={idx} className="text-md mt-6 font-display font-bold text-stone-900 uppercase tracking-wide">
                      {trimmed.replace("### ", "")}
                    </h3>
                  );
                }
                return (
                  <p key={idx} className="first-letter:font-serif first-letter:text-lg">
                    {trimmed}
                  </p>
                );
              })}
            </div>

            {/* Curated quote bottom box */}
            <div className="bg-[#FAF8F5] border-l-4 border-amber-800 p-6 rounded-r-2xl font-sans text-xs italic text-stone-600">
              Thank you for supporting Shillong's local independent storytelling. This article was originally written in the clouds above Laitumkhrah.
            </div>
          </motion.div>
        ) : (
          /* GENERAL EDITORIAL GRID LIST */
          <motion.div
            key="stories-grid-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            {/* Header */}
            <div className="text-center space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-800 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Local Periodicals
              </span>
              <h2 className="text-3xl font-display font-medium tracking-tight text-stone-900 sm:text-4.5xl animate-fade-in">
                Shillong Editorial & Guides
              </h2>
              <p className="max-w-2xl mx-auto text-sm text-stone-600 font-sans leading-relaxed">
                Read deep narratives about our unique rain culture, high-altitude organic coffee, cozy heritage bakers, and regional music scenes.
              </p>
            </div>

            {/* Filters chips */}
            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
              {categories.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setActiveCategory(c.key)}
                  className={`px-3.5 py-1.5 rounded-full border text-xs tracking-wide font-sans font-medium transition-all duration-300 cursor-pointer ${
                    activeCategory === c.key
                      ? "bg-amber-800 text-stone-100 border-amber-800"
                      : "bg-[#FAF8F5] border-stone-200 text-stone-600 hover:border-stone-400"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Articles List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-2">
              {filteredArticles.map((article) => (
                <div
                  id={`article-card-${article.id}`}
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="flex flex-col justify-between bg-[#FAF8F5] border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                >
                  <div className="h-52 w-full overflow-hidden bg-stone-100">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="inline-block text-[10px] uppercase tracking-wider font-mono text-amber-805 text-amber-800 font-bold">
                          {article.category.replace("-", " ")}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono italic">
                          {article.readTime}
                        </span>
                      </div>

                      <h3 className="text-lg font-display font-bold text-stone-900 group-hover:text-amber-800 leading-snug transition-colors">
                        {article.title}
                      </h3>

                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-sans font-light">
                        {article.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-200/50 flex items-center justify-between text-stone-500">
                      <span className="text-[10px] font-mono text-stone-400">By {article.author}</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-amber-800 group-hover:underline">
                        Read Story
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Beautiful, atmospheric Newsletter sign-up block */}
            <div className="bg-stone-900 text-stone-100 p-8 rounded-2xl border border-stone-800 text-center space-y-6 max-w-2xl mx-auto shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none transform translate-x-12 -translate-y-12">
                <BookOpen className="w-32 h-32 text-amber-500" />
              </div>

              <div className="space-y-2">
                <h4 className="text-amber-400 font-display font-bold text-md tracking-wide">
                  Join the Cozy Editorial Gazette
                </h4>
                <p className="text-xs text-stone-300 max-w-md mx-auto leading-relaxed font-sans font-light">
                  Subscribe to receive beautiful, curated notes about hidden bakeries, record stores, and coffee harvests, delivered as the mist sets over Meghalaya.
                </p>
              </div>

              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto justify-center">
                <input
                  type="email"
                  placeholder="Your misty afternoon email..."
                  required
                  value={subscriberEmail}
                  onChange={(e) => setSubscriberEmail(e.target.value)}
                  className="bg-stone-800 border border-stone-700 text-stone-100 rounded-lg px-4 py-2.5 text-xs outline-none focus:border-amber-500 flex-1"
                />
                <button
                  type="submit"
                  className="bg-amber-850 hover:bg-amber-800 bg-amber-800 hover:text-white px-5 py-2.5 rounded-lg text-xs font-sans font-semibold transition-colors flex items-center gap-1.5 cursor-pointer justify-center select-none"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Subscribe News
                </button>
              </form>

              {subscriptionSuccess && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-green-400 font-mono font-bold"
                >
                  Success! Khublei! You will receive your misty morning gazette soon.
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
