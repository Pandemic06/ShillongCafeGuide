import React from "react";

// ── Sohra / Cherrapunji data ───────────────────────────────────────────────
const ATTRACTIONS = [
  {
    name: "Nohkalikai Falls",
    type: "Waterfall",
    distance: "4 km from Sohra town",
    scale: "340 m — 4th highest plunge waterfall in the world",
    bestTime: "June–October (monsoon peak)",
    tip: "Arrive before 9 AM to beat the cloud cover. The plunge pool turns vivid turquoise post-monsoon.",
    emoji: "🌊",
  },
  {
    name: "Double Decker Living Root Bridge",
    type: "Living Architecture",
    distance: "Tyrna village → 3,500 steps down (~2–3 hr trek one way)",
    scale: "Two-tiered; ~29 m long — oldest tier 180+ years",
    bestTime: "October–April (dry trail, clear skies)",
    tip: "Stay overnight in Nongriat village. The return trek is harder than the descent — start back by 2 PM.",
    emoji: "🌿",
  },
  {
    name: "Seven Sisters Falls (Nohsngithiang)",
    type: "Waterfall",
    distance: "~1 km off NH 6 near Mawsmai",
    scale: "315 m, seven-segmented cascade across a 70 m wide cliff",
    bestTime: "July–September (all seven streams run full)",
    tip: "Best viewed from the highway-side public viewpoint. Bring a telephoto lens for detail shots.",
    emoji: "💧",
  },
  {
    name: "Mawsmai Cave",
    type: "Limestone Cave",
    distance: "6 km from Sohra town center",
    scale: "150 m lit passage through ancient stalactites",
    bestTime: "Year-round; noticeably cooler in summer",
    tip: "Takes 30 minutes. Wear non-slip footwear — floor is perpetually wet year-round.",
    emoji: "🪨",
  },
  {
    name: "Eco Park Viewpoint",
    type: "Panoramic Viewpoint",
    distance: "1 km from Sohra town center",
    scale: "Overlooks Bangladesh plains from cliff edge",
    bestTime: "Early morning for dramatic mist layers over the valley",
    tip: "Entry ₹20. On clear October–March days you can see Sylhet district, Bangladesh.",
    emoji: "🏔️",
  },
  {
    name: "Mawkdok Dympep Valley",
    type: "Valley Viewpoint + Zip-line",
    distance: "~47 km from Shillong on the Sohra road",
    scale: "Zip-line spans 1 km across the gorge at 150 m height",
    bestTime: "October–March (clear skies, green valley)",
    tip: "The roadside chai stalls here have stunning views. Zip-line ₹800; book at the kiosk on arrival.",
    emoji: "🌄",
  },
  {
    name: "Dainthlen Falls",
    type: "Waterfall + Legend Site",
    distance: "8 km from Sohra",
    scale: "Tiered falls; Khasi legend of the serpent Thlen",
    bestTime: "Monsoon season (July–September)",
    tip: "Locals share the legend of how the Khasi hero Luh Lyndon slew the serpent here. Ask your guide.",
    emoji: "🐍",
  },
  {
    name: "Wakaba Falls",
    type: "Hidden Waterfall",
    distance: "~3 km trek from Sohra",
    scale: "Secluded single-drop fall, less visited",
    bestTime: "June–October",
    tip: "Rarely crowded. Combine with the Nohkalikai visit for a full waterfall day.",
    emoji: "🍃",
  },
];

