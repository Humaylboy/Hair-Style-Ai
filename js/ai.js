// AI restyle + multi-angle views. Photos go to /api/restyle (Vercel function, or start.bat's server locally) -> Cloudflare Workers AI (FLUX.2).
let photoId=0,quick=false,genId=0,curView='front';
const aiCache=new Map();
const API=(['localhost','127.0.0.1'].includes(location.hostname)&&location.port!=='8000')?'http://localhost:8000':''; // deployed: same-origin. Live Server: start.bat on :8000
if(location.protocol==='file:'){const b=document.createElement('div');b.className='warn';b.innerHTML='⚠ You opened index.html directly. Double-click <b>start.bat</b> (needs Python) so AI and camera work.';document.body.append(b)}
const vkey=(s,a)=>photoId+':'+s.id+':'+s.color+(a&&a!=='front'?':'+a:'');
const ANGLES={left:['LEFT side',"the camera is on the person's left, so we see their left ear and left profile, face pointing toward the right edge of the frame"],
  right:['RIGHT side',"the camera is on the person's right, so we see their right ear and right profile, face pointing toward the left edge of the frame"]};
function hideOut(){$('#out').hidden=true;quick=false;$('#views').hidden=true;curView='front'}
function showOut(src){const o=$('#out');o.src=src;o.style.opacity=1;o.hidden=false;$('#views').hidden=false;say('Hold the image to compare with your original')}
function setView(a){curView=a;document.querySelectorAll('[data-v]').forEach(b=>b.classList.toggle('on',b.dataset.v===a))}
function fromCanvas(c,max=512){const k=Math.min(1,max/Math.max(c.width,c.height)),t=document.createElement('canvas');t.width=Math.round(c.width*k);t.height=Math.round(c.height*k);
  t.getContext('2d').drawImage(c,0,0,t.width,t.height);return{b64:t.toDataURL('image/jpeg',.92).split(',')[1],w:t.width,h:t.height}}
const loadImg=src=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(new Error('Could not read the generated image'));i.src=src});
async function callAI(prompt,p,ref){
  const r=await fetch(API+'/api/restyle',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:p.b64,prompt,w:p.w,h:p.h,ref})});
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||(r.status==404?'AI endpoint missing: deploy the whole folder including api/':'Server error '+r.status));return j.image}
const errText=e=>e instanceof TypeError?'AI server not reachable. Run start.bat and keep its window open':String(e.message).slice(0,260);

async function generate(s){ // front view (restyles the user's photo)
  const id=++genId,key=vkey(s);quick=false;setView('front');
  if($('#qp')&&$('#qp').checked){$('#out').hidden=true;quick=true;render();say(`⚡ Quick preview: ${s.name} (${s.color}). Untick it to use AI`);return}
  if(aiCache.has(key)){showOut(aiCache.get(key));return}
  $('#out').hidden=true;render();$('.stage').classList.add('generating');say(`✨ AI is giving you a ${s.name} (${s.color})… ~15-30s`);
  try{
    const prompt=`Edit image 0 (a photo of a person). Change ONLY the person's hairstyle to: "${s.name}"${s.g=='m'?" (a men's style)":s.g=='f'?" (a women's style)":''}, ${s.color} hair colour. Remove their current hair completely and replace it with the new style, photorealistic, matching the photo's lighting. Keep the face, identity, skin tone, glasses, facial hair, expression, clothing, pose, camera framing and background exactly unchanged.`;
    const img=await callAI(prompt,fromCanvas(base));if(id!==genId)return;aiCache.set(key,img);showOut(img);
  }catch(e){if(id!==genId)return;console.error(e);quick=true;render();say('AI error: '+errText(e)+' · showing quick preview')}
  finally{if(id===genId)$('.stage').classList.remove('generating')}
}
async function viewAngle(a){ // left / right / back (or front) of the CURRENT style; returns true when shown
  if(!cur||!L)return false;const s=cur,front=aiCache.get(vkey(s));
  if(!front){say('Generate the AI front view first: tap a style with Quick preview unticked');return false}
  const prev=curView;if(a==='front'||aiCache.has(vkey(s,a))){setView(a);showOut(a==='front'?front:aiCache.get(vkey(s,a)));return true}
  const id=++genId;setView(a);$('.stage').classList.add('generating');say(`📐 AI is rendering the ${a} view… ~15-30s`);
  try{
    const [lab,desc]=ANGLES[a],ref=await loadImg(front),rc=document.createElement('canvas');rc.width=ref.width;rc.height=ref.height;rc.getContext('2d').drawImage(ref,0,0);
    const prompt=`Edit image 0 (the original photo of a person). Image 1 shows the same person after a hairstyle change to "${s.name}" in ${s.color} hair colour. Create a photorealistic photo of this same person seen from the ${lab} view: ${desc}. Use EXACTLY the hairstyle, hair colour and length from image 1 as seen from that angle, inventing only what cannot be seen, consistently. Keep the same person, skin tone, glasses, clothing, lighting and background style, with the same upper-body framing as image 0.`;
    const img=await callAI(prompt,fromCanvas(base),fromCanvas(rc).b64);if(id!==genId)return false;aiCache.set(vkey(s,a),img);showOut(img);return true;
  }catch(e){if(id!==genId)return false;console.error(e);setView(prev);say('AI error: '+errText(e));return false}
  finally{if(id===genId)$('.stage').classList.remove('generating')}
}
async function allViews(){if(!cur||!L)return false;for(const a of['left','right'])if(!(await viewAngle(a)))return false;return viewAngle('front')}
async function collage(){ // one sheet: left | front | right
  if(!cur||!(await allViews()))return;const W=480,H=600,c=document.createElement('canvas');c.width=W*3;c.height=H;const g=c.getContext('2d');g.fillStyle='#0b0b10';g.fillRect(0,0,c.width,c.height);
  for(const [i,a] of['left','front','right'].entries()){const im=await loadImg(aiCache.get(vkey(cur,a))),k=Math.min(W/im.width,H/im.height),x=i*W;
    g.drawImage(im,x+(W-im.width*k)/2,(H-im.height*k)/2,im.width*k,im.height*k);g.fillStyle='#fffc';g.font='600 22px system-ui';g.fillText(a.toUpperCase(),x+16,34)}
  const l=document.createElement('a');l.download='my-new-look-3-views.png';l.href=c.toDataURL('image/png');l.click();say('Saved your 3-view collage')}
document.addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(b)viewAngle(b.dataset.v)});
if($('#all'))$('#all').onclick=allViews;if($('#coll'))$('#coll').onclick=collage;
const o=$('#out');o.onpointerdown=()=>o.style.opacity=0;o.onpointerup=o.onpointerleave=()=>o.style.opacity=1;
if($('#qp'))$('#qp').onchange=()=>{if(cur&&L)pick(cur.id)};
