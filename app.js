'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const menu=document.querySelector('.menu-toggle');
const navigation=document.querySelector('#navigation');
function closeMenu(){navigation?.classList.remove('open');menu?.setAttribute('aria-expanded','false');}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));navigation.classList.toggle('open',open);});
navigation?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&navigation?.classList.contains('open')){closeMenu();menu.focus();}});
matchMedia('(min-width: 701px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
if('IntersectionObserver' in window&&!reduced.matches){document.body.classList.add('motion-ready');const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.remove('pending');observer.unobserve(entry.target);}}},{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>{el.classList.add('pending');observer.observe(el);});reduced.addEventListener('change',e=>{if(e.matches){document.querySelectorAll('.pending').forEach(el=>el.classList.remove('pending'));observer.disconnect();}});}
const dialog=document.querySelector('#gallery-dialog');let lastTrigger;
document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{lastTrigger=button;const img=document.querySelector('#gallery-image');img.src=button.dataset.image;img.alt=button.dataset.caption;document.querySelector('#gallery-caption').textContent=button.dataset.caption;dialog.showModal();document.body.classList.add('dialog-open');}));
dialog?.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog?.addEventListener('close',()=>{document.body.classList.remove('dialog-open');lastTrigger?.focus();});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{const filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));let count=0;document.querySelectorAll('[data-category]').forEach(card=>{card.hidden=filter!=='all'&&card.dataset.category!==filter;if(!card.hidden){card.classList.remove('pending');count++;}});document.querySelector('#filter-status').textContent=`แสดงผลงาน ${count} ภาพ`;}));
const cursor=document.querySelector('#view-cursor');const fine=matchMedia('(hover: hover) and (pointer: fine)');
document.querySelectorAll('[data-view]').forEach(card=>{card.addEventListener('pointermove',e=>{if(!fine.matches||reduced.matches||e.pointerType!=='mouse')return;cursor.style.left=`${e.clientX}px`;cursor.style.top=`${e.clientY}px`;cursor.classList.add('visible');});card.addEventListener('pointerleave',()=>cursor.classList.remove('visible'));card.addEventListener('click',()=>cursor.classList.remove('visible'));});

// Cursor coordinates control actual head and eye direction frames.
const gaze=document.querySelector('.gaze-character');
if(gaze){
 const frames=[...gaze.querySelectorAll('[data-direction]')];
 let ready=false,last='neutral',frame=0,lastPointer=null;
 const setDirection=direction=>{if(direction===last)return;last=direction;gaze.dataset.gaze=direction;};
 Promise.all(frames.map(img=>img.decode())).then(()=>{ready=true;gaze.dataset.ready='true';if(lastPointer)update(lastPointer);}).catch(()=>{gaze.dataset.ready='false';});
 function update(e){
  if(!ready||reduced.matches||!fine.matches||e.pointerType==='touch')return;
  const r=gaze.getBoundingClientRect();
  const faceX=r.left+r.width*.51,faceY=r.top+r.height*.25;
  const dx=e.clientX-faceX,dy=e.clientY-faceY;
  const x=dx/(r.width*.55),y=dy/(r.height*.45);
  if(Math.hypot(dx,dy)<40){setDirection('neutral');return;}
  setDirection(Math.abs(x)>Math.abs(y)?(x<0?'left':'right'):(y<0?'up':'down'));
 }
 window.addEventListener('pointermove',e=>{lastPointer=e;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>update(e));},{passive:true});
 document.documentElement.addEventListener('pointerleave',()=>{lastPointer=null;cancelAnimationFrame(frame);setDirection('neutral');});
 window.addEventListener('blur',()=>setDirection('neutral'));
 reduced.addEventListener('change',e=>{if(e.matches)setDirection('neutral');});
 // Touch users can also tap around the character to try the gaze.
 gaze.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'||!ready||reduced.matches)return;const r=gaze.getBoundingClientRect();const x=e.clientX-r.left-r.width*.5,y=e.clientY-r.top-r.height*.25;setDirection(Math.abs(x)>Math.abs(y)?(x<0?'left':'right'):(y<0?'up':'down'));});
}
// Preserve the current section when switching between language versions.
document.querySelectorAll('.language-switch a').forEach(link=>link.addEventListener('click',()=>{if(location.hash)link.hash=location.hash;}));
