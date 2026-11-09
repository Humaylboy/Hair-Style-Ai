// ---- diagnostics: show any problem on screen instead of failing silently ----
function banner(m){if(document.getElementById('err'))return;const b=document.createElement('div');b.id='err';b.className='warn';b.style.cssText='background:#c0392b;z-index:200;cursor:pointer';b.onclick=()=>b.remove();b.textContent='⚠ '+m+' (tap to dismiss)';document.body.append(b)}
addEventListener('error',e=>{if(e.target&&e.target!==window){const u=e.target.src||e.target.href||'';if(u&&!/\/lib\/|face_mesh/.test(u))banner('Missing file: '+u.split('/').slice(3).join('/'))}else banner('Script error: '+e.message+' ('+String(e.filename).split('/').pop()+':'+e.lineno+')')},true);
addEventListener('unhandledrejection',e=>banner('Error: '+((e.reason&&e.reason.message)||e.reason)));
{const miss=['qp','cols','flt','out','sz','checks','grid','q','best','stats','cv','views','all','coll'].filter(i=>!document.getElementById(i));if(miss.length)banner('index.html is out of date (missing '+miss.join(', ')+'). Re-upload ALL files from the latest zip')}
const $=s=>document.querySelector(s),cv=$('#cv'),ctx=cv.getContext('2d'),base=document.createElement('canvas');
const NAMES={O:'Oval',R:'Round',S:'Square',H:'Heart',L:'Oblong'};let fm,L,cur,stream,off={x:0,y:0,s:1,a:1};
const loadScript=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s)});
// Face mesh (468 landmarks): bundled in lib/face_mesh, CDN as backup.
const ready=(async()=>{for(const r of['lib/face_mesh/','https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/']){
  try{await loadScript(r+'face_mesh.js');fm=new FaceMesh({locateFile:f=>r+f});fm.setOptions({maxNumFaces:1,refineLandmarks:false,minDetectionConfidence:.4});await fm.initialize();return}catch(e){console.warn('face mesh failed',r,e);fm=null}}})();
const detect=img=>new Promise(res=>{fm.onResults(r=>res(r.multiFaceLandmarks&&r.multiFaceLandmarks[0]||null));fm.send({image:img}).catch(()=>res(null))});
const say=t=>{const s=$('#status');s.textContent=t;s.style.display=t?'block':'none'};
function render(){ctx.drawImage(base,0,0);if(L&&cur&&quick)drawHair(ctx,L,cv.width,cv.height,cur,off)}
function guess(){const w=cv.width,h=cv.height,W=Math.min(.45*w,.5*h/1.3),H=1.3*W,cx=w/2,ty=h*.5-H*.6,o=[];
  [[10,0,0],[152,0,H],[234,-W/2,H/2],[454,W/2,H/2],[172,-.33*W,.7*H],[397,.33*W,.7*H],[54,-.35*W,.1*H],[284,.35*W,.1*H]].forEach(([i,x,y])=>o[i]={x:(cx+x)/w,y:(ty+y)/h});return o}
