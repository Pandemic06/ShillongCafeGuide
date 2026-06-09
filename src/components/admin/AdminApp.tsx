import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { signInWithGoogle, signOutAdmin, watchAuth } from "../../services/auth";
import CafeManager from "./CafeManager";
import GuideManager from "./GuideManager";
import ReviewModeration from "./ReviewModeration";
import SiteSettings from "./SiteSettings";
import { Coffee, BookOpen, MessageSquare, Settings, LogOut, ExternalLink, Shield } from "lucide-react";

/**
 * Admin shell + auth gate. Lives at /admin and /admin/* (any subpath).
 * Routing is path-segment based: /admin/{section}.
 * Sections: cafes (default) | guides | reviews | settings
 */

type Section = "cafes" | "guides" | "reviews" | "settings";

function readSection(): Section {
  const seg = window.location.pathname.split("/")[2] || "cafes";
  const valid: Section[] = ["cafes", "guides", "reviews", "settings"];
  return (valid.includes(seg as Section) ? seg : "cafes") as Section;
}

function pushSection(s: Section) {
  const target = `/admin/${s}`;
  if (window.location.pathname !== target) {
    window.history.pushState({ section: s }, "", target);
  }
}

export default function AdminApp() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [section, setSection] = useState<Section>(readSection());
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = watchAuth((u, admin) => {
      setUser(u);
      setIsAdmin(admin);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const onPop = () => setSection(readSection());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // ── Pending counts (badge in sidebar) ──────────────────────────────────
  // Refresh every 60s so newly-agent-added cafés / reviews surface fast
  // without manual reload. Failure swallowed — badge just shows 0.
  // MUST live above the early returns below: hooks have to run on every
  // render path or React throws #310 (hook count changes when user signs in).
  const [pendingCafes, setPendingCafes] = useState(0);
  const [pendingReviews, setPendingReviews] = useState(0);
  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    const refresh = async () => {
      try {
        const [cafesRes, reviewsMod] = await Promise.all([
          fetch("/api/cafes").then((r) => r.ok ? r.json() : []),
          import("../../services/admin-db"),
        ]);
        if (cancelled) return;
        const cafes = Array.isArray(cafesRes) ? cafesRes : [];
        setPendingCafes(
          cafes.filter((c: any) => c?.status === "pending" || c?.publish_eligibility_status === "pending").length
        );
        const reviews = await reviewsMod.listReviews().catch(() => []);
        if (cancelled) return;
        setPendingReviews(reviews.filter((r: any) => !r.approved).length);
      } catch {
        // ignore — badge is best-effort
      }
    };
    refresh();
    const iv = window.setInterval(refresh, 60_000);
    return () => { cancelled = true; window.clearInterval(iv); };
  }, [isAdmin]);

  const navigate = (s: Section) => {
    setSection(s);
    pushSection(s);
  };

  const onSignIn = async () => {
    setSigningIn(true);
    setError("");
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Sign-in failed");
    } finally {
      setSigningIn(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────
  if (!authReady) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <p className="text-stone-500">Checking access…</p>
      </div>
    );
  }

  // ── Sign-in screen ─────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="bg-white border border-stone-200 rounded-2xl shadow-xs p-8 max-w-md w-full text-center">
          <Shield className="w-12 h-12 text-amber-700 mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-stone-900 mb-2">Admin sign-in</h1>
          <p className="text-sm text-stone-600 mb-6">Shillong Café Map CMS. Google account required.</p>
          {error && <p className="text-sm text-rose-700 mb-4 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>}
          <button
            onClick={onSignIn}
            disabled={signingIn}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 text-sm font-medium disabled:opacity-50"
          >
            {signingIn ? "Signing in…" : "Sign in with Google"}
          </button>
          <a href="/" className="block mt-6 text-xs text-stone-500 hover:text-amber-800">← Back to public site</a>
        </div>
      </div>
    );
  }

  // ── Not on admin allowlist ─────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="bg-white border border-stone-200 rounded-2xl shadow-xs p-8 max-w-md w-full text-center">
          <Shield className="w-12 h-12 text-rose-600 mx-auto mb-4" />
          <h1 className="text-xl font-display font-bold text-stone-900 mb-2">Access denied</h1>
          <p className="text-sm text-stone-600 mb-1">{user.email}</p>
          <p className="text-xs text-stone-500 mb-6">
            Not on the admin allowlist. Ask the site owner to add a Firestore document at
            <code className="bg-stone-100 px-1 rounded mx-1">admins/{user.uid}</code>.
          </p>
          <button
            onClick={() => signOutAdmin()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-900 rounded-lg hover:bg-stone-200 text-sm"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </div>
    );
  }

  // ── Admin shell ────────────────────────────────────────────────────────
  const navItems: { id: Section; label: string; icon: React.ComponentType<any>; badge?: number }[] = [
    { id: "cafes", label: "Cafés", icon: Coffee, badge: pendingCafes },
    { id: "guides", label: "Guides", icon: BookOpen },
    { id: "reviews", label: "Reviews", icon: MessageSquare, badge: pendingReviews },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="bg-white border-b border-stone-200">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-amber-700" />
            <div>
              <p className="text-xs uppercase tracking-widest text-amber-700 font-bold font-mono">Admin CMS</p>
              <p className="text-sm font-display font-bold text-stone-900">Shillong Café Map</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-amber-800">
              <ExternalLink className="w-3.5 h-3.5" /> View site
            </a>
            <div className="flex items-center gap-2">
              {user.photoURL && <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />}
              <span className="text-xs text-stone-600">{user.email}</span>
            </div>
            <button onClick={() => signOutAdmin()} className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-rose-700">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <nav className="w-56 min-h-[calc(100vh-57px)] bg-white border-r border-stone-200 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium mb-1 transition-colors ${
                  active ? "bg-amber-50 text-amber-900" : "text-stone-700 hover:bg-stone-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span
                    className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-rose-600 text-white text-[10px] font-bold tabular-nums"
                    title={`${item.badge} pending`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <main className="flex-1 p-8">
          {section === "cafes" && <CafeManager />}
          {section === "guides" && <GuideManager />}
          {section === "reviews" && <ReviewModeration />}
          {section === "settings" && <SiteSettings />}
        </main>
      </div>
    </div>
  );
}
