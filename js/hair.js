// Hair is drawn in head-local space: origin = forehead-top landmark (10), x runs cheek-to-cheek (rotated with head tilt), y runs down to the chin (152).
function drawHair(c,L,w,h,s,o){
  const p=i=>[L[i].x*w,L[i].y*h],[tx,ty]=p(10),[cx2,cy]=p(152),[lx,ly]=p(234),[rx,ry]=p(454);
  const W=Math.hypot(rx-lx,ry-ly),H=Math.hypot(tx-cx2,ty-cy),hw=W/2,up=H*(.1+.4*s.vol)*(s.len?1:.3),sw=s.len?.14:.05;
  c.save();c.translate(tx+o.x,ty+o.y);c.rotate(Math.atan2(ry-ly,rx-lx));c.scale(o.s,o.s);
  c.fillStyle=s.hex;c.shadowColor='rgba(0,0,0,.35)';c.shadowBlur=W*.05;c.globalAlpha=(s.len?.95:.7)*o.a;
  if(s.len>=2){const bot=H*(s.len==2?1.05:1.75);
    for(const d of[-1,1]){const x=d*hw;c.beginPath();c.moveTo(x-d*W*.03,H*.12);
      c.quadraticCurveTo(x+d*W*.3,H*.5,x+d*W*.2,bot);c.quadraticCurveTo(x+d*W*.02,bot-H*.05,x-d*W*.06,H*.55);c.fill();}}
  c.beginPath();c.ellipse(0,H*.12,hw+W*.04,H*.34,0,Math.PI,2*Math.PI);c.fill(); // scalp base so no bald gap after erasing
  c.beginPath();c.moveTo(-hw-W*sw,H*.3);
  c.bezierCurveTo(-hw-W*.18,-up*1.6,hw+W*.18,-up*1.6,hw+W*sw,H*.3);c.lineTo(hw-W*.02,H*.24);
  c.quadraticCurveTo(s.fr==1?W*.12:0,H*(s.fr==2?.2:s.fr==1?-.02:.05),-hw+W*.02,H*.24);c.fill();
  if(s.tex)for(let i=0;i<=16;i++){const a=Math.PI*i/16;c.beginPath();
    c.arc(-Math.cos(a)*(hw+W*.05),H*.3-Math.sin(a)*(up*1.2+H*.3),W*(s.tex==2?.09:.06),0,7);c.fill();}
  c.shadowBlur=0;c.globalAlpha=.15*o.a;c.fillStyle='#fff';c.beginPath();
  c.ellipse(-W*.1,-up*.6,W*.25,Math.max(up*.25,2),0,0,7);c.fill();c.restore();
}
