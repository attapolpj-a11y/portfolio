'use strict';
(()=>{
 const cards=[...document.querySelectorAll('[data-archive-category]')];
 if(!cards.length)return;
 const filters=[...document.querySelectorAll('[data-archive-filter]')];
 const more=document.querySelector('#archive-more'),status=document.querySelector('#archive-status');
 const english=document.documentElement.lang==='en';
 const requested=new URLSearchParams(location.search).get('category');
 let category=filters.some(b=>b.dataset.archiveFilter===requested)?requested:'all',limit=12;
 function render(){
  const matching=cards.filter(c=>category==='all'||c.dataset.archiveCategory===category);
  const visible=new Set(matching.slice(0,limit));
  cards.forEach(card=>{card.hidden=!visible.has(card);if(card.hidden)card.querySelector('video')?.pause();});
  filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.archiveFilter===category)));
  more.hidden=matching.length<=limit;
  status.textContent=english?`Showing ${Math.min(limit,matching.length)} of ${matching.length} items`:`แสดง ${Math.min(limit,matching.length)} จาก ${matching.length} ผลงาน`;
 }
 filters.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.archiveFilter;limit=12;render();const url=new URL(location.href);if(category==='all')url.searchParams.delete('category');else url.searchParams.set('category',category);history.replaceState(null,'',url);syncLanguage();}));
 more.addEventListener('click',()=>{const firstNew=cards.filter(c=>category==='all'||c.dataset.archiveCategory===category)[limit];limit+=12;render();firstNew?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});
 function syncLanguage(){document.querySelectorAll('.language-switch a').forEach(a=>{const url=new URL(a.href);url.search=location.search;a.href=url.href;});}
 document.querySelectorAll('video').forEach(video=>video.addEventListener('play',()=>cards.forEach(c=>{const other=c.querySelector('video');if(other&&other!==video)other.pause();})));
 render();syncLanguage();
})();