const CAFES_EATS = [
  {
    name: "Cherrapunjee Holiday Resort Restaurant",
    type: "Restaurant",
    vibe: "Heritage bungalow, sweeping valley views, full dining room",
    mustTry: "Jadoh, Tungrymbai, Dohneiiong pork curry, Maize soup",
    priceRange: "₹₹",
    note: "Most reliable full-service kitchen in Sohra. Pre-book for dinner during Oct–Jan peak season.",
  },
  {
    name: "Polo Orchid Resort Dining",
    type: "Restaurant",
    vibe: "Modern eco-resort, cloud-level dining terrace",
    mustTry: "Khasi thali, smoked pork with mustard greens, local herbal tea",
    priceRange: "₹₹₹",
    note: "Best breakfast view in Sohra. Open to non-guests; call ahead.",
  },
  {
    name: "Sohra Café & Local Eateries (Town Area)",
    type: "Café / Street Stalls",
    vibe: "Small, local, foggy-window aesthetic — the real Sohra",
    mustTry: "Black sesame tea, local rice cakes (Pukhlein), fried pork momos",
    priceRange: "₹",
    note: "Several unnamed stalls near the taxi stand serve the best Jadoh in town. Cash only, close by 5 PM.",
  },
  {
    name: "Conifer Café",
    type: "Café",
    vibe: "Pine forest adjacent, relaxed pitstop atmosphere",
    mustTry: "Filter coffee, egg sandwiches, local ginger biscuits",
    priceRange: "₹",
    note: "Best pitstop on the drive in — just after Mawkdok viewpoint. Good cell signal here.",
  },
  {
    name: "Nongriat Homestay Kitchens",
    type: "Homestay Meals",
    vibe: "Valley floor, post-trek, community-cooked",
    mustTry: "Rice and bamboo shoot curry, smoked meat, eggs from the village",
    priceRange: "₹",
    note: "Meals included with overnight stay (₹600–1,200 full board). Book via local guides.",
  },
];

const ROUTES = [
  {
    label: "Classic Day Trip from Shillong",
    duration: "1 day",
    distance: "~108 km round trip",
    stops: [
      "Shillong (Police Bazaar) — depart 6:30 AM",
      "Mawkdok Valley Viewpoint — pit stop, photos, chai (45 min)",
      "Nohkalikai Falls — walk to cliff viewpoint (1.5 hr)",
      "Seven Sisters Falls viewpoint — roadside (30 min)",
      "Mawsmai Cave — lit walkthrough (45 min)",
      "Eco Park Viewpoint — Bangladesh plains panorama (1 hr)",
      "Lunch at Cherrapunjee Holiday Resort or town stalls",
      "Dainthlen Falls — optional on the drive back (30 min)",
      "Return to Shillong by 6–7 PM",
    ],
    tips: "Rent a Bolero/Sumo from Police Bazaar (₹2,500–3,500 for the full day). Avoid Mondays — several sites close. Pack a light jacket; Sohra is 10°C cooler than Shillong in evenings.",
  },
  {
    label: "Root Bridge Overnight Trek",
    duration: "2 days / 1 night",
    distance: "Tyrna trailhead + 3,500 steps each way",
    stops: [
      "Day 1: Shillong → Sohra → Tyrna village trailhead (early morning)",
      "Trek down to Nongriat village — 3,500 steps (2–3 hr)",
      "Single Decker Root Bridge (1 hr exploration)",
      "Double Decker Living Root Bridge (1.5 hr exploration)",
      "Natural swimming pool at Nongriat (optional)",
      "Night stay in Nongriat homestay (₹600–1,200 full board)",
      "Day 2: Sunrise over the valley gorge",
      "Trek back up to Tyrna (2.5–3 hr)",
      "Drive back to Shillong via Sohra with stops",
    ],
    tips: "Pack light — you carry everything down and back up. Trekking poles strongly recommended. Mobile signal is near-zero in the valley. Carry ₹500 cash for meals and tip the homestay family.",
  },
  {
    label: "Sohra → Dawki Grand Loop",
    duration: "2 days / 1 night",
    distance: "~165 km total loop",
    stops: [
      "Day 1: Shillong → Mawkdok → Sohra full sightseeing day",
      "Nohkalikai + Seven Sisters + Mawsmai Cave + Eco Park",
      "Overnight in Sohra (Cherrapunjee Holiday Resort or Polo Orchid)",
      "Day 2: Sohra → Pynursla road → Dawki (Umngot River)",
      "Boating on the crystal-clear Umngot River (₹600/boat, 1 hr)",
      "Border town Tamabil viewpoint — India-Bangladesh crossing (optional)",
      "Shnongpdeng village — cliff jumping or kayaking (optional)",
      "Return: Dawki → Shillong via Jowai road (3 hr)",
    ],
    tips: "Best October–March (Dawki is clearest and dry). Book Dawki boats in advance during Dec–Jan peak via Dawki Tourism. Start Day 2 early — Dawki gets crowded after 10 AM.",
  },
  {
    label: "Mawsynram Extension Route",
    duration: "1 long day or 2 days",
    distance: "~30 km from Sohra to Mawsynram",
    stops: [
      "Sohra → Mawsynram (world's wettest place by record)",
      "Mawjymbuin Cave — sacred stalactite shaped like a Shivling",
      "Mawsmai to Mawsynram ridge road — misty forest drive",
      "Nohwet Village — traditional Khasi long house (optional)",
      "Return to Sohra or Shillong",
    ],
    tips: "Roads to Mawsynram can be rough post-monsoon. A 4WD vehicle is advisable June–September. Combine with Sohra day if staying overnight in the area.",
  },
];

