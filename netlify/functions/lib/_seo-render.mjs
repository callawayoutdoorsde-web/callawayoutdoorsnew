import { findSpec } from './_spec-match.mjs';
const SITE_HEADER = "<div class=\"topbar\"><div class=\"wrap topbarIn\"><span>8864 S Dupont Hwy, Felton, DE 19943</span><span>$0 down options* • Trades • Delivery • Warranty options</span></div></div>\n<nav class=\"nav\"><div class=\"wrap navin\">\n<a class=\"logoBrand\" href=\"index.html\" aria-label=\"Callaway Outdoors home\"><img src=\"assets/callaway_outdoors_site_logo.png\" alt=\"Callaway Outdoors RV dealer in Felton Delaware\"></a>\n<div class=\"links\"><a class=\"\" href=\"inventory.html\">Inventory</a><a class=\"\" href=\"financing.html\">Financing</a><a class=\"\" href=\"trade.html\">Sell / Trade</a><a class=\"\" href=\"service.html\">Service</a><a class=\"\" href=\"about.html\">Why Callaway</a><a class=\"\" href=\"contact.html\">Contact</a></div>\n<a class=\"btn dark\" href=\"tel:+13026405353\">(302) 640-5353</a>\n</div></nav>";
const SITE_FOOTER = "<footer class=\"footer\"><div class=\"wrap footerGrid\"><div><a class=\"logoBrand footerLogo\" href=\"index.html\"><img src=\"assets/callaway_outdoors_site_logo.png\" alt=\"Callaway Outdoors\"></a><p>Quality used campers at straightforward prices in Felton, Delaware.</p><div class=\"footerBadges\"><span>No hidden dealer fees</span><span>Trades accepted</span><span>Delivery available</span></div></div><div><strong>Shop</strong><ul><li><a href=\"inventory.html\">All inventory</a></li><li><a href=\"inventory.html?max=15000\">Under $15K</a></li><li><a href=\"inventory.html?tag=Bunkhouse\">Bunkhouses</a></li><li><a href=\"inventory.html?tag=Toy%20Hauler\">Toy haulers</a></li></ul></div><div><strong>Customer tools</strong><ul><li><a href=\"financing.html\">Financing / Apply</a></li><li><a href=\"trade.html\">Value my trade</a></li><li><a href=\"service.html\">Service & warranty</a></li><li><a href=\"contact.html\">Contact & hours</a></li></ul></div><div><strong>Callaway Outdoors</strong><ul><li>8864 S Dupont Hwy, Felton, DE 19943</li><li><a href=\"tel:+13026405353\">302-640-5353</a></li><li><a href=\"mailto:callawayoutdoorsde@gmail.com\">callawayoutdoorsde@gmail.com</a></li></ul></div></div><div class=\"wrap footerBottom\">© 2026 Callaway Outdoors. *$0 down subject to lender approval and qualification. Taxes, title and registration may apply. Inventory and pricing subject to prior sale.</div></footer>\n<div class=\"mobileBar\"><a href=\"inventory.html\">Inventory</a><a class=\"call\" href=\"tel:+13026405353\">Call sales</a><a href=\"financing.html\">Finance</a></div>\n";
const DOMAIN = 'https://callaway-outdoors.com';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const money = n => '$' + Number(n).toLocaleString('en-US', {maximumFractionDigits: 0});
const urlFor = u => `${DOMAIN}/inventory/${encodeURIComponent(u.id)}.html`;
const schema = x => JSON.stringify(x).replace(/</g, '\\u003c');
const clean = s => String(s || '').toLowerCase().replace(/&/g, 'and').replace(/\b(recreational vehicles|rv company|rv co|rv)\b/g, '').replace(/[^a-z0-9]+/g, '');
export const STATIC_PAGES = ['/', '/inventory.html', '/financing.html', '/trade.html', '/service.html', '/about.html', '/contact.html', '/used-travel-trailers-delaware.html', '/used-fifth-wheels-delaware.html', '/used-toy-haulers-delaware.html', '/bunkhouse-campers-delaware.html', '/used-campers-dover-de.html', '/used-campers-milford-de.html', '/used-campers-harrington-de.html', '/used-campers-kent-county-de.html', '/rv-roof-repair-delaware.html', '/rv-slide-out-repair-delaware.html', '/rv-floor-repair-delaware.html', '/rv-service-delaware.html'];
export function getSpecs(u, library) { return u?.verified ? u : findSpec(u, library); }
const fmt = n => `${Number(n).toLocaleString('en-US')} lbs`;

