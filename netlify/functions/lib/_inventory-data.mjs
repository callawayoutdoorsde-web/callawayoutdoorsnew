// Share the inventory endpoint used by the live customer-facing inventory grid.
// This prevents different feed parsers or cache snapshots from producing different camper IDs.
export async function loadInventory(request) {
  const endpoint = new URL('/api/inventory', request.url);
  const response = await fetch(endpoint, {signal: AbortSignal.timeout(15000)});
  if (!response.ok) throw Error(`Inventory API returned ${response.status}`);
  const items = await response.json();
  if (!Array.isArray(items)) throw Error('Inventory API returned an invalid payload');
  return {items, stale: response.headers.get('x-inventory-status') === 'stale'};
}
