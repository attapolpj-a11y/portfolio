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
 const finishEntry=()=>{clearTimeout(entryTimer);welcome.dispatchEvent(new CustomEvent('postcard-music-stop'));welcome.close();welcome.classList.remove('is-entering');welcome.querySelector('.postcard-bloom')?.remove();document.body.classList.remove('postcard-open');document.documentElement.classList.remove('welcome-pending');entering=false;const target=returnFocus||document.querySelector('.hero h1');if(target){if(!target.hasAttribute('tabindex')&&!returnFocus)target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}};
 function openPostcard(trigger=null){returnFocus=trigger;entering=false;welcome.classList.remove('is-entering');welcome.querySelector('.postcard-bloom')?.remove();document.body.classList.add('postcard-open');welcome.showModal();document.documentElement.classList.remove('welcome-pending');welcome.scrollTop=0;paper.focus({preventScroll:true});}
 function enterPortfolio(e,direct=false){if(entering)return;entering=true;markEntered();welcome.dispatchEvent(new CustomEvent('postcard-music-fade'));if(direct||reduced.matches){finishEntry();return;}const r=paper.getBoundingClientRect();const bloom=document.createElement('span');bloom.className='postcard-bloom';bloom.setAttribute('aria-hidden','true');bloom.style.setProperty('--bloom-x',`${e.detail?e.clientX-r.left:r.width/2}px`);bloom.style.setProperty('--bloom-y',`${e.detail?e.clientY-r.top:r.height/2}px`);paper.append(bloom);welcome.classList.add('is-entering');entryTimer=setTimeout(finishEntry,900);}
 welcome.addEventListener('keydown',e=>{if(e.key==='Tab')welcome.classList.add('keyboard-navigation');});
 welcome.addEventListener('pointerdown',()=>welcome.classList.remove('keyboard-navigation'));
 paper.addEventListener('click',e=>enterPortfolio(e));
 welcome.querySelector('[data-enter-direct]').addEventListener('click',e=>enterPortfolio(e,true));
 welcome.addEventListener('cancel',e=>{e.preventDefault();markEntered();finishEntry();});
 document.querySelectorAll('[data-open-postcard]').forEach(button=>button.addEventListener('click',()=>openPostcard(button)));
 let seen=false;try{seen=sessionStorage.getItem('attapol-postcard-entered')==='yes';}catch(e){}
 if(!seen&&typeof welcome.showModal==='function')openPostcard();else document.documentElement.classList.remove('welcome-pending');
}

// Opt-in music uses the official visible YouTube embed, never an audio rip.
if(welcome){
 const musicButton=welcome.querySelector('#welcome-music-toggle');
 const musicPanel=welcome.querySelector('#welcome-music-panel');
 const musicLabel=welcome.querySelector('[data-music-label]');
 const musicStatus=welcome.querySelector('.welcome-music-status');
 const english=document.documentElement.lang==='en';
 let musicPlayer=null,musicReady=false,musicOpen=false,musicLoading=false,musicFade=null,musicLoadTimer=null;
 const say=(th,en)=>{musicStatus.textContent=english?en:th;};
 const stopFade=()=>{clearInterval(musicFade);musicFade=null;};
 function closeMusic(){musicOpen=false;stopFade();musicPlayer?.pauseVideo?.();musicPanel.hidden=true;musicButton.setAttribute('aria-expanded','false');musicLabel.textContent=english?'Play gentle music':'เปิดเพลงคลอ';}
 function unavailable(){say('ยังเล่นเพลงไม่ได้ ลองเปิดฟังบน YouTube ได้ครับ','Music is unavailable here. You can listen on YouTube.');clearTimeout(musicLoadTimer);}
 function buildMusicPlayer(){
  if(musicPlayer)return;
  musicPlayer=new YT.Player('welcome-music-player',{host:'https://www.youtube-nocookie.com',width:'100%',height:200,videoId:'gn7HgzOEdHU',playerVars:{playsinline:1,controls:1,rel:0,origin:location.origin},events:{
   onReady:event=>{clearTimeout(musicLoadTimer);musicReady=true;event.target.setVolume(12);say('กด ▶ ในตัวเล่นเพื่อเริ่มเพลง','Press ▶ in the player to start the music.');if(musicOpen&&welcome.open)event.target.playVideo();},
   onStateChange:event=>{if(event.data===1){if(!musicOpen||!welcome.open){event.target.pauseVideo();return;}say('เพลงคลอเบา ๆ · ปรับเสียงได้ในตัวเล่น','Gentle music · Adjust the volume in the player.');}else if(event.data===2||event.data===0)say('กด ▶ ในตัวเล่นเพื่อฟังต่อ','Press ▶ in the player to listen again.');},
   onError:unavailable,
   onAutoplayBlocked:()=>say('กด ▶ ในตัวเล่นเพื่อเริ่มเพลง','Press ▶ in the player to start the music.')
  }});
  musicPlayer.getIframe().setAttribute('title','Duomo — Wildest Dreams · YouTube music player');
 }
 function loadMusic(){
  if(musicReady){stopFade();musicPlayer.setVolume(12);musicPlayer.playVideo();return;}
  if(musicLoading)return;
  musicLoading=true;say('กำลังเตรียมเพลง…','Preparing the music…');
  musicLoadTimer=setTimeout(unavailable,15000);
  if(window.YT?.Player){buildMusicPlayer();return;}
  const prior=window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady=()=>{prior?.();buildMusicPlayer();};
  const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.async=true;script.onerror=unavailable;document.head.append(script);
 }
 musicButton?.addEventListener('click',()=>{if(musicOpen){closeMusic();return;}musicOpen=true;musicPanel.hidden=false;musicButton.setAttribute('aria-expanded','true');musicLabel.textContent=english?'Turn off music':'ปิดเพลงคลอ';loadMusic();});
 welcome.querySelector('[data-close-music]')?.addEventListener('click',()=>{closeMusic();musicButton.focus();});
 welcome.addEventListener('postcard-music-fade',()=>{if(!musicReady||!musicOpen)return;stopFade();const startVolume=musicPlayer.getVolume(),startTime=performance.now();musicFade=setInterval(()=>{const progress=Math.min((performance.now()-startTime)/800,1);musicPlayer.setVolume(Math.round(startVolume*(1-progress)));if(progress===1)closeMusic();},50);});
 welcome.addEventListener('postcard-music-stop',closeMusic);
 window.addEventListener('pagehide',closeMusic);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)closeMusic();});
}
