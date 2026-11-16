(()=>{
  function init(root){
    const main=root.querySelector('.galleryMain'), thumbs=[...root.querySelectorAll('.galleryThumb')], prev=root.querySelector('.galleryPrev'), next=root.querySelector('.galleryNext'), counter=root.querySelector('.galleryCounter');
    if(!main||!thumbs.length)return; let active=0, startX=null;
    const show=i=>{active=(i+thumbs.length)%thumbs.length;const t=thumbs[active];main.src=t.dataset.full||t.src;main.alt=t.alt||main.alt;thumbs.forEach((x,n)=>{x.classList.toggle('is-active',n===active);x.setAttribute('aria-current',n===active?'true':'false')});if(counter)counter.textContent=`${active+1} / ${thumbs.length}`;t.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});};
    thumbs.forEach((t,i)=>t.addEventListener('click',()=>show(i))); if(prev)prev.addEventListener('click',()=>show(active-1)); if(next)next.addEventListener('click',()=>show(active+1));
    main.addEventListener('touchstart',e=>{startX=e.changedTouches[0].clientX},{passive:true}); main.addEventListener('touchend',e=>{if(startX===null)return;const dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>45)show(active+(dx<0?1:-1));startX=null},{passive:true});
    root.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')show(active-1);if(e.key==='ArrowRight')show(active+1)}); show(0);
  }
  const initialize=()=>document.querySelectorAll('[data-gallery]:not([data-gallery-initialized])').forEach(el=>{el.setAttribute('data-gallery-initialized','true');init(el)});
  document.addEventListener('DOMContentLoaded',initialize);
  document.addEventListener('callaway:gallery-ready',initialize);
})();
