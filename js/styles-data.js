// 46 base cuts × 16 colours = 736 styles. Shape letters: O oval, R round, S square, H heart, L oblong.
const COLORS=[["Jet Black","#15120f"],["Espresso","#3b2417"],["Chestnut","#6b4023"],["Honey Blonde","#c9a15a"],["Platinum","#e6dfc9"],["Auburn","#8a3a1f"],["Ash Grey","#8d9199"],["Midnight Blue","#1f3a8a"],["Copper Red","#b4532a"],["Rose Pink","#e58bb0"],["Emerald Green","#1f8f6b"],["Silver White","#cfd3da"],["Burgundy","#6d1f3a"],["Lavender","#a78bfa"],["Sunset Orange","#f08a3c"],["Ice Blue","#8fd3f4"]];
// [name, length 0-3, volume 0-1, fringe 0 none/1 side/2 blunt, texture 0 straight/1 wavy/2 curly, best shapes]
const OLD=[["Buzz Cut",0,.1,0,0,"OSR"],["Crew Cut",1,.3,0,0,"OSRH"],["Textured Crop",1,.4,2,0,"ORH"],["French Crop",1,.35,2,0,"OSL"],
["Classic Side Part",1,.5,1,0,"OSRL"],["Pompadour",1,.9,0,0,"ORS"],["Quiff",1,.8,0,1,"ORH"],["Slick Undercut",1,.6,0,0,"OS"],
["Messy Fringe",2,.4,2,1,"LSO"],["Curtain Bangs",2,.4,1,1,"HLOS"],["Wavy Medium",2,.5,1,1,"OHSL"],["Shag",2,.6,2,1,"OHL"],
["Curly Top Fade",1,.7,0,2,"RSO"],["Afro Crown",1,1,0,2,"OHL"],["Long Layers",3,.4,1,0,"RSOH"],["Long Straight",3,.3,0,0,"RS"],
["Beach Waves",3,.5,1,1,"OHLS"],["Long Curls",3,.7,0,2,"OSL"],["Blunt Bob",2,.3,2,0,"OSH"],["Lob Waves",2,.45,1,1,"OHSR"],
["Caesar Cut",1,.2,2,0,"ORL"],["Fade Taper",1,.3,0,0,"OSRH"],["Ivy League",1,.45,1,0,"OSRH"],["Spiky Crop",1,.7,0,0,"RSOH"],
["Top Knot",1,.95,0,0,"OSL"],["Slick Back Long",2,.5,0,0,"OSLH"],["Mullet",2,.5,2,1,"OSH"],["Bowl Cut",1,.4,2,0,"OLS"],
["Dreadlocks",3,.6,0,2,"OSLH"],["Twist Out",1,.7,0,2,"OHSR"],["Wolf Cut",2,.7,2,1,"OHL"],["Pixie Cut",1,.4,1,0,"OHSL"],
["Bixie",2,.4,1,0,"OHR"],["Long Bangs Bob",2,.35,2,0,"OSHR"],["Layered Waves",3,.6,0,1,"OHLS"],["Ponytail",2,.5,0,0,"OHLS"],
["Edgar Cut",1,.2,2,0,"ORSL"],["Perm Curls",1,.7,1,2,"OSLR"],["Comma Hair",1,.5,2,1,"OSLH"],["Two-Block Cut",1,.5,2,0,"OSRL"],
["Side Swept Bangs",2,.4,1,0,"OHSR"],["Hime Cut",3,.3,2,0,"OHRS"],["Faux Hawk",1,.8,0,0,"ORSH"],["Mohawk",1,1,0,0,"OSL"],
["Butterfly Cut",3,.6,1,1,"OHLR"],["Box Braids",3,.6,0,2,"OSHLR"]];

