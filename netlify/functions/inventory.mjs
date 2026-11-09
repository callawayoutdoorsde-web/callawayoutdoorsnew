import { getStore } from '@netlify/blobs';

// One authoritative inventory endpoint. Do NOT call /api/inventory from here:
// this function IS /api/inventory, and doing so causes recursive requests.
const FEED = 'https://28547101-1.websites.dealercenter.net/dealercenter/facebook/feed.php?dcid=28547101';
const CACHE_TTL_MS = 30 * 60 * 1000;
const HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'public, max-age=60'
};
const clean = value => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
const decode = value => String(value ?? '').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>').replace(/&quot;/gi, '"').replace(/&#39;/gi, "'");
const field = (xml, tag) => {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decode(match[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim()) : '';
};

function parseFeed(xml) {
  const listings = xml.match(/<listing\b[^>]*>[\s\S]*?<\/listing>/gi) || [];
  if (!listings.length) throw new Error('DealerCenter XML has no <listing> entries');
  const parsed = listings.map(x => ({
    vehicle_id: field(x, 'vehicle_id'), stock_number: field(x, 'stock_number'), vin: field(x, 'vin'),
    year: Number(field(x, 'year')), make: field(x, 'make'), model: field(x, 'model'),
    trim: field(x, 'trim'), price: Number(field(x, 'price').replace(/[^0-9.]/g, '')),
    photos: [...x.matchAll(/<image>\s*<url>([^<]+)<\/url>\s*<\/image>/gi)].map(m => decode(m[1])),
    source_url: field(x, 'url')
  })).filter(x => x.vehicle_id && x.year && x.price > 0 && x.photos.length > 0);
  if (!parsed.length) throw new Error(`DealerCenter feed had ${listings.length} listings but none passed validation`);
  return parsed;
}

function mergeInventory(feed, base) {
  const used = new Set(), ids = new Set();
  return feed.map(r => {
    const matches = u => u.year === r.year && (
      (clean(r.trim) && clean(u.model).includes(clean(r.trim))) ||
      (clean(r.model) && clean(u.model).includes(clean(r.model)))
    );
    const i = base.findIndex((u, j) => !used.has(j) && matches(u));
    if (i >= 0) used.add(i);
    const u = i >= 0 ? {...base[i]} : {
      id: `${r.year}-${clean(r.make).slice(0,14)}-${clean(r.trim || r.model)}`,
      type: 'Travel Trailer', tags: [], featured: false, condition: 'Used',
      location: 'Felton, Delaware', make: r.make, model: `${r.model} ${r.trim}`.trim()
    };
    Object.assign(u, {year: r.year, price: r.price, photos: r.photos, source_url: r.source_url,
      vin: r.vin, stock_number: r.stock_number, vehicle_id: r.vehicle_id});
    if (i >= 0 && r.trim && !clean(u.model).includes(clean(r.trim))) u.model += ` ${r.trim}`;
    if (ids.has(u.id)) u.id += `-${clean(r.vin || r.vehicle_id).slice(-8)}`;
    ids.add(u.id);
    if (!Array.isArray(u.tags)) u.tags = [];
    return u;
  });
}

function json(items, extra = {}) {
  return new Response(JSON.stringify(items), {headers: {...HEADERS, ...extra}});
}

export default async function inventory(request) {
  let store = null, cached = null;
  try {
    store = getStore('callaway-inventory');
    cached = await store.get('snapshot', {type: 'json'});
  } catch (error) {
    // Blob storage is an optimization; it must never stop a live feed request.
    console.warn('[inventory] Cache unavailable:', error?.message || String(error));
  }
  if (cached?.feedUrl === FEED && Array.isArray(cached.items) && cached.items.length &&
      Date.now() - Number(cached.checkedAt || 0) < CACHE_TTL_MS) {
    return json(cached.items);
  }

  try {
    // Feed is the source of truth for what is currently for sale.
    const feedResponse = await fetch(FEED, {signal: AbortSignal.timeout(10000)});
    if (!feedResponse.ok) throw new Error(`DealerCenter returned HTTP ${feedResponse.status}`);
    const feed = parseFeed(await feedResponse.text());

    // The local file only enriches the feed with descriptions, tags, and featured flags.
    // Failure to fetch this optional file must NOT take down the inventory.
    let base = [];
    try {
      const seed = await fetch(new URL('/data/inventory.json', request.url), {
        signal: AbortSignal.timeout(4000)
      });
      if (seed.ok) {
        const value = await seed.json();
        if (Array.isArray(value)) base = value;
      } else {
        console.warn(`[inventory] Optional seed returned HTTP ${seed.status}`);
      }
    } catch (error) {
      console.warn('[inventory] Optional seed unavailable:', error?.message || String(error));
    }
    if (!base.length && Array.isArray(cached?.items)) base = cached.items;

    // Preserve the last known valid feed if a transient partial response arrives.
    if (cached?.items?.length > 12 && feed.length < Math.floor(cached.items.length / 4)) {
      throw new Error(`Suspicious feed shrink: ${feed.length} vs cached ${cached.items.length}`);
    }
    const items = mergeInventory(feed, base);
    if (store) {
      try {
        await store.setJSON('snapshot', {feedUrl: FEED, checkedAt: Date.now(), items});
      } catch (error) {
        console.warn('[inventory] Could not update cache:', error?.message || String(error));
      }
    }
    console.info(`[inventory] Loaded ${items.length} DealerCenter campers`);
    return json(items);
  } catch (error) {
    console.error('[inventory] Live feed failure:', error?.stack || error?.message || String(error));
    if (Array.isArray(cached?.items) && cached.items.length) {
      return json(cached.items, {'x-inventory-status': 'stale', 'cache-control': 'no-store'});
    }
    return new Response(JSON.stringify({error: 'Live inventory unavailable'}), {
      status: 503, headers: {...HEADERS, 'cache-control': 'no-store'}
    });
  }
}

export const config = {path: '/api/inventory'};
