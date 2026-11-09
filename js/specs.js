(function(){
  const fmtWeight=n=>Number.isFinite(Number(n))?`${Number(n).toLocaleString('en-US')} lbs`:'';
  const clean=s=>String(s||'').toLowerCase().replace(/&/g,'and').replace(/\b(recreational vehicles|rv company|rv co|rv)\b/g,'').replace(/[^a-z0-9]+/g,'').trim();
  const makeClean=s=>clean(s).replace(/^kz$/,'kz');
  const modelClean=s=>clean(s);
  const key=u=>`${u.year}|${String(u.make||'').trim().toLowerCase()}|${String(u.model||'').trim().toLowerCase()}`;
  const findSpec=(u,lib)=>{
    const direct=lib[key(u)];
    if(direct) return direct;
    const y=String(u.year), mk=makeClean(u.make), md=modelClean(u.model);
    for(const [k,spec] of Object.entries(lib)){
      const parts=k.split('|');
      if(parts[0]!==y) continue;
      if(makeClean(parts[1])!==mk) continue;
      const names=[parts.slice(2).join('|'),...(spec.aliases||[])].map(modelClean);
      if(names.includes(md)) return spec;
    }
    return null;
  };
  const merge=(u,lib)=>{const spec=findSpec(u,lib);return spec?({...u,...spec,specSource:spec.source||null}):u};
  const quickSpecs=u=>[
    u.length?`<span><b>${u.length}</b><small>Length</small></span>`:'',
    u.dryWeight?`<span><b>${fmtWeight(u.dryWeight)}</b><small>Dry weight</small></span>`:'',
    u.sleeps?`<span><b>Sleeps ${u.sleeps}</b><small>Capacity</small></span>`:'',
    Number.isFinite(Number(u.slides))?`<span><b>${u.slides} slide${Number(u.slides)===1?'':'s'}</b><small>Slide-outs</small></span>`:''
  ].filter(Boolean).join('');
  const fullSpecs=u=>[
    ['Length',u.length],['Dry Weight',u.dryWeight?fmtWeight(u.dryWeight):null],['GVWR',u.gvwr?fmtWeight(u.gvwr):null],['Sleeps',u.sleeps],['Slide-outs',Number.isFinite(Number(u.slides))?u.slides:null],['Hitch Weight',u.hitchWeight?fmtWeight(u.hitchWeight):null],['Fresh Water',u.freshWater?`${u.freshWater} gal`:null],['Gray Water',u.grayWater?`${u.grayWater} gal`:null],['Black Water',u.blackWater?`${u.blackWater} gal`:null]
  ].filter(([,v])=>v!==null&&v!==undefined&&v!=='').map(([k,v])=>`<div class="specDataItem"><small>${k}</small><strong>${v}</strong></div>`).join('');

  window.CallawaySpecs={key,findSpec,merge,quickSpecs,fullSpecs,fmtWeight};

  document.addEventListener('DOMContentLoaded',async()=>{
    const main=document.querySelector('.staticUnit[data-unit-id]');
    if(!main)return;
    try{
      const [ir,sr]=await Promise.all([fetch('../data/inventory.json'),fetch('../data/spec-library.json')]);
      const [inventory,lib]=await Promise.all([ir.json(),sr.json()]);
      const base=inventory.find(x=>x.id===main.dataset.unitId);
      if(!base)return;
      const u=merge(base,lib);
      if(!u.verified)return;
      const specs=fullSpecs(u);
      if(!specs)return;
      const panel=document.querySelector('.detailPanel .specs');
      if(panel){
        panel.insertAdjacentHTML('afterend',`<div class="verifiedSpecs"><div class="verifiedSpecsHead"><strong>Verified model specifications</strong><span>Automatically matched by year / make / model</span></div><div class="specDataGrid">${specs}</div><p class="specDisclaimer">Manufacturer/base-model specifications. Installed options and production changes can affect actual weights and capacities. Verify the unit data plate before towing.</p></div>`);
      }
    }catch(e){console.warn('Spec enrichment unavailable',e)}
  });
})();
