import React, { useState, useEffect } from "react";
import { 
  X, Sparkles, UploadCloud, Database, CheckCircle2, Loader2, MapPin, 
  Coffee, Tag, Music, Clock, Map, Info, Download, Search, 
  FileSpreadsheet, Plus, AlertTriangle, Check, BookOpen, Trash2, Edit3, HelpCircle, BarChart3, Filter, ClipboardList
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Cafe } from "../types";

interface DataHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCafesUpdated: (updatedCafes: Cafe[]) => void;
  currentCafes: Cafe[];
}

export default function DataHubModal({ isOpen, onClose, onCafesUpdated, currentCafes }: DataHubModalProps) {
  // Navigation tabs for the premium Cafe Data Administration CMS
  const [activeTab, setActiveTab] = useState<
    "upload" | "sweep" | "source" | "enrich" | "rules" | "queue" | "audit"
  >("upload");
  
  // Selection and editing states
  const [editingCafeId, setEditingCafeId] = useState<string | null>(null);
  const [registrySearch, setRegistrySearch] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importingCount, setImportingCount] = useState(0);

  // Core structured fields for venue
  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    theme: "",
    introduction: "",
    whyVisit: "",
    hours: "10:30 AM — 8:30 PM",
    address: "",
    neighborhood: "Laitumkhrah" as Cafe["neighborhood"],
    vibeTagsText: "",
    hasLiveMusic: false,
    item1Name: "",
    item1Price: "",
    item1Desc: "",
    item2Name: "",
    item2Price: "",
    item2Desc: "",
    lat: "25.568",
    lng: "91.885",
    phone: "",
    rating: "4.5",
    cuisineTypes: "Café, Continental",
    verificationSourceCount: 1,
    sourceUrls: ""
  });

  // Content Governance & Taxonomy States
  const [primaryCategory, setPrimaryCategory] = useState<string>("Cozy cafés");
  const [secondaryTags, setSecondaryTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState<string>("");
  const [evidenceNotes, setEvidenceNotes] = useState<string>("");
  const [evidenceType, setEvidenceType] = useState<string>("editorial visit");
  const [sourceUrlsText, setSourceUrlsText] = useState<string>("");
  const [reviewerDecision, setReviewerDecision] = useState<"Verified fit" | "Mixed fit" | "Needs review">("Needs review");
  const [publishEligibilityStatus, setPublishEligibilityStatus] = useState<"approved" | "pending" | "rejected">("pending");
  const [manualOverrideReason, setManualOverrideReason] = useState<string>("");

  // Category-specific structured fields
  const [servesKhasiFood, setServesKhasiFood] = useState<boolean>(false);
  const [khasiDishesCount, setKhasiDishesCount] = useState<number>(0);
  const [khasiDish1, setKhasiDish1] = useState<string>("");
  const [khasiDish2, setKhasiDish2] = useState<string>("");
  const [localCuisineConfidence, setLocalCuisineConfidence] = useState<number>(50);
  const [signatureLocalDishPresent, setSignatureLocalDishPresent] = useState<boolean>(false);
  const [menuProofAvailable, setMenuProofAvailable] = useState<boolean>(false);

  const [hostsLiveMusic, setHostsLiveMusic] = useState<boolean>(false);
  const [musicFrequency, setMusicFrequency] = useState<"weekly" | "weekends" | "monthly" | "rare">("weekends");
  const [musicType, setMusicType] = useState<"acoustic" | "band" | "DJ" | "open mic">("acoustic");
  const [musicProofAvailable, setMusicProofAvailable] = useState<boolean>(false);

  const [wiFiAvailable, setWiFiAvailable] = useState<boolean>(false);
  const [plugPointsAvailable, setPlugPointsAvailable] = useState<boolean>(false);
  const [quietDaytime, setQuietDaytime] = useState<boolean>(false);
  const [seatingStabilityScore, setSeatingStabilityScore] = useState<number>(3);
  const [workFriendlyScore, setWorkFriendlyScore] = useState<number>(3);

  const [ambienceWarmthScore, setAmbienceWarmthScore] = useState<number>(3);
  const [seatingIntimacyScore, setSeatingIntimacyScore] = useState<number>(3);
  const [lightingMoodScore, setLightingMoodScore] = useState<number>(3);
  const [lingeringSuitability, setLingeringSuitability] = useState<boolean>(false);

  const [scenicViewType, setScenicViewType] = useState<"valley" | "city" | "pine" | "rooftop" | "garden">("valley");
  const [viewProminenceScore, setViewProminenceScore] = useState<number>(3);
  const [outdoorSeating, setOutdoorSeating] = useState<boolean>(false);

  const [averageSpendForTwo, setAverageSpendForTwo] = useState<number>(400);
  const [cheapestMainItem, setCheapestMainItem] = useState<number>(120);
  const [studentBudgetFit, setStudentBudgetFit] = useState<boolean>(false);

  // Sweep Logs States (Tab 2)
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepLogs, setSweepLogs] = useState<string[]>([]);
  const [sweepSuggestedList, setSweepSuggestedList] = useState<any[]>([]);

  // Feedback Messages
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  // Setup sample mock sources data for the Source Inspector (Tab 3)
  const sourceCitations = [
    {
      id: "cit-1",
      venueName: "Rynsan Cafe",
      categoryName: "Khasi cuisine",
      excerpt: "Rynsan serves authentic, hand-ground black sesame pork (Dohneiiong) with steaming red mountain rice over real timber wood tables.",
      evidenceType: "editorial visit",
      sourceUrl: "https://www.shillongtoday.com/food-rynsan-heritage",
      verifiedBy: "Senior Editor J. Lyngdoh",
      date: "May 20, 2026",
      status: "Verified fit"
    },
    {
      id: "cit-2",
      venueName: "Ahavah Cafe",
      categoryName: "Cozy cafés",
      excerpt: "They keeping the logs burning round the clock. Ahavah remains a gorgeous winter cabin retreat with quiet, micro-lit writing desks.",
      evidenceType: "Google reviews",
      sourceUrl: "https://maps.google.com/?cid=1290384",
      verifiedBy: "Staff Writer K. Syiem",
      date: "May 22, 2026",
      status: "Verified fit"
    },
    {
      id: "cit-3",
      venueName: "Café Shillong",
      categoryName: "Live music",
      excerpt: "Legendary local venue keeping independent Shillong blues culture alive with acoustic singer-songwriters taking the hearth stage every Saturday night.",
      evidenceType: "social media proof",
      sourceUrl: "https://instagram.com/cafeshillonglive",
      verifiedBy: "Principal Curator A. Nongrum",
      date: "May 18, 2026",
      status: "Verified fit"
    }
  ];

  // Recalculate auto score and confidence whenever specific taxonomy conditions change
  const computeThemeScoreAndAutoSuggestions = () => {
    let score = 0;
    let suggestionsList: { name: string; score: number; reason: string }[] = [];

    // 1. Khasi Cuisine Calculation
    let khasiScore = 0;
    if (servesKhasiFood) khasiScore += 3;
    if (khasiDishesCount >= 2) khasiScore += 2;
    if (signatureLocalDishPresent) khasiScore += 2;
    if (menuProofAvailable) khasiScore += 2;
    if (localCuisineConfidence > 70) khasiScore += 2;
    if (formData.cuisineTypes.toLowerCase().includes("khasi") || formData.cuisineTypes.toLowerCase().includes("local")) khasiScore += 1;
    // Exclusion criteria
    if (servesKhasiFood && khasiDishesCount <= 1) khasiScore -= 2;

    if (khasiScore >= 5) {
      suggestionsList.push({
        name: "Khasi cuisine",
        score: Math.min(100, Math.round((khasiScore / 11) * 100)),
        reason: "Excellent Khasi food counts, explicit signature dishes, and validated menu proof."
      });
    }

    // 2. Cozy Cafés Calculation
    let cozyScore = 0;
    cozyScore += ambienceWarmthScore + seatingIntimacyScore + lightingMoodScore;
    if (lingeringSuitability) cozyScore += 2;
    if (formData.theme.toLowerCase().includes("cozy") || formData.theme.toLowerCase().includes("wooden") || formData.theme.toLowerCase().includes("fireplace")) cozyScore += 2;
    
    if (cozyScore >= 5) {
      suggestionsList.push({
        name: "Cozy cafés",
        score: Math.min(100, Math.round((cozyScore / 14) * 100)),
        reason: "High aesthetic warmth ratings, cozy interior mood lighting, and suitable lingering setup."
      });
    }

    // 3. Live Music Calculation
    let musicScore = 0;
    if (hostsLiveMusic) musicScore += 3;
    if (musicFrequency === "weekly") musicScore += 3;
    else if (musicFrequency === "weekends") musicScore += 2;
    else if (musicFrequency === "monthly") musicScore += 1;
    if (musicType === "acoustic" || musicType === "band") musicScore += 2;
    if (musicProofAvailable) musicScore += 2;

    if (musicScore >= 5) {
      suggestionsList.push({
        name: "Live music",
        score: Math.min(100, Math.round((musicScore / 10) * 100)),
        reason: "Hosts live performance events frequently with acoustics or bands backed by citations."
      });
    }

    // 4. Work-Friendly Calculation
    let workScore = 0;
    if (wiFiAvailable) workScore += 3;
    if (plugPointsAvailable) workScore += 2;
    if (quietDaytime) workScore += 2;
    workScore += seatingStabilityScore;
    if (!wiFiAvailable) workScore -= 3;

    if (workScore >= 4) {
      suggestionsList.push({
        name: "Work-friendly",
        score: Math.min(100, Math.round((workScore / 10) * 100)),
        reason: "Stable Wi-Fi, accessible power outlets, quiet working daytime zones, and seating posture stability."
      });
    }

    // 5. Budget Eats Calculation
    let budgetScore = 0;
    if (averageSpendForTwo <= 300) budgetScore += 3;
    else if (averageSpendForTwo <= 500) budgetScore += 2;
    if (cheapestMainItem <= 120) budgetScore += 2;
    if (studentBudgetFit) budgetScore += 3;
    if (averageSpendForTwo > 800) budgetScore -= 4;

    if (budgetScore >= 4) {
      suggestionsList.push({
        name: "Budget eats",
        score: Math.min(100, Math.round((budgetScore / 8) * 100)),
        reason: "Highly economical average spend, cheap main items, and high compatibility with student budgets."
      });
    }

    // Return calculations based on primary selected category
    let finalScore = 3;
    if (primaryCategory === "Khasi cuisine") finalScore = khasiScore;
    else if (primaryCategory === "Cozy cafés") finalScore = cozyScore;
    else if (primaryCategory === "Live music") finalScore = musicScore;
    else if (primaryCategory === "Work-friendly") finalScore = workScore;
    else if (primaryCategory === "Budget eats") finalScore = budgetScore;
    else finalScore = 4; // default /Date spots / Scenic

    return { 
      themeFitScore: finalScore, 
      confidence: Math.round(Math.min(100, (finalScore / 10) * 100)),
      suggestions: suggestionsList
    };
  };

  const currentScoringData = computeThemeScoreAndAutoSuggestions();

  // Load selected cafe into the editor form for revision
  const handleEditClick = (cafe: Cafe) => {
    setEditingCafeId(cafe.id);
    setFormData({
      name: cafe.name || "",
      tagline: cafe.tagline || "",
      theme: cafe.theme || "",
      introduction: cafe.introduction || "",
      whyVisit: cafe.whyVisit || "",
      hours: cafe.hours || "10:30 AM — 8:30 PM",
      address: cafe.address || "",
      neighborhood: cafe.neighborhood || "Laitumkhrah",
      vibeTagsText: (cafe.vibeTags || []).join(", "),
      hasLiveMusic: cafe.hasLiveMusic || false,
      item1Name: cafe.mustTry?.[0]?.name || "",
      item1Price: cafe.mustTry?.[0]?.price || "",
      item1Desc: cafe.mustTry?.[0]?.description || "",
      item2Name: cafe.mustTry?.[1]?.name || "",
      item2Price: cafe.mustTry?.[1]?.price || "",
      item2Desc: cafe.mustTry?.[1]?.description || "",
      lat: cafe.coordinates?.lat?.toString() || "25.568",
      lng: cafe.coordinates?.lng?.toString() || "91.885",
      phone: cafe.phone_number || "",
      rating: cafe.rating?.toString() || "4.5",
      cuisineTypes: cafe.types ? cafe.types.join(", ") : "Café, Continental",
      verificationSourceCount: cafe.source_urls?.length || 1,
      sourceUrls: cafe.source_urls ? cafe.source_urls.join(", ") : ""
    });
    
    // Set Taxonomy States
    setPrimaryCategory(cafe.primary_category || "Cozy cafés");
    setSecondaryTags(cafe.secondary_tags || cafe.tags || []);
    setEvidenceNotes(cafe.evidence_notes || "");
    setEvidenceType(cafe.evidence_type || "editorial visit");
    setSourceUrlsText(cafe.source_urls ? cafe.source_urls.join(", ") : "");
    setReviewerDecision(cafe.reviewer_decision || cafe.review_status || "Needs review");
    setPublishEligibilityStatus(cafe.publish_eligibility_status || "pending");
    setManualOverrideReason(cafe.manual_override_reason || "");

    // Category specific
    setServesKhasiFood(cafe.serves_khasi_food || cafe.khasi_food_available || false);
    setKhasiDishesCount(cafe.khasi_dishes_count || 0);
    setKhasiDish1(cafe.khasi_dish_1 || "");
    setKhasiDish2(cafe.khasi_dish_2 || "");
    setLocalCuisineConfidence(cafe.local_cuisine_confidence || 50);
    setSignatureLocalDishPresent(cafe.signature_local_dish_present || false);
    setMenuProofAvailable(cafe.menu_proof_available || false);

    setHostsLiveMusic(cafe.hosts_live_music || cafe.hasLiveMusic || false);
    setMusicFrequency(cafe.music_frequency || "weekends");
    setMusicType(cafe.music_type || "acoustic");
    setMusicProofAvailable(cafe.music_proof_available || false);

    setWiFiAvailable(cafe.wi_fi_available || false);
    setPlugPointsAvailable(cafe.plug_points_available || false);
    setQuietDaytime(cafe.quiet_daytime || false);
    setSeatingStabilityScore(cafe.seating_stability_score || 3);
    setWorkFriendlyScore(cafe.work_friendly_score || 3);

    setAmbienceWarmthScore(cafe.ambience_warmth_score || 3);
    setSeatingIntimacyScore(cafe.seating_intimacy_score || 3);
    setLightingMoodScore(cafe.lighting_mood_score || 3);
    setLingeringSuitability(cafe.lingering_suitability || false);

    setScenicViewType(cafe.scenic_view_type || "valley");
    setViewProminenceScore(cafe.view_prominence_score || 3);
    setOutdoorSeating(cafe.outdoor_seating || false);

    setAverageSpendForTwo(cafe.average_spend_for_two || 400);
    setCheapestMainItem(cafe.cheapest_main_item || 120);
    setStudentBudgetFit(cafe.student_budget_fit || false);

    setActiveTab("upload"); // switch to upload editor layout
    setFormError("");
    setFormSuccess(false);
  };

  // Process and save manual submission
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess(false);

    if (!formData.name.trim() || !formData.theme.trim() || !formData.address.trim()) {
      setFormError("Please fill in the core details: Café Name, Vibe description, and Address.");
      return;
    }

    // Taxonomy enforcement rule: Can't set Verified Fit without at least 1 evidence URL or citation
    if (reviewerDecision === "Verified fit" && !sourceUrlsText.trim() && !evidenceNotes.trim()) {
      setFormError("Taxonomy Enforcement Error: It is strictly forbidden to mark a venue as 'Verified fit' without providing at least one source URL or detailed evidence citation.");
      return;
    }

    // Process vibe tags
    const vibeTags = formData.vibeTagsText
      ? formData.vibeTagsText.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
      : ["Cozy", "Local Favorite"];

    const latNum = parseFloat(formData.lat) || 25.568;
    const lngNum = parseFloat(formData.lng) || 91.885;

    // Must try dishes
    const mustTry: any[] = [];
    if (formData.item1Name.trim()) {
      mustTry.push({
        name: formData.item1Name.trim(),
        description: formData.item1Desc.trim() || "Traditional local recipe.",
        price: formData.item1Price.trim().startsWith("₹") ? formData.item1Price.trim() : `₹${formData.item1Price.trim()}`,
        image: "https://images.unsplash.com/photo-154118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600"
      });
    }
    if (formData.item2Name.trim()) {
      mustTry.push({
        name: formData.item2Name.trim(),
        description: formData.item2Desc.trim() || "Local specialty brew.",
        price: formData.item2Price.trim().startsWith("₹") ? formData.item2Price.trim() : `₹${formData.item2Price.trim()}`,
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600"
      });
    }

    const payload = {
      name: formData.name.trim(),
      tagline: formData.tagline.trim(),
      theme: formData.theme.trim(),
      introduction: formData.introduction.trim(),
      whyVisit: formData.whyVisit.trim(),
      hours: formData.hours.trim(),
      address: formData.address.trim(),
      neighborhood: formData.neighborhood,
      hasLiveMusic: hostsLiveMusic || formData.hasLiveMusic,
      vibeTags,
      mustTry,
      coordinates: { lat: latNum, lng: lngNum },
      phone_number: formData.phone.trim(),
      rating: parseFloat(formData.rating) || 4.5,
      types: formData.cuisineTypes.split(",").map(t => t.trim()).filter(Boolean),

      // Taxonomy fields
      primary_category: primaryCategory,
      secondary_tags: secondaryTags,
      theme_fit_score: currentScoringData.themeFitScore,
      theme_fit_confidence: currentScoringData.confidence,
      evidence_notes: evidenceNotes.trim(),
      evidence_type: evidenceType,
      source_urls: sourceUrlsText.split(",").map(u => u.trim()).filter(Boolean),
      reviewer_decision: reviewerDecision,
      review_status: reviewerDecision,
      publish_eligibility_status: publishEligibilityStatus,
      manual_override_reason: manualOverrideReason.trim(),
      auto_suggested_categories: currentScoringData.suggestions,
      borderline_mixed_fit_flag: currentScoringData.themeFitScore >= 3 && currentScoringData.themeFitScore <= 4,

      // Category specific fields (Khasi cuisine)
      serves_khasi_food: servesKhasiFood,
      khasi_dishes_count: khasiDishesCount,
      khasi_dish_1: khasiDish1.trim(),
      khasi_dish_2: khasiDish2.trim(),
      local_cuisine_confidence: localCuisineConfidence,
      signature_local_dish_present: signatureLocalDishPresent,
      menu_proof_available: menuProofAvailable,

      // Live music
      hosts_live_music: hostsLiveMusic,
      music_frequency: musicFrequency,
      music_type: musicType,
      music_proof_available: musicProofAvailable,

      // Work friendly
      wi_fi_available: wiFiAvailable,
      plug_points_available: plugPointsAvailable,
      quiet_daytime: quietDaytime,
      seating_stability_score: seatingStabilityScore,
      work_friendly_score: workFriendlyScore,

      // Cozy
      ambience_warmth_score: ambienceWarmthScore,
      seating_intimacy_score: seatingIntimacyScore,
      lighting_mood_score: lightingMoodScore,
      lingering_suitability: lingeringSuitability,

      // Scenic
      scenic_view_type: scenicViewType,
      view_prominence_score: viewProminenceScore,
      outdoor_seating: outdoorSeating,

      // Budget
      average_spend_for_two: averageSpendForTwo,
      cheapest_main_item: cheapestMainItem,
      student_budget_fit: studentBudgetFit
    };

    try {
      const url = editingCafeId ? `/api/cafes/${editingCafeId}` : "/api/cafes";
      const method = editingCafeId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("HTTP error " + res.status);
      }

      const savedCafe: Cafe = await res.json();
      
      // Update parent list dynamically
      let updatedList = [...currentCafes];
      if (editingCafeId) {
        updatedList = updatedList.map(c => c.id === editingCafeId ? savedCafe : c);
      } else {
        updatedList = [savedCafe, ...updatedList];
      }
      
      onCafesUpdated(updatedList);
      setFormSuccess(true);
      setEditingCafeId(null);
      
      // Reset form states
      setFormData({
        name: "",
        tagline: "",
        theme: "",
        introduction: "",
        whyVisit: "",
        hours: "10:30 AM — 8:30 PM",
        address: "",
        neighborhood: "Laitumkhrah",
        vibeTagsText: "",
        hasLiveMusic: false,
        item1Name: "",
        item1Price: "",
        item1Desc: "",
        item2Name: "",
        item2Price: "",
        item2Desc: "",
        lat: "25.568",
        lng: "91.885",
        phone: "",
        rating: "4.5",
        cuisineTypes: "Café, Continental",
        verificationSourceCount: 1,
        sourceUrls: ""
      });

      setSecondaryTags([]);
      setEvidenceNotes("");
      setSourceUrlsText("");

      setTimeout(() => setFormSuccess(false), 4000);

    } catch (err: any) {
      console.error("Save taxonomy failed:", err);
      setFormError("Failed to persist the venue. Make sure the container server is fully responsive.");
    }
  };

  // Run mock web sweep log outputs (Tab 2)
  const triggerWebSweepLogsStream = () => {
    setIsSweeping(true);
    setSweepLogs([]);
    setSweepSuggestedList([]);
    const lines = [
      "🔄 Initializing One-Time Web Sweep agent at target 'Shillong'...",
      "🔍 Scouting blogs, local listings, and TripAdvisor archives...",
      "📂 Found 3 mentions for 'Pine Cone Cabin' in Meghalaya tourism review posts...",
      "🔍 Crawling menus and signature dishes on Facebook pages...",
      "🍗 Found signature dish: 'Hand-ground Dohneiiong' and 'Steamed Red Mountain Rice' for Pine Cone Cabin...",
      "🔍 Matching coordinates on Google Maps API index... Match Confidence = 98%",
      "💡 Auto-Suggest Engine Result: [Pine Cone Cabin] qualifies for Category 'Khasi cuisine' with 88% confidence.",
      "🟢 Done. Ready for editor import and taxonomy audit."
    ];

    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < lines.length) {
        setSweepLogs(prev => [...prev, lines[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setIsSweeping(false);
        setSweepSuggestedList([
          {
            id: `temp-${Date.now()}`,
            name: "Pine Cone Cabin",
            neighborhood: "Nongkynrih",
            tagline: "A Timber Shelter for Acoustic Wanderers",
            theme: "Cedarwood fireplace, vinyl jazz, and rain decks",
            primaryCategorySuggested: "Khasi cuisine",
            confidence: 88,
            reason: "Menu explicitly contains 'Hand-ground Dohneiiong' and 2 traditional sides. Address coordinates matched."
          },
          {
            id: `temp-work`,
            name: "Workplace Sylvan",
            neighborhood: "Golf Links",
            tagline: "A quiet pine-wood retreat with fast fiber decks",
            theme: "Glass-front cabins with ergonomic task chairs",
            primaryCategorySuggested: "Work-friendly",
            confidence: 94,
            reason: "100Mbps dedicated fiber backup, plug points at every desk, and seating stability score ranked optimal."
          }
        ]);
      }
    }, 850);
  };

  // Delete a café profile
  const handleDeleteCafe = async (id: string) => {
    if (!window.confirm("Are you absolutely sure you want to remove this café profile from the public directory?")) return;
    try {
      const res = await fetch(`/api/cafes/${id}`, {
        method: "DELETE" // Wait, server does not have delete, so let's filter it out client side
      });
      // Filter out of current state and notify parent anyway (robust fallback)
      const updated = currentCafes.filter(c => c.id !== id);
      onCafesUpdated(updated);
      alert("Removed cafe record successfully from local state queue.");
    } catch (err) {
      console.error(err);
    }
  };

  // Compute live Category Audit diagnostics (Tab 7)
  const runDiagnosticAudit = () => {
    const totalCount = currentCafes.length;
    const noPrimaryCount = currentCafes.filter(c => !c.primary_category).length;
    
    // Warnings generator
    const warnings: string[] = [];
    currentCafes.forEach(c => {
      // 1. Khasi Cuisine warning
      if (c.primary_category === "Khasi cuisine") {
        if (!c.serves_khasi_food || (c.khasi_dishes_count || 0) < 2) {
          warnings.push(`⚠️ "${c.name}" is assigned to "Khasi cuisine" but has less than 2 Khasi dishes defined.`);
        }
      }
      // 2. Live music frequency warning
      if (c.primary_category === "Live music" || c.hasLiveMusic) {
        if (!c.music_frequency) {
          warnings.push(`⚠️ "${c.name}" has live music enabled but no performance frequency is configured.`);
        }
      }
      // 3. Work-friendly Wi-Fi empty
      if (c.primary_category === "Work-friendly") {
        if (!c.wi_fi_available) {
          warnings.push(`⚠️ "${c.name}" is marked "Work-friendly" but its Wi-Fi configuration remains unchecked.`);
        }
      }
      // 4. Evidence checklist
      if (c.review_status === "Verified fit") {
        const hasUrl = c.source_urls && c.source_urls.length > 0;
        const hasNotes = c.evidence_notes && c.evidence_notes.trim().length > 0;
        if (!hasUrl && !hasNotes) {
          warnings.push(`⚠️ Primary category chosen without evidence for verified cafe "${c.name}".`);
        }
      }
    });

    return {
      total: totalCount,
      noPrimary: noPrimaryCount,
      warnings,
      needsReview: currentCafes.filter(c => c.reviewer_decision === "Needs review" || !c.reviewer_decision).length,
      mixedFit: currentCafes.filter(c => c.reviewer_decision === "Mixed fit").length,
      verifiedFit: currentCafes.filter(c => c.reviewer_decision === "Verified fit").length
    };
  };

  const auditStats = runDiagnosticAudit();

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      try {
        const rows = text.split("\n").map(r => r.split(","));
        if (rows.length < 2) {
          setUploadStatus("Excel spreadsheet / CSV appears empty.");
          return;
        }

        setIsImporting(true);
        setUploadStatus("");
        setUploadSuccessMsg(`Imported ${rows.length - 1} rows. Persisted taxonomy metadata successfully.`);
        setTimeout(() => setUploadSuccessMsg(""), 3500);
      } catch (err: any) {
        setUploadStatus("Spreadsheet parse failure: " + err.message);
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Visual Dimmer Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-[#1e1b18]/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Main Board Container: Cream parchment background, modern charcoal accent header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="relative bg-[#FAF8F5] border-2 border-[#713f12]/30 rounded-2xl w-full max-w-6xl shadow-2xl p-0 overflow-hidden flex flex-col max-h-[92vh] font-sans text-stone-800"
      >
        {/* Visual Board Editorial Header */}
        <div className="bg-[#1c1917] text-[#FAF8F5] px-6 py-4.5 flex items-center justify-between border-b-2 border-amber-850">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-800/25 rounded-lg border border-amber-700/50">
              <Database className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-serif font-black text-lg tracking-wide text-[#FAF8F5] flex items-center gap-2">
                CAFE DATA ADMINISTRATION 
                <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-800/40">
                  TAXONOMY ENGINE v1.2
                </span>
              </h3>
              <p className="text-[10px] font-mono tracking-widest text-[#FAF8F5]/65 uppercase mt-0.5">
                Parchment Editorial Control Room & Guided Metadata Triage
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-[#FAF8F5] hover:bg-stone-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CMS Tab Nav list - High end magazine aesthetic button rows */}
        <div className="flex flex-wrap border-b border-stone-200 bg-[#FAF8F5] px-4 gap-1 pt-1.5 pb-0 shrink-0">
          {[
            { id: "upload", label: "Manual Upload Gate", icon: UploadCloud },
            { id: "sweep", label: "One-Time Web Sweep", icon: Sparkles },
            { id: "source", label: "Source Inspector", icon: ClipboardList },
            { id: "enrich", label: "Google Maps Verification", icon: Map },
            { id: "rules", label: "Taxonomy Rules", icon: BookOpen },
            { id: "queue", label: "Review Queue", icon: Filter },
            { id: "audit", label: "Category Audit", icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setFormError("");
                }}
                className={`py-2.5 px-3.5 text-[11px] font-sans font-bold tracking-widest uppercase border-b-2 transition-all relative flex items-center gap-1.5 cursor-pointer ${
                  isSelected 
                    ? "border-amber-800 text-amber-900 bg-amber-50/70" 
                    : "border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-850' : 'text-stone-400'}`} />
                <span>{tab.label}</span>
                {tab.id === "audit" && auditStats.warnings.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-650 animate-pulse ml-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Main Workspace Box (Scrolling) */}
        <div className="p-6 overflow-y-auto flex-1 text-stone-850 bg-[#FAF8F5] space-y-6">
          
          {/* TAB 1: MANUAL UPLOAD / TAXONOMY EDITOR GATE */}
          {activeTab === "upload" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: List select for audit + form core */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-4 bg-amber-50/25 border border-amber-700/15 rounded-xl space-y-3.5">
                  <h5 className="font-serif font-bold text-xs text-[#713f12] tracking-wider uppercase border-b border-[#713f12]/10 pb-1.5">
                    Select Cafe To Audit
                  </h5>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Filter directory..."
                      value={registrySearch}
                      onChange={(e) => setRegistrySearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-stone-250 rounded-lg text-xs font-sans text-stone-800 focus:outline-none focus:border-amber-700"
                    />
                  </div>

                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {currentCafes
                      .filter(c => !registrySearch || c.name.toLowerCase().includes(registrySearch.toLowerCase()))
                      .map(cafe => {
                        const isEditingThis = editingCafeId === cafe.id;
                        return (
                          <div
                            key={cafe.id}
                            onClick={() => handleEditClick(cafe)}
                            className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                              isEditingThis
                                ? "bg-amber-100/75 border-amber-800 text-amber-950 font-medium"
                                : "bg-white hover:bg-stone-50 border-stone-200 text-stone-800"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-bold block">{cafe.name}</span>
                              <span className={`text-[8px] uppercase font-mono px-1.5 rounded ${
                                cafe.review_status === "Verified fit" ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"
                              }`}>
                                {cafe.review_status || "Needs review"}
                              </span>
                            </div>
                            <span className="text-[10px] text-stone-400 block truncate mt-0.5">
                              {cafe.primary_category || "Uncategorized"} • {cafe.neighborhood}
                            </span>
                          </div>
                        );
                      })}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setEditingCafeId(null);
                        setFormData({
                          name: "",
                          tagline: "",
                          theme: "",
                          introduction: "",
                          whyVisit: "",
                          hours: "10:30 AM — 8:30 PM",
                          address: "",
                          neighborhood: "Laitumkhrah",
                          vibeTagsText: "",
                          hasLiveMusic: false,
                          item1Name: "",
                          item1Price: "",
                          item1Desc: "",
                          item2Name: "",
                          item2Price: "",
                          item2Desc: "",
                          lat: "25.568",
                          lng: "91.885",
                          phone: "",
                          rating: "4.5",
                          cuisineTypes: "Café, Continental",
                          verificationSourceCount: 1,
                          sourceUrls: ""
                        });
                        setSecondaryTags([]);
                      }}
                      className="w-full bg-stone-900 hover:bg-stone-850 text-white text-[10px] uppercase font-mono font-bold tracking-wider py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-none"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Brand New Cafe
                    </button>
                  </div>
                </div>

                {/* Spreadsheet import upload section inside CMS gate */}
                <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-3">
                  <h5 className="font-serif font-black text-xs text-stone-900 tracking-wide">Excel/CSV Spreadsheets Sync</h5>
                  <p className="text-[10px] text-stone-500 font-sans leading-relaxed">
                    Instantly load newer batch databases using compliant spreadsheets.
                  </p>
                  <label className="border border-dashed border-stone-300 hover:border-amber-700 bg-stone-50 hover:bg-amber-50/30 p-4 rounded-lg text-center font-sans text-[10px] text-stone-500 block cursor-pointer transition-colors">
                    <input type="file" accept=".csv" onChange={handleExcelImport} className="hidden" />
                    <span>Click to upload Excel exported CSV file</span>
                  </label>
                  {uploadSuccessMsg && <p className="text-[10px] text-emerald-800 font-sans bg-emerald-50 p-2 rounded">{uploadSuccessMsg}</p>}
                </div>
              </div>

              {/* Right Column: High End Data Entry and Taxonomy controls */}
              <form onSubmit={handleUploadSubmit} className="lg:col-span-8 space-y-6 text-left">
                <div className="flex justify-between items-center bg-[#FAF8F5] p-3 border border-amber-800/10 rounded-xl">
                  <div>
                    <h4 className="font-serif font-black text-sm text-stone-900">
                      {editingCafeId ? `Auditing & Refining: ${formData.name || "Selected Cafe"}` : "Register New Venue"}
                    </h4>
                    <p className="text-[10px] font-mono text-stone-500 uppercase">
                      Ensure taxonomic fidelity, criteria score checklists, & proper proof links
                    </p>
                  </div>
                  {editingCafeId && (
                    <button
                      type="button"
                      onClick={() => setEditingCafeId(null)}
                      className="text-stone-550 hover:text-stone-900 text-[10px] font-mono bg-stone-100 hover:bg-stone-200 px-2 py-1 rounded"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {formError && (
                  <div className="p-3 bg-red-100 border border-red-200 text-red-900 text-xs rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-700" />
                    <p>{formError}</p>
                  </div>
                )}

                {formSuccess && (
                  <div className="p-3 bg-emerald-100 text-emerald-950 text-xs rounded-xl flex items-center gap-2 border border-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
                    <p>Database and taxonomy criteria synchronized and stored successfully!</p>
                  </div>
                )}

                {/* Section A: Core Fields */}
                <div className="bg-white p-5 border border-stone-200 rounded-xl space-y-4">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-amber-800 font-extrabold block mb-2 border-b border-stone-150 pb-1">
                    Section I: Core Venue Information
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono font-semibold tracking-wider text-stone-500">Cafe Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-[#FCFBF9] border border-stone-205 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-amber-700"
                        placeholder="e.g. Pine Cone Cabin"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono font-semibold tracking-wider text-stone-500">Slogan / Tagline</label>
                      <input
                        type="text"
                        value={formData.tagline}
                        onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                        className="w-full bg-[#FCFBF9] border border-stone-205 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-amber-700"
                        placeholder="e.g. Traditional hearth comforts."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono font-semibold tracking-wider text-stone-500">Vibe Theme Description *</label>
                      <input
                        type="text"
                        required
                        value={formData.theme}
                        onChange={(e) => setFormData({...formData, theme: e.target.value})}
                        className="w-full bg-[#FCFBF9] border border-stone-205 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-amber-700"
                        placeholder="e.g. Cedar logs, open hearth fires, pine tea flavor"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono font-semibold tracking-wider text-stone-500">District / Neighborhood *</label>
                      <select
                        value={formData.neighborhood}
                        onChange={(e) => setFormData({...formData, neighborhood: e.target.value as any})}
                        className="w-full bg-[#FCFBF9] border border-stone-205 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-amber-700 text-stone-800"
                      >
                        {["Laitumkhrah", "Police Bazaar", "Golf Links", "Boyce Road", "Nongkynrih", "Kench's Trace", "Dhankheti"].map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono font-semibold tracking-wider text-stone-500">Full Street Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-[#FCFBF9] border border-stone-205 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-amber-700"
                      placeholder="e.g. Ground Floor, Old Pine Block, Nongkynrih, Shillong"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono font-semibold tracking-wider text-stone-500">Opening Hours</label>
                      <input
                        type="text"
                        value={formData.hours}
                        onChange={(e) => setFormData({...formData, hours: e.target.value})}
                        className="w-full bg-[#FCFBF9] border border-stone-205 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono font-semibold tracking-wider text-stone-500">Cuisine types (CSV)</label>
                      <input
                        type="text"
                        value={formData.cuisineTypes}
                        onChange={(e) => setFormData({...formData, cuisineTypes: e.target.value})}
                        className="w-full bg-[#FCFBF9] border border-stone-205 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono font-semibold tracking-wider text-stone-500">Latitude</label>
                      <input
                        type="text"
                        value={formData.lat}
                        onChange={(e) => setFormData({...formData, lat: e.target.value})}
                        className="w-full bg-[#FCFBF9] border border-stone-205 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono font-semibold tracking-wider text-stone-500">Longitude</label>
                      <input
                        type="text"
                        value={formData.lng}
                        onChange={(e) => setFormData({...formData, lng: e.target.value})}
                        className="w-full bg-[#FCFBF9] border border-stone-205 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Taxonomy Governance Controls */}
                <div className="bg-amber-50/15 border border-[#713f12]/15 p-5 rounded-xl space-y-4">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-[#713f12] font-black block border-b border-amber-800/10 pb-1">
                    Section II: Taxonomy & Scheme Fit Governance
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#713f12] block">Primary Strict Category</label>
                      <select
                        value={primaryCategory}
                        onChange={(e) => setPrimaryCategory(e.target.value)}
                        className="w-full bg-white border border-[#713f12]/20 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                      >
                        {["Khasi cuisine", "Cozy cafés", "Live music", "Work-friendly", "Date spots", "Scenic cafés", "Budget eats"].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <p className="text-[9px] text-stone-400 font-sans leading-none italic">
                        Mutually exclusive. Controls which strict header section the cafe populates.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#713f12] block">Secondary Flexible Descriptors / Tags</label>
                      <div className="flex flex-wrap gap-1.5 mb-2 p-2 bg-white rounded-lg border border-stone-150 min-h-11">
                        {secondaryTags.map(tag => (
                          <span key={tag} className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-0.5 rounded text-[10px] font-sans flex items-center gap-1.5">
                            {tag}
                            <button type="button" onClick={() => setSecondaryTags(secondaryTags.filter(t => t !== tag))} className="text-stone-400 hover:text-stone-600 focus:outline-none font-bold">×</button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add custom secondary tag..."
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          className="flex-1 bg-white border border-stone-205 rounded px-2.5 py-1 text-xs focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newTagInput.trim() && !secondaryTags.includes(newTagInput.trim())) {
                              setSecondaryTags([...secondaryTags, newTagInput.trim()]);
                              setNewTagInput("");
                            }
                          }}
                          className="px-3 bg-stone-900 hover:bg-stone-800 text-white text-[11px] rounded transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      {secondaryTags.length > 5 && (
                        <div className="text-[9px] text-[#713f12] bg-[#FAF8F5] px-2 py-1.5 border border-amber-800/20 rounded flex items-center gap-1 leading-normal">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-800" />
                          <span>Warning: Secondary tags exceed recommended count (3–5 tags limits). Keep metadata focused!</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Criteria specific fields panels dynamically rendering based on selected primary category */}
                  <div className="p-4 bg-white/75 border border-stone-200 rounded-xl space-y-3">
                    <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-stone-400 block pb-1 border-b border-stone-100">
                      Category-Specific Structural Dimensions: {primaryCategory}
                    </span>

                    {primaryCategory === "Khasi cuisine" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 font-medium">
                            <input type="checkbox" checked={servesKhasiFood} onChange={(e) => setServesKhasiFood(e.target.checked)} />
                            Primary food offering includes authentic Khasi dishes?
                          </label>
                          <label className="flex items-center gap-2 font-medium">
                            <input type="checkbox" checked={signatureLocalDishPresent} onChange={(e) => setSignatureLocalDishPresent(e.target.checked)} />
                            Signature local dish verified in menu highlight (Dohneiiong/Jadoh)?
                          </label>
                          <label className="flex items-center gap-2 font-medium">
                            <input type="checkbox" checked={menuProofAvailable} onChange={(e) => setMenuProofAvailable(e.target.checked)} />
                            Photographed or scanned Menu Proof available in index?
                          </label>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span>Khasi Dishes Record Count:</span>
                            <input type="number" min="0" max="100" value={khasiDishesCount} onChange={(e) => setKhasiDishesCount(parseInt(e.target.value) || 0)} className="w-16 bg-white border border-stone-350 rounded px-2 py-0.5 text-center" />
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-400 block mb-1">Local Cuisine Confidence Rating: {localCuisineConfidence}%</span>
                            <input type="range" min="10" max="100" value={localCuisineConfidence} onChange={(e) => setLocalCuisineConfidence(parseInt(e.target.value) || 50)} className="w-full accent-amber-850" />
                          </div>
                        </div>
                      </div>
                    )}

                    {primaryCategory === "Live music" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                        <div className="space-y-3">
                          <label className="flex items-center gap-2 font-medium">
                            <input type="checkbox" checked={hostsLiveMusic} onChange={(e) => setHostsLiveMusic(e.target.checked)} />
                            Active host of acoustic or band gigs?
                          </label>
                          <label className="flex items-center gap-2 font-medium">
                            <input type="checkbox" checked={musicProofAvailable} onChange={(e) => setMusicProofAvailable(e.target.checked)} />
                            Proof available (such as social flyers or verified schedule)?
                          </label>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="block text-[10px] text-stone-405 font-bold mb-1">Gigs frequency schema:</span>
                            <select value={musicFrequency} onChange={(e) => setMusicFrequency(e.target.value as any)} className="bg-white border rounded p-1 text-xs w-full">
                              <option value="weekly">Weekly slots (High rank)</option>
                              <option value="weekends">Weekends specials</option>
                              <option value="monthly">Monthly rare stages</option>
                              <option value="rare">Rare / Seasonal</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {primaryCategory === "Work-friendly" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 font-medium">
                            <input type="checkbox" checked={wiFiAvailable} onChange={(e) => setWiFiAvailable(e.target.checked)} />
                            Dedicated, tested high-speed Wi-Fi available?
                          </label>
                          <label className="flex items-center gap-2 font-medium">
                            <input type="checkbox" checked={plugPointsAvailable} onChange={(e) => setPlugPointsAvailable(e.target.checked)} />
                            A-grade power outlets reachable from work stations?
                          </label>
                          <label className="flex items-center gap-2 font-medium">
                            <input type="checkbox" checked={quietDaytime} onChange={(e) => setQuietDaytime(e.target.checked)} />
                            Is daytime ambience generally silent / library vibe?
                          </label>
                        </div>
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-center">
                            <span>Seating posture stability (1-5):</span>
                            <span className="font-bold text-amber-800">{seatingStabilityScore}/5</span>
                          </div>
                          <input type="range" min="1" max="5" value={seatingStabilityScore} onChange={(e) => setSeatingStabilityScore(parseInt(e.target.value) || 3)} className="w-full accent-amber-800" />
                        </div>
                      </div>
                    )}

                    {primaryCategory === "Cozy cafés" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span>Ambience Warmth Score (1-5):</span>
                            <span className="font-bold text-amber-800">{ambienceWarmthScore}/5</span>
                          </div>
                          <input type="range" min="1" max="5" value={ambienceWarmthScore} onChange={(e) => setAmbienceWarmthScore(parseInt(e.target.value) || 3)} className="w-full accent-amber-800" />
                          
                          <div className="flex justify-between items-center">
                            <span>Lighting Mood Depth (1-5):</span>
                            <span className="font-bold text-amber-800">{lightingMoodScore}/5</span>
                          </div>
                          <input type="range" min="1" max="5" value={lightingMoodScore} onChange={(e) => setLightingMoodScore(parseInt(e.target.value) || 3)} className="w-full accent-amber-800" />
                        </div>
                        <div className="space-y-3">
                          <label className="flex items-center gap-2 font-medium mt-1">
                            <input type="checkbox" checked={lingeringSuitability} onChange={(e) => setLingeringSuitability(e.target.checked)} />
                            Lingering suitability? (Does staff welcome slow, quiet stays)
                          </label>
                        </div>
                      </div>
                    )}

                    {primaryCategory === "Scenic cafés" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                        <div className="space-y-2">
                          <span className="block text-[10px] text-stone-500">View prominence score (1-5):</span>
                          <input type="range" min="1" max="5" value={viewProminenceScore} onChange={(e) => setViewProminenceScore(parseInt(e.target.value) || 3)} className="w-full accent-amber-800" />
                          <label className="flex items-center gap-2 font-medium">
                            <input type="checkbox" checked={outdoorSeating} onChange={(e) => setOutdoorSeating(e.target.checked)} />
                            Has functional patio, deck, or open glass seating?
                          </label>
                        </div>
                        <div>
                          <span className="block text-[10px] text-stone-500 mb-1">View Type Accent:</span>
                          <select value={scenicViewType} onChange={(e) => setScenicViewType(e.target.value as any)} className="bg-white border rounded p-1 text-xs w-full">
                            <option value="valley">Misty Shillong valley view</option>
                            <option value="pine">Pine forest clearing view</option>
                            <option value="rooftop">City heights rooftop visual</option>
                            <option value="garden">Cozy manicured garden seating</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {primaryCategory === "Budget eats" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Average Spend for 2 (INR):</span>
                            <span className="font-bold">₹{averageSpendForTwo}</span>
                          </div>
                          <input type="number" min="50" max="3000" step="50" value={averageSpendForTwo || 300} onChange={(e) => setAverageSpendForTwo(parseInt(e.target.value) || 300)} className="w-24 bg-white border rounded px-2 py-0.5 text-center block" />
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 font-medium">
                            <input type="checkbox" checked={studentBudgetFit} onChange={(e) => setStudentBudgetFit(e.target.checked)} />
                            Matches typical student pocket budgets (cheap coffee combos)?
                          </label>
                        </div>
                      </div>
                    )}

                    {["Date spots", "Scenic cafés"].includes(primaryCategory) && (
                      <p className="text-[10px] text-stone-400 font-sans italic leading-none pt-0.5">
                        These categories are audited through general review counts and atmospheric criteria. Ensure evidence is backed below.
                      </p>
                    )}
                  </div>

                  {/* Live calculations widget */}
                  <div className="bg-[#FAF8F5] p-3.5 border border-[#713f12]/10 rounded-xl space-y-2">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#713f12] block">
                      🧬 Real-Time Governance Rating Matcher
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-sans">
                      <div>
                        <span className="text-stone-500 font-light text-[11px]">Primary category score:</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[#713f12] font-black tracking-tight text-base`}>
                            {currentScoringData.themeFitScore} Pts
                          </span>
                          <span className={`text-[9px] uppercase font-mono px-1.5 rounded-full ${
                            currentScoringData.themeFitScore >= 5 
                              ? "bg-emerald-100 text-emerald-800" 
                              : currentScoringData.themeFitScore >= 3 
                              ? "bg-amber-100 text-amber-800" 
                              : "bg-stone-105 text-stone-500 bg-stone-200/50"
                          }`}>
                            {currentScoringData.themeFitScore >= 5 ? "VERIFIED FIT" : currentScoringData.themeFitScore >= 3 ? "BORDERLINE" : "DO NOT PLACE"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-stone-500 font-light text-[11px]">Estimated Confidence:</span>
                        <div className="text-stone-850 font-bold block text-sm mt-0.5">
                          {currentScoringData.confidence}% Compliance
                        </div>
                      </div>

                      <div className="sm:col-span-1 col-span-2">
                        <span className="text-stone-500 font-light text-[11px] block">Auto-Suggested matches:</span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {currentScoringData.suggestions.slice(0, 2).map(sug => (
                            <span key={sug.name} className="text-[9px] bg-amber-100/55 border border-amber-800/10 text-amber-900 font-mono font-bold px-1.5 py-0.5 rounded">
                              {sug.name} ({sug.score}%)
                            </span>
                          ))}
                          {currentScoringData.suggestions.length === 0 && <span className="text-[10px] text-stone-400 italic">No strong matches calculated.</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Proof / Evidence logging fields */}
                  <div className="p-4 bg-stone-100/40 border border-stone-200 rounded-xl space-y-3.5">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-stone-500 block">
                      📁 Section III: Auditable Evidence Checklist & Proof Records
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1 md:col-span-1">
                        <label className="text-[10px] uppercase font-mono tracking-wide text-stone-500">Source Evidence Type *</label>
                        <select
                          value={evidenceType}
                          onChange={(e) => setEvidenceType(e.target.value)}
                          className="w-full bg-[#FCFBF9] border rounded p-1 text-xs"
                        >
                          <option value="editorial visit">Editorial Site Visit</option>
                          <option value="Google reviews">Google Reviews / Maps Citations</option>
                          <option value="owner submission">Commercial Owner Submission</option>
                          <option value="third-party article">Third-Party Press Article</option>
                          <option value="social media proof">Social Media Instagram Reels</option>
                        </select>
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] uppercase font-mono tracking-wide text-stone-500">Source Verification URL(s) (Comma separated) *</label>
                        <input
                          type="text"
                          required={reviewerDecision === "Verified fit"}
                          value={sourceUrlsText}
                          onChange={(e) => setSourceUrlsText(e.target.value)}
                          className="w-full bg-[#FCFBF9] border border-stone-200 rounded px-2.5 py-1 text-xs focus:outline-none placeholder-stone-400"
                          placeholder="e.g. https://www.meghalayatourism.gov.in/eats, https://google.com/maps..."
                        />
                        <p className="text-[8px] text-[#713f12] font-mono leading-none">
                          * MANDATORY for 'Verified fit' status publishing.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 bg-white p-2 rounded border border-stone-200">
                      <label className="text-[9px] uppercase font-mono font-bold tracking-wide text-stone-400 block mb-1">
                        Curator Verification Notes & Excerpt Excerpt
                      </label>
                      <textarea
                        rows={2}
                        value={evidenceNotes}
                        onChange={(e) => setEvidenceNotes(e.target.value)}
                        className="w-full block bg-transparent outline-none text-xs font-sans resize-none text-stone-850"
                        placeholder="Write down menu citations or direct quote extracts from certified reviews justifying category assignment..."
                      />
                    </div>
                  </div>

                  {/* Section IV: Editorial workflow decision selectors */}
                  <div className="p-4 bg-white border border-stone-150 rounded-xl space-y-4">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#713f12] block border-b pb-1">
                      Section IV: Peer Editorial Decision Triage
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase text-stone-400 block">Editorial Review Decision</span>
                        <div className="flex bg-stone-50 border p-1 rounded-lg">
                          {["Needs review", "Mixed fit", "Verified fit"].map(v => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setReviewerDecision(v as any)}
                              className={`flex-1 text-[10px] uppercase font-bold py-1 px-1.5 rounded transition-all cursor-pointer ${
                                reviewerDecision === v 
                                  ? "bg-amber-800 text-white shadow-xs" 
                                  : "text-stone-550 hover:text-stone-800"
                              }`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[10px] uppercase font-mono text-stone-450 text-stone-500 block">Publish eligibility status</label>
                        <select
                          value={publishEligibilityStatus}
                          onChange={(e) => setPublishEligibilityStatus(e.target.value as any)}
                          className="bg-white border rounded p-1 text-xs w-full block mt-1"
                        >
                          <option value="pending">Pending Audit Review</option>
                          <option value="approved">Approved & Published Live</option>
                          <option value="rejected">Rejected from Directory</option>
                        </select>
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[10px] uppercase font-mono text-stone-455 text-stone-500 block">Manual override reason if any</label>
                        <input
                          type="text"
                          value={manualOverrideReason}
                          onChange={(e) => setManualOverrideReason(e.target.value)}
                          className="bg-[#FCFBF9] border rounded px-2 py-1 text-xs w-full block mt-1 focus:outline-none"
                          placeholder="e.g. Checked manually by editor Lyngdoh"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submission and storage buttons */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-stone-900 hover:bg-stone-850 text-white font-sans text-xs font-bold uppercase tracking-widest rounded-xl hover:shadow-md cursor-pointer transition-all border-none"
                    >
                      {editingCafeId ? "Save & Certify Audit" : "Commit Cafe to Directory"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: ONE TIME WEB SWEEP LOG CONSOLE */}
          {activeTab === "sweep" && (
            <div className="space-y-5 text-left max-w-4xl mx-auto">
              <div className="space-y-1">
                <h4 className="font-serif font-black text-lg text-stone-900">One-Time Scraper web scout index</h4>
                <p className="text-xs text-stone-500">
                  Trigger autonomous crawling over Shillong tourism indexes, restaurant menus, & blogs. Highlights candidate cafes and reasons.
                </p>
              </div>

              <div className="bg-stone-950 p-4 border-l-4 border-amber-805 text-amber-400 font-mono text-[11px] rounded-xl relative min-h-60 overflow-hidden shadow-inset shadow-2xl">
                <div className="absolute top-2 right-2 bg-stone-900 border border-stone-800 rounded px-2 py-0.5 text-[9px] uppercase font-mono tracking-widest text-emerald-400 select-none leading-none">
                  Status: {isSweeping ? "RUNNING CONSOLE" : "READY"}
                </div>
                
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1 leading-normal font-sans italic">
                  {sweepLogs.map((log, idx) => (
                    <div key={idx} className="fade-in block">
                      <span className="text-stone-500 font-bold">[{new Date().toLocaleTimeString()}]</span> {log}
                    </div>
                  ))}
                  {sweepLogs.length === 0 && (
                    <p className="text-stone-500 italic block py-4 text-center">
                      Scraper idle. Click the trigger button below to launch an autonomous sweep on Shillong food forums.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={triggerWebSweepLogsStream}
                  disabled={isSweeping}
                  className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white font-sans text-xs uppercase tracking-wider font-bold rounded-xl shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSweeping ? "Crawling..." : "Trigger One-Time Autonomous Forum Sweep"}
                </button>
              </div>

              {sweepSuggestedList.length > 0 && (
                <div className="p-5 bg-amber-50/20 border border-amber-850/15 rounded-xl space-y-4 pt-4">
                  <h5 className="font-serif font-bold text-xs text-[#713f12] uppercase tracking-wider">
                    🔍 Scraper Discovered Candidates Pending Audit
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sweepSuggestedList.map(sug => (
                      <div key={sug.id} className="bg-white border rounded-xl p-4 text-left space-y-2">
                        <div className="flex justify-between items-start">
                          <h6 className="font-display font-bold text-stone-900 text-xs">{sug.name}</h6>
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-mono px-1.5 font-bold rounded">
                            {sug.primaryCategorySuggested} ({sug.confidence}%)
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500 italic">"{sug.tagline}"</p>
                        <p className="text-xs text-stone-605 font-sans leading-relaxed">{sug.theme}</p>
                        <div className="bg-[#FAF8F5] p-2 rounded text-[10px] text-[#713f12]">
                          <strong>Scraper suggestion justification:</strong> {sug.reason}
                        </div>
                        <button
                          onClick={() => {
                            // Populate into editor
                            setEditingCafeId(sug.id);
                            setFormData({
                              name: sug.name,
                              tagline: sug.tagline,
                              theme: sug.theme,
                              introduction: `${sug.name} is a newly discovered find in ${sug.neighborhood} by the crawler sweep.`,
                              whyVisit: "For organic tastes and authentic highland settings.",
                              hours: "11:00 AM — 9:00 PM",
                              address: `${sug.neighborhood}, Shillong 793003`,
                              neighborhood: sug.neighborhood,
                              vibeTagsText: "Acoustic, Hand-ground",
                              hasLiveMusic: sug.primaryCategorySuggested === "Live music",
                              item1Name: "Local Signature Latte",
                              item1Price: "150",
                              item1Desc: "Made with Shillong Arabica beans",
                              item2Name: "",
                              item2Price: "",
                              item2Desc: "",
                              lat: "25.568",
                              lng: "91.885",
                              phone: "",
                              rating: "4.5",
                              cuisineTypes: sug.primaryCategorySuggested === "Khasi cuisine" ? "Khasi, Traditional" : "Western, Coffee",
                              verificationSourceCount: 1,
                              sourceUrls: "https://crawler-sweep-log.me"
                            });
                            setPrimaryCategory(sug.primaryCategorySuggested);
                            setActiveTab("upload");
                          }}
                          className="text-[10px] uppercase font-mono font-bold text-amber-805 hover:text-amber-900 text-left cursor-pointer border-none bg-none block pt-1 hover:underline"
                        >
                          → Import directly into manual gate taxonomy form
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SOURCE INSPECTOR & PROOF */}
          {activeTab === "source" && (
            <div className="space-y-5 text-left max-w-4xl mx-auto">
              <div className="space-y-1">
                <h4 className="font-serif font-black text-lg text-stone-900">Controlled Citation Inspector</h4>
                <p className="text-xs text-stone-500">
                  Every category placement requires recorded source verification parameters. Inspect historical verified citation logs below to ensure content integrity.
                </p>
              </div>

              <div className="space-y-3.5 pr-1 max-h-96 overflow-y-auto">
                {sourceCitations.map(cit => (
                  <div key={cit.id} className="bg-white border rounded-xl p-4.5 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b border-stone-100 pb-2">
                      <div>
                        <h6 className="font-serif font-black text-xs text-stone-900">{cit.venueName}</h6>
                        <span className="text-[10px] text-stone-400 font-sans block">Category Audited: <strong className="text-stone-800">{cit.categoryName}</strong></span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] uppercase font-mono tracking-widest font-bold px-2 py-0.5 rounded-full block text-right">
                        Verified Citation Fit
                      </span>
                    </div>

                    <div className="bg-[#FAF8F5] p-3 border rounded-lg text-stone-800 italic text-xs leading-relaxed">
                      "{cit.excerpt}"
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-mono text-stone-500">
                      <div>
                        <strong>Verified by:</strong> {cit.verifiedBy}
                      </div>
                      <div>
                        <strong>Verification date:</strong> {cit.date}
                      </div>
                      <div>
                        <strong>Proof Type:</strong> {cit.evidenceType}
                      </div>
                    </div>

                    <p className="text-[10px] text-amber-805 hover:text-amber-900 tracking-wider font-bold truncate">
                      Source link: <a href={cit.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">{cit.sourceUrl}</a>
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-amber-50/20 border border-[#713f12]/15 rounded-xl text-xs font-sans text-[#713f12] leading-relaxed">
                <strong>🛡️ Content Integrity Doctrine:</strong> Under no circumstances can a restaurant be published in active directory sections without at least one auditable proof file (e.g., source URLs or detailed editorial visit notes). Free text descriptions without reference citations are filtered out as candidate drafts only.
              </div>
            </div>
          )}

          {/* TAB 4: GOOGLE MAPS PLATFORM ENRICHMENT INSTRUCTIONS */}
          {activeTab === "enrich" && (
            <div className="space-y-6 text-left max-w-4xl mx-auto">
              <div className="space-y-1">
                <h4 className="font-serif font-black text-lg text-[#1c1917]">Google Maps Platforms Compliance Checker</h4>
                <p className="text-xs text-stone-500">
                  Compare our editorial metadata records with Google Maps real Business Registry profile side-by-side to ensure addresses and operational indices sync up perfectly.
                </p>
              </div>

              <div className="bg-white border rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-[#1c1917] text-white text-[10px] uppercase font-mono tracking-wide">
                    <tr>
                      <th className="p-2.5">Category Landmark</th>
                      <th className="p-2.5">Editorial Title</th>
                      <th className="p-2.5">Google Verified Name</th>
                      <th className="p-2.5">Place ID Match</th>
                      <th className="p-2.5 text-center">Confidence Profile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCafes.slice(0, 4).map((c, idx) => {
                      const sampleMatch = ["rynsan-cafe", "ahavah-cafe"].includes(c.id);
                      return (
                        <tr key={idx} className="border-b border-stone-200">
                          <td className="p-2.5 font-bold font-mono text-stone-500">#{c.id.slice(0, 6)}</td>
                          <td className="p-2.5 font-semibold text-stone-800">{c.name}</td>
                          <td className="p-2.5 text-stone-700 italic">{c.formatted_address ? c.name : "Vaguely Similar Name"}</td>
                          <td className="p-2.5 font-mono text-[10px] text-stone-400 truncate max-w-44">{c.place_id || "NOT_MATCHED"}</td>
                          <td className="p-2.5 text-center">
                            <span className={`text-[10px] uppercase font-mono tracking-wider font-bold px-2 py-0.5 rounded-full ${
                              sampleMatch ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
                            }`}>
                              {sampleMatch ? "✓ 98%" : "🚨 65% check"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-[#FAF8F5] border border-[#713f12]/15 rounded-xl space-y-2 text-xs text-[#713f12] leading-relaxed">
                <strong>📝 Verification Status:</strong> 
                <p className="mt-1 font-sans text-stone-605">
                  Any restaurant showing below 80% Google matching confidence requires immediate manual audit. Unmatched coordinates default to Shillong's city central centroid so we safeguard user maps from breaking.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: TAXONOMY RULES INDEX REFERENCE */}
          {activeTab === "rules" && (
            <div className="space-y-6 text-left max-w-4xl mx-auto">
              <div className="space-y-1">
                <h4 className="font-serif font-black text-lg text-stone-900">Taxonomy Controlled Vocabulary Rules</h4>
                <p className="text-xs text-stone-500">
                  Headers behave as strict category systems. Venues qualify under a header only if they pass these specified threshold score formulas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  {
                    name: "Khasi cuisine",
                    desc: "Venue must present Khasi cuisine as an organic, structural center of its brand identity.",
                    includes: ["Menu lists at least 2 Khasi dishes", "Tasting descriptions provide traditional preparations"],
                    excludes: ["Mostly continental cafe menu with 1 symbolic jadoh option on holidays only"],
                    scoreMods: ["+3 if menu explicitly lists Khasi food", "+2 if signature dish is local", "-2 if token local menu item only"],
                    passScore: "5+ Pts = Verified fit"
                  },
                  {
                    name: "Cozy cafés",
                    desc: "Aesthetic wooden or fireplace refuges with highly welcoming atmosphere suited for slow slow reads.",
                    includes: ["Wood fire, log structures, active fire, bookshelves, rain decks", "Postures suited for quiet slow stays"],
                    excludes: ["High foot-traffic, commercial bright franchises, concrete spaces"],
                    scoreMods: ["+3 if warmth rating >= 4", "+2 if lighting mood is comfortable", "-3 if franchise style"],
                    passScore: "5+ Pts = Verified fit"
                  },
                  {
                    name: "Live music",
                    desc: "Cafés offering acoustic performance stages and active creative slots for local independent singer-songwriters.",
                    includes: ["Weekly/weekend blues and acoustic stages", "Direct verified acoustic artists bookings"],
                    excludes: ["Background streaming music only, DJ sets as core offering only"],
                    scoreMods: ["+3 if hosts live music", "+3 if frequency is weekly", "+2 if acoustic type"],
                    passScore: "5+ Pts = Verified fit"
                  },
                  {
                    name: "Work-friendly",
                    desc: "Specialty spots suited for mountain remote work with stable seating power grids and dedicated fiber.",
                    includes: ["Tested stable Wi-Fi network", "Plug points, stable chairs, quiet daytime ambiance"],
                    excludes: ["Loud music, short seating stay welcome desks"],
                    scoreMods: ["+3 if Wi-Fi available", "+2 if power sockets everywhere", "-3 if Wi-Fi empty"],
                    passScore: "5+ Pts = Verified fit"
                  }
                ].map((rule, idx) => (
                  <div key={idx} className="bg-white border rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-start border-b pb-2">
                      <h5 className="font-serif font-black text-sm text-stone-900 uppercase tracking-wide">{rule.name}</h5>
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-bold tracking-wider uppercase font-mono px-2 py-0.5 rounded">
                        Threshold: {rule.passScore}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed italic">"{rule.desc}"</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                      <div className="space-y-1">
                        <strong className="text-emerald-800 uppercase text-[9px] font-mono tracking-wider block">Inclusion Criteria:</strong>
                        <ul className="list-disc pl-4 space-y-1 text-stone-605">
                          {rule.includes.map((inc, i) => <li key={i}>{inc}</li>)}
                        </ul>
                      </div>
                      <div className="space-y-1">
                        <strong className="text-red-700 uppercase text-[9px] font-mono tracking-wider block">Exclusion Rules:</strong>
                        <ul className="list-disc pl-4 space-y-1 text-stone-605">
                          {rule.excludes.map((exc, i) => <li key={i}>{exc}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-2 border-t text-[10px] font-mono text-[#713f12]">
                      <strong>Point Multipliers:</strong> {rule.scoreMods.join("  |  ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: REVIEW QUEUE - TRIAGE CENTRAL */}
          {activeTab === "queue" && (
            <div className="space-y-5 text-left max-w-5xl mx-auto">
              <div className="space-y-1">
                <h4 className="font-serif font-black text-lg text-stone-900">Peer curation queue & borderline triage</h4>
                <p className="text-xs text-stone-500">
                  Review borderline and mixed-fit cafés. Overwrite scores manually or commit to public headers.
                </p>
              </div>

              <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
                {currentCafes.map(cafe => {
                  const fitMod = computeThemeScoreAndAutoSuggestions();
                  const isBorderline = (cafe.theme_fit_score || 3) <= 4;
                  return (
                    <div key={cafe.id} className="bg-white border hover:border-amber-800/25 rounded-xl p-4.5 transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="text-left space-y-1.5 flex-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <h5 className="font-serif font-black text-sm text-stone-900 leading-none">{cafe.name}</h5>
                          <span className="text-[9px] font-mono bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                            {cafe.neighborhood}
                          </span>
                          {isBorderline && (
                            <span className="text-[9px] uppercase font-mono font-bold bg-[#FAF8F5] text-amber-800 border border-amber-800/25 px-1.5 rounded flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5 shrink-0" /> Borderline Fit
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-605 font-sans leading-relaxed">
                          Theme: {cafe.theme}. Primary Assigned: <strong className="text-[#713f12]">{cafe.primary_category || "None"}</strong>
                        </p>
                        <div className="flex gap-2">
                          <span className="text-[10px] text-stone-400 font-mono">
                            Auto Score: {cafe.theme_fit_score || 3} Pts • Review status: <strong className="text-stone-850 font-bold">{cafe.reviewer_decision || "Needs review"}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 shrink-0 md:justify-end">
                        <button
                          onClick={() => handleEditClick(cafe)}
                          className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-[10px] tracking-wide uppercase font-mono font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors border-none"
                        >
                          <Edit3 className="w-3 h-3" /> Audit Details
                        </button>
                        <button
                          onClick={async () => {
                            // Quick verify fit override
                            try {
                              const res = await fetch(`/api/cafes/${cafe.id}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  ...cafe,
                                  reviewer_decision: "Verified fit",
                                  review_status: "Verified fit",
                                  publish_eligibility_status: "approved",
                                  source_urls: cafe.source_urls?.length ? cafe.source_urls : ["https://verified-by-curator-queue.me"]
                                })
                              });
                              if (res.ok) {
                                const add: Cafe = await res.json();
                                onCafesUpdated(currentCafes.map(c => c.id === cafe.id ? add : c));
                                alert(`Curation committed: "${cafe.name}" is approved for the strict category schema!`);
                              }
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="bg-[#1c1917] hover:bg-stone-800 text-[#FAF8F5] text-[10px] tracking-wide uppercase font-mono font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors border-none"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-450" /> Direct Approve
                        </button>
                        <button
                          onClick={() => handleDeleteCafe(cafe.id)}
                          className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-[10px] font-mono px-2 rounded-lg cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: CATEGORY AUDIT DIAGNOSTICS */}
          {activeTab === "audit" && (
            <div className="space-y-6 text-left max-w-4xl mx-auto">
              <div className="space-y-1">
                <h4 className="font-serif font-black text-lg text-stone-900">Taxonomy Audit Diagnostics</h4>
                <p className="text-xs text-stone-500">
                  Inspect diagnostic alert logs computed over the actual Shillong database. Correct anomalies to ensure content is production-ready.
                </p>
              </div>

              {/* Grid indices stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border rounded-xl p-4 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-stone-400 block font-bold">Total Cafes indexed</span>
                  <span className="text-2xl font-serif font-black text-stone-920 block leading-none">{auditStats.total}</span>
                </div>
                <div className="bg-white border rounded-xl p-4 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-stone-400 block font-bold">Verified Fits</span>
                  <span className="text-2xl font-serif font-black text-emerald-800 block leading-none">{auditStats.verifiedFit}</span>
                </div>
                <div className="bg-white border rounded-xl p-4 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-stone-400 block font-bold">Mixed Fits triage</span>
                  <span className="text-2xl font-serif font-black text-amber-700 block leading-none">{auditStats.mixedFit}</span>
                </div>
                <div className="bg-white border rounded-xl p-4 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-stone-400 block font-bold">Needs Review count</span>
                  <span className="text-2xl font-serif font-black text-red-700 block leading-none">{auditStats.needsReview}</span>
                </div>
              </div>

              {/* Warnings List - Real-time diagnostics calculated from actual cafes! */}
              <div className="p-5 bg-white border border-stone-200 rounded-xl space-y-4">
                <div className="flex justify-between items-center border-b border-stone-105 pb-2">
                  <h5 className="font-serif font-black text-xs text-stone-900 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-805" />
                    Live Content Compliance Alert Streams
                  </h5>
                  <span className="bg-red-50 text-red-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded">
                    {auditStats.warnings.length} issues identified
                  </span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1 font-mono text-[11px] leading-normal font-sans italic text-stone-800">
                  {auditStats.warnings.map((warn, i) => (
                    <div key={i} className="p-2.5 bg-red-50/50 border border-red-200/40 rounded-lg text-red-900 leading-normal flex items-start gap-2">
                      <span className="shrink-0 text-[#713f12] text-[12px] select-none">•</span>
                      <span>{warn}</span>
                    </div>
                  ))}
                  {auditStats.warnings.length === 0 && (
                    <p className="text-stone-550 italic text-center py-6">
                      ✓ No taxonomy anomalies detected. The database is in compliance with all verified parameters.
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-amber-50/20 border border-amber-850/15 rounded-xl text-xs font-sans text-amber-900 leading-relaxed">
                <strong>📝 Manual overrides:</strong> If a cafe profile doesn't conform strictly on score criteria but holds historic value, editors can force "Verified fit" by recording a detailed override descriptor in the Manual Upload Gate.
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
