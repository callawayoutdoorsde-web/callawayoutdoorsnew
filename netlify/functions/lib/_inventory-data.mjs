import { getStore } from '@netlify/blobs';
import { FEED, TTL, parseFeed, mergeInventory } from './_inventory-core.mjs';

// All three routes (inventory JSON, camper detail, and sitemap) use the SAME
// 24-hour cached DealerCenter snapshot. No private API keys are exposed.
export async function loadInventory(request) {
  const store = getStore('callaway-inventory');
  let cache;
  try { cache = await store.get('snapshot', {type: 'json'}); } catch (_) {}
  if (cache?.feedUrl === FEED && Array.isArray(cache.items) && Date.now() - cache.checkedAt < TTL)
    return {items: cache.items, stale: false};
  try {
    const [resp, baseResp] = await Promise.all([
      fetch(FEED, {signal: AbortSignal.timeout(12000)}),
      fetch(new URL('/data/inventory.json', request.url), {signal: AbortSignal.timeout(12000)})
    ]);
    if (!resp.ok || !baseResp.ok) throw Error('Feed or seed unavailable');
    const parsed = parseFeed(await resp.text());
    const base = await baseResp.json();
    if (parsed.length < Math.max(5, Math.floor(base.length * 0.5))) throw Error('Unexpectedly small feed');
    const items = mergeInventory(parsed, base);
    await store.setJSON('snapshot', {feedUrl: FEED, checkedAt: Date.now(), items});
    return {items, stale: false};
  } catch (e) {
    if (Array.isArray(cache?.items) && cache.items.length) return {items: cache.items, stale: true};
    throw Error('Live inventory unavailable');
  }
}