const tween=(ms,fn)=>new Promise(done=>{const t0=performance.now(),f=n=>{const t=Math.min(1,(n-t0)/ms);fn(t);t<1?requestAnimationFrame(f):done()};requestAnimationFrame(f)});
// Scan animation: landmarks reveal top→bottom, then measurement lines draw in.
async function scanAnim(){
  const w=cv.width,h=cv.height,q=i=>[L[i].x*w,L[i].y*h],d=Math.max(2,w/320),idx=[...L.keys()].sort((a,b)=>L[a].y-L[b].y);
  await tween(1800,t=>{ctx.drawImage(base,0,0);const n=Math.max(1,idx.length*t|0);ctx.fillStyle='#2de2c5';
    for(let k=0;k<n;k++){const[x,y]=q(idx[k]);ctx.fillRect(x-d/2,y-d/2,d,d)}ctx.fillRect(0,q(idx[n-1])[1],w,2)});
  const lines=[[234,454,'#ff5fa2'],[172,397,'#7c5cff'],[54,284,'#ffd166'],[10,152,'#2de2c5']];
  await tween(1100,t=>{ctx.drawImage(base,0,0);ctx.globalAlpha=.5;ctx.fillStyle='#2de2c5';idx.forEach(i=>{const[x,y]=q(i);ctx.fillRect(x-d/2,y-d/2,d,d)});ctx.globalAlpha=1;
    ctx.lineWidth=d;lines.forEach(([a,b,col],k)=>{const u=Math.min(1,Math.max(0,t*lines.length-k)),[x1,y1]=q(a),[x2,y2]=q(b);ctx.strokeStyle=col;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x1+(x2-x1)*u,y1+(y2-y1)*u);ctx.stroke()})});
}
async function load(src){
  const k=Math.min(1,900/Math.max(src.width,src.height));base.width=cv.width=src.width*k;base.height=cv.height=src.height*k;
  base.getContext('2d').drawImage(src,0,0,cv.width,cv.height);ctx.drawImage(base,0,0);$('#empty').hidden=true;$('#guide').toggleAttribute('hidden',true);
  off={x:0,y:0,s:1,a:0};$('#sz').value=1;L=null;cur=null;photoId++;hideOut();$('.stage').classList.add('scanning');say('Loading face scanner…');
  await ready;let r=null,msg='';if(fm){say('Scanning face…');try{r=await detect(base)}catch(e){console.error(e)}}
  $('.stage').classList.remove('scanning');
  if(r){L=r;say('Mapping 468 points…');await scanAnim()}
  else{L=guess();msg=fm?'No face detected: drag the hair onto your head and use the size slider':'Scanner could not load (needs http://localhost, not file://): drag the hair to fit'}
  analyse();if(r){const f=check();msg=f?`Photo not ideal (${f}). Retake for accurate placement`:'✓ Photo looks good'}else $('#checks').innerHTML='<p class="mute">Could not verify this photo.</p>';say(msg);tween(600,t=>{off.a=t;render()});
}
function analyse(){
  const w=cv.width,h=cv.height,d=(a,b)=>Math.hypot((L[a].x-L[b].x)*w,(L[a].y-L[b].y)*h);
  const cheek=d(234,454),jaw=d(172,397),fore=d(54,284),len=d(10,152),r=len/cheek,jr=jaw/cheek,fr=fore/cheek;
  const sh=r>1.45?'L':jr>.86&&r<1.3?'S':r<1.25&&jr<.86?'R':fr>jr+.12?'H':'O';
  const lv=(v,a,b)=>v<a?'Narrow':v<b?'Medium':'Wide';
  const rows=[['Face shape',NAMES[sh],90],['Jawline width',lv(jr,.78,.88)+` · ${jr*100|0}%`,jr*100],
    ['Forehead width',lv(fr,.78,.88)+` · ${fr*100|0}%`,fr*100],['Length / width',r.toFixed(2),Math.min(100,r*55)]];
  $('#stats').innerHTML=rows.map(([a,b,p])=>`<div class="stat"><span>${a}</span><b>${b}</b><div class="bar"><i style="--w:${p}%"></i></div></div>`).join('');
  const pool=STYLES.filter(s=>s.fit.includes(sh)),picks=pool.filter((_,i)=>i%Math.max(1,pool.length/6|0)==0).slice(0,6);
  $('#best').innerHTML=picks.map((s,i)=>`<button class="chip" data-i="${s.id}" style="animation-delay:${i*.1}s">${s.name}</button>`).join('');
  say('Pick a style to generate it on your photo');const vw=$('#views');if(vw)vw.hidden=false; // angle tabs appear right after the scan
}
function pick(i){cur={...STYLES[i],color:COLORS[colIdx][0],hex:COLORS[colIdx][1]};document.querySelectorAll('[data-i]').forEach(e=>e.classList.toggle('on',+e.dataset.i===i));generate(cur)}
let flt=()=>true,colIdx=0,ct,shown=48,lastQ='';
function grid(q='',keep){if(!keep)shown=48;lastQ=q;const l=STYLES.filter(s=>flt(s)&&(s.name+' '+s.cat).toLowerCase().includes(q.toLowerCase()));$('#count').textContent=`(${l.length})`;
  $('#grid').innerHTML=l.slice(0,shown).map(s=>`<button class="card" data-i="${s.id}"><span class="dot" style="background:${COLORS[colIdx][1]}"></span><b>${s.name}</b><small>${s.cat}</small></button>`).join('')+(l.length>shown?`<button class="btn ghost more" style="grid-column:1/-1">Show ${Math.min(96,l.length-shown)} more · ${l.length-shown} left</button>`:'');
  if(cur)document.querySelectorAll(`.card[data-i="${cur.id}"]`).forEach(e=>e.classList.add('on'))}
