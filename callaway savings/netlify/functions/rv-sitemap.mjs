import { loadInventory } from './lib/_inventory-data.mjs';
import { renderSitemap } from './lib/_seo-render.mjs';
export default async request => {
  try {
    const {items, stale} = await loadInventory(request);
    return new Response(renderSitemap(items), {headers: {'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=300', ...(stale ? {'x-inventory-status': 'stale'} : {})}});
  } catch (_) {
    return new Response('Sitemap temporarily unavailable', {status: 503, headers: {'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store'}});
  }
};