const PRACTICAL = [
  { label: "Distance from Shillong", value: "54 km via NH 6 · ~1.5–2 hr drive (traffic-dependent)" },
  { label: "Best season", value: "June–Oct for waterfalls at full flow · Oct–Mar for trekking, clear skies & Dawki combo" },
  { label: "Avoid", value: "Mondays (many sites closed) · Dense fog: January mornings can cut visibility to 5 m" },
  { label: "Getting there", value: "Shared sumo from Police Bazaar stand (~₹120–150 per seat) · Private taxi ₹2,500–3,500 for the day" },
  { label: "Stay options", value: "Cherrapunjee Holiday Resort · Polo Orchid Resort · Nongriat village homestays (₹600–1,200 incl. meals)" },
  { label: "Entry fees", value: "Nohkalikai ₹20 · Mawsmai Cave ₹20 · Eco Park ₹20 · Root Bridge ₹50 · Dainthlen ₹10" },
  { label: "ATMs", value: "Only 1–2 ATMs in Sohra town; often out of cash. Carry cash from Shillong before departing." },
  { label: "Mobile network", value: "BSNL most reliable. Airtel works in town. Jio weak. Zero signal in Nongriat valley." },
  { label: "Weather note", value: "Can rain any time of year. Sohra averages 11,777 mm/year. Always carry a compact raincoat." },
  { label: "Local guide", value: "Recommended for Root Bridge trek. Rates ₹800–1,500/day. Book via Cherrapunji resort or Tyrna village entry point." },
];

