export const LEGACY_FEED = 'https://28547101-1.websites.dealercenter.net/dealercenter/facebook/feed.php?dcid=28547101';
export const TTL = 60 * 60 * 1000;
const clean = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const decode = s => String(s || '').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&quot;/gi, '"').replace(/&#39;/gi, "'");
const field = (xml, tag) => {
  const m = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return m ? decode(m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim()) : '';
};
export function parseLegacyXml(xml) {
  const chunks = xml.match(/<listing>[^]*?<\/listing>/g) || [];
  if (!chunks.length) throw Error('No listings in DealerCenter feed');
  return chunks.map(x => ({
    vehicle_id: field(x, 'vehicle_id'), stock_number: field(x, 'stock_number'), vin: field(x, 'vin'),
    year: Number(field(x, 'year')), make: field(x, 'make'), model: field(x, 'model'), trim: field(x, 'trim'),
    price: Number(field(x, 'price').replace(/[^0-9.]/g, '')),
    photos: [...x.matchAll(/<image>\s*<url>([^<]+)<\/url>\s*<\/image>/g)].map(m => decode(m[1])),
    source_url: field(x, 'url'), description: field(x, 'description') || field(x, 'web_ad_description')
  })).filter(r => r.year && r.make && r.price > 0 && r.photos.length);
}
function parseCsvRows(text) {
  const rows = []; let row = [], cell = '', quoted = false;
  for (let i=0;i<text.length;i++) {
    const ch=text[i];
    if (quoted) {
      if (ch==='"' && text[i+1]==='"') { cell+='"'; i++; }
      else if (ch==='"') quoted=false;
      else cell+=ch;
    } else {
      if (ch==='"') quoted=true;
      else if (ch===',') { row.push(cell); cell=''; }
      else if (ch==='\n') { row.push(cell.replace(/\r$/,'')); rows.push(row); row=[]; cell=''; }
      else cell+=ch;
    }
  }
  if (cell.length || row.length) { row.push(cell.replace(/\r$/,'')); rows.push(row); }
  return rows.filter(r=>r.some(v=>String(v).trim()!==''));
}
export function parseDealerCenterCsv(text) {
  const rows = parseCsvRows(String(text || '').replace(/^\uFEFF/,''));
  if (rows.length < 2) throw Error('DealerCenter CSV is empty');
  const headers = rows[0].map(h=>String(h).trim());
  const get = (obj, name) => String(obj[name] ?? '').trim();
  return rows.slice(1).map(values => {
    const obj = Object.fromEntries(headers.map((h,i)=>[h, values[i] ?? '']));
    const photoText = get(obj,'PhotoURLs');
    return {
      vehicle_id: get(obj,'VIN') || get(obj,'StockNumber'),
      stock_number: get(obj,'StockNumber'), vin: get(obj,'VIN'),
      year: Number(get(obj,'Year')), make: get(obj,'Make'), model: get(obj,'Model'), trim: get(obj,'Trim'),
      price: Number(get(obj,'Price').replace(/[^0-9.]/g,'')) + 599,
      photos: photoText.split(/\s*,\s*/).filter(x=>/^https?:\/\//i.test(x)),
      description: get(obj,'WebAdDescription'),
      equipment_code: get(obj,'EquipmentCode'),
      latest_photo_modified: get(obj,'LatestPhotoModifiedDate')
    };
  }).filter(r => r.year && r.make && r.price > 0 && r.photos.length);
}
export function mergeInventory(feed, base) {
  const used = new Set(), ids = new Set();
  return feed.map(r => {
    const target = clean(`${r.model} ${r.trim}`);
    let i = base.findIndex((u,j)=>!used.has(j) && Number(u.year)===Number(r.year) && clean(u.make)===clean(r.make) && [clean(u.model),clean(`${u.model} ${u.trim||''}`)].some(x=>x===target || x.endsWith(clean(r.trim)) || target.endsWith(x)));
    if (i < 0) i = base.findIndex((u,j)=>!used.has(j) && Number(u.year)===Number(r.year) && clean(u.make)===clean(r.make) && clean(r.trim) && clean(u.model).includes(clean(r.trim)));
    if (i >= 0) used.add(i);
    let u = i >= 0 ? {...base[i]} : {
      id: `${r.year}-${clean(r.make).slice(0,18)}-${clean(r.trim || r.model).slice(0,24)}`,
      type: 'Travel Trailer', tags: [], featured: false, condition: 'Used', location: 'Felton, Delaware'
    };
    u.make = r.make || u.make;
    u.model = `${r.model || ''} ${r.trim || ''}`.trim() || u.model;
    Object.assign(u, {year:r.year, price:r.price, photos:r.photos, vin:r.vin, stock_number:r.stock_number,
      vehicle_id:r.vehicle_id, description:r.description || u.description || '', equipment_code:r.equipment_code || '',
      latest_photo_modified:r.latest_photo_modified || ''});
    if (ids.has(u.id)) u.id += '-' + clean(r.stock_number || r.vin || r.vehicle_id).slice(-8);
    ids.add(u.id);
    return u;
  });
}
