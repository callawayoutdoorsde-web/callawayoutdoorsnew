import { loadInventory } from './lib/_inventory-data.mjs';
export default async request => {
  const headers = {'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=300'};
  try {
    const {items, stale} = await loadInventory(request);
    return new Response(JSON.stringify(items), {headers: {...headers, ...(stale ? {'x-inventory-status': 'stale'} : {})}});
  } catch (_) {
    return new Response(JSON.stringify({error: 'Live inventory unavailable'}), {status: 503, headers: {...headers, 'cache-control': 'no-store'}});
  }
};
export const config = {path: '/api/inventory'};
