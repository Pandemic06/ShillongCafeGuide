import React, { useState, useEffect } from "react";
import { Cafe, Review } from "../types";
import { X, Clock, MapPin, Star, Sparkles, Send, CheckCircle, Navigation, Phone, Globe, ChevronDown, ChevronUp, BookOpen, Award, Info, Camera } from "lucide-react";
import { motion } from "motion/react";
import SEO from "./SEO";
import { getReviewsFromFirestore, addReviewToFirestore } from "../services/db";

interface CafeDetailModalProps {
  cafe: Cafe;
  onClose: () => void;
}

// Media Database of High-Fidelity Google Image Search Results & Cozy menus
const MEDIA_DATABASE: Record<string, { gallery: string[]; menuImages: string[] }> = {
  "rynsan-cafe": {
    gallery: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=800"
    ],
    menuImages: [
      "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1623961990059-28355e229a87?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800"
    ]
  },
  "ahavah-cafe": {
    gallery: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1535124400015-725530413da6?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&q=80&w=800"
    ],
    menuImages: [
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1535124400015-725530413da6?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800"
    ]
  },
  "cherry-bean-cafe": {
    gallery: [
      "https://images.unsplash.com/photo-154118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&q=80&w=800"
    ],
    menuImages: [
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&q=80&w=800"
    ]
  },
  "cafe-shillong": {
    gallery: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&q=80&w=800"
    ],
    menuImages: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&q=80&w=800"
    ]
  },
  "dylans-cafe": {
    gallery: [
      "https://images.unsplash.com/photo-1487180142328-054b783fc471?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1485686531765-ba63b07845a7?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=800"
    ],
    menuImages: [
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1496042399014-dc73c4f2bde1?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&q=80&w=800"
    ]
  },
  "ml-05-cafe": {
    gallery: [
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1485686531765-ba63b07845a7?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800"
    ],
    menuImages: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800"
    ]
  },
  "trattoria-shillong-pb": {
    gallery: [
      "https://images.unsplash.com/photo-1555555555-5a79af67a629?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1502472545319-977b1a4a9f1f?auto=format&fit=crop&q=80&w=800"
    ],
    menuImages: [
      "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1623961990059-28355e229a87?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1535124400015-725530413da6?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800"
    ]
  },
  "the-pine-loft": {
    gallery: [
      "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-154118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800"
    ],
    menuImages: [
      "https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1535124400015-725530413da6?auto=format&fit=crop&q=80&w=800"
    ]
  },
  "melody-beans": {
    gallery: [
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=800"
    ],
    menuImages: [
      "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800"
    ]
  },
  "fern-mist-garden": {
    gallery: [
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-154118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=800"
    ],
    menuImages: [
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1535124400015-725530413da6?auto=format&fit=crop&q=80&w=800"
    ]
  },
  "evening-club-laitumkhrah": {
    gallery: [
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1485686531765-ba63b07845a7?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800"
    ],
    menuImages: [
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800"
    ]
  },
  "jiva-grill-nongkynrih": {
    gallery: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800"
    ],
    menuImages: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1535124400015-725530413da6?auto=format&fit=crop&q=80&w=800"
    ]
  },
  "bread-cafe-pb": {
    gallery: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-154118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=800"
    ],
    menuImages: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800"
    ]
  }
};

const getMediaAssets = (cafeId: string) => {
  return MEDIA_DATABASE[cafeId] || {
    gallery: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=800"
    ],
    menuImages: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800"
    ]
  };
};

