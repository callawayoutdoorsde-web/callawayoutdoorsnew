const clean = s => String(s || '').toLowerCase().replace(/&/g,'and').replace(/\b(recreational vehicles|rv company|rv co|rv)\b/g,'').replace(/[^a-z0-9]+/g,'').trim();
const makeClean = s => clean(s);
const candidates = u => [u.model, u.trim, `${u.model || ''} ${u.trim || ''}`].map(clean).filter(Boolean);
export function findSpec(u, lib = {}) {
  const y = String(u.year || '');
  const mk = makeClean(u.make);
  const cands = candidates(u);
  for (const [k, spec] of Object.entries(lib)) {
    const parts = k.split('|');
    if (parts[0] !== y || makeClean(parts[1]) !== mk) continue;
    const names = [parts.slice(2).join('|'), ...(spec.aliases || [])].map(clean).filter(Boolean);
    if (cands.some(c => names.includes(c))) return spec;
    if (cands.some(c => names.some(n => c.endsWith(n) || n.endsWith(c)))) return spec;
  }
  return null;
}
export function enrichWithSpecs(u, lib = {}) {
  const spec = findSpec(u, lib);
  return spec ? {...u, ...spec, specSource: spec.source || null} : u;
}