const CUSTOM_COPY = {
  '2019-momentum-376th': `Exceptionally well-kept Grand Design Momentum 376TH with the hard-to-find front-living layout and a dedicated toy-hauler garage for a motorcycle, golf cart or other gear. Six-point automatic leveling makes setup easier, while the outdoor entertainment and kitchen area give you plenty of space to enjoy the campsite. This is a strong option for extended travel, seasonal camping or full-time RV living when you want residential-style space without giving up a garage.`,
  '2022-catalina-303rkds': `Very clean Coachmen Catalina 303RKDS with an open, roomy rear-kitchen layout. Two slide-outs create a spacious interior, while the large bedroom storage, dual electric fireplaces and outdoor kitchen make this a versatile camper for weekend trips, seasonal camping or extended stays.`,
  '2020-salem-hemisphere-314bud': `Clean Salem Hemisphere 314BUD built around a family-friendly bunkhouse floorplan. This layout combines a separate bunk room, bath-and-a-half arrangement and outdoor kitchen, making it especially useful for families, seasonal sites and longer camping trips where extra sleeping space and privacy matter.`,
  '2017-outback-324cg': `Keystone Outback 324CG toy hauler with a versatile rear garage that works well for motorcycles, golf carts, bikes and other camping gear. The garage is approximately 93 inches wide, with a rear opening approximately 56 inches wide by 72 inches tall. It gives you toy-hauler utility while still keeping the comfortable living space of a travel trailer.`,
  '2021-salem-fsx-260rt': `Versatile Salem FSX 260RT toy hauler that is easy to use for camping, hauling toys or setting up at a seasonal site. The rear ramp can double as a patio-style deck, and the open cargo area gives you flexibility for motorcycles, golf carts, bikes or extra camping equipment.`,
  '2018-crossroadsrv-ss331bh': `Extremely clean and well-kept Sunset Trail 331BH with a large separate bunkhouse, sleeping space for a big family or group, a bath-and-a-half layout with a second entry door, and a large outdoor kitchen. It is a strong choice for seasonal camping or anyone who wants extra room without stepping into a fifth wheel.`,
  '2018-heritage-glen-272rl': `Well-kept Heritage Glen 272RL with a wide-open rear-living floorplan, walk-around bedroom, large bathroom, reclining loveseat and sofa. The outdoor kitchen adds another useful entertaining space, making this a comfortable camper for couples or extended stays.`,
  '2016-cherokee-274dbh': `A lot of camper for the money. This Cherokee 274DBH combines a practical bunkhouse layout with family-friendly sleeping space and a straightforward travel-trailer design. It is an appealing value for buyers who want a usable bunkhouse without moving into a much higher price range.`,
  '2018-premier-31bkpr': `Very clean Keystone Premier 31BKPR with a family-oriented bunkhouse layout and plenty of interior room. It is a good fit for weekend camping, seasonal sites or families who want separate sleeping space without stepping up to a larger fifth wheel.`,
  '2015-sprinter-295rks': `Keystone Sprinter 295RKS with a roomy rear-kitchen floorplan that keeps the cooking area separated from the main living space. The open center living area and private front bedroom make this a comfortable option for couples, seasonal camping or extended trips.`,
  '2017-premier-29rkpr': `Keystone Premier 29RKPR with a practical rear-kitchen layout and comfortable living space. The floorplan works especially well for couples or seasonal campers who want an open main living area and a private front bedroom.`,
  '2024-twilight-tws31bh': `Late-model Cruiser Twilight TWS31BH with a spacious bunkhouse layout designed for families who want extra sleeping room and separation from the main living area. The combination of newer construction, multiple sleeping areas and a roomy interior makes it a strong choice for travel, seasonal camping or extended stays.`,
  '2012-outback-312bh': `Affordable Keystone Outback 312BH with a family-friendly bunkhouse floorplan and plenty of usable interior space. It is a value-focused option for buyers who want a larger camper and separate sleeping areas without the price of a newer unit.`,
  '2025-coleman-17b': `Compact, lightweight Coleman 17B with a bunkhouse layout that is easy to manage and easier to tow than many full-size travel trailers. It is a practical choice for first-time buyers, couples or small families who want a newer camper at an approachable price point.`,
  '2020-cherokee-324ts': `Forest River Cherokee 324TS with a large bunkhouse-oriented layout and outdoor kitchen. The extra sleeping space and separate areas make it a practical camper for families, seasonal sites and longer trips where room to spread out matters.`,
  '2020-kz-sportsmen-312bhse': `KZ Sportsmen 312BHSE with a family-friendly bunkhouse floorplan and outdoor kitchen. It offers the separate sleeping space families look for while keeping a practical travel-trailer layout for camping and seasonal use.`,
  '2021-tracer-200bhsle': `Lightweight Prime Time Tracer 200BHSLE with a bunkhouse layout that gives families extra sleeping space without requiring a very large trailer. Its manageable size makes it appealing to buyers looking for easier towing and a practical weekend-camping setup.`
};

