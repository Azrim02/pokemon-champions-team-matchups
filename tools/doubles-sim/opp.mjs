// Realistic opponent teams: sampled from usage and teammates, with sampled items / moves / spreads.
import fs from 'fs';const R=new URL('../../',import.meta.url).pathname;
const { dataset }=await import(R+'test/helpers/dataset.js');const { topThreats, validateTeam }=await import(R+'src/index.js');
const u=JSON.parse(fs.readFileSync(R+'data/usage/2026-10/gen9championsvgc2026regmc-1760.json'));
let q=+process.argv[2]||7;const rnd=()=>{q^=q<<13;q>>>=0;q^=q>>>17;q^=q<<5;q>>>=0;return q/4294967296;};for(let i=0;i<9;i++)rnd();
const pick=(a,w)=>{let t=0;for(const x of a)t+=w(x);let r=rnd()*t;for(const x of a){r-=w(x);if(r<=0)return x;}return a[a.length-1];};
const list=u.pokemon.slice(0,process.env.ARCH?110:70);const base=topThreats(u,dataset,{n:process.env.ARCH?110:70}).map(t=>t.sets[0]);
const K=['hp','atk','def','spa','spd','spe'];const BAD=/fling|explosion|selfdestruct|psychup|finalgambit|magicroom|wonderroom|doodle/;
const BOOST=process.env.CALIBRATE?1.35:2.2;const wt=list.map(x=>x.usagePct);
function make(i,items){const x=list[i],b=base[i];const mega=dataset.megaFormeFor(b.species,b.item);let item=b.item;
 if(!mega){const c=x.items.filter(z=>dataset.getItem(z.id)&&!/ironball/.test(z.id)&&!items.has(z.id)&&!dataset.megaFormeFor(b.species,dataset.getItem(z.id)?.name)&&z.pct>2);if(!c.length)return null;item=dataset.getItem(pick(c,z=>z.pct).id).name;}
 else if(items.has(dataset.getItem(item).id))return null;
 const mv=x.moves.filter(z=>!BAD.test(z.id)&&z.pct>4&&dataset.getMove(z.id));let ms=[],pool=[...mv];
 while(ms.length<4&&pool.length){const m=pick(pool,z=>z.pct**1.6);ms.push(m);pool=pool.filter(z=>z!==m);}
 if(ms.filter(z=>dataset.getMove(z.id).category!=='Status').length<1)return null;
 if(/Choice/.test(item)&&ms.some(z=>z.id==='protect')){const alt=mv.filter(z=>!ms.includes(z)&&dataset.getMove(z.id).category!=='Status');if(!alt.length)return null;ms=ms.map(z=>z.id==='protect'?alt[0]:z);}
 const sp=pick(x.spreads.slice(0,5),z=>z.pct);const [nat,ev]=sp.spread.split(':');
 return {name:'',species:b.species,item,ability:b.ability,nature:nat,gender:'',evs:Object.fromEntries(ev.split('/').map((v,k)=>[K[k],+v])),moves:ms.map(z=>dataset.getMove(z.id).name)};}
function team(){for(let tr=0;tr<200;tr++){const idx=[],sets=[],items=new Set();let meg=0,g=0;
 while(sets.length<6&&g++<200){const i=pick(list.map((_,k)=>k),k=>{if(idx.includes(k))return 0;let w=wt[k];for(const j of idx){if(list[j].teammates.includes(list[k].id))w*=BOOST;}return w;});
  if(idx.some(j=>dataset.getPokemon(base[j].species).baseSpecies===dataset.getPokemon(base[i].species).baseSpecies))continue;const isM=!!dataset.megaFormeFor(base[i].species,base[i].item);if(isM&&meg>=(rnd()<.6?1:2))continue;
  const s=make(i,items);if(!s)continue;idx.push(i);sets.push(s);items.add(dataset.getItem(s.item).id);if(isM)meg++;}
 if(sets.length===6&&meg>=1&&!validateTeam(sets,dataset).length)return sets;}return null;}
