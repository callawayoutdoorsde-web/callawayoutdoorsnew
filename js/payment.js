(function(){
  const APR=8.9, MONTHS=180;
  function payment(price,down=0,apr=APR,months=MONTHS){
    const principal=Math.max(0,Number(price||0)-Number(down||0));
    const n=Math.max(1,Math.round(Number(months)||MONTHS));
    const rate=Math.max(0,Number(apr)||0)/1200;
    return rate ? principal*rate/(1-Math.pow(1+rate,-n)) : principal/n;
  }
  const dollars=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
  function estimate(price){return `<div class="monthlyEstimate">Est. ${dollars(payment(price))}/mo <span>at 8.9% APR · 180 months · $0 down*</span></div>`;}
  function calculator(price){return `<section class="paymentCalculator" aria-label="Calculate my payment"><h3>Calculate My Payment</h3><p>Adjust your down payment, APR or loan term to estimate your monthly payment.</p><div class="paymentFields"><label>Camper price<input id="payPrice" type="number" min="0" step="100" value="${Number(price)||0}"></label><label>Down payment<input id="payDown" type="number" min="0" step="100" value="0"></label><label>APR (%)<input id="payApr" type="number" min="0" max="100" step="0.1" value="8.9"></label><label>Term (months)<select id="payTerm"><option value="180" selected>180 months</option><option value="144">144 months</option><option value="120">120 months</option><option value="96">96 months</option><option value="84">84 months</option><option value="60">60 months</option></select></label></div><div class="paymentResult">Estimated payment <strong id="payResult">${dollars(payment(price))}/mo</strong></div><p class="paymentFinePrint">*Estimate only; not an offer or guarantee of financing. Assumes 8.9% APR, 180 months and $0 down unless adjusted. Actual APR, available term, down payment and approval depend on lender, credit, unit age and eligibility. Taxes, title, registration and other financed charges are excluded. Financing terms may not be available on every unit.</p></section>`;}
  function bind(root=document){const el=root.querySelector('.paymentCalculator');if(!el)return;const ids=['payPrice','payDown','payApr','payTerm'];const inputs=ids.map(x=>el.querySelector('#'+x));const out=el.querySelector('#payResult');const recalc=()=>{out.textContent=dollars(payment(inputs[0].value,inputs[1].value,inputs[2].value,inputs[3].value))+'/mo';};inputs.forEach(x=>x.addEventListener('input',recalc));}
  window.CallawayPayment={payment,estimate,calculator,bind};
})();
