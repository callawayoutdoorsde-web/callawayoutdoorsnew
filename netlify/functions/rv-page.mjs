import { loadInventory } from './lib/_inventory-data.mjs';
import { renderPage } from './lib/_seo-render.mjs';

const html = {'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300'};
const clean = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const slugTokens = s => String(s || '').toLowerCase().replace(/\.html$/i,'').split(/[^a-z0-9]+/).filter(Boolean);

function normalizeSlug(input='') {
  let value = String(input || '');
  try { value = decodeURIComponent(value); } catch (_) {}
  value = value.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
  if (value.includes('/')) value = value.split('/').pop();
  return value.replace(/\.html$/i, '').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g,'-').replace(/^-|-$/g,'');
}

function legacyMatch(items, slug) {
  const tokens = slugTokens(slug);
  const year = tokens.find(t => /^20\d{2}$|^19\d{2}$/.test(t));
  const meaningful = tokens.filter(t => t !== year && t.length >= 3);
  if (!year || !meaningful.length) return null;

  let best = null, bestScore = 0;
  for (const u of items) {
    if (String(u.year) !== year) continue;
    const hay = clean(`${u.make} ${u.model} ${u.trim || ''} ${u.id || ''}`);
    let score = 0;
    for (const t of meaningful) if (hay.includes(clean(t))) score++;
    if (score > bestScore) { best = u; bestScore = score; }
  }
  return bestScore >= Math.min(2, meaningful.length) ? best : null;
}

const unavailablePage = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Camper not available | Callaway Outdoors</title><style>body{font-family:Arial,sans-serif;margin:0;background:#f5f5f5;color:#111}.box{max-width:720px;margin:10vh auto;background:#fff;padding:42px;border-radius:18px;box-shadow:0 8px 30px #0001}h1{margin-top:0}.btn{display:inline-block;background:#e81f2f;color:#fff;text-decoration:none;padding:14px 20px;border-radius:9px;font-weight:700}</style></head><body><main class="box"><h1>This camper is no longer available.</h1><p>That listing may have sold or the inventory link may have changed. Browse our current campers to see what is available now.</p><a class="btn" href="/inventory.html">Browse current inventory</a></main></body></html>`;

export default async (request, context) => {
  const url = new URL(request.url);
  // Prefer Netlify's named route parameter. Fall back to the pathname so the
  // page still works if the routing context changes.
  const raw = context?.params?.slug || url.pathname.split('/').pop() || url.searchParams.get('slug') || '';
  const slug = normalizeSlug(raw);

  // Never expose a raw "Invalid listing" error to customers.
  if (!slug || slug.length < 2 || slug.length > 180) {
    return Response.redirect(new URL('/inventory.html', request.url), 302);
  }

  try {
    const {items, stale} = await loadInventory(request);
    let u = items.find(x => normalizeSlug(x.id) === slug);
    if (!u) u = legacyMatch(items, slug);

    if (!u) {
      return new Response(unavailablePage, {status:404, headers:{...html,'cache-control':'no-store','x-robots-tag':'noindex'}});
    }

    let specs = {};
    try {
      const response = await fetch(new URL('/data/spec-library.json', request.url), {signal:AbortSignal.timeout(5000)});
      if (response.ok) specs = await response.json();
    } catch (_) {}

    return new Response(renderPage(u, specs), {headers:{...html, ...(stale ? {'x-inventory-status':'stale'} : {})}});
  } catch (_) {
    return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Inventory temporarily unavailable</title></head><body><h1>Inventory is temporarily unavailable.</h1><p>Please refresh shortly or <a href="/inventory.html">return to inventory</a>.</p></body></html>`, {status:503, headers:{...html,'cache-control':'no-store','x-robots-tag':'noindex'}});
  }
};


// Route clean camper URLs directly to this function. This avoids relying on a
// netlify.toml rewrite to copy :slug into a query string.
export const config = {
  path: "/inventory/:slug.html",
  method: "GET"
};