const n=+process.argv[3]||40;
// CALIBRATE=1: tune the sampling weights until each Pokemon appears as often as on the ladder. Without it,
// the teammate weight compounds and common Pokemon appear far too often (sets A to E were made that way).
const idOf=s=>list[base.findIndex(b=>b.species===s.species&&(dataset.megaFormeFor(b.species,b.item)??'')===(dataset.megaFormeFor(s.species,s.item)??''))]?.id;
if(process.env.CALIBRATE){const tot=list.reduce((a,x)=>a+x.usagePct,0);for(let it=0;it<14;it++){const c={};const m=400;for(let i=0;i<m;){const t=team();if(t){i++;t.forEach(s=>{const k=idOf(s);c[k]=(c[k]||0)+1;});}}
 list.forEach((x,k)=>{const got=100*(c[x.id]||.5)/m,want=x.usagePct*600/tot;wt[k]*=Math.min(2,Math.max(.4,(want/got)**.6));});}}
let out=[];
// ARCH=1: n teams of each archetype. core: one Pokemon from each group; must: moves it has to carry;
// like: preferred partners; ban: excluded; slow: Trick Room spreads for everyone but the setter's partners.
const ARCHES=[
 {name:'Sun',core:['charizardmegay',['venusaur','torkoal']],like:'arcaninehisui volcarona farigiraf incineroar garchomp whimsicott armarouge',ab:{venusaur:'Chlorophyll'},ban:'pelipper politoed tyranitarmega'},
 {name:'Rain',core:[['pelipper','politoed'],['archaludon','swampertmega','golisopodmega'],['basculegionf','basculegion','archaludon']],like:'sneasler rillaboom kingambit farigiraf incineroar',ab:{basculegionf:'Swift Swim',basculegion:'Swift Swim'},must:{archaludon:['electroshot']},ban:'charizardmegay torkoal tyranitarmega'},
 {name:'Sand',core:[['tyranitarmega','hippowdon','tyranitar'],'excadrill'],like:'garchomp garchompmega garchompmegaz rillaboom sylveon whimsicott gholdengo',ab:{excadrill:'Sand Rush'},ban:'charizardmegay pelipper politoed torkoal'},
 {name:'Snow / Aurora Veil',core:[['froslassmega','ninetalesalola']],like:'sneasler kingambit garchomp dragonitemega baxcalibur gholdengo incineroar rillaboom',must:{froslassmega:['auroraveil'],ninetalesalola:['auroraveil']},ban:'charizardmegay pelipper politoed tyranitarmega torkoal'},
 {name:'Trick Room',core:[['farigiraf','indeedeef','hatterene'],['sinistcha','indeedeef','hatterene','farigiraf'],['torkoal','cameruptmega','golisopodmega','snorlax','mawilemega'],['kingambit','incineroar','torkoal','snorlax']],must:{farigiraf:['trickroom'],indeedeef:['trickroom'],hatterene:['trickroom'],sinistcha:['trickroom']},like:'kingambit incineroar rillaboom sylveon milotic golisopodmega',ban:'sneasler whimsicott garchomp pelipper dragonitemega salamencemega raichumegay froslassmega staraptormega talonflame aerodactylmega',slow:true},
 {name:'Psychic Terrain',core:[['indeedeef','indeedee'],['armarouge','gardevoirmega','delphoxmega','hatterene','espathra']],must:{armarouge:['expandingforce'],gardevoirmega:['expandingforce'],delphoxmega:['expandingforce'],hatterene:['expandingforce']},like:'sneasler kingambit basculegion garchomp gholdengo',ban:'rillaboom'},
 {name:'Tailwind offense',core:[['whimsicott','talonflame','aerodactylmega','pelipper']],must:{whimsicott:['tailwind'],pelipper:['tailwind'],aerodactylmega:['tailwind']},like:'sneasler dragonitemega garchomp gholdengo kommoo floettemega basculegion kingambit',ban:'farigiraf indeedeef sinistcha'},
 {name:'Redirection + setup',core:[['indeedeef','volcarona','sinistcha','maushold','clefable'],['floettemega','gholdengo','tyranitarmega','delphoxmega']],must:{indeedeef:['followme'],volcarona:['ragepowder'],sinistcha:['ragepowder'],maushold:['followme'],floettemega:['calmmind'],gholdengo:['nastyplot'],tyranitarmega:['dragondance'],delphoxmega:['nastyplot']},like:'incineroar rillaboom kingambit basculegion'},
 {name:'Fake Out balance',core:['incineroar','rillaboom'],must:{incineroar:['fakeout','partingshot'],rillaboom:['fakeout']},like:'sylveon milotic basculegion salamencemega gholdengo raichumegay volcarona floettemega'},
 {name:'Screens',core:['grimmsnarl',['floettemega','dragonitemega','salamencemega','kommoo','tyranitarmega']],must:{grimmsnarl:['reflect','lightscreen']},like:'sneasler kingambit basculegion gholdengo archaludon'},
 {name:'Mega Flying Tailwind',core:[['salamencemega','dragonitemega','staraptormega']],must:{salamencemega:['tailwind'],dragonitemega:['tailwind'],staraptormega:['tailwind']},like:'kingambit rillaboom incineroar basculegion gholdengo sneasler farigiraf'},
 {name:'Raichu offense',core:[['raichumegay','raichumegax'],'sneasler'],must:{raichumegay:['fakeout'],raichumegax:['fakeout']},like:'garchomp basculegion kingambit rillaboom incineroar dragonite'},
 {name:'Metagross mirror',core:['metagrossmega',['rillaboom','indeedeef']],like:'incineroar basculegion garchomp grimmsnarl floettemega'},
];
if(process.env.ARCH){const ix=id=>list.findIndex(x=>x.id===id);const meta=[];
 for(const a of ARCHES){const like=new Set((a.like||'').split(' ')),ban=new Set((a.ban||'').split(' '));let got=0,tr=0;
  while(got<n&&tr++<4000){const idx=[],sets=[],items=new Set();let meg=0,bad=false,g=0;
   const add=i=>{const id=list[i].id;if(idx.some(j=>dataset.getPokemon(base[j].species).baseSpecies===dataset.getPokemon(base[i].species).baseSpecies))return false;const isM=!!dataset.megaFormeFor(base[i].species,base[i].item);if(isM&&meg>=2)return false;
    const s=make(i,items);if(!s)return false;const must=(a.must||{})[id]||[];for(const m of must){const nm=dataset.getMove(m).name;if(!dataset.canLearn(dataset.getPokemon(s.species).id,m))return false;if(!s.moves.includes(nm)){const k=s.moves.findIndex((z,q)=>!must.some(mm=>dataset.getMove(mm).name===z)&&(dataset.getMove(z).category==='Status'||q===3));if(k<0)return false;s.moves[k]=nm;}}
    if(!s.moves.some(z=>dataset.getMove(z).category!=='Status'))return false;if(a.ab&&a.ab[id])s.ability=a.ab[id];
    if(a.slow){s.evs.hp=Math.min(32,s.evs.hp+s.evs.spe);s.evs.spe=0;s.nature=dataset.getMove(s.moves.find(z=>dataset.getMove(z).category!=='Status')).category==='Physical'?'Brave':'Quiet';}
    if(/Choice/.test(s.item)&&s.moves.some(z=>dataset.getMove(z).category==='Status'))return false;
    idx.push(i);sets.push(s);items.add(dataset.getItem(s.item).id);meg+=isM?1:0;return true;};
   for(const c of a.core){const opts=[c].flat().filter(z=>ix(z)>=0&&!idx.includes(ix(z)));if(!opts.length){bad=true;break;}let okk=false;for(let t=0;t<6&&!okk;t++)okk=add(ix(pick(opts,z=>Math.sqrt(list[ix(z)].usagePct))));if(!okk){bad=true;break;}}
   if(bad)continue;
   while(sets.length<6&&g++<200){const i=pick(list.map((_,k)=>k),k=>idx.includes(k)||ban.has(list[k].id)?0:list[k].usagePct*(like.has(list[k].id)?3:.35));add(i);}
   if(sets.length===6&&!validateTeam(sets,dataset).length){out.push(sets);meta.push(a.name);got++;}}
  console.log(a.name,got,'|',out.at(-1).map(s=>s.species+'@'+s.item).join(', '));}
 fs.writeFileSync(process.argv[4].replace('.json','-names.json'),JSON.stringify(meta));}
else while(out.length<n){const t=team();if(t)out.push(t);}
if(process.env.CALIBRATE){const c={};out.flat().forEach(s=>{const k=idOf(s);c[k]=(c[k]||0)+1;});console.log(list.slice(0,16).map(x=>`${x.id} ${x.usagePct.toFixed(0)}->${(100*(c[x.id]||0)/n).toFixed(0)}`).join(', '));}
fs.writeFileSync(process.argv[4],JSON.stringify(out));const c={};out.flat().forEach(s=>c[s.species]=(c[s.species]||0)+1);console.log(out.length,Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,22).map(x=>x.join(' ')).join(', '));
