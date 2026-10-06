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

// A small watercolor bloom follows a mouse click without intercepting controls.
window.addEventListener('click',e=>{
 if(!fine.matches||reduced.matches||e.detail===0||e.pointerType==='touch'||e.target.closest('video,input,textarea,[contenteditable="true"]'))return;
 const drop=document.createElement('span');drop.className='watercolor-drop';drop.setAttribute('aria-hidden','true');
 drop.style.left=`${e.clientX}px`;drop.style.top=`${e.clientY}px`;
 drop.style.setProperty('--paint',['#77bde8','#367cca','#184c9d'][Math.floor(Math.random()*3)]);
 drop.style.setProperty('--tilt',`${Math.random()*90-45}deg`);
 (document.querySelector('dialog[open]')||document.body).append(drop);
 drop.addEventListener('animationend',()=>drop.remove(),{once:true});setTimeout(()=>drop.remove(),1100);
},{passive:true});

// First-visit postcard: a single paint stroke opens the existing portfolio.
const welcome=document.querySelector('#welcome-screen');
if(welcome){
 const paper=welcome.querySelector('#enter-portfolio');
 let entering=false,returnFocus=null,entryTimer;
 const markEntered=()=>{try{sessionStorage.setItem('attapol-postcard-entered','yes');}catch(e){/* Storage may be unavailable; the entrance still works. */}};
 const finishEntry=()=>{clearTimeout(entryTimer);welcome.close();welcome.classList.remove('is-entering');welcome.querySelector('.postcard-bloom')?.remove();document.body.classList.remove('postcard-open');document.documentElement.classList.remove('welcome-pending');entering=false;const target=returnFocus||document.querySelector('.hero h1');if(target){if(!target.hasAttribute('tabindex')&&!returnFocus)target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}};
 function openPostcard(trigger=null){returnFocus=trigger;entering=false;welcome.classList.remove('is-entering');welcome.querySelector('.postcard-bloom')?.remove();document.body.classList.add('postcard-open');welcome.showModal();document.documentElement.classList.remove('welcome-pending');welcome.scrollTop=0;paper.focus({preventScroll:true});}
 function enterPortfolio(e,direct=false){if(entering)return;entering=true;markEntered();if(direct||reduced.matches){finishEntry();return;}const r=paper.getBoundingClientRect();const bloom=document.createElement('span');bloom.className='postcard-bloom';bloom.setAttribute('aria-hidden','true');bloom.style.setProperty('--bloom-x',`${e.detail?e.clientX-r.left:r.width/2}px`);bloom.style.setProperty('--bloom-y',`${e.detail?e.clientY-r.top:r.height/2}px`);paper.append(bloom);welcome.classList.add('is-entering');entryTimer=setTimeout(finishEntry,900);}
 welcome.addEventListener('keydown',e=>{if(e.key==='Tab')welcome.classList.add('keyboard-navigation');});
 welcome.addEventListener('pointerdown',()=>welcome.classList.remove('keyboard-navigation'));
 paper.addEventListener('click',e=>enterPortfolio(e));
 welcome.querySelector('[data-enter-direct]').addEventListener('click',e=>enterPortfolio(e,true));
 welcome.addEventListener('cancel',e=>{e.preventDefault();markEntered();finishEntry();});
 document.querySelectorAll('[data-open-postcard]').forEach(button=>button.addEventListener('click',()=>openPostcard(button)));
 let seen=false;try{seen=sessionStorage.getItem('attapol-postcard-entered')==='yes';}catch(e){}
 if(!seen&&typeof welcome.showModal==='function')openPostcard();else document.documentElement.classList.remove('welcome-pending');
}
