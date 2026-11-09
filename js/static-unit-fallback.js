// Fallback only: Netlify normally serves /inventory/*.html via rv-page.mjs.
// If rewrites are temporarily unavailable, don't display stale prices or sold stock.
(async () => {
  const main = document.querySelector('.staticUnit[data-unit-id]');
  if (!main) return;
  try {
    const r = await fetch('/api/inventory', {cache: 'no-store'});
    if (!r.ok) return;
    const list = await r.json();
    const u = list.find(x => x.id === main.dataset.unitId);
    if (!u) {
      main.innerHTML = '<section class="section"><div class="wrap"><h1>This camper is no longer available</h1><p>Browse our current inventory.</p><a class="btn red" href="/inventory.html">Shop current inventory</a></div></section>';
      document.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex,follow');
      return;
    }
    const price = '$' + Number(u.price).toLocaleString('en-US');
    main.querySelectorAll('.price').forEach(el => el.textContent = price);
    const gallery = main.querySelector('.unitGalleryPlaceholder');
    if (gallery && u.photos?.length) {
      const esc = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      gallery.outerHTML = `<div class="gallery"><img class="galleryMain" src="${esc(u.photos[0])}" alt="${esc(u.year+' '+u.make+' '+u.model)}"><div class="thumbRow">${u.photos.slice(1,6).map(x => `<img src="${esc(x)}" alt="Camper photo">`).join('')}</div></div>`;
    }
    main.querySelectorAll('a[href*="financing.html?price="]').forEach(a => a.href = '/financing.html?price=' + encodeURIComponent(u.price));
    const copy = main.querySelector('.unitSeoCopy p');
    if (copy) copy.innerHTML = `This pre-owned camper is currently listed for <strong>${price}</strong> at Callaway Outdoors in Felton, Delaware. Contact us to confirm availability and specifications.`;
  } catch (_) {}
})();
