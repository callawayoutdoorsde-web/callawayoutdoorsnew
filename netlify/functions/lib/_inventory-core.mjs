// Shared DealerCenter parsing/merchandising logic for all inventory endpoints.
export const FEED = 'https://28547101-1.websites.dealercenter.net/dealercenter/facebook/feed.php?dcid=28547101';
export const TTL = 24 * 60 * 60 * 1000;
const clean = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const decode = s => String(s || '').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&quot;/gi, '"').replace(/&#39;/gi, "'");
const field = (xml, tag) => {
  const m = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return m ? decode(m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim()) : '';
};
export function parseFeed(xml) {
  const chunks = xml.match(/<listing>[^]*?<\/listing>/g) || [];
  if (!chunks.length) throw Error('No listings in DealerCenter feed');
  return chunks.map(x => ({
    vehicle_id: field(x, 'vehicle_id'), stock_number: field(x, 'stock_number'), vin: field(x, 'vin'),
    year: Number(field(x, 'year')), make: field(x, 'make'), model: field(x, 'model'), trim: field(x, 'trim'),
    price: Number(field(x, 'price').replace(/[^0-9.]/g, '')),
    photos: [...x.matchAll(/<image>\s*<url>([^<]+)<\/url>\s*<\/image>/g)].map(m => decode(m[1])),
    source_url: field(x, 'url')
  })).filter(r => r.vehicle_id && r.year && r.price > 0 && r.photos.length);
}
export function mergeInventory(feed, base) {
  const used = new Set(), ids = new Set();
  return feed.map(r => {
    let i = base.findIndex((u, j) => !used.has(j) && u.year === r.year &&
      ((clean(r.trim) && clean(u.model).includes(clean(r.trim))) ||
       (clean(r.model) && clean(u.model).includes(clean(r.model)))));
    if (i < 0) i = base.findIndex((u, j) => !used.has(j) && u.year === r.year && clean(r.trim) && clean(u.model).includes(clean(r.trim)));
    if (i >= 0) used.add(i);
    let u = i >= 0 ? {...base[i]} : {
      id: `${r.year}-${clean(r.make).slice(0,14)}-${clean(r.trim || r.model)}`,
      type: 'Travel Trailer', tags: [], featured: false, condition: 'Used',
      location: 'Felton, Delaware', make: r.make, model: `${r.model} ${r.trim}`.trim()
    };
    Object.assign(u, {year: r.year, price: r.price, photos: r.photos,
      source_url: r.source_url, vin: r.vin, stock_number: r.stock_number, vehicle_id: r.vehicle_id});
    if (i >= 0 && r.trim && !clean(u.model).includes(clean(r.trim))) u.model += ' ' + r.trim;
    // Two newly added campers can share year/make/model; keep their URLs distinct.
    if (ids.has(u.id)) u.id += '-' + clean(r.vin || r.vehicle_id).slice(-8);
    ids.add(u.id);
    return u;
  });
}