export default function TrendingDestination() {
  return (
    <div className="trending-page">

      {/* ── Hero ── */}
      <section className="trending-hero">
        <div className="trending-hero-badge">🔥 Trending Now in Meghalaya</div>
        <h2 className="trending-hero-title">Sohra</h2>
        <p className="trending-hero-sub">Cherrapunji &nbsp;·&nbsp; East Khasi Hills &nbsp;·&nbsp; Meghalaya, India</p>
        <p className="trending-hero-desc">
          The world's wettest place is also its most enchanting. Ancient living root bridges woven
          by Khasi hands over centuries, waterfalls that vanish into monsoon cloud, limestone caves
          carved by millennia of rain, and a valley silence only the hills understand.
          Right now, Sohra is having a moment — and it deserves every bit of it.
        </p>
        <div className="trending-hero-stats">
          <div className="trending-stat">
            <span className="trending-stat-val">340 m</span>
            <span className="trending-stat-label">Nohkalikai Falls</span>
          </div>
          <div className="trending-stat">
            <span className="trending-stat-val">54 km</span>
            <span className="trending-stat-label">from Shillong</span>
          </div>
          <div className="trending-stat">
            <span className="trending-stat-val">11,777</span>
            <span className="trending-stat-label">mm rain/year</span>
          </div>
          <div className="trending-stat">
            <span className="trending-stat-val">3,500</span>
            <span className="trending-stat-label">steps to Root Bridge</span>
          </div>
        </div>
      </section>

      {/* ── Attractions ── */}
      <section className="trending-section">
        <h3 className="trending-section-title">Top Attractions</h3>
        <div className="trending-attractions-grid">
          {ATTRACTIONS.map((a) => (
            <div key={a.name} className="trending-attraction-card">
              <div className="trending-card-emoji">{a.emoji}</div>
              <div className="trending-card-body">
                <div className="trending-card-type">{a.type}</div>
                <h4 className="trending-card-name">{a.name}</h4>
                <ul className="trending-card-meta">
                  <li><strong>Location:</strong> {a.distance}</li>
                  <li><strong>Scale:</strong> {a.scale}</li>
                  <li><strong>Best time:</strong> {a.bestTime}</li>
                </ul>
                <p className="trending-card-tip">💡 {a.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Routes ── */}
      <section className="trending-section trending-section-alt">
        <h3 className="trending-section-title">Curated Routes</h3>
        <div className="trending-routes-grid">
          {ROUTES.map((r) => (
            <div key={r.label} className="trending-route-card">
              <div className="trending-route-header">
                <h4 className="trending-route-label">{r.label}</h4>
                <div className="trending-route-meta">
                  <span className="trending-badge">{r.duration}</span>
                  <span className="trending-badge trending-badge-muted">{r.distance}</span>
                </div>
              </div>
              <ol className="trending-route-stops">
                {r.stops.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <p className="trending-route-tips">📌 {r.tips}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cafés & Eats ── */}
      <section className="trending-section">
        <h3 className="trending-section-title">Where to Eat &amp; Drink</h3>
        <div className="trending-cafes-grid">
          {CAFES_EATS.map((c) => (
            <div key={c.name} className="trending-cafe-card">
              <div className="trending-cafe-header">
                <h4 className="trending-cafe-name">{c.name}</h4>
                <span className="trending-price">{c.priceRange}</span>
              </div>
              <div className="trending-cafe-type">{c.type} · {c.vibe}</div>
              <p className="trending-cafe-must"><strong>Must try:</strong> {c.mustTry}</p>
              <p className="trending-cafe-note">{c.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Practical Info ── */}
      <section className="trending-section trending-section-alt">
        <h3 className="trending-section-title">Practical Info</h3>
        <dl className="trending-practical-grid">
          {PRACTICAL.map((p) => (
            <div key={p.label} className="trending-practical-row">
              <dt className="trending-practical-label">{p.label}</dt>
              <dd className="trending-practical-value">{p.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Styles ── */}
      <style>{`
        .trending-page {
          font-family: var(--font-body, 'Satoshi', sans-serif);
          color: var(--color-text, #28251d);
        }

        /* ── Hero ── */
        .trending-hero {
          background: linear-gradient(160deg, #faf8f3 0%, #e8f0ee 100%);
          border-bottom: 1px solid rgba(0,0,0,0.08);
          padding: clamp(2.5rem, 6vw, 5rem) clamp(1rem, 5vw, 3rem);
          text-align: center;
        }
        .trending-hero-badge {
          display: inline-block;
          background: #01696f;
          color: #fff;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          padding: 0.3rem 0.85rem;
          border-radius: 9999px;
          margin-bottom: 1.1rem;
        }
        .trending-hero-title {
          font-family: var(--font-display, 'Boska', Georgia, serif);
          font-size: clamp(2.75rem, 7vw, 5.5rem);
          font-weight: 800;
          color: #28251d;
          margin-bottom: 0.3rem;
          line-height: 1.05;
          letter-spacing: -0.02em;
        }
        .trending-hero-sub {
          font-size: 0.8rem;
          color: #7a7974;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 1.4rem;
        }
        .trending-hero-desc {
          max-width: 58ch;
          margin: 0 auto 2.25rem;
          font-size: clamp(0.95rem, 1.5vw, 1.05rem);
          color: #5a5955;
          line-height: 1.8;
        }
        .trending-hero-stats {
          display: flex;
          gap: clamp(1.25rem, 4vw, 3rem);
          justify-content: center;
          flex-wrap: wrap;
        }
        .trending-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
        }
        .trending-stat-val {
          font-size: clamp(1.5rem, 3vw, 2.25rem);
          font-weight: 800;
          color: #01696f;
          line-height: 1;
        }
        .trending-stat-label {
          font-size: 0.68rem;
          color: #7a7974;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 600;
        }

        /* ── Sections ── */
        .trending-section {
          padding: clamp(2rem, 5vw, 4rem) clamp(1rem, 5vw, 3rem);
        }
        .trending-section-alt {
          background: #f3f0ec;
        }
        .trending-section-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: clamp(1.25rem, 2.5vw, 1.75rem);
          font-weight: 700;
          color: #28251d;
          margin-bottom: 1.75rem;
          padding-bottom: 0.65rem;
          border-bottom: 2.5px solid #01696f;
          display: inline-block;
        }

        /* ── Attractions ── */
        .trending-attractions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
          gap: 1.25rem;
        }
        .trending-attraction-card {
          display: flex;
          gap: 1rem;
          background: #fff;
          border: 1px solid rgba(40,37,29,0.1);
          border-radius: 0.75rem;
          padding: 1.25rem;
          box-shadow: 0 1px 3px rgba(40,37,29,0.06);
          transition: box-shadow 180ms ease, transform 180ms ease;
        }
        .trending-attraction-card:hover {
          box-shadow: 0 4px 16px rgba(40,37,29,0.1);
          transform: translateY(-2px);
        }
        .trending-card-emoji {
          font-size: 2rem;
          flex-shrink: 0;
          line-height: 1;
          padding-top: 0.1rem;
        }
        .trending-card-body {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .trending-card-type {
          font-size: 0.68rem;
          color: #01696f;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .trending-card-name {
          font-size: clamp(1rem, 1.5vw, 1.15rem);
          font-weight: 700;
          color: #28251d;
          line-height: 1.25;
          margin: 0;
        }
        .trending-card-meta {
          list-style: none;
          padding: 0;
          margin: 0.1rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          font-size: 0.82rem;
          color: #5a5955;
          line-height: 1.5;
        }
        .trending-card-tip {
          font-size: 0.82rem;
          color: #3d5e5b;
          background: #deecea;
          border-radius: 0.5rem;
          padding: 0.5rem 0.7rem;
          margin-top: 0.25rem;
          line-height: 1.55;
        }

        /* ── Routes ── */
        .trending-routes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(340px, 100%), 1fr));
          gap: 1.5rem;
        }
        .trending-route-card {
          background: #fff;
          border: 1px solid rgba(40,37,29,0.1);
          border-radius: 0.75rem;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          box-shadow: 0 1px 3px rgba(40,37,29,0.06);
        }
        .trending-route-header {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .trending-route-label {
          font-size: clamp(1rem, 1.75vw, 1.15rem);
          font-weight: 700;
          color: #28251d;
          margin: 0;
          line-height: 1.3;
        }
        .trending-route-meta {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .trending-badge {
          display: inline-block;
          background: #01696f;
          color: #fff;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 0.2rem 0.65rem;
          border-radius: 9999px;
          letter-spacing: 0.04em;
        }
        .trending-badge-muted {
          background: #e6e4df;
          color: #5a5955;
        }
        .trending-route-stops {
          padding-left: 1.2rem;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          font-size: 0.84rem;
          color: #5a5955;
          line-height: 1.55;
          margin: 0;
        }
        .trending-route-tips {
          font-size: 0.82rem;
          background: #deecea;
          border-radius: 0.5rem;
          padding: 0.65rem 0.85rem;
          color: #3d5e5b;
          line-height: 1.55;
          margin: 0;
        }

        /* ── Cafés ── */
        .trending-cafes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
          gap: 1.25rem;
        }
        .trending-cafe-card {
          background: #fff;
          border: 1px solid rgba(40,37,29,0.1);
          border-radius: 0.75rem;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          box-shadow: 0 1px 3px rgba(40,37,29,0.06);
          transition: box-shadow 180ms ease;
        }
        .trending-cafe-card:hover {
          box-shadow: 0 4px 14px rgba(40,37,29,0.09);
        }
        .trending-cafe-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
        }
        .trending-cafe-name {
          font-size: 1rem;
          font-weight: 700;
          color: #28251d;
          line-height: 1.3;
          margin: 0;
        }
        .trending-price {
          font-size: 0.82rem;
          color: #01696f;
          font-weight: 800;
          flex-shrink: 0;
          letter-spacing: 0.05em;
        }
        .trending-cafe-type {
          font-size: 0.75rem;
          color: #7a7974;
          line-height: 1.4;
        }
        .trending-cafe-must,
        .trending-cafe-note {
          font-size: 0.83rem;
          color: #5a5955;
          line-height: 1.6;
          margin: 0;
        }

        /* ── Practical ── */
        .trending-practical-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(340px, 100%), 1fr));
          gap: 0.75rem;
        }
        .trending-practical-row {
          background: #fff;
          border: 1px solid rgba(40,37,29,0.09);
          border-radius: 0.625rem;
          padding: 0.85rem 1rem;
          display: flex;
          gap: 0.85rem;
          align-items: baseline;
        }
        .trending-practical-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #01696f;
          min-width: 130px;
          flex-shrink: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          line-height: 1.4;
        }
        .trending-practical-value {
          font-size: 0.84rem;
          color: #5a5955;
          line-height: 1.6;
        }

        @media (max-width: 480px) {
          .trending-hero-stats { gap: 1.25rem; }
          .trending-practical-row { flex-direction: column; gap: 0.2rem; }
          .trending-practical-label { min-width: unset; }
          .trending-card-emoji { font-size: 1.6rem; }
        }
      `}</style>
    </div>
  );
}
