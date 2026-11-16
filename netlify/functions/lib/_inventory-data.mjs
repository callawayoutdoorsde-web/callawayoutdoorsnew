import { getStore } from '@netlify/blobs';
import SftpClient from 'ssh2-sftp-client';
import { LEGACY_FEED, TTL, parseLegacyXml, parseDealerCenterCsv, mergeInventory } from './_inventory-core.mjs';
import { enrichWithSpecs } from './_spec-match.mjs';

async function readSftpCsv() {
  const host = process.env.DEALERCENTER_SFTP_HOST;
  const username = process.env.DEALERCENTER_SFTP_USER;
  const password = process.env.DEALERCENTER_SFTP_PASSWORD;
  const remotePath = process.env.DEALERCENTER_SFTP_PATH || '/inventory/inventory/DealerCenter_28547101.csv';
  if (!host || !username || !password) throw Error('SFTP environment variables not configured');
  const sftp = new SftpClient();
  try {
    await sftp.connect({host, port:Number(process.env.DEALERCENTER_SFTP_PORT || 22), username, password, readyTimeout:12000});
    const data = await sftp.get(remotePath);
    return Buffer.isBuffer(data) ? data.toString('utf8') : String(data);
  } finally { try { await sftp.end(); } catch (_) {} }
}
async function loadSource() {
  try { return {kind:'sftp-csv', text:await readSftpCsv()}; }
  catch (sftpError) {
    const resp = await fetch(LEGACY_FEED, {signal:AbortSignal.timeout(12000)});
    if (!resp.ok) throw sftpError;
    return {kind:'legacy-xml', text:await resp.text()};
  }
}
export async function loadInventory(request) {
  const store = getStore('callaway-inventory');
  let cache; try { cache = await store.get('snapshot-v3', {type:'json'}); } catch (_) {}
  if (Array.isArray(cache?.items) && Date.now()-cache.checkedAt<TTL) return {items:cache.items, stale:false, source:cache.source};
  try {
    const [source, baseResp, specResp] = await Promise.all([
      loadSource(),
      fetch(new URL('/data/inventory.json', request.url), {signal:AbortSignal.timeout(12000)}),
      fetch(new URL('/data/spec-library.json', request.url), {signal:AbortSignal.timeout(12000)})
    ]);
    if (!baseResp.ok || !specResp.ok) throw Error('Seed/spec library unavailable');
    const parsed = source.kind==='sftp-csv' ? parseDealerCenterCsv(source.text) : parseLegacyXml(source.text);
    const base = await baseResp.json(); const specs = await specResp.json();
    if (parsed.length < 3) throw Error('Unexpectedly small inventory feed');
    const items = mergeInventory(parsed, base).map(u=>enrichWithSpecs(u,specs));
    await store.setJSON('snapshot-v3', {checkedAt:Date.now(), source:source.kind, items});
    return {items, stale:false, source:source.kind};
  } catch (e) {
    if (Array.isArray(cache?.items) && cache.items.length) return {items:cache.items, stale:true, source:cache.source || 'cache'};
    throw e;
  }
}
