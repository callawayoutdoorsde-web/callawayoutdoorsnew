import { loadInventory } from './lib/_inventory-data.mjs';
import { renderPage } from './lib/_seo-render.mjs';

const html = {'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300'};

// Netlify supplies the actual camper filename via context.params.slug.
// This route runs before old static camper files, including legacy redirects.
export const config = { path: '/inventory/:slug' };

export default async (request, context) => {
  const url = new URL(request.url);
  const raw = context?.params?.slug || url.pathname.split('/').pop() || '';
  let slug;
  try { slug = decodeURIComponent(raw).replace(/\.html$/i, ''); }
  catch { return new Response('Invalid listing', {status: 404, headers: {...html, 'x-robots-tag': 'noindex'}}); }
  if (!/^[a-z0-9-]{2,150}$/.test(slug)) {
    return new Response('Invalid listing', {status: 404, headers: {...html, 'x-robots-tag': 'noindex'}});
  }
  try {
    const {items, stale} = await loadInventory(request);
    const u = items.find(x => x.id === slug);
    if (!u) {
      return new Response('<!doctype html><html><head><meta name="robots" content="noindex"><title>Camper no longer available</title></head><body><h1>This camper is no longer available.</h1><a href="/inventory">Browse current inventory</a></body></html>', {status: 404, headers: {...html, 'cache-control': 'no-store', 'x-robots-tag': 'noindex'}});
    }
    let specs = {};
    try {
      const resp = await fetch(new URL('/data/spec-library.json', request.url), {signal: AbortSignal.timeout(5000)});
      if (resp.ok) specs = await resp.json();
    } catch (_) {}
    return new Response(renderPage(u, specs), {headers: {...html, ...(stale ? {'x-inventory-status': 'stale'} : {})}});
  } catch (_) {
    return new Response('Inventory temporarily unavailable; please try again shortly.', {status: 503, headers: {...html, 'cache-control': 'no-store', 'x-robots-tag': 'noindex'}});
  }
};