function featureList(u, spec) {
  const tags = Array.isArray(u.tags) ? u.tags : [];
  const items = [];
  for (const tag of tags) if (tag && !/^Under \$/i.test(tag)) items.push(tag);
  if (spec?.verified) {
    if (spec.sleeps) items.push(`Sleeps up to ${spec.sleeps}`);
    if (spec.slides !== undefined && spec.slides !== null && String(spec.slides) !== '') items.push(`${spec.slides} slide-out${Number(spec.slides)===1?'':'s'}`);
    if (spec.length) items.push(`${spec.length} overall length`);
    if (spec.dryWeight) items.push(`${Number(spec.dryWeight).toLocaleString('en-US')} lb dry weight`);
  }
  items.push('Financing available for qualified buyers', 'Trades accepted', 'Delivery available');
  return [...new Set(items)].slice(0, 9);
}

function generatedCopy(u, spec) {
  const title = `${u.year} ${u.make} ${u.model}`.trim();
  const tags = Array.isArray(u.tags) ? u.tags.filter(Boolean) : [];
  const tagText = tags.length ? ` Highlights include ${tags.slice(0,3).join(', ').toLowerCase()}.` : '';
  const specText = spec?.verified ? `${spec.sleeps ? ` It sleeps up to ${spec.sleeps}.` : ''}${spec.slides !== undefined && spec.slides !== null && String(spec.slides) !== '' ? ` It has ${spec.slides} slide-out${Number(spec.slides)===1?'':'s'}.` : ''}${spec.length ? ` Overall length is approximately ${spec.length}.` : ''}` : '';
  return `${title} is a pre-owned ${String(u.type || 'camper').toLowerCase()} currently available at Callaway Outdoors in Felton, Delaware.${tagText}${specText} This unit can be a strong fit for weekend camping, seasonal use or extended travel depending on the floorplan and towing setup. Contact our team to confirm current condition, included equipment and availability before traveling.`;
}

function salesCopy(u, spec) { return CUSTOM_COPY[u.id] || generatedCopy(u, spec); }