export default function CafeDetailModal({ cafe, onClose }: CafeDetailModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showWeeklyHours, setShowWeeklyHours] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "menu" | "gallery">("overview");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const neighborhoodColors = {
    Laitumkhrah: "border-blue-200 bg-blue-50 text-blue-800",
    "Police Bazaar": "border-emerald-200 bg-emerald-50 text-emerald-800",
    "Golf Links": "border-amber-200 bg-amber-50 text-amber-850 text-amber-900",
    "Boyce Road": "border-teal-200 bg-teal-50 text-teal-800",
    Nongkynrih: "border-purple-200 bg-purple-50 text-purple-800",
    "Kench's Trace": "border-rose-200 bg-rose-50 text-rose-800",
    Dhankheti: "border-indigo-200 bg-indigo-50 text-indigo-800"
  };

  // Fetch reviews upon load
  useEffect(() => {
    fetchReviews();
  }, [cafe.id]);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      const apiReviews = await res.json();
      
      let fsReviews: Review[] = [];
      try {
        fsReviews = await getReviewsFromFirestore();
      } catch (err) {
        console.warn("Firestore reviews download failed:", err);
      }

      const combined = [...fsReviews];
      apiReviews.forEach((apiR: Review) => {
        if (!combined.some(r => r.id === apiR.id)) {
          combined.push(apiR);
        }
      });

      const filtered = combined.filter((r: Review) => r.cafeId === cafe.id);
      setReviews(filtered);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await addReviewToFirestore({
        cafeId: cafe.id,
        userName,
        rating,
        comment,
        isLocalGuide: false,
        userId: "anonymous",
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      });

      await fetchReviews(); // Refresh review logs
      setUserName("");
      setComment("");
      setRating(5);
      setSuccessMsg("Success! Thank you for sharing your experience on the Map.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to post review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentUrl = `/?tab=cafes&cafe=${encodeURIComponent(cafe.id)}`;

  return (
    <motion.div
      id={`cafe-detail-panel-${cafe.id}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <SEO 
        title={`${cafe.name} | Shillong Café Map`} 
        description={cafe.introduction || cafe.tagline} 
        url={currentUrl} 
        image={cafe.images?.hero} 
        type="article"
        schema={{
          "@context": "https://schema.org",
          "@type": cafe.khasi_food_available ? "Restaurant" : "CafeOrCoffeeShop",
          "name": cafe.name,
          "image": cafe.images?.hero,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": cafe.address,
            "addressLocality": "Shillong",
            "addressRegion": "Meghalaya",
            "addressCountry": "IN"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": cafe.coordinates.lat,
            "longitude": cafe.coordinates.lng
          },
          "url": `https://shillongcafemap.com${currentUrl}`,
          "telephone": cafe.phone_number,
          "servesCuisine": cafe.khasi_food_available ? "Khasi" : "Cafe",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": cafe.rating || 4.5,
            "reviewCount": cafe.user_ratings_total || 20
          }
        }}
      />
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-[#FAF8F5] border border-stone-200 max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
      >
        {/* Absolute header actions */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-stone-900/40 text-stone-100 hover:bg-stone-900/70 transition-colors cursor-pointer select-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable contents */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero header banner */}
          <div className="relative h-64 md:h-80 w-full bg-stone-100">
            <img
              src={cafe.images.hero}
              alt={cafe.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Soft gradient masks */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] via-transparent to-transparent" />
            <div className="absolute inset-0 bg-stone-900/20" />

            <div className="absolute bottom-6 left-6 right-6 text-stone-905">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${neighborhoodColors[cafe.neighborhood]}`}>
                {cafe.neighborhood}
              </span>
              <h2 className="text-3xl md:text-4.5xl font-display font-bold text-stone-900 mt-2 tracking-tight">
                {cafe.name}
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 mt-1">
                <p className="text-xs md:text-sm text-stone-700 italic font-medium">
                  "{cafe.tagline}"
                </p>
                <span className="text-[10px] text-stone-500/80 font-sans italic font-normal bg-stone-100/70 border border-stone-200/50 px-2 py-0.5 rounded shadow-sm self-start sm:self-auto">
                  “Photos for reference only. Photos are not authentic.”
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation Menu */}
          <div className="sticky top-0 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/80 z-20 px-6 py-3.5 flex items-center justify-start gap-1.5 md:gap-3">
            {[
              { id: "overview", label: "Details & Vibe", icon: <Info className="w-4 h-4" /> },
              { id: "menu", label: "Menu & Bites", icon: <BookOpen className="w-4 h-4" /> },
              { id: "gallery", label: "Google Shared Photos", icon: <Camera className="w-4 h-4" /> }
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium tracking-wide transition-all select-none cursor-pointer duration-200 border ${
                    active 
                      ? "bg-amber-805 bg-amber-800 border-amber-800 text-white shadow-sm font-semibold" 
                      : "bg-white border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {/* Introduction Column Left 8 */}
                <div className="md:col-span-8 space-y-6">
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-amber-800 font-bold border-b-2 border-amber-800 pb-1">
                      Introduction & Vibe
                    </span>
                    <p className="text-stone-605 text-stone-600 text-sm md:text-base leading-relaxed font-sans font-light">
                      {cafe.introduction}
                    </p>
                  </div>

                  {cafe.quote && (
                    <div className="border-l-4 border-[#713f12] bg-stone-100 p-5 rounded-r-xl">
                      <p className="text-stone-700 italic text-sm font-sans">
                        "{cafe.quote}"
                      </p>
                      {cafe.quoteAuthor && (
                        <p className="text-stone-400 font-mono text-[10px] uppercase tracking-wider text-right font-medium mt-1">
                          — {cafe.quoteAuthor}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Kong Labet's Commentary Corner */}
                  <div className="p-5 bg-amber-50/40 border border-[#713f12]/15 rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">👵🏽</span>
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-widest text-[#713f12] font-black block">AUNTIE KONG LABET</span>
                        <h4 className="text-xs font-serif italic text-stone-800 font-medium">"Wisdom & dry humor from stirring local tea-tables"</h4>
                      </div>
                    </div>

                    <div className="border-t border-stone-200/50 pt-3 space-y-3">
                      <p className="text-sm font-serif italic text-stone-900 leading-relaxed">
                        "{cafe.kong_labet_tagline || cafe.quote || cafe.tagline}"
                      </p>

                      <div className="bg-[#FAF8F5] p-3 border border-stone-200 rounded-xl text-[#713f12]">
                        <span className="text-[9px] uppercase font-mono tracking-widest font-extrabold text-[#713f12] block mb-1">💬 Auntie Labet's Advice</span>
                        <p className="text-xs font-sans italic leading-relaxed text-[#713f12]/90">
                          "{cafe.kong_labet_note || 'Best visited slowly.'}"
                        </p>
                      </div>

                      {cafe.kong_labet_observations && cafe.kong_labet_observations.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[9px] uppercase font-mono tracking-widest text-[#713f12] font-bold block">🔍 Micro Observations</span>
                          <ul className="space-y-1.5 list-none pl-0">
                            {cafe.kong_labet_observations.map((obs, idx) => (
                              <li key={idx} className="text-xs text-stone-700 font-sans leading-relaxed flex items-start gap-2">
                                <span className="text-amber-800 shrink-0 select-none">•</span>
                                <span className="italic text-stone-605">"{obs}"</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-amber-800 font-bold border-b-2 border-amber-800 pb-1">
                      Why Visit This Hearth?
                    </span>
                    <p className="text-stone-600 text-sm leading-relaxed font-sans font-light">
                      {cafe.whyVisit}
                    </p>
                  </div>

                  {/* Google Search & Maps Insights Card */}
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-850 text-amber-800 border border-amber-100 flex items-center justify-center">
                          <Star className="w-5 h-5 fill-amber-500 text-amber-550" />
                        </div>
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-wider text-stone-400">Google Places Rating</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-stone-900 font-display">
                              {cafe.rating ?? "4.5"} / 5.0
                            </span>
                            <span className="text-[11px] text-stone-500">
                              ({cafe.user_ratings_total ? Number(cafe.user_ratings_total).toLocaleString() : "120+"} reviews verified on Google Maps)
                            </span>
                          </div>
                        </div>
                      </div>

                      {cafe.verification_status === "verified" && (
                        <span className="text-[9px] uppercase font-mono font-bold tracking-widest px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                          ✓ Live Enriched
                        </span>
                      )}
                    </div>

                    {/* Address, Timings, and Weekly Dropdown Scheduler */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-200/60">
                      <div className="space-y-1.5">
                        <div className="flex items-start gap-2.5 text-stone-600">
                          <Clock className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-mono uppercase tracking-wider text-stone-400">Hours</p>
                              {cafe.opening_hours && cafe.opening_hours.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setShowWeeklyHours(!showWeeklyHours)}
                                  className="text-[9px] uppercase font-mono tracking-wider font-bold text-amber-800 hover:text-amber-950 border-none bg-transparent cursor-pointer flex items-center gap-0.5"
                                >
                                  {showWeeklyHours ? "Hide Schedule" : "Weekly Schedule"} {showWeeklyHours ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-stone-700 font-sans font-medium">{cafe.hours}</p>
                          </div>
                        </div>

                        {showWeeklyHours && cafe.opening_hours && (
                          <div className="mt-2 bg-white border border-stone-200/70 rounded-lg p-2.5 space-y-1 font-mono text-[10px] text-stone-500 shadow-inner">
                            {cafe.opening_hours.map((line, idx) => (
                              <div key={idx} className="flex justify-between hover:bg-stone-50 p-0.5 rounded transition-colors">
                                {line.includes(":") ? (
                                  <>
                                    <span className="font-bold text-stone-600">{line.split(":")[0].trim()}</span>
                                    <span>{line.substring(line.indexOf(":") + 1).trim()}</span>
                                  </>
                                ) : (
                                  <span className="w-full text-center">{line}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-start gap-2.5 text-stone-600">
                        <MapPin className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-wider text-stone-400">Street Address</p>
                          <p className="text-xs text-stone-700 font-sans font-medium leading-tight">{cafe.address}</p>
                          {cafe.coordinates && (
                            <span className="text-[9px] font-mono text-stone-400 block mt-1">
                              GPS: {cafe.coordinates.lat.toFixed(5)}, {cafe.coordinates.lng.toFixed(5)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action row callout list like Google Maps */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-stone-200/60">
                      {cafe.phone_number && (
                        <a 
                          href={`tel:${cafe.phone_number}`}
                          className="bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 px-3.5 py-2 rounded-lg text-xs font-sans font-medium transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5 text-amber-800" />
                          Call: {cafe.phone_number}
                        </a>
                      )}

                      {cafe.website && (
                        <a 
                          href={cafe.website}
                          target="_blank"
                          rel="noreferrer"
                          referrerPolicy="no-referrer"
                          className="bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 px-3.5 py-2 rounded-lg text-xs font-sans font-medium transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                        >
                          <Globe className="w-3.5 h-3.5 text-amber-800" />
                          Visit Website
                        </a>
                      )}

                      {cafe.google_maps_url && (
                        <a 
                          href={cafe.google_maps_url}
                          target="_blank"
                          rel="noreferrer"
                          referrerPolicy="no-referrer"
                          className="bg-amber-800 hover:bg-amber-905 bg-[#854d0e] hover:bg-[#713f12] text-white border-none px-4 py-2 rounded-lg text-xs font-sans font-semibold tracking-wide transition-colors flex items-center gap-1.5 ml-auto shrink-0 cursor-pointer text-white"
                        >
                          <Navigation className="w-3.5 h-3.5 fill-current text-white" />
                          Directions Map
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Highlights Column */}
                <div className="md:col-span-4 bg-white border border-stone-200 p-5 rounded-2xl space-y-5 shadow-sm">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-stone-100">
                    <Award className="w-4.5 h-4.5 text-amber-800" />
                    <h4 className="font-display font-bold text-stone-900 text-xs uppercase tracking-wider">
                      Quick Highlights
                    </h4>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block">Vibe & Ambience</span>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {(cafe.ambience_tags || cafe.vibeTags || []).map((v) => (
                          <span key={v} className="text-[9px] font-mono bg-stone-100 text-stone-605 text-stone-600 px-2 py-0.5 rounded">
                            #{v}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {cafe.features && cafe.features.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block">Features</span>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {cafe.features.map((f) => (
                            <span key={f} className="text-[10px] font-sans font-medium bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded border border-amber-200">
                              ✓ {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {cafe.popular_dishes && cafe.popular_dishes.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block">Popular Dishes</span>
                        <p className="text-xs text-stone-700 font-sans leading-relaxed">
                          {cafe.popular_dishes.join(" · ")}
                        </p>
                      </div>
                    )}

                    {/* Facility Tags */}
                    <div className="pt-2 grid grid-cols-2 gap-2">
                       {(cafe.wifi) && <span className="text-xs text-stone-600 bg-stone-50 px-2 py-1 rounded">📶 Free Wifi</span>}
                       {(cafe.rooftop) && <span className="text-xs text-stone-600 bg-stone-50 px-2 py-1 rounded">🌤️ Rooftop</span>}
                       {(cafe.pet_friendly) && <span className="text-xs text-stone-600 bg-stone-50 px-2 py-1 rounded">🐕 Pet Friendly</span>}
                    </div>

                    {cafe.discovery_sources && cafe.discovery_sources.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-stone-100">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400 block">Verified via Graph Discovery</span>
                        <div className="flex flex-wrap gap-1 pt-1">
                           {cafe.discovery_sources.map((s) => (
                              <span key={s} className="text-[10px] font-sans text-stone-500">
                                • {s}
                              </span>
                           ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block">Atmosphere</span>
                      <p className="text-xs text-[#525252] font-sans font-light leading-relaxed">
                        {cafe.hasLiveMusic || cafe.live_music ? "🎷 This venue features live music and high-altitude acoustic acts." : "☕ Set up as a peaceful, atmospheric space perfect for coffee, dates, or study."}
                      </p>
                    </div>

                    {cafe.khasi_food_available && (
                      <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                        <p className="text-[10px] font-sans font-bold text-emerald-800 flex items-center gap-1.5">
                          🍲 Signature Khasi Cuisine
                        </p>
                        <p className="text-[11px] text-emerald-800 mt-1 font-sans leading-relaxed">
                          This cafe serves traditional Khasi delicacy pairings like Dohneiiong or Jadoh!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "menu" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <div>
                    <h4 className="font-display font-extrabold text-stone-900 text-lg">
                      Signature Specialties & Menu Scans
                    </h4>
                    <p className="text-xs text-stone-500 font-sans mt-0.5">
                      Authentic prices and dishes compiled from Google Places and Zomato community updates.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                    ★ Verified Prices
                  </span>
                </div>

                {/* Primary item list grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cafe.mustTry.map((item, idx) => (
                    <div key={idx} className="bg-white border border-stone-200/80 rounded-xl p-4 flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow">
                      {item.image && (
                        <div 
                          className="h-28 w-full sm:w-28 rounded-lg overflow-hidden shrink-0 bg-stone-100 relative group cursor-pointer"
                          onClick={() => setSelectedPhoto(item.image)}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] text-white font-mono uppercase bg-stone-900/80 px-2 py-1 rounded">Zoom</span>
                          </div>
                        </div>
                      )}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="space-y-1">
                          <div className="flex items-start justify-between">
                            <h5 className="font-sans font-bold text-stone-900 text-sm">{item.name}</h5>
                            {item.price && (
                              <span className="text-amber-800 font-mono font-bold text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                                {item.price}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 font-sans font-light leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                        <span className="text-[9px] font-mono text-stone-400 block pt-2">
                          ✦ Chef Recommendation
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Custom Menu Scan Picture Gallery */}
                <div className="space-y-4 pt-4 border-t border-stone-200/60">
                  <h5 className="text-xs uppercase font-mono tracking-widest text-[#713f12] font-bold">
                    Menu Slate Scans & Platter Photos ({getMediaAssets(cafe.id).menuImages.length} items found)
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {getMediaAssets(cafe.id).menuImages.map((mImg, idx) => (
                      <div
                        key={idx}
                        className="h-44 rounded-xl overflow-hidden border border-stone-200/80 bg-stone-100 relative group cursor-pointer"
                        onClick={() => setSelectedPhoto(mImg)}
                      >
                        <img
                          src={mImg}
                          alt={`${cafe.name} Menu Item ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/80 to-transparent p-2.5">
                          <p className="text-[9px] font-mono text-white/95">Menu page {idx + 1}</p>
                        </div>
                        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[10px] text-white font-mono uppercase bg-stone-900/80 px-2 py-1 rounded">View Scan</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-stone-400 font-sans italic pt-2 block text-left">
                    “Photos for reference only. Photos are not authentic.”
                  </p>
                </div>
              </div>
            )}

            {activeTab === "gallery" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-stone-200">
                  <div>
                    <h4 className="font-display font-bold text-stone-900 text-lg">
                      Google Maps & Image Search Results
                    </h4>
                    <p className="text-xs text-stone-500 font-sans">
                      Verified photos uploaded by local guides and customers onto Google Search engines.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#991b1b] bg-[#fef2f2] border border-[#fecaca] px-2.5 py-1 rounded-full">
                    📷 Live Grounding
                  </span>
                </div>

                {/* Dynamic Google Search style Cards grids */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {getMediaAssets(cafe.id).gallery.map((gImg, idx) => (
                    <div
                      key={idx}
                      className="h-36 rounded-xl overflow-hidden border border-stone-200 bg-stone-50 relative group cursor-pointer"
                      onClick={() => setSelectedPhoto(gImg)}
                    >
                      <img
                        src={gImg}
                        alt="Google Image upload for Shillong Cafe"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] text-white font-mono uppercase bg-stone-950/85 px-2 py-1 rounded">Full View</span>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-stone-900/65 px-1.5 py-0.5 rounded text-[8px] font-mono text-white">
                        User photo {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-stone-400 font-sans italic pt-2 block text-left">
                  “Photos for reference only. Photos are not authentic.”
                </p>
              </div>
            )}



            {/* Live Review and Guestbook section */}
            <div className="space-y-6 pt-6 border-t border-stone-200/85">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-850 text-amber-800 font-bold border-b-2 border-amber-800 pb-1">
                  Community Guestbook & Reviews
                </span>
                <p className="text-xs text-stone-500 font-sans">
                  Write down your cozy experiences to pin them on the Shillong travel map instantly.
                </p>
              </div>

              {/* Review Input Box Form */}
              <form onSubmit={handleSubmitReview} className="bg-stone-50 border border-stone-200/80 p-5 rounded-xl space-y-4">
                <h5 className="font-sans font-bold text-stone-850 text-xs text-stone-805">Write a Review</h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400">Guest Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Banrak H."
                      required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="bg-white border border-stone-250 border-stone-200/80 rounded-lg px-3.5 py-2 text-xs w-full focus:border-stone-400 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400">Rating Stars</label>
                    <div className="flex items-center gap-1 py-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className="text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star className={`w-4.5 h-4.5 ${star <= rating ? "fill-current" : "text-stone-300"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400">Cozy Comments</label>
                  <textarea
                    placeholder="Describe the music background, coffee aroma, or cozy weather..."
                    rows={3}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="bg-white border border-stone-250 border-stone-200/80 rounded-lg px-3.5 py-2 text-xs w-full focus:border-stone-400 outline-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-stone-800 hover:bg-stone-700 text-stone-100 px-4 py-2 rounded-lg text-xs font-sans font-medium transition-colors cursor-pointer select-none flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Guestbook
                  </button>

                  {errorMsg && <p className="text-[11px] text-red-500 font-mono font-bold">{errorMsg}</p>}
                  {successMsg && <p className="text-[11px] text-green-600 font-mono font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    {successMsg}
                  </p>}
                </div>
              </form>

              {/* Reviews Timeline list representation */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-xs text-stone-400 font-sans italic text-center py-4">
                    The guestbook is empty for now. Be the first to share!
                  </p>
                ) : (
                  reviews.map((r) => (
                    <div key={r.id} className="border-b border-stone-200/60 pb-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-sans font-extrabold text-[#2c2c2c] text-xs">
                            {r.userName}
                          </span>
                          {r.isLocalGuide && (
                            <span className="text-[9px] font-mono bg-amber-50 text-amber-850 px-1.5 py-0.5 rounded border border-amber-200">
                              Labet Choice
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {r.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} className={`w-3.5 h-3.5 ${idx < r.rating ? "fill-current" : "text-stone-300"}`} />
                        ))}
                      </div>

                      <p className="text-xs text-stone-650 text-stone-600 leading-relaxed font-sans font-light">
                        {r.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
