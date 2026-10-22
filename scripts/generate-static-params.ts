import * as fs from 'fs';
import * as path from 'path';
import { buildCafeSchema } from '../src/utils/cafeSchema';
import { PAGE_SEO } from '../src/components/SEO';
import type { Cafe } from '../src/types';

const DB_PATH = path.join(process.cwd(), 'src', 'cafes_db.json');
const HTML_SHELL_PATH = path.join(process.cwd(), 'dist', 'public', 'index.html');
const OUT_DIR = path.join(process.cwd(), 'dist', 'public', 'cafe');
const TAB_OUT_DIR = path.join(process.cwd(), 'dist', 'public', 'tab');
const PHOTOS_DIR = path.join(process.cwd(), 'public', 'cafe-photos');
const SITE = 'https://shillongcafemap.in';

type HeadTags = { title: string; description: string; url: string; image?: string; imageAlt?: string };

/** Escapes text for use inside an HTML attribute or element. */
function esc(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Rewrites the shell's <head> SEO tags (title, description, canonical, OG, Twitter). */
function applyHeadTags(html: string, tags: HeadTags): string {
  const title = esc(tags.title);
  const description = esc(tags.description);
  const swaps: [RegExp, string][] = [
    [/<title>.*?<\/title>/i, `<title>${title}</title>`],
    [/<link rel="canonical" href=".*?"\s*\/?>/i, `<link rel="canonical" href="${tags.url}" />`],
    [/<meta name="description" content=".*?"\s*\/?>/i, `<meta name="description" content="${description}" />`],
    [/<meta property="og:title" content=".*?"\s*\/?>/i, `<meta property="og:title" content="${title}" />`],
    [/<meta property="og:description" content=".*?"\s*\/?>/i, `<meta property="og:description" content="${description}" />`],
    [/<meta property="og:url" content=".*?"\s*\/?>/i, `<meta property="og:url" content="${tags.url}" />`],
    [/<meta name="twitter:title" content=".*?"\s*\/?>/i, `<meta name="twitter:title" content="${title}" />`],
    [/<meta name="twitter:description" content=".*?"\s*\/?>/i, `<meta name="twitter:description" content="${description}" />`],
  ];
  if (tags.image) {
    swaps.push(
      [/<meta property="og:image" content=".*?"\s*\/?>/i, `<meta property="og:image" content="${tags.image}" />`],
      [/<meta name="twitter:image" content=".*?"\s*\/?>/i, `<meta name="twitter:image" content="${tags.image}" />`],
      [/<meta property="og:image:alt" content=".*?"\s*\/?>/i, `<meta property="og:image:alt" content="${esc(tags.imageAlt || tags.title)}" />`],
    );
  }
  return swaps.reduce((out, [pattern, replacement]) => out.replace(pattern, replacement), html);
}

/** Prefers the café's real cached Google photo over a stock image. */
function cafeShareImage(cafe: Cafe): string {
  if (cafe.images?.hero?.startsWith('/')) return `${SITE}${cafe.images.hero}`;
  if (fs.existsSync(path.join(PHOTOS_DIR, cafe.id, 'hero-0.jpg'))) {
    return `${SITE}/cafe-photos/${cafe.id}/hero-0.jpg`;
  }
  return cafe.images?.hero || cafe.images?.card || `${SITE}/cafe-photos/rynsan-cafe/hero-0.jpg`;
}

/** Writes one pre-rendered page per site section (tab), served by server.ts for /?tab=<id>. */
function generateTabPages(htmlShell: string) {
  fs.mkdirSync(TAB_OUT_DIR, { recursive: true });
  for (const [tab, meta] of Object.entries(PAGE_SEO)) {
    if (tab === 'explore') continue; // the homepage is index.html itself
    let pageHtml = applyHeadTags(htmlShell, { title: meta.title, description: meta.description, url: meta.canonical });
    pageHtml = pageHtml.replace(
      /<div id="root"><\/div>/i,
      `<div id="root"><main style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1917;"><a href="/" style="color: #8b5c1a;">← Shillong Café Map</a><h1>${esc(meta.title)}</h1><p>${esc(meta.description)}</p></main></div>`
    );
    fs.writeFileSync(path.join(TAB_OUT_DIR, `${tab}.html`), pageHtml, 'utf-8');
    console.log(`Generated section page: /?tab=${tab}`);
  }
}

async function run() {
  console.log('--- Generating Static Café Pages for SEO ---');
  
  if (!fs.existsSync(DB_PATH)) {
    console.error(`Café database not found at: ${DB_PATH}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(HTML_SHELL_PATH)) {
    console.error(`Vite build output index.html not found at: ${HTML_SHELL_PATH}`);
    console.error('Please run `vite build` before running this script.');
    process.exit(1);
  }
  
  const cafes: Cafe[] = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  const htmlShell = fs.readFileSync(HTML_SHELL_PATH, 'utf-8');
  
  console.log(`Loaded ${cafes.length} cafes from database.`);
  
  // Ensure base output directory exists
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }
  
  for (const cafe of cafes) {
    if (!cafe.id) {
      console.warn(`Skipping café without ID: ${cafe.name}`);
      continue;
    }
    
    console.log(`Generating pre-rendered page for: /cafe/${cafe.id}`);
    
    // Create café directory
    const cafeDir = path.join(OUT_DIR, cafe.id);
    if (!fs.existsSync(cafeDir)) {
      fs.mkdirSync(cafeDir, { recursive: true });
    }
    
    // Generate Cafe JSON-LD Schema
    const schema = buildCafeSchema(cafe);
    // buildCafeSchema omits @context (SEO.tsx adds it in the browser), so add it here.
    const schemaString = JSON.stringify({ '@context': 'https://schema.org', ...schema }, null, 2);
    
    // Build specific SEO strings
    const seoTitle = cafe.seo_title || `${cafe.name} — Cozy Café in ${cafe.neighborhood}, Shillong`;
    const seoDescription = cafe.seo_description || (
      `${cafe.name} is a café in ${cafe.neighborhood}, Shillong. ` +
      (cafe.tagline || cafe.introduction?.slice(0, 110) || "")
    ).slice(0, 160);
    const seoImage = cafeShareImage(cafe);
    const cafeUrl = `${SITE}/cafe/${cafe.id}`;

    let pageHtml = applyHeadTags(htmlShell, {
      title: seoTitle,
      description: seoDescription,
      url: cafeUrl,
      image: seoImage,
      imageAlt: `${cafe.name}, ${cafe.neighborhood}, Shillong`,
    });

    // 6. Inject dynamic schema as JSON-LD right before </head>
    const schemaScript = `\n    <script type="application/ld+json" id="seo-jsonld">\n    ${schemaString}\n    </script>\n  `;
    pageHtml = pageHtml.replace(
      /<\/head>/i,
      `${schemaScript}</head>`
    );
    
    // 7. Inject static preview inside `<div id="root"></div>`
    const staticPreview = `
      <div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1917; background-color: #FAF8F5;">
        <header style="margin-bottom: 30px; border-bottom: 1px solid #E6E4DF; padding-bottom: 15px;">
          <a href="/" style="color: #8b5c1a; text-decoration: none; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">← Shillong Café Map</a>
        </header>
        <main>
          <h1 style="font-size: 36px; margin: 0 0 10px 0; color: #1c1917;">${cafe.name}</h1>
          <p style="color: #8b5c1a; font-weight: 600; margin: 0 0 20px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 0.05em;">${cafe.neighborhood}, Shillong</p>
          ${cafe.images?.hero ? `<img src="${cafe.images.hero}" alt="${cafe.name}" style="width: 100%; max-height: 450px; object-fit: cover; border-radius: 16px; margin-bottom: 25px; border: 1px solid #E6E4DF;" />` : ''}
          <p style="font-size: 18px; line-height: 1.6; margin-bottom: 25px; font-weight: 300;">${cafe.introduction || cafe.tagline}</p>
          
          <div style="background-color: #ffffff; border: 1px solid #E6E4DF; border-radius: 16px; padding: 25px; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
            <h2 style="font-size: 20px; margin-top: 0; margin-bottom: 15px; color: #1c1917; border-bottom: 1px solid #FAF8F5; padding-bottom: 10px;">Café Details</h2>
            <p style="margin: 8px 0; font-size: 14px;"><strong style="color: #8b5c1a;">Address:</strong> ${cafe.address || 'Shillong, Meghalaya, India'}</p>
            ${cafe.hours ? `<p style="margin: 8px 0; font-size: 14px;"><strong style="color: #8b5c1a;">Hours:</strong> ${cafe.hours}</p>` : ''}
            ${cafe.phone_number ? `<p style="margin: 8px 0; font-size: 14px;"><strong style="color: #8b5c1a;">Phone:</strong> ${cafe.phone_number}</p>` : ''}
            ${cafe.website ? `<p style="margin: 8px 0; font-size: 14px;"><strong style="color: #8b5c1a;">Website:</strong> <a href="${cafe.website}" target="_blank" rel="noopener noreferrer" style="color: #8b5c1a; text-decoration: underline;">${cafe.website}</a></p>` : ''}
            ${cafe.google_maps_url ? `<p style="margin: 8px 0; font-size: 14px;"><strong style="color: #8b5c1a;">Google Maps:</strong> <a href="${cafe.google_maps_url}" target="_blank" rel="noopener noreferrer" style="color: #8b5c1a; text-decoration: underline;">View on Google Maps</a></p>` : ''}
          </div>
        </main>
      </div>
    `;
    
    pageHtml = pageHtml.replace(
      /<div id="root"><\/div>/i,
      `<div id="root">${staticPreview}</div>`
    );
    
    // Write out pre-rendered HTML file
    fs.writeFileSync(path.join(cafeDir, 'index.html'), pageHtml, 'utf-8');
  }
  
  generateTabPages(htmlShell);

  console.log('--- Static generation complete! ---');
}

run().catch(err => {
  console.error('Fatal error during static generation:', err);
  process.exit(1);
});
