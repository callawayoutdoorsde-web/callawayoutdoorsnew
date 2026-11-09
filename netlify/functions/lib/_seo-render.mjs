const SITE_HEADER = "<div class=\"topbar\"><div class=\"wrap topbarIn\"><span>8864 S Dupont Hwy, Felton, DE 19943</span><span>$0 down options* • Trades • Delivery • Warranty options</span></div></div>\n<nav class=\"nav\"><div class=\"wrap navin\">\n<a class=\"logoBrand\" href=\"index.html\" aria-label=\"Callaway Outdoors home\"><img src=\"assets/callaway_outdoors_site_logo.png\" alt=\"Callaway Outdoors RV dealer in Felton Delaware\"></a>\n<div class=\"links\"><a class=\"\" href=\"inventory.html\">Inventory</a><a class=\"\" href=\"financing.html\">Financing</a><a class=\"\" href=\"trade.html\">Sell / Trade</a><a class=\"\" href=\"service.html\">Service</a><a class=\"\" href=\"about.html\">Why Callaway</a><a class=\"\" href=\"contact.html\">Contact</a></div>\n<a class=\"btn dark\" href=\"tel:+13026405353\">(302) 640-5353</a>\n</div></nav>";
const SITE_FOOTER = "<footer class=\"footer\"><div class=\"wrap footerGrid\"><div><a class=\"logoBrand footerLogo\" href=\"index.html\"><img src=\"assets/callaway_outdoors_site_logo.png\" alt=\"Callaway Outdoors\"></a><p>Quality used campers at straightforward prices in Felton, Delaware.</p><div class=\"footerBadges\"><span>No hidden dealer fees</span><span>Trades accepted</span><span>Delivery available</span></div></div><div><strong>Shop</strong><ul><li><a href=\"inventory.html\">All inventory</a></li><li><a href=\"inventory.html?max=15000\">Under $15K</a></li><li><a href=\"inventory.html?tag=Bunkhouse\">Bunkhouses</a></li><li><a href=\"inventory.html?tag=Toy%20Hauler\">Toy haulers</a></li></ul></div><div><strong>Customer tools</strong><ul><li><a href=\"financing.html\">Financing / Apply</a></li><li><a href=\"trade.html\">Value my trade</a></li><li><a href=\"service.html\">Service & warranty</a></li><li><a href=\"contact.html\">Contact & hours</a></li></ul></div><div><strong>Callaway Outdoors</strong><ul><li>8864 S Dupont Hwy, Felton, DE 19943</li><li><a href=\"tel:+13026405353\">302-640-5353</a></li><li><a href=\"mailto:callawayoutdoorsde@gmail.com\">callawayoutdoorsde@gmail.com</a></li></ul></div></div><div class=\"wrap footerBottom\">© 2026 Callaway Outdoors. *$0 down subject to lender approval and qualification. Taxes, title and registration may apply. Inventory and pricing subject to prior sale.</div></footer>\n<div class=\"mobileBar\"><a href=\"inventory.html\">Inventory</a><a class=\"call\" href=\"tel:+13026405353\">Call sales</a><a href=\"financing.html\">Finance</a></div>\n";
const DOMAIN = 'https://callaway-outdoors.com';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const money = n => '$' + Number(n).toLocaleString('en-US', {maximumFractionDigits: 0});
const urlFor = u => `${DOMAIN}/inventory/${encodeURIComponent(u.id)}.html`;
const schema = x => JSON.stringify(x).replace(/</g, '\\u003c');
const clean = s => String(s || '').toLowerCase().replace(/&/g, 'and').replace(/\b(recreational vehicles|rv company|rv co|rv)\b/g, '').replace(/[^a-z0-9]+/g, '');
export const STATIC_PAGES = ['/', '/inventory.html', '/financing.html', '/trade.html', '/service.html', '/about.html', '/contact.html'];
export function getSpecs(u, library) {
  const key = `${u.year}|${String(u.make || '').trim().toLowerCase()}|${String(u.model || '').trim().toLowerCase()}`;
  if (library[key]) return library[key];
  for (const [k, spec] of Object.entries(library)) {
    const parts = k.split('|');
    if (parts[0] !== String(u.year) || clean(parts[1]) !== clean(u.make)) continue;
    if ([parts.slice(2).join('|'), ...(spec.aliases || [])].some(name => clean(name) === clean(u.model))) return spec;
  }
  return null;
}
const fmt = n => `${Number(n).toLocaleString('en-US')} lbs`;
export function renderPage(u, library = {}) {
  const title = `${u.year} ${u.make} ${u.model}`.trim();
  const canonical = urlFor(u);
  const desc = `Used ${title} for sale at Callaway Outdoors in Felton, Delaware. Current price ${money(u.price)}. View photos, camper details, financing and trade-in options.`;
  const photo = (u.photos || []).filter(Boolean);
  const tags = Array.isArray(u.tags) ? u.tags : [];
  const spec = getSpecs(u, library);
  const specs = spec?.verified ? [
    ['Length', spec.length], ['Dry weight', spec.dryWeight ? fmt(spec.dryWeight) : ''],
    ['GVWR', spec.gvwr ? fmt(spec.gvwr) : ''], ['Sleeps', spec.sleeps],
    ['Slide-outs', spec.slides], ['Hitch weight', spec.hitchWeight ? fmt(spec.hitchWeight) : '']
  ].filter(([, v]) => v !== '' && v !== null && v !== undefined) : [];
  const product = {
    '@context': 'https://schema.org', '@type': 'Product', name: title, description: desc,
    image: photo, brand: {'@type':'Brand', name: u.make},
    category: u.type || 'Used RV', itemCondition: 'https://schema.org/UsedCondition',
    ...(u.stock_number || u.vin ? {sku: u.stock_number || u.vin} : {}),
    ...(u.vin ? {additionalProperty: [{'@type': 'PropertyValue', name: 'VIN', value: u.vin}]} : {}),
    offers: {'@type': 'Offer', price: u.price, priceCurrency: 'USD',
      availability: 'https://schema.org/InStock', url: canonical,
      seller: {'@type': 'Organization', name: 'Callaway Outdoors'}}
  };
  const gallery = photo.length ? `<div class="gallery"><img class="galleryMain" src="${esc(photo[0])}" alt="${esc(title)} for sale at Callaway Outdoors" fetchpriority="high"><div class="thumbRow">${photo.slice(1,6).map((src,i)=>`<img src="${esc(src)}" alt="${esc(title)} photo ${i+2}" loading="lazy">`).join('')}</div></div>` : `<div class="bigPhoto">Photos coming soon</div>`;
  const body = `<section class="detailHero"><div class="wrap detailGrid"><div>${gallery}</div><aside class="detailPanel">
    <div class="kicker">PRE-OWNED • ${esc(u.type || 'CAMPER')}</div>
    <h1>${esc(u.year)} ${esc(u.make)}<br>${esc(u.model)}</h1>
    <div class="price">${money(u.price)}</div>
    <p style="font-weight:850;line-height:1.45">Straightforward pricing with $0 down options for well-qualified buyers, trades and delivery available.</p>
    <div class="tags">${tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>
    ${specs.length ? `<div class="verifiedSpecs"><div class="verifiedSpecsHead"><strong>Verified model specifications</strong><span>Matched by year / make / model</span></div><div class="specDataGrid">${specs.map(([k,v])=>`<div class="specDataItem"><small>${esc(k)}</small><strong>${esc(v)}</strong></div>`).join('')}</div><p class="specDisclaimer">Manufacturer/base-model specifications. Options and production changes may affect actual figures. Verify the unit data plate before towing.</p></div>` : ''}
    <div class="specs"><div class="spec"><strong>Condition</strong><br><span class="meta">Pre-owned</span></div><div class="spec"><strong>Location</strong><br><span class="meta">Felton, Delaware</span></div>${u.stock_number ? `<div class="spec"><strong>Stock #</strong><br><span class="meta">${esc(u.stock_number)}</span></div>` : ''}${u.vin ? `<div class="spec"><strong>VIN</strong><br><span class="meta">${esc(u.vin)}</span></div>` : ''}<div class="spec"><strong>Financing</strong><br><span class="meta">$0 down options*</span></div><div class="spec"><strong>Trades</strong><br><span class="meta">Welcome</span></div></div>
    <div class="actions"><a class="btn red" href="tel:+13026405353">Call (302) 640-5353</a><a class="btn light" href="/financing.html?price=${encodeURIComponent(u.price)}">Financing options</a></div>
    <p class="notice">*$0 down subject to lender approval and qualification. Taxes, title and registration may apply. Inventory and pricing subject to prior sale.</p>
    </aside></div></section>
    <section class="section"><div class="wrap"><div class="eyebrow darkEyebrow">USED RV FOR SALE IN DELAWARE</div><h2>${esc(title)} at Callaway Outdoors</h2><p>This pre-owned ${esc(u.type || 'camper')} is listed for ${money(u.price)} at Callaway Outdoors in Felton, Delaware. Contact us to confirm current availability, exact specifications, condition and included equipment before traveling.</p><div class="relatedLinks"><a href="/inventory.html">All used RVs</a><a href="/financing.html?price=${encodeURIComponent(u.price)}">RV financing</a><a href="/trade.html">Trade your camper</a><a href="/contact.html">Directions &amp; hours</a></div></div></section>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="/">
  <title>${esc(title)} for Sale in Delaware | Callaway Outdoors</title>
  <meta name="description" content="${esc(desc)}"><meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${esc(canonical)}"><meta name="theme-color" content="#101114">
  <meta property="og:type" content="product"><meta property="og:site_name" content="Callaway Outdoors">
  <meta property="og:title" content="${esc(title)} for Sale"><meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${esc(canonical)}"><meta property="og:image" content="${esc(photo[0] || DOMAIN+'/assets/callaway_outdoors_site_logo.png')}">
  <link rel="stylesheet" href="/css/styles.css"><script type="application/ld+json">${schema(product)}</script></head>
  <body>${SITE_HEADER}<main>${body}</main>${SITE_FOOTER}</body></html>`;
}
export function renderSitemap(items) {
  const urls = [...STATIC_PAGES.map(path => DOMAIN + path), ...items.map(urlFor)];
  const unique = [...new Set(urls)];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${unique.map(url => `  <url><loc>${esc(url)}</loc></url>`).join('\n')}\n</urlset>\n`;
}