document.addEventListener('click',e=>{if(e.target.closest('.more')){shown+=96;grid(lastQ,true);return}const b=e.target.closest('[data-i]');if(b){if(!L)say('Add a photo first');else pick(+b.dataset.i)}});
$('#q').oninput=e=>grid(e.target.value);grid();
const CL2=[...new Set(STYLES.map(s=>s.cat))],FL=[['All',()=>true],...CL2.map(c=>[c,s=>s.cat==c])];
$('#flt').innerHTML=FL.map(([n],i)=>`<button class="chip${i?'':' on'}" data-f="${i}">${n}</button>`).join('');
$('#flt').onclick=e=>{const b=e.target.closest('[data-f]');if(!b)return;flt=FL[b.dataset.f][1];document.querySelectorAll('[data-f]').forEach(x=>x.classList.toggle('on',x===b));grid($('#q').value)};
$('#cols').innerHTML=COLORS.map(([n,hx],i)=>`<button class="sw${i?'':' on'}" data-c="${i}" title="${n}" style="background:${hx}"></button>`).join('');
$('#cols').onclick=e=>{const b=e.target.closest('[data-c]');if(!b)return;colIdx=+b.dataset.c;document.querySelectorAll('[data-c]').forEach(x=>x.classList.toggle('on',x===b));grid($('#q').value,true);
  if(cur&&L){clearTimeout(ct);ct=setTimeout(()=>pick(cur.id),700)}};
$('#sz').oninput=e=>{off.s=+e.target.value;render()};
let drag;cv.style.touchAction='none';cv.onpointerdown=e=>{drag=[e.clientX,e.clientY];cv.setPointerCapture(e.pointerId)};cv.onpointerup=()=>drag=null;
cv.onpointermove=e=>{if(!drag||!L)return;const r=cv.getBoundingClientRect(),f=1/Math.min(r.width/cv.width,r.height/cv.height);
  off.x+=(e.clientX-drag[0])*f;off.y+=(e.clientY-drag[1])*f;drag=[e.clientX,e.clientY];render()};
$('#file').onchange=async e=>{const f=e.target.files[0];if(f)load(await createImageBitmap(f))};
const startCam=async()=>{try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'}});const v=$('#cam');v.srcObject=stream;v.hidden=false;v.play();$('#guide').toggleAttribute('hidden',false);$('#empty').hidden=true;$('#snap').hidden=false}catch{say('Camera unavailable (use http://localhost)')}};
$('#snap').onclick=()=>{const v=$('#cam'),t=document.createElement('canvas');t.width=v.videoWidth;t.height=v.videoHeight;t.getContext('2d').drawImage(v,0,0);
  stream.getTracks().forEach(t=>t.stop());v.hidden=true;$('#snap').hidden=true;load(t)};
$('#save').onclick=()=>{const a=document.createElement('a');a.download='my-new-look.png';a.href=$('#out').hidden?cv.toDataURL():$('#out').src;a.click()};
const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('in')),{threshold:.15});document.querySelectorAll('.rv').forEach(e=>io.observe(e));

// ---- Photo protocol: guide modal + quality checks ----
let seen=false,goal;const guide=fn=>{if(seen)return fn();goal=fn;$('#proto').hidden=false};
$('#ok').onclick=()=>{seen=true;$('#proto').hidden=true;goal&&goal();goal=null};
$('#help').onclick=()=>{goal=null;$('#proto').hidden=false};
$('#camBtn').onclick=()=>guide(startCam);$('#up').onclick=()=>guide(()=>$('#file').click());
function check(){
  const w=cv.width,h=cv.height,P=i=>[L[i].x*w,L[i].y*h],[tx,ty]=P(10),[cx,cy]=P(152),[lx,ly]=P(234),[rx,ry]=P(454),[nx]=P(1);
  const H=Math.hypot(tx-cx,ty-cy),roll=Math.abs(Math.atan2(ry-ly,rx-lx)*180/Math.PI),yaw=Math.abs((nx-lx)-(rx-nx))/(rx-lx);
  const it=[['Head straight (no tilt)',roll<6,roll.toFixed(0)+'° tilt'],['Facing the camera',yaw<.12,'turned sideways'],
    ['Distance',H/h>.22&&H/h<.55,H/h<=.22?'too far':'too close'],['Shoulders visible',h-cy>H*.75,'step back'],
    ['Space above head',ty>H*.18,'leave headroom'],['Centered',Math.abs((lx+rx)/2-w/2)<w*.18,'center your face']];
  const bad=it.filter(x=>!x[1]);
  $('#checks').innerHTML=it.map(([a,ok,n])=>`<div class="stat"><span>${ok?'✓':'✗'} ${a}</span><b style="color:${ok?'var(--c)':'#ff6b6b'}">${ok?'OK':n}</b></div>`).join('')+(bad.length?'<button class="btn" onclick="retake()">↺ Retake photo</button>':'');
  return bad.length?bad[0][0]:'';
}
function retake(){L=null;cur=null;hideOut();ctx.clearRect(0,0,cv.width,cv.height);$('#empty').hidden=false;$('#guide').toggleAttribute('hidden',false);
  $('#stats').innerHTML=$('#checks').innerHTML='<p class="mute">Waiting for a photo…</p>';$('#best').innerHTML='';say('');guide(()=>$('#file').click())}
window.__ok=1; // tells index.html the app started