// ===== 350 listed styles in 11 categories (+ original picks not already listed). Colour is chosen separately (16 colours). =====
const CATS=[
["Men · Short","m","Buzz Cut|Induction Cut|Burr Cut|Butch Cut|Crew Cut|Ivy League Cut|French Crop|Textured Crop|Caesar Cut|Short Fringe|Edgar Cut|Short Quiff|Classic Taper|Short Side Part|Comb Over|Regulation Cut|High and Tight|Flat Top|Short Spiky Hair|Brush Cut|Short Slick Back|Short Pompadour|Short Faux Hawk|Short Mohawk|Shadow Fade Crop|Short Textured Fringe|Short Curly Crop|Short Wavy Crop|Short Messy Hair|Short Choppy Hair|Short Angular Fringe|Short Bowl Cut|Short Two-Block Cut|Short Undercut|Short Disconnected Cut"],
["Men · Fades","m","Low Fade|Mid Fade|High Fade|Skin Fade|Bald Fade|Drop Fade|Burst Fade|Temple Fade|Taper Fade|Low Taper|Mid Taper|High Taper|Blowout Taper|Afro Taper Fade|Curly Taper Fade|Textured Crop Fade|French Crop Fade|Buzz Cut Fade|Crew Cut Fade|Pompadour Fade|Quiff Fade|Comb Over Fade|Slick Back Fade|Faux Hawk Fade|Mohawk Fade|Edgar Fade|Shadow Fade|High Top Fade|Flat Top Fade|South of France Fade|Brooklyn Fade|V-Shaped Fade|Burst Fade Mohawk|Drop Fade Pompadour|Skin Fade Side Part"],
["Men · Medium","m","Classic Quiff|Textured Quiff|Modern Pompadour|Classic Pompadour|Slick Back|Textured Slick Back|Side-Swept Hair|Classic Side Part|Modern Side Part|Curtains Hairstyle|Middle-Part Hairstyle|Bro Flow|Messy Fringe|Textured Fringe|Wavy Fringe|Curly Fringe|Layered Medium Cut|Shag Haircut|Wolf Cut|Modern Mullet|Classic Mullet|Burst Mullet|Tapered Mullet|Hockey Flow|Surfer Hair|Feathered Medium Hair|Medium Undercut|Disconnected Undercut|Medium Faux Hawk|Medium Spiky Hair|Messy Textured Hair|Brushed-Back Hair|Loose Side Part|Medium Bowl Cut|Medium Two-Block Cut"],
["Men · Long","m","Long Straight Hair|Long Wavy Hair|Long Curly Hair|Long Layered Hair|Man Bun|Half-Up Man Bun|Top Knot|Samurai Bun|Low Man Bun|High Man Bun|Messy Man Bun|Long Ponytail|Low Ponytail|High Ponytail|Half-Up Ponytail|Long Slicked-Back Hair|Long Middle Part|Long Side Part|Long Shag|Long Wolf Cut|Long Mullet|Shoulder-Length Hair|Chest-Length Hair|Long Feathered Hair|Long Layered Curtains"],
["Women · Short","f","Pixie Cut|Classic Pixie|Long Pixie|Textured Pixie|Undercut Pixie|Asymmetrical Pixie|Pixie Bob|Bixie Cut|Classic Bob|French Bob|Italian Bob|Blunt Bob|Inverted Bob|A-Line Bob|Graduated Bob|Layered Bob|Choppy Bob|Textured Bob|Shaggy Bob|Wavy Bob|Curly Bob|Sleek Bob|Asymmetrical Bob|Chin-Length Bob|Jaw-Length Bob|Ear-Length Bob|Micro Bob|Box Bob|Bubble Bob|Boyfriend Bob|Short Stacked Bob|Short Feathered Cut|Short Wolf Cut|Short Shag Cut|Short Mullet"],
["Women · Medium","f","Classic Lob|Blunt Lob|Layered Lob|Textured Lob|Wavy Lob|Curly Lob|Asymmetrical Lob|Collarbone Cut|Shoulder-Length Layers|Butterfly Cut|Medium Wolf Cut|Medium Shag|Modern Shag|Feathered Layers|Face-Framing Layers|Choppy Layers|U-Shaped Cut|V-Shaped Cut|Medium Blunt Cut|Medium Side Part|Medium Middle Part|Curtain Bangs with Layers|Wispy Bangs with Lob|Bottleneck Bangs|Birkin Bangs|Side-Swept Bangs|Blunt Bangs with Medium Hair|Korean Layered Cut|Japanese Medium Cut|Hime Cut|Medium Octopus Cut|Medium Butterfly Layers|Medium Beach Waves|Medium Sleek Hair|Medium Tousled Hair"],
["Women · Long","f","Long Straight Hair|Long Layered Hair|Long Feathered Hair|Long Butterfly Cut|Long Wolf Cut|Long Shag|Long Octopus Cut|Long U-Cut|Long V-Cut|Long Blunt Cut|Long Face-Framing Layers|Long Curtain Layers|Long Bottleneck Bangs|Long Side-Swept Bangs|Long Wispy Bangs|Long Blunt Bangs|Long Beach Waves|Hollywood Waves|Mermaid Waves|Loose Romantic Waves|Voluminous Blowout|90s Supermodel Blowout|Long Sleek Hair|Glass Hair|Long Middle Part|Long Side Part|Deep Side Part|Long Crimped Hair|Long S-Waves|Long Spiral Curls|Long Ringlets|Long Boho Waves|Long Choppy Layers|Long Disconnected Layers|Long Princess Layers"],
["Ponytails & Buns","f","Classic High Ponytail|Classic Low Ponytail|Sleek High Ponytail|Sleek Low Ponytail|Bubble Ponytail|Braided Ponytail|Wrapped Ponytail|Side Ponytail|Curly Ponytail|Wavy Ponytail|Voluminous Ponytail|Half-Up Half-Down|Half-Up Top Knot|Half-Up Braided Style|Messy Bun|Sleek Bun|High Ballet Bun|Low Chignon|French Twist|French Roll|Top Knot Bun|Space Buns|Double Buns|Braided Bun|Sock Bun|Donut Bun|Twisted Bun|Cinnamon Bun|Rose Bun|Knotted Bun|Side Bun|Low Textured Bun|High Textured Bun|Elegant Bridal Updo|Romantic Loose Updo"],
["Braids","u","Classic Three-Strand Braid|French Braid|Dutch Braid|Fishtail Braid|French Fishtail Braid|Dutch Fishtail Braid|Four-Strand Braid|Five-Strand Braid|Rope Braid|Pull-Through Braid|Waterfall Braid|Crown Braid|Halo Braid|Milkmaid Braids|Side Braid|Double French Braids|Double Dutch Braids|Boxer Braids|Snake Braid|Ladder Braid|Infinity Braid|Lace Braid|Mermaid Braid|Pancaked Braid|Braided Headband|Braided Mohawk|Braided Ponytail|Braided Crown Updo|Boho Braids|Micro Braids|Accent Braids|Cornrows|Stitch Braids|Feed-In Braids|Ghana Braids"],
["Afro & Protective","u","Natural Afro|Rounded Afro|Tapered Afro|Afro Puff|Double Afro Puffs|Wash-and-Go Curls|Twist-Out|Braid-Out|Bantu Knots|Bantu Knot-Out|Flat Twists|Two-Strand Twists|Three-Strand Twists|Senegalese Twists|Marley Twists|Havana Twists|Passion Twists|Spring Twists|Kinky Twists|Box Braids|Knotless Box Braids|Jumbo Box Braids|Triangle Box Braids|Fulani Braids|Lemonade Braids"],
["Locs & Creative","u","Traditional Locs|Freeform Locs|Sisterlocks|Microlocs|Faux Locs|Butterfly Locs|Goddess Locs|Soft Locs|Loc Bob|Loc Ponytail|Loc Bun|Half-Up Locs|Loc Mohawk|High Top Locs|Locs with Undercut|Viking Braids|Viking Undercut|Mohawk with Braided Sides|Liberty Spikes|Asymmetrical Creative Cut"]];
const CL=[1,1,2,3,2,2,3,1,3,3,3]; // default length per category: 0 buzz,1 short,2 medium,3 long
function derive(name,ci){
  const n=name.toLowerCase(),h=r=>r.test(n);let len=CL[ci],vol=.4,fr=0,tex=0;
  if(h(/buzz|induction|burr|butch|high and tight|regulation/))len=0;
  else if(h(/bun|ponytail|updo|chignon|french twist|french roll|knot(?!less)|halo|crown|space|half-up|braided mohawk|mohawk with/)){len=1;vol=.9}
  else if(h(/\bshort\b|pixie|micro bob|ear-length|crop|crew|caesar|edgar|flat top|high top|brush|mohawk|spik|liberty|afro|puff|wash-and-go|twist-out|braid-out|undercut|bowl|two-block|comb over|quiff|pompadour|faux hawk|ivy|fade|taper/)&&!h(/medium|long|mullet|shag|wolf|lob/))len=1;
  if(h(/pompadour|quiff|mohawk|faux hawk|flat top|high top|afro|puff|blowout|voluminous|spik|liberty|bubble|messy|knot/))vol=Math.max(vol,.85);
  else if(h(/textured|layer|shag|wolf|wavy|curly|choppy|tousled|waves|curls/))vol=.6;
  else if(h(/sleek|glass|slick|straight|blunt|crop|crew|tight/))vol=.25;
  if(h(/side part|side-swept|comb over|wispy|curtain|bottleneck|birkin|asymmetrical|feathered|disconnected/))fr=1;
  if(h(/blunt (cut|bangs)|bowl|caesar|fringe|french crop|hime|edgar|bangs/)&&!h(/side-swept|wispy|curtain|bottleneck|birkin/))fr=2;
  if(h(/middle|slick|pompadour|quiff|bun|ponytail|updo|mohawk|buzz|braids|twists|locs|afro/))fr=0;
  if(h(/curl|ringlet|spiral|afro|twist|bantu|locs|loc |kinky|coil|braids|cornrows|puff|wash-and-go/))tex=2;
  else if(h(/wav|shag|wolf|textured|messy|choppy|tousled|crimped|boho|beach|mermaid|hollywood|layer|feathered|butterfly|octopus|bro flow|mullet|romantic|blowout/))tex=1;
  let f='O';if(vol>.6||len==3)f+='R';if(tex>0||fr==1)f+='S';if((len==2&&fr>0)||fr==1)f+='H';if(fr==2||(tex>0&&vol<.6&&len>0))f+='L';
  return [len,vol,fr,tex,f];
}
const NEW=CATS.flatMap(([cat,g,names],ci)=>names.split('|').map(n=>[n,cat,g,...derive(n,ci)]));
const _have=new Set(NEW.map(b=>b[0].toLowerCase()));
const BASES=NEW.concat(OLD.filter(o=>!_have.has(o[0].toLowerCase())).map(([n,l,v,f,t,fit])=>[n,'Original picks','u',l,v,f,t,fit]));
const STYLES=BASES.map(([name,cat,g,len,vol,fr,tex,fit],id)=>({id,name,cat,g,len,vol,fr,tex,fit,color:COLORS[0][0],hex:COLORS[0][1]}));
