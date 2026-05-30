import { 
  collection, 
  getDocs, 
  addDoc,
  doc,
  setDoc,
  query, 
  orderBy, 
  serverTimestamp,
  getDoc
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";
import { Review, Cafe } from "../types";

const REVIEWS_COLLECTION = "reviews";
const CAFES_COLLECTION = "cafes";

/**
 * Fetches all reviews from Firestore.
 * Merges them with fallback static reviews if needed in the UI.
 */
export async function getReviewsFromFirestore(): Promise<Review[]> {
  try {
    const q = query(collection(db, REVIEWS_COLLECTION));
    const querySnapshot = await getDocs(q);
    const results: Review[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      results.push({
        id: docSnap.id,
        cafeId: data.cafeId,
        userName: data.userName,
        rating: Number(data.rating),
        comment: data.comment,
        date: data.date,
        isLocalGuide: !!data.isLocalGuide,
        userId: data.userId || ""
      } as Review);
    });
    return results;
  } catch (error) {
    return handleFirestoreError(error, OperationType.LIST, REVIEWS_COLLECTION);
  }
}

/**
 * Adds a new review to Firestore.
 * Requires user to be signed in.
 */
export async function addReviewToFirestore(review: Omit<Review, "id">): Promise<Review> {
  const reviewId = `user-${Date.now()}`;
  const reviewData = {
    ...review,
    id: reviewId,
    userId: review.userId || "anonymous",
    isLocalGuide: review.isLocalGuide || false,
    rating: Number(review.rating),
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  };

  try {
    // We can use setDoc with a descriptive unique ID so our rules validate perfectly
    const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
    await setDoc(docRef, reviewData);
    return reviewData as Review;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, `${REVIEWS_COLLECTION}/${reviewId}`);
  }
}

/**
 * Fetches user custom and override cafes from Firestore.
 */
export async function getCustomCafesFromFirestore(): Promise<any[]> {
  try {
    const q = query(collection(db, CAFES_COLLECTION));
    const querySnapshot = await getDocs(q);
    const results: any[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      results.push({
        ...data,
        id: docSnap.id
      });
    });
    return results;
  } catch (error) {
    return handleFirestoreError(error, OperationType.LIST, CAFES_COLLECTION);
  }
}

/**
 * Persists/Overrides a Cafe in Firestore.
 */
export async function saveCustomCafeToFirestore(cafe: Cafe): Promise<Cafe> {
  const cafeId = cafe.id || `cafe-${Date.now()}`;
  const cafeDocData = {
    id: cafeId,
    name: cafe.name,
    theme: cafe.theme,
    neighborhood: cafe.neighborhood,
    tagline: cafe.tagline || "Heart of Shillong Coffee",
    introduction: cafe.introduction || `${cafe.name} is a curation on the map.`,
    whyVisit: cafe.whyVisit || "For high-quality flavors, friendly hosts, and warm spaces.",
    hours: cafe.hours || "10:30 AM — 8:30 PM",
    address: cafe.address || "Shillong, Meghalaya 793001",
    images: {
      hero: cafe.images?.hero || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200",
      card: cafe.images?.card || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800",
      interior: cafe.images?.interior || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200"
    },
    quote: cafe.quote || "A steaming cup of tea, a notebook, and the scent of wild pine outside.",
    quoteAuthor: cafe.quoteAuthor || "Host",
    vibeTags: Array.isArray(cafe.vibeTags) && cafe.vibeTags.length > 0 ? cafe.vibeTags : ["Friendly", "Cozy", "Classic"],
    hasLiveMusic: !!cafe.hasLiveMusic,
    mustTry: Array.isArray(cafe.mustTry) && cafe.mustTry.length > 0 ? cafe.mustTry : [
      {
        name: "Artisan Hill Roast Latte",
        description: "Organically cultivated East Khasi hills arabica blend topped with microfoam.",
        price: "₹180",
        image: "https://images.unsplash.com/photo-154118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600"
      }
    ],
    gallery: Array.isArray(cafe.gallery) ? cafe.gallery : [],
    coordinates: cafe.coordinates || { lat: 25.568, lng: 91.885 }
  };

  try {
    const docRef = doc(db, CAFES_COLLECTION, cafeId);
    await setDoc(docRef, cafeDocData);
    return cafeDocData as Cafe;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, `${CAFES_COLLECTION}/${cafeId}`);
  }
}
