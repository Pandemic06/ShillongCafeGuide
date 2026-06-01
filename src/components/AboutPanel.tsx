import React, { useState } from "react";
import { Coffee, Shield, Eye, Heart, Anchor, Send } from "lucide-react";
import { motion } from "motion/react";

// @ts-expect-error - image asset import
import founderImage from "../assets/images/regenerated_image_1779950906461.jpg";

export default function AboutPanel() {
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formComment, setFormComment] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formComment) return;
    setFormSuccess(true);
    setFormName("");
    setFormEmail("");
    setFormComment("");
    setTimeout(() => setFormSuccess(false), 5000);
  };

  return (
    <div id="about-panel-container" className="space-y-12 max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center space-y-3">
        <span className="text-[11px] font-mono uppercase tracking-widest text-amber-805 text-amber-800 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          Our Chronicle
        </span>
        <h2 className="text-3xl font-display font-medium tracking-tight text-stone-900 sm:text-4.5xl leading-tight">
          The Story Behind the Map
        </h2>
        <p className="max-w-xl mx-auto text-sm text-stone-600 font-sans leading-relaxed">
          Born in Lummawbah as a way of holding on to the city beyond its postcards and polished lists, Shillong Cafe Map follows the cafés, the kitchens, the music, and the everyday places where Shillong quietly reveals itself to anyone patient enough to look.
        </p>
      </div>

      {/* Founder block */}
      <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch shadow-xs">
        {/* Founder image Left 5 */}
        <div className="md:col-span-5 relative h-64 md:h-auto min-h-[250px] bg-stone-100">
          <img
            src={founderImage}
            alt="Founder Ujjwal"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-stone-900/30" />
        </div>

        {/* Note Right 7 */}
        <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-center space-y-4">
          <span className="text-[10px] uppercase font-mono tracking-widest text-amber-800 font-bold">
            Founder's Note
          </span>
          <h3 className="font-display font-bold text-stone-900 text-lg">
            Ujjwal • "Keepers of the Hearth"
          </h3>
          <p className="text-stone-600 text-xs md:text-sm leading-relaxed font-sans font-light">
            "I built Shillong Cafe Map because the city I love was being flattened into top ten lists and star ratings when it deserves stories, small details and honest recommendations from someone who has actually sat in these cafés, stained their notebook with gravy and watched the fog roll past the windows"
          </p>
          <div className="pt-2">
            <p className="font-mono text-[10px] text-stone-400 font-bold uppercase">
              Shillong, Meghalaya • May 2026
            </p>
          </div>
        </div>
      </div>

      {/* Grid of philosophy pillar cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#FAF8F5] border border-stone-200/80 p-6 rounded-xl space-y-3">
          <div className="w-10 h-10 bg-amber-50 text-amber-800 rounded-lg flex items-center justify-center border border-amber-200 shadow-2xs">
            <Coffee className="w-5 h-5" />
          </div>
          <h4 className="font-display font-bold text-stone-900 text-sm">Friendly Companion</h4>
          <p className="text-xs text-stone-600 leading-relaxed font-sans font-light">
            We are your warm, cozy guide through the misty hills, sharing honest stories, quiet reflections, and helpful directions rather than robotic ratings.
          </p>
        </div>

        <div className="bg-[#FAF8F5] border border-stone-200/80 p-6 rounded-xl space-y-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-800 rounded-lg flex items-center justify-center border border-blue-200 shadow-2xs">
            <Shield className="w-5 h-5" />
          </div>
          <h4 className="font-display font-bold text-stone-900 text-sm">Cultural Roots</h4>
          <p className="text-xs text-stone-605 text-stone-500 leading-relaxed font-sans font-light">
            We document traditional Khasi food methods like Jadoh or Dohneiiong to help you appreciate the rich, delicious heritage of our heritage mountain-town.
          </p>
        </div>

        <div className="bg-[#FAF8F5] border border-stone-200/80 p-6 rounded-xl space-y-3">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-800 rounded-lg flex items-center justify-center border border-emerald-200 shadow-2xs">
            <Heart className="w-5 h-5" />
          </div>
          <h4 className="font-display font-bold text-stone-900 text-sm">Cozy Advisory</h4>
          <p className="text-xs text-stone-505 text-stone-500 leading-relaxed font-sans font-light">
            We match quiet corners to your mood, weather, or time of day—recommending the ideal cozy refuge to write, read, or simply let the rain pass slowly.
          </p>
        </div>
      </div>

      {/* Interactive Contact us inquiries form */}
      <div className="bg-stone-900 text-stone-100 p-8 rounded-2xl border border-stone-800 relative shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              Get in Touch
            </span>
            <h3 className="font-display font-bold text-xl text-stone-100 tracking-wide">
              Contribute to the Map
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed font-sans font-light">
              Do you know a secret wood-fired bakery in Mawlai, or a cozy guitar café in Sohryngkham? Drop us a line! We inspect and illustrative-draw every single recommendation by hand.
            </p>
            <div className="text-xs font-mono text-stone-400 space-y-1 pt-2">
              <p>Email: shillongcafemap@gmail.com</p>
              <p>Hearth: Lummawbah Shillong</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Name"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="bg-stone-800 border border-stone-700 text-stone-100 rounded-lg px-3.5 py-2.5 text-xs outline-none focus:border-amber-500"
              />
              <input
                type="email"
                placeholder="Email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="bg-stone-800 border border-stone-700 text-stone-100 rounded-lg px-3.5 py-2.5 text-xs outline-none focus:border-amber-500"
              />
            </div>
            <textarea
              placeholder="Tell us about the cozy spots or recipes..."
              rows={3}
              required
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              className="bg-stone-800 border border-stone-700 text-stone-100 rounded-lg px-3.5 py-2.5 text-xs outline-none focus:border-amber-500 w-full"
            />
            <button
              type="submit"
              className="bg-amber-800 hover:bg-amber-700 hover:text-white px-5 py-2.5 rounded-lg text-xs font-sans font-semibold transition-colors flex items-center gap-1.5 cursor-pointer justify-center select-none w-full"
            >
              <Send className="w-3.5 h-3.5" />
              Send Cozy Inquiries
            </button>

            {formSuccess && (
              <p className="text-xs text-green-400 font-mono text-center pt-2 font-bold">
                Khublei! We have received your query. Our local riders will explore it next rainy day!
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
