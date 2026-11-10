document.addEventListener('DOMContentLoaded',()=>{
 const cfg=window.SITE_CONFIG||{};
 document.querySelectorAll('.appOneButton').forEach(btn=>btn.addEventListener('click',()=>{if(cfg.appOneUrl){window.open(cfg.appOneUrl,'_blank','noopener')}else{alert('The AppOne portal is ready to connect. Add Callaway\'s dealer-specific AppOne URL in js/config.js.')}}));
 const p=document.querySelector('#calcPrice'),d=document.querySelector('#calcDown'),a=document.querySelector('#calcApr'),t=document.querySelector('#calcTerm'),out=document.querySelector('#calcPayment');
 const params=new URLSearchParams(location.search); if(params.get('price')&&p)p.value=params.get('price');
 function calc(){if(!p)return;const principal=Math.max(0,(+p.value||0)-(+d.value||0));const months=+t.value||180;const apr=(+a.value||0)/100;let payment;if(!apr)payment=principal/months;else{const r=apr/12;payment=principal*r/(1-Math.pow(1+r,-months));}out.textContent=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(payment||0)}
 [p,d,a,t].forEach(x=>x&&x.addEventListener('input',calc)); calc();
});