export function renderPage(u, library = {}) {
  const title = `${u.year} ${u.make} ${u.model}`.trim();
  const canonical = urlFor(u);
  const desc = `Used ${title} camper for sale at Callaway Outdoors in Felton, Delaware. Price ${money(u.price)}. View photos, specs and estimated payments. $0 down financing options for qualified buyers.`;
  const photo = (u.photos || []).filter(Boolean);
  const tags = Array.isArray(u.tags) ? u.tags : [];
  const spec = getSpecs(u, library);
  const specs = spec?.verified ? [
    ['Length', spec.length], ['Dry weight', spec.dryWeight ? fmt(spec.dryWeight) : ''],
    ['GVWR', spec.gvwr ? fmt(spec.gvwr) : ''], ['Sleeps', spec.sleeps],
    ['Slide-outs', spec.slides], ['Hitch weight', spec.hitchWeight ? fmt(spec.hitchWeight) : '']
  ].filter(([, v]) => v !== '' && v !== null && v !== undefined) : [];
  const copy = salesCopy(u, spec);
  const features = featureList(u, spec);
  const product = {
    '@context': 'https://schema.org', '@type': 'Product', name: title, description: copy,
    image: photo, brand: {'@type':'Brand', name: u.make},
    category: u.type || 'Used RV', itemCondition: 'https://schema.org/UsedCondition',
    ...(u.stock_number || u.vin ? {sku: u.stock_number || u.vin} : {}),
    ...(u.vin ? {additionalProperty: [{'@type': 'PropertyValue', name: 'VIN', value: u.vin}]} : {}),
    offers: {'@type': 'Offer', price: u.price, priceCurrency: 'USD',
      availability: 'https://schema.org/InStock', url: canonical,
      seller: {'@type': 'Organization', name: 'Callaway Outdoors'}}
  };
  const gallery = photo.length ? `<div class="gallery" data-gallery tabindex="0"><div class="galleryStage"><img class="galleryMain" src="${esc(photo[0])}" alt="${esc(title)} for sale at Callaway Outdoors" fetchpriority="high"><button class="galleryNav galleryPrev" type="button" aria-label="Previous photo">‹</button><button class="galleryNav galleryNext" type="button" aria-label="Next photo">›</button><span class="galleryCounter">1 / ${photo.length}</span></div><div class="thumbRow">${photo.map((src,i)=>`<img class="galleryThumb${i===0?' is-active':''}" data-full="${esc(src)}" src="${esc(src)}" alt="${esc(title)} photo ${i+1}" loading="${i<4?'eager':'lazy'}">`).join('')}</div></div>` : `<div class="bigPhoto">Photos coming soon</div>`;
  const body = `<section class="detailHero"><div class="wrap"><div class="breadcrumb"><a href="/">Home</a> › <a href="/inventory.html">Used RV Inventory</a> › ${esc(title)}</div></div><div class="wrap detailGrid"><div>${gallery}</div><aside class="detailPanel">
    <div class="kicker">PRE-OWNED • ${esc(u.type || 'CAMPER')}</div>
    <h1>${esc(u.year)} ${esc(u.make)}<br>${esc(u.model)}</h1>
    <div class="price">${money(u.price)}</div>
    <div id="seoEstimatedPayment"></div>
    <p style="font-weight:850;line-height:1.45">Straightforward pricing with $0 down options for well-qualified buyers, trades and delivery available.</p>
    <div class="tags">${tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>
    ${specs.length ? `<div class="verifiedSpecs"><div class="verifiedSpecsHead"><strong>Verified model specifications</strong><span>Matched by year / make / model</span></div><div class="specDataGrid">${specs.map(([k,v])=>`<div class="specDataItem"><small>${esc(k)}</small><strong>${esc(v)}</strong></div>`).join('')}</div><p class="specDisclaimer">Manufacturer/base-model specifications. Options and production changes may affect actual figures. Verify the unit data plate before towing.</p></div>` : ''}
    <div class="specs"><div class="spec"><strong>Condition</strong><br><span class="meta">Pre-owned</span></div><div class="spec"><strong>Location</strong><br><span class="meta">Felton, Delaware</span></div>${u.stock_number ? `<div class="spec"><strong>Stock #</strong><br><span class="meta">${esc(u.stock_number)}</span></div>` : ''}${u.vin ? `<div class="spec"><strong>VIN</strong><br><span class="meta">${esc(u.vin)}</span></div>` : ''}<div class="spec"><strong>Financing</strong><br><span class="meta">$0 down options*</span></div><div class="spec"><strong>Trades</strong><br><span class="meta">Welcome</span></div></div>
    <div id="seoPaymentCalculator"></div><div class="actions"><a class="btn red" href="tel:+13026405353">Call (302) 640-5353</a><a class="btn light" href="/financing.html?price=${encodeURIComponent(u.price)}">Financing options</a></div>
    <p class="notice">*$0 down subject to lender approval and qualification. Taxes, title and registration may apply. Inventory and pricing subject to prior sale.</p>
    </aside></div></section>
    <section class="section unitSalesSection"><div class="wrap unitSeoCopy"><div class="eyebrow darkEyebrow">ABOUT THIS CAMPER</div><h2>${esc(title)} for Sale in Delaware</h2><p class="unitSalesCopy">${esc(copy)}</p>${u.description ? `<p class="dealerCenterCopy"><strong>Dealer notes:</strong> ${esc(u.description)}</p>` : ''}<h3>Highlights</h3><div class="unitFeatureGrid">${features.map(x=>`<div>✓ ${esc(x)}</div>`).join('')}</div><div class="unitValueBox"><h3>Why buy this camper from Callaway Outdoors?</h3><p>We focus on straightforward pricing and an easier buying experience. Financing is available for qualified buyers, trades are welcome, delivery is available, and our team can help you compare this unit with other campers in stock.</p></div><div class="relatedLinks"><a href="/inventory.html">All used RVs</a><a href="/used-travel-trailers-delaware.html">Travel trailers</a><a href="/used-toy-haulers-delaware.html">Toy haulers</a><a href="/bunkhouse-campers-delaware.html">Bunkhouses</a><a href="/financing.html?price=${encodeURIComponent(u.price)}">RV financing</a><a href="/trade.html">Trade your camper</a><a href="/contact.html">Directions &amp; hours</a></div></div></section>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="/">
  <title>${esc(title)} For Sale in Delaware | Callaway Outdoors</title>
  <meta name="description" content="${esc(desc)}"><meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${esc(canonical)}"><meta name="theme-color" content="#101114">
  <meta property="og:type" content="product"><meta property="og:site_name" content="Callaway Outdoors">
  <meta property="og:title" content="${esc(title)} For Sale in Delaware | Callaway Outdoors"><meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${esc(canonical)}"><meta property="og:image" content="${esc(photo[0] || DOMAIN+'/assets/callaway_outdoors_site_logo.png')}">
  <link rel="stylesheet" href="/css/styles.css"><script type="application/ld+json">${schema(product)}</script></head>
  <body>${SITE_HEADER}<main>${body}</main>${SITE_FOOTER}<script src="/js/payment.js?v=seo-v3"></script><script>if(window.CallawayPayment){document.getElementById("seoEstimatedPayment").innerHTML=window.CallawayPayment.estimate(${Number(u.price)||0});document.getElementById("seoPaymentCalculator").innerHTML=window.CallawayPayment.calculator(${Number(u.price)||0});window.CallawayPayment.bind(document);}</script><script src="/js/gallery.js" defer></script></body></html>`;
}
export function renderSitemap(items) {
  const urls = [...STATIC_PAGES.map(path => DOMAIN + path), ...items.map(urlFor)];
  const unique = [...new Set(urls)];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${unique.map(url => `  <url><loc>${esc(url)}</loc></url>`).join('\n')}\n</urlset>\n`;
}
