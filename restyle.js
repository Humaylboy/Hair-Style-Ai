// Vercel serverless function: POST /api/restyle -> Cloudflare Workers AI (FLUX.2 image editing).
// Credentials come from Vercel Environment Variables (never from the browser or the repo).
const MODELS=(process.env.MODELS||'@cf/black-forest-labs/flux-2-klein-4b').split(',').filter(Boolean);
const cl=v=>Math.max(256,Math.min(1920,Math.round((+v||512)*1.5/16)*16));
module.exports=async(req,res)=>{
  if(req.method!=='POST')return res.status(405).json({error:'POST only'});
  const ACC=process.env.CLOUDFLARE_ACCOUNT_ID,TOK=process.env.CLOUDFLARE_API_TOKEN;
  if(!ACC||!TOK)return res.status(503).json({error:'Server not configured: add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in Vercel > Settings > Environment Variables, then redeploy'});
  const {image,prompt,w,h,ref}=req.body||{};
  // light abuse guard: only hairstyle-edit requests with a normal-sized photo
  if(typeof image!=='string'||typeof prompt!=='string'||image.length>3e6||prompt.length>1500||!prompt.startsWith('Edit image 0')||(ref!==undefined&&(typeof ref!=='string'||ref.length>3e6)))return res.status(400).json({error:'Invalid request'});
  const buf=Buffer.from(image,'base64'),errs=[];
  for(const m of MODELS){
    try{
      const f=new FormData();f.append('prompt',prompt);f.append('width',String(cl(w)));f.append('height',String(cl(h)));
      f.append('input_image_0',new Blob([buf],{type:'image/jpeg'}),'photo.jpg');
      if(ref)f.append('input_image_1',new Blob([Buffer.from(ref,'base64')],{type:'image/jpeg'}),'ref.jpg');
      const r=await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACC}/ai/run/${m}`,{method:'POST',headers:{Authorization:'Bearer '+TOK},body:f});
      const j=await r.json().catch(()=>({}));
      if(!r.ok||!j.success||!(j.result&&j.result.image)){errs.push(m.split('/').pop()+' HTTP '+r.status+': '+((j.errors&&j.errors[0]&&j.errors[0].message)||'no image')+((r.status===401||r.status===403)?' (check the token has Workers AI permission)':''));continue}
      const mime=j.result.image.startsWith('iVBOR')?'image/png':'image/jpeg';
      return res.status(200).json({image:`data:${mime};base64,${j.result.image}`});
    }catch(e){errs.push(m.split('/').pop()+': '+e.message)}
  }
  res.status(502).json({error:errs.join(' | ')});
};
