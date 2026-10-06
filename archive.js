'use strict';
(()=>{
 const cards=[...document.querySelectorAll('[data-archive-category]')];
 const more=document.querySelector('#archive-more'),status=document.querySelector('#archive-status');
 if(!cards.length||!more||!status)return;
 const filters=[...document.querySelectorAll('[data-archive-filter]')],sectors=[...document.querySelectorAll('[data-sector-filter]')];
 const english=document.documentElement.lang==='en',params=new URLSearchParams(location.search);
 let category=filters.some(b=>b.dataset.archiveFilter===params.get('category'))?params.get('category'):'all';
 let sector=sectors.some(b=>b.dataset.sectorFilter===params.get('sector'))?params.get('sector'):'all',limit=12;
 const matching=()=>cards.filter(c=>(category==='all'||c.dataset.archiveCategory===category)&&(sector==='all'||c.dataset.sector===sector));
 function render(){
  const matches=matching(),visible=new Set(matches.slice(0,limit));
  cards.forEach(card=>{card.hidden=!visible.has(card);if(card.hidden)card.querySelector('video')?.pause();});
  filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.archiveFilter===category)));
  sectors.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sectorFilter===sector)));
  document.querySelectorAll('[data-sector-heading]').forEach(h=>h.hidden=!matches.slice(0,limit).some(c=>c.dataset.sector===h.dataset.sectorHeading));
  more.hidden=matches.length<=limit;
  status.textContent=english?`Showing ${Math.min(limit,matches.length)} of ${matches.length} items`:`แสดง ${Math.min(limit,matches.length)} จาก ${matches.length} ผลงาน`;
 }
 function updateURL(){const url=new URL(location.href);for(const [key,value] of [['category',category],['sector',sector]]){if(value==='all')url.searchParams.delete(key);else url.searchParams.set(key,value);}history.replaceState(null,'',url);syncLanguage();}
 filters.forEach(b=>b.addEventListener('click',()=>{category=b.dataset.archiveFilter;limit=12;render();updateURL();}));
 sectors.forEach(b=>b.addEventListener('click',()=>{sector=b.dataset.sectorFilter;limit=12;render();updateURL();}));
 more.addEventListener('click',()=>{const firstNew=matching()[limit];limit+=12;render();firstNew?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});
 function syncLanguage(){document.querySelectorAll('.language-switch a').forEach(a=>{const url=new URL(a.href);url.search=location.search;a.href=url.href;});}
 document.querySelectorAll('video').forEach(v=>v.addEventListener('play',()=>cards.forEach(c=>{const other=c.querySelector('video');if(other&&other!==v)other.pause();})));
 render();syncLanguage();
})();
