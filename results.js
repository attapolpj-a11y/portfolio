'use strict';
(()=>{
 const grid=document.querySelector('#results-grid');if(!grid)return;
 const cards=[...grid.querySelectorAll('.result-card')],buttons=[...document.querySelectorAll('[data-result-filter]')];
 const brand=document.querySelector('#results-brand'),status=document.querySelector('#results-status'),more=document.querySelector('#results-more'),empty=document.querySelector('#results-empty');
 const english=document.documentElement.lang==='en',params=new URLSearchParams(location.search);let platform=buttons.some(b=>b.dataset.resultFilter===params.get('platform'))?params.get('platform'):'all',limit=12;
 if([...brand.options].some(o=>o.value===params.get('brand')))brand.value=params.get('brand');
 function render(updateURL=false){
  const matches=cards.filter(c=>(platform==='all'||c.dataset.resultPlatform===platform)&&(brand.value==='all'||c.dataset.resultBrand===brand.value));
  const visible=new Set(matches.slice(0,limit));cards.forEach(c=>c.hidden=!visible.has(c));buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.resultFilter===platform)));
  status.textContent=english?`Showing ${Math.min(limit,matches.length)} of ${matches.length} records`:`แสดง ${Math.min(limit,matches.length)} จาก ${matches.length} รายการ`;
  more.hidden=matches.length<=limit;empty.hidden=matches.length>0;
  const search=new URLSearchParams(location.search);for(const [key,value] of [['platform',platform],['brand',brand.value]]){if(value==='all')search.delete(key);else search.set(key,value);}
  if(updateURL)history.replaceState(null,'',location.pathname+(search.size?'?'+search:'')+location.hash);
  document.querySelectorAll('.language-switch a').forEach(a=>{const url=new URL(a.href,location.href);for(const [key,value] of [['platform',platform],['brand',brand.value]]){if(value==='all')url.searchParams.delete(key);else url.searchParams.set(key,value);}a.href=url.pathname+url.search+url.hash;});
 }
 buttons.forEach(button=>button.addEventListener('click',()=>{platform=button.dataset.resultFilter;limit=12;render(true);}));brand.addEventListener('change',()=>{limit=12;render(true);});more.addEventListener('click',()=>{limit+=12;render();});render();
})();
