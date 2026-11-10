// Callaway Outdoors Google Reviews: Netlify server-side function.
// Required: GOOGLE_PLACES_API_KEY (Netlify environment variable, Functions scope).
// Optional: GOOGLE_PLACE_ID (avoids business name lookup).
const placeQuery = 'Callaway Outdoors LLC, 8864 S Dupont Hwy, Felton, DE 19943';
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': status === 200 ? 'public, max-age=3600' : 'no-store' }
});
function env(name) {
  const node = typeof process !== 'undefined' ? process.env?.[name] : undefined;
  const netlify = typeof Netlify !== 'undefined' ? Netlify.env?.get?.(name) : undefined;
  return String(node || netlify || '').trim();
}
async function googleJSON(url, options, stage) {
  let response;
  try { response = await fetch(url, options); }
  catch (e) { throw { stage, googleStatus: 'NETWORK_ERROR', googleMessage: String(e?.message || e).replaceAll(options?.headers?.['X-Goog-Api-Key'] || '\u0000', '[REDACTED]').slice(0, 250) }; }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const googleStatus = body?.error?.status || `HTTP_${response.status}`;
    const googleMessage = String(body?.error?.message || `Google returned HTTP ${response.status}`).replaceAll(options?.headers?.['X-Goog-Api-Key'] || '\u0000', '[REDACTED]').slice(0, 450);
    throw { stage, googleStatus, googleMessage, httpStatus: response.status };
  }
  return body;
}
export default async () => {
  const key = env('GOOGLE_PLACES_API_KEY');
  if (!key) return json({ error: 'Google Places API key not configured', diagnostic: 'Add GOOGLE_PLACES_API_KEY to this Netlify site with Functions scope and redeploy.' }, 503);
  try {
    let placeId = env('GOOGLE_PLACE_ID');
    if (!placeId) {
      const found = await googleJSON('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'places.id,places.displayName' },
        body: JSON.stringify({ textQuery: placeQuery })
      }, 'place_search');
      const place = found.places?.find(p => /callaway outdoors/i.test(p.displayName?.text || ''));
      if (!place?.id) return json({ error: 'Reviews unavailable', stage: 'place_search', diagnostic: 'Google did not return a matching Callaway Outdoors listing. Set GOOGLE_PLACE_ID in Netlify.' }, 502);
      placeId = place.id;
    }
    const data = await googleJSON('https://places.googleapis.com/v1/places/' + encodeURIComponent(placeId), {
      headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'rating,userRatingCount,reviews' }
    }, 'place_details');
    const reviews = (data.reviews || []).map(r => ({
      author: r.authorAttribution?.displayName || 'Google reviewer',
      photo: r.authorAttribution?.photoUri || '',
      rating: r.rating,
      text: r.text?.text || r.originalText?.text || ''
    })).filter(r => r.text);
    return json({ rating: data.rating, total: data.userRatingCount, reviews });
  } catch (e) {
    // Never include API keys, request headers, or credentials in diagnostics.
    return json({ error: 'Reviews unavailable', stage: e?.stage || 'unknown', googleStatus: e?.googleStatus || 'UNKNOWN', googleMessage: e?.googleMessage || 'Unexpected function error', httpStatus: e?.httpStatus || undefined }, 502);
  }
};
export const config = { path: '/.netlify/functions/google-reviews' };
