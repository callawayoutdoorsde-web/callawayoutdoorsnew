import { getStore } from '@netlify/blobs';
const FEED = 'https://www.callaway-outdoors.com/dealercenter/facebook/feed.php?dcid=28547101';
const ttl=24*60*60*1000;
const clean=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const field=(xml,tag)=>{const m=xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,'i'));return m?m[1].replace(/<!\\[CDATA\\[|\\]\\]>/g,'').trim():''};
function parse(xml){const chunks=xml.match(/<listing>[^]*?<\/listing>/g)||[];if(!chunks.length)throw Error('No listings in feed');return chunks.map(x=>({vehicle_id:field(x,'vehicle_id'),stock_number:field(x,'stock_number'),vin:field(x,'vin'),year:Number(field(x,'year')),make:field(x,'make'),model:field(x,'model'),trim:field(x,'trim'),price:Number(field(x,'price').replace(/[^0-9.]/g,'').split('.')[0]),photos:[...x.matchAll(/<image>\s*<url>([^<]+)<\/url>\s*<\/image>/g)].map(m=>m[1]),source_url:field(x,'url')})).filter(r=>r.vehicle_id&&r.year&&r.price&&r.photos.length)}
const merge=(feed,base)=>{const used=new Set();return feed.map(r=>{let i=base.findIndex((u,j)=>!used.has(j)&&u.year===r.year&&(clean(r.trim)&&clean(u.model).includes(clean(r.trim))||clean(r.model)&&clean(u.model).includes(clean(r.model))));if(i<0)i=base.findIndex((u,j)=>!used.has(j)&&u.year===r.year&&clean(r.trim)&&clean(u.model).includes(clean(r.trim)));if(i>=0)used.add(i);let u=i>=0?{...base[i]}:{id:`${r.year}-${clean(r.make).slice(0,14)}-${clean(r.trim||r.model)}`,type:'Travel Trailer',tags:[],featured:false,condition:'Used',location:'Felton, Delaware',make:r.make,model:`${r.model} ${r.trim}`.trim()};Object.assign(u,{year:r.year,price:r.price,photos:r.photos,source_url:r.source_url,vin:r.vin,stock_number:r.stock_number,vehicle_id:r.vehicle_id});if(i>=0&&r.trim&&!clean(u.model).includes(clean(r.trim)))u.model+=' '+r.trim;return u})};
export default async (request,context)=>{
 const headers={'content-type':'application/json; charset=utf-8','cache-control':'public, max-age=300'};
 const store=getStore('callaway-inventory');let cache;
 try{cache=await store.get('snapshot',{type:'json'})}catch{}
 if(cache&&Date.now()-cache.checkedAt<ttl)return new Response(JSON.stringify(cache.items),{headers});
 try{
 const [resp,baseResp]=await Promise.all([fetch(FEED,{signal:AbortSignal.timeout(12000)}),fetch(new URL('/data/inventory.json',request.url),{signal:AbortSignal.timeout(12000)})]);
 if(!resp.ok||!baseResp.ok)throw Error('Feed or seed unavailable');
 const parsed=parse(await resp.text());const base=await baseResp.json();
 // A suspiciously small response must not wipe inventory.
 if(parsed.length<Math.max(5,Math.floor(base.length*.5)))throw Error('Unexpectedly small inventory feed');
 const items=merge(parsed,base);await store.setJSON('snapshot',{checkedAt:Date.now(),items});return new Response(JSON.stringify(items),{headers});
 }catch(e){if(cache?.items?.length)return new Response(JSON.stringify(cache.items),{headers:{...headers,'x-inventory-status':'stale'}});return new Response(JSON.stringify({error:'Live inventory unavailable'}),{status:503,headers})}
};
export const config={path:'/api/inventory'};
