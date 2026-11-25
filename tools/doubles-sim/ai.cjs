// Doubles AI: abstract turn simulator + 1-turn joint search + greedy rollouts, driving Showdown's engine.
const SD=require('path').join(__dirname,'../../vendor/pokemon-showdown/');
const S=require(SD+'dist/sim');const {Battle,Teams,Dex}=S;
const FMT='gen9championsvgc2026regmc';const dex=Dex.forFormat(Dex.formats.get(FMT));
// MD=1: Reg M-D preview. The two announced Mega abilities are patched in memory (vendor/ is not changed).
if(process.env.MD){dex.data.Pokedex.heatranmega.abilities={0:'Water Compaction'};
 dex.data.Abilities.mdspastart={name:'MD SpA Start',num:-1,flags:{},onStart(p){this.boost({spa:1},p);}};
 for(const f of ['tatsugiricurlymega','tatsugiridroopymega','tatsugiristretchymega'])if(dex.data.Pokedex[f])dex.data.Pokedex[f].abilities={0:'MD SpA Start'};}
const PROT=new Set(['protect','detect','kingsshield','spikyshield','banefulbunker','silktrap','burningbulwark','obstruct']);
const PIV=new Set(['uturn','voltswitch','flipturn']);const SLOW=new Set(['icywind','electroweb','bulldoze','rocktomb','lowsweep','mudshot','drumbeating']);
const SETUP={nastyplot:[0,2],swordsdance:[2,0],quiverdance:[0,1],dragondance:[1,0],calmmind:[0,1],bulkup:[1,0],coil:[1,0],clangoroussoul:[1,1],tailglow:[0,3],howl:[1,0],growth:[1,1]};
const HEAL=new Set(['recover','roost','slackoff','softboiled','moonlight','morningsun','synthesis','strengthsap','milkdrink','shoreup']);
const PIX={pixilate:'Fairy',aerilate:'Flying',refrigerate:'Ice',galvanize:'Electric',dragonize:'Dragon'};
const ITEMT={charcoal:'Fire',mysticwater:'Water',miracleseed:'Grass',magnet:'Electric',nevermeltice:'Ice',blackbelt:'Fighting',poisonbarb:'Poison',softsand:'Ground',sharpbeak:'Flying',twistedspoon:'Psychic',silverpowder:'Bug',hardstone:'Rock',spelltag:'Ghost',dragonfang:'Dragon',blackglasses:'Dark',metalcoat:'Steel',fairyfeather:'Fairy',silkscarf:'Normal'};
const BERRY={occaberry:'Fire',passhoberry:'Water',wacanberry:'Electric',rindoberry:'Grass',yacheberry:'Ice',chopleberry:'Fighting',kebiaberry:'Poison',shucaberry:'Ground',cobaberry:'Flying',payapaberry:'Psychic',tangaberry:'Bug',chartiberry:'Rock',kasibberry:'Ghost',habanberry:'Dragon',colburberry:'Dark',babiriberry:'Steel',roseliberry:'Fairy'};
const IMM={levitate:'Ground',eartheater:'Ground',flashfire:'Fire',wellbakedbody:'Fire',waterabsorb:'Water',stormdrain:'Water',dryskin:'Water',voltabsorb:'Electric',lightningrod:'Electric',motordrive:'Electric',sapsipper:'Grass'};
const NOPRI=new Set(['armortail','queenlymajesty','dazzling']);
const NOINT=new Set(['clearbody','whitesmoke','hypercutter','innerfocus','oblivious','owntempo','scrappy','fullmetalbody','mirrorarmor','guarddog']);
const mvCache=new Map();
function mv(id){let m=mvCache.get(id);if(m)return m;const x=dex.moves.get(id);let hits=1;if(Array.isArray(x.multihit))hits=3;else if(x.multihit)hits=x.multihit;
 m={id:x.id,type:x.type,cat:x.category,bp:x.basePower||(x.basePowerCallback?60:0),acc:x.accuracy===true?1:x.accuracy/100,pri:x.priority,tgt:x.target,contact:!!x.flags.contact,sound:!!x.flags.sound,punch:!!x.flags.punch,bite:!!x.flags.bite,bullet:!!x.flags.bullet,pulse:!!x.flags.pulse,slicing:!!x.flags.slicing,heal:!!x.flags.heal,protect:!!x.flags.protect,hits,recoil:x.recoil?x.recoil[0]/x.recoil[1]:0,drain:x.drain?x.drain[0]/x.drain[1]:0,self:x.self&&x.self.boosts,crit:!!x.willCrit,sheer:!!(x.secondaries||x.secondary),spread:x.target==='allAdjacentFoes'||x.target==='allAdjacent',hitsAlly:x.target==='allAdjacent',dmg:x.category!=='Status',ohko:!!x.ohko};
 if(id==='grassknot'||id==='lowkick')m.bp=70;if(id==='lastrespects')m.bp=50;if(m.ohko)m.bp=0;if(id==='finalgambit'||id==='fling'||id==='counter'||id==='mirrorcoat')m.bp=id==='fling'?100:0;
 mvCache.set(id,m);return m;}
const eff=(type,types)=>{let e=1;for(const t of types){if(!dex.getImmunity(type,[t]))return 0;e*=2**dex.getEffectiveness(type,[t]);}return e;};
const effC=new Map();const effm=(a,b)=>{const k=a+b.join();let v=effC.get(k);if(v===undefined){v=eff(a,b);effC.set(k,v);}return v;};
const BM=b=>b>=0?(2+b)/2:2/(2-b);
const natMod=(set,st)=>{const n=dex.natures.get(set.nature);return n.plus===st?1.1:n.minus===st?.9:1;};
function info(battle,p,canMega){ // static snapshot of one Pokemon
 let sp=p.species,ab=p.ability,st=p.storedStats,mega=false;
 const it=p.getItem?p.getItem():dex.items.get(p.item);
 if(canMega&&p.canMegaEvo){const ms=dex.species.get(p.canMegaEvo);mega=true;sp=ms;ab=dex.abilities.get(ms.abilities[0]).id;st={};for(const k of ['atk','def','spa','spd','spe'])st[k]=Math.floor((ms.baseStats[k]+20+(p.set.evs[k]||0))*natMod(p.set,k));}
 const fly=sp.types.includes('Flying')||ab==='levitate'||p.item==='airballoon';
 return {p,mega,types:mega?sp.types:p.getTypes(),ab,item:p.item,st,maxhp:p.maxhp,hp0:p.fainted?0:p.hp/p.maxhp,b:p.boosts,status:p.status,wt:sp.weightkg,grounded:!fly,name:sp.name,
  moves:p.moveSlots.map(s=>({...mv(s.id),pp:s.pp,disabled:s.disabled})),fresh:p.activeMoveActions===0||!p.isActive,stall:p.volatiles.stall?1:0,unb:p.volatiles.unburden?1:0,hadItem:!!p.item,lr:p.side.totalFainted||0,rage:p.timesAttacked||0};}
function damage(G,a,d,m,ai,di){ // expected fraction of max HP (accuracy excluded), no spread factor
 if(!m.dmg||!m.bp)return m.id==='superfang'||m.id==='ruination'?.4:m.id==='nightshade'||m.id==='seismictoss'?50/d.maxhp:0;
 let type=m.type,bp=m.bp,mod=1;const ab=a.ab,db=(ab==='moldbreaker'||ab==='teravolt'||ab==='turboblaze')?'':d.ab;
 if(PIX[ab]&&type==='Normal'){type=PIX[ab];mod*=1.2;}if(ab==='liquidvoice'&&m.sound)type='Water';
 if(m.id==='weatherball'&&G.w){type={sun:'Fire',rain:'Water',sand:'Rock',snow:'Ice'}[G.w];bp=100;}
 if(m.id==='ragingbull'||m.id==='ivycudgel')type=a.types[a.types.length-1];
 if(m.id==='lastrespects')bp=50+50*a.lr;if(m.id==='ragefist')bp=Math.min(350,50+50*a.rage);
 if(m.id==='acrobatics'&&!a.item)bp*=2;if(m.id==='knockoff'&&d.item&&!/ite[xyz]?$/.test(d.item))bp*=1.5;if(m.id==='hex'&&d.status)bp*=2;if(m.id==='facade'&&a.status)bp*=2;
 if(m.id==='lowkick'||m.id==='grassknot')bp=d.wt>=200?120:d.wt>=100?100:d.wt>=50?80:d.wt>=25?60:40;
 if(m.id==='heavyslam'||m.id==='heatcrash'){const r=a.wt/d.wt;bp=r>=5?120:r>=4?100:r>=3?80:r>=2?60:40;}
 if(m.id==='gyroball')bp=Math.min(150,25*d.st.spe/a.st.spe);if(m.id==='electroball')bp=80;if(m.id==='eruption'||m.id==='waterspout')bp=Math.max(1,150*a.hp0);
 if(m.id==='expandingforce'&&G.t==='psychic'&&a.grounded)bp*=1.5;if(m.id==='steelroller'&&!G.t)return 0;if(m.id==='risingvoltage'&&G.t==='electric')bp*=2;
 if(type==='Ground'&&!d.grounded&&m.id!=='thousandarrows')return 0;
 let e=effm(type,d.types);if(ab==='scrappy'&&!e)e=1;if(m.id==='freezedry'&&d.types.includes('Water'))e*=4;if(m.id==='flyingpress')e*=effm('Flying',d.types);if(!e)return 0;
 if(IMM[db]===type)return 0;if(db==='bulletproof'&&m.bullet)return 0;if(db==='soundproof'&&m.sound)return 0;if(db==='wonderguard'&&e<=1)return 0;if(m.pri>0&&G.t==='psychic'&&d.grounded)return 0;
 const phys=m.cat==='Physical';let A=phys?a.st.atk:a.st.spa,D=phys?d.st.def:d.st.spd;
 if(m.id==='bodypress')A=a.st.def;if(m.id==='foulplay')A=d.st.atk;if(m.id==='psyshock'||m.id==='psystrike')D=d.st.def;
 let ba=phys?a.b.atk:a.b.spa,bd=phys||m.id==='psyshock'?d.b.def:d.b.spd;if(m.id==='bodypress')ba=a.b.def;if(m.id==='foulplay')ba=d.b.atk;
 if(db==='unaware')ba=0;if(ab==='unaware')bd=0;if(m.crit){ba=Math.max(0,ba);bd=Math.min(0,bd);}
 A*=BM(ba);D*=BM(bd);
 if(phys&&(ab==='hugepower'||ab==='purepower'))A*=2;if(phys&&a.status==='brn'&&ab!=='guts')mod*=.5;if(ab==='guts'&&a.status&&phys)A*=1.5;if(ab==='solarpower'&&G.w==='sun'&&!phys)A*=1.5;if(ab==='orichalcumpulse'&&G.w==='sun'&&phys)A*=1.33;
 if(G.w==='sand'&&!phys&&d.types.includes('Rock'))D*=1.5;if(G.w==='snow'&&phys&&d.types.includes('Ice'))D*=1.5;if(db==='furcoat'&&phys)D*=2;
 if(a.types.includes(type))mod*=ab==='adaptability'?2:1.5;
 if(ab==='toughclaws'&&m.contact)mod*=1.3;if(ab==='ironfist'&&m.punch)mod*=1.2;if(ab==='strongjaw'&&m.bite)mod*=1.5;if(ab==='sharpness'&&m.slicing)mod*=1.5;if(ab==='megalauncher'&&m.pulse)mod*=1.5;if(ab==='technician'&&bp<=60)mod*=1.5;if(ab==='sheerforce'&&m.sheer)mod*=1.3;if(ab==='reckless'&&m.recoil)mod*=1.2;if(ab==='waterbubble'&&type==='Water')mod*=2;if(ab==='sandforce'&&G.w==='sand'&&/Ground|Rock|Steel/.test(type))mod*=1.3;if(ab==='supremeoverlord')mod*=1+.1*Math.min(5,a.lr);if(ab==='punkrock'&&m.sound)mod*=1.3;if(ab==='transistor'&&type==='Electric')mod*=1.3;if(ab==='fairyaura'&&type==='Fairy'||ab==='darkaura'&&type==='Dark')mod*=1.33;
 if((ab==='blaze'&&type==='Fire'||ab==='torrent'&&type==='Water'||ab==='overgrow'&&type==='Grass'||ab==='swarm'&&type==='Bug')&&a.hp0<=1/3)mod*=1.5;
 if(a.item==='lifeorb')mod*=1.3;if(ITEMT[a.item]===type)mod*=1.2;if(a.item==='expertbelt'&&e>1)mod*=1.2;if(a.item==='normalgem'&&type==='Normal')mod*=1.3;if(a.item==='muscleband'&&phys)mod*=1.1;if(a.item==='wiseglasses'&&!phys)mod*=1.1;if(a.item==='lightball'&&/Pikachu/.test(a.name))mod*=2;
 if(BERRY[d.item]===type&&e>1)mod*=.5;
 if(G.w==='sun'&&type==='Fire')mod*=1.5;if(G.w==='sun'&&type==='Water')mod*=.5;if(G.w==='rain'&&type==='Water')mod*=1.5;if(G.w==='rain'&&type==='Fire')mod*=.5;
 if(a.grounded&&(G.t==='grassy'&&type==='Grass'||G.t==='electric'&&type==='Electric'||G.t==='psychic'&&type==='Psychic'))mod*=1.3;if(d.grounded&&G.t==='misty'&&type==='Dragon')mod*=.5;if(G.t==='grassy'&&d.grounded&&(m.id==='earthquake'||m.id==='bulldoze'))mod*=.5;
 if(db==='multiscale'||db==='shadowshield')mod*=.5;if((db==='filter'||db==='solidrock')&&e>1)mod*=.75;if(db==='thickfat'&&/Fire|Ice/.test(type))mod*=.5;if(db==='heatproof'&&type==='Fire')mod*=.5;if(db==='fluffy'){if(m.contact)mod*=.5;if(type==='Fire')mod*=2;}if(db==='icescales'&&!phys)mod*=.5;if(db==='waterbubble'&&type==='Fire')mod*=.5;if(db==='purifyingsalt'&&type==='Ghost')mod*=.5;if(db==='dryskin'&&type==='Fire')mod*=1.25;
 const scr=G.scr[di>>2];if(scr[phys?0:1])mod*=.667;
 let dm=(Math.floor(Math.floor(22*bp*A/D)/50)+2)*mod*e*.925*m.hits*(m.crit?1.5:1.02);
 if((m.id==='solarbeam'||m.id==='solarblade')&&G.w!=='sun'||m.id==='electroshot'&&G.w!=='rain'||m.id==='meteorbeam')dm*=.5;
 if(m.id==='hyperbeam'||m.id==='gigaimpact')dm*=.6;if(m.id==='focuspunch')dm*=.3;
 return dm/d.maxhp;}
const TERR={grassyterrain:'grassy',psychicterrain:'psychic',electricterrain:'electric',mistyterrain:'misty'};
const WE={sunnyday:'sun',desolateland:'sun',raindance:'rain',primordialsea:'rain',sandstorm:'sand',snowscape:'snow',snow:'snow'};
function build(battle){ // G: global context
 const G={w:WE[battle.field.weather]||'',t:TERR[battle.field.terrain]||'',tr:battle.field.pseudoWeather.trickroom?battle.field.pseudoWeather.trickroom.duration:0,scr:[],tw:[0,0],M:[],act:[],bench:[],cmd:[-1,-1],D:new Map()};
 battle.sides.forEach((s,si)=>{G.scr.push([!!(s.sideConditions.reflect||s.sideConditions.auroraveil),!!(s.sideConditions.lightscreen||s.sideConditions.auroraveil)]);G.tw[si]=s.sideConditions.tailwind?s.sideConditions.tailwind.duration:0;});
 battle.sides.forEach((s,si)=>{const used=s.pokemon.some(p=>p.species.isMega);const list=s.pokemon.slice(0,4);const act=[-1,-1],bench=[];let pend=!used;
  list.forEach((p,i)=>{const cmdg=!!p.volatiles.commanding;if(cmdg)G.cmd[si]=s.active.indexOf(p);const act_=s.active.includes(p)&&!p.fainted&&!cmdg;const cm=!used&&!!p.canMegaEvo&&pend;if(cm)pend=false;const x=info(battle,p,cm);x.idx=si*4+i;x.cmdg=cmdg;G.M[si*4+i]=x;if(act_)act[s.active.indexOf(p)]=si*4+i;else if(!p.fainted&&!cmdg)bench.push(si*4+i);});
  G.act[si]=act;G.bench[si]=bench;});
 return G;}
function Df(G,ai,mi,di){const k=ai*256+mi*16+di;let v=G.D.get(k);if(v===undefined){v=damage(G,G.M[ai],G.M[di],G.M[ai].moves[mi],ai,di);G.D.set(k,v);}return v;}
function speed(G,st,i){const x=G.M[i];let s=x.st.spe*BM(x.b.spe)*st.spm[i];if(x.item==='choicescarf')s*=1.5;if(x.item==='ironball')s*=.5;if(x.status==='par')s*=.5;if(x.unb)s*=2;if(G.w==='sun'&&x.ab==='chlorophyll'||G.w==='rain'&&x.ab==='swiftswim'||G.w==='sand'&&x.ab==='sandrush'||G.w==='snow'&&x.ab==='slushrush'||G.t==='electric'&&x.ab==='surgesurfer')s*=2;
 if(x.ab==='unburden'&&x.item==='grassyseed'&&st.terr==='grassy'||x.ab==='unburden'&&x.item==='psychicseed'&&st.terr==='psychic')s*=2;
 if(st.tw[i>>2]>0)s*=2;return s;}
function S0(G){return {hp:G.M.reduce((a,x,i)=>{a[i]=x?x.hp0:0;return a;},new Array(8).fill(0)),am:new Array(8).fill(1),sm:new Array(8).fill(1),spm:new Array(8).fill(1),act:[[...G.act[0]],[...G.act[1]]],fresh:G.M.reduce((a,x,i)=>{a[i]=x?x.fresh:true;return a;},[]),tw:[...G.tw],tr:G.tr,terr:G.t,stall:G.M.map(x=>x?x.stall:0),bonus:[0,0],w:G.w};}
const cl=s=>({hp:s.hp.slice(),am:s.am.slice(),sm:s.sm.slice(),spm:s.spm.slice(),act:[s.act[0].slice(),s.act[1].slice()],fresh:s.fresh.slice(),tw:s.tw.slice(),tr:s.tr,terr:s.terr,stall:s.stall.slice(),bonus:s.bonus.slice(),w:s.w});
function enter(G,s,si,slot,i){s.act[si][slot]=i;s.fresh[i]=true;const x=G.M[i];s.am[i]=s.sm[i]=s.spm[i]=1;
 if(x.ab==='intimidate')for(const f of s.act[1-si])if(f>=0&&s.hp[f]>0){const fx=G.M[f];if(fx.ab==='defiant')s.am[f]*=1.5;else if(fx.ab==='competitive')s.sm[f]*=2;else if(fx.ab==='contrary')s.am[f]*=1.5;else if(!NOINT.has(fx.ab)&&fx.item!=='clearamulet')s.am[f]*=.667;}
 if(x.ab==='grassysurge')s.terr='grassy';if(x.ab==='psychicsurge')s.terr='psychic';if(x.ab==='hospitality'){const al=s.act[si][1-slot];if(al>=0)s.hp[al]=Math.min(1,s.hp[al]+.25*(s.hp[al]>0));}}
function bestBench(G,s,si){let b=-1,bv=-9;for(let k=si*4;k<si*4+4;k++){if(!G.M[k]||s.hp[k]<=0||s.act[si].includes(k)||G.M[k].cmdg)continue;let v=s.hp[k]*.3;for(const f of s.act[1-si]){if(f<0||s.hp[f]<=0)continue;let o=0;G.M[k].moves.forEach((m,mi)=>{if(m.dmg)o=Math.max(o,Math.min(1,Df(G,k,mi,f)*m.acc));});let inc=0;G.M[f].moves.forEach((m,mi)=>{if(m.dmg)inc=Math.max(inc,Math.min(1,Df(G,f,mi,k)*m.acc));});v+=o-.8*inc;}if(v>bv){bv=v;b=k;}}return b;}
const priOf=(G,s,i,m)=>{const x=G.M[i];let p=m.pri;if(m.id==='grassyglide'&&s.terr==='grassy'&&x.grounded)p+=1;if(x.ab==='prankster'&&!m.dmg)p+=1;if(x.ab==='galewings'&&m.type==='Flying'&&s.hp[i]>=.99)p+=1;if(x.ab==='triage'&&m.heal)p+=3;return p;};
// actions: {k:'m',mi,t(global index or -1)}, {k:'s',to}
function turn(G,s,acts){ // acts: map idx->action
 const list=[];for(let si=0;si<2;si++)for(let sl=0;sl<2;sl++){const i=s.act[si][sl];if(i<0||s.hp[i]<=0)continue;const a=acts[i];if(!a)continue;if(a.k==='s')list.push({i,si,sl,a,o:100});else{const m=G.M[i].moves[a.mi];list.push({i,si,sl,a,m,o:priOf(G,s,i,m)});}}
 const sp={};for(const l of list)sp[l.i]=speed(G,s,l.i);
 list.sort((x,y)=>y.o-x.o||(s.tr?sp[x.i]-sp[y.i]:sp[y.i]-sp[x.i]));
 const prot={},flin={},red=[-1,-1],wide=[0,0],hh={},skip={};
 for(let q=0;q<list.length;q++){const {i,si,sl,a,m,o}=list[q];if(s.hp[i]<=0||skip[i])continue;
  if(a.k==='s'){if(s.hp[a.to]>0&&!s.act[si].includes(a.to))enter(G,s,si,sl,a.to);continue;}
  if(s.act[si][sl]!==i)continue;if(flin[i]){s.fresh[i]=false;continue;}
  const x=G.M[i],foe=s.act[1-si],ally=s.act[si][1-sl];const wasFresh=s.fresh[i];s.fresh[i]=false;
  if(PROT.has(m.id)){const pr=s.stall[i]?.33:1;prot[i]=pr;s.stall[i]=1;continue;}s.stall[i]=0;
  if(!m.dmg){switch(m.id){
    case 'tailwind':if(s.tw[si]<=0)s.tw[si]=4;break;case 'trickroom':s.tr=s.tr?0:5;break;
    case 'followme':case 'ragepowder':red[si]=i;break;case 'helpinghand':if(ally>=0)hh[ally]=1.5;break;case 'wideguard':wide[si]=1;break;
    case 'partingshot':{const t=a.t;if(t>=0&&s.hp[t]>0&&!prot[t]&&G.M[t].ab!=='goodasgold'){if(!NOINT.has(G.M[t].ab)){s.am[t]*=G.M[t].ab==='defiant'?1.5:.667;s.sm[t]*=G.M[t].ab==='competitive'?2:.667;}const b=bestBench(G,s,si);if(b>=0)enter(G,s,si,sl,b);}break;}
    case 'haze':for(const f of foe)if(f>=0){const fx=G.M[f];s.am[f]=1/Math.max(1,BM(fx.b.atk));s.sm[f]=1/Math.max(1,BM(fx.b.spa));}break;
    case 'willowisp':{const t=a.t;if(t>=0&&s.hp[t]>0&&!prot[t]&&!G.M[t].status&&!G.M[t].types.includes('Fire')&&G.M[t].ab!=='goodasgold'){s.am[t]*=.5+.5*.15;s.hp[t]-=.04;}break;}
    case 'thunderwave':{const t=a.t;if(t>=0&&!prot[t]&&!G.M[t].status&&!/Electric|Ground/.test(G.M[t].types.join()))s.spm[t]*=.5;break;}
    case 'taunt':{const t=a.t;if(t>=0&&!prot[t]){const nx=list.slice(q+1).find(z=>z.i===t);if(nx&&nx.m&&!nx.m.dmg&&nx.a.k==='m')skip[t]=1;s.bonus[si]+=.08;}break;}
    case 'encore':{const t=a.t;if(t>=0&&!prot[t]&&!wasFresh)s.bonus[si]+=G.M[t].stall?.45:.1;break;}
    case 'reflect':case 'lightscreen':s.bonus[si]+=.18;break;case 'auroraveil':if(s.w==='snow')s.bonus[si]+=.35;break;
    case 'lifedew':for(const k of [i,ally])if(k>=0&&s.hp[k]>0)s.hp[k]=Math.min(1,s.hp[k]+.25);break;
    case 'coaching':if(ally>=0){s.am[ally]*=1.4;s.bonus[si]+=.08;}break;
    case 'yawn':if(a.t>=0&&!prot[a.t]&&!G.M[a.t].status)s.bonus[si]+=.12;break;case 'spore':case 'sleeppowder':case 'hypnosis':if(a.t>=0&&!prot[a.t]&&!G.M[a.t].status&&list.slice(q+1).some(z=>z.i===a.t)){s.bonus[si]+=.35*m.acc;}break;
    case 'charm':case 'featherdance':if(a.t>=0&&!prot[a.t])s.am[a.t]*=.5;break;
    default:if(SETUP[m.id]){const u=SETUP[m.id];s.am[i]*=1+.5*u[0];s.sm[i]*=1+.5*u[1];if(m.id==='quiverdance'||m.id==='dragondance')s.spm[i]*=1.5;}
     else if(HEAL.has(m.id))s.hp[i]=Math.min(1,s.hp[i]+.5);else if(m.id==='irondefense'||m.id==='acidarmor'||m.id==='cosmicpower')s.bonus[si]+=.08;}
   continue;}
  if(m.id==='fakeout'&&!wasFresh)continue;if(m.id==='firstimpression'&&!wasFresh)continue;
  let tg=[];if(m.spread){for(const f of foe)if(f>=0&&s.hp[f]>0)tg.push(f);if(m.hitsAlly&&ally>=0&&s.hp[ally]>0)tg.push(ally);}
  else{let t=a.t;if(t===undefined||t<0||s.hp[t]<=0||!(s.act[0].includes(t)||s.act[1].includes(t))){const sl0=a.ts;t=sl0!==undefined&&foe[sl0]>=0&&s.hp[foe[sl0]]>0?foe[sl0]:foe.find(f=>f>=0&&s.hp[f]>0);}if(t===undefined||t<0)continue;
   const r=red[1-si];if(r>=0&&s.hp[r]>0&&(t>>2)===1-si&&x.ab!=='stalwart'&&x.ab!=='propellertail')t=r;tg=[t];}
  const sf=tg.length>1?.75:1;const mult=(m.cat==='Physical'?s.am[i]:s.sm[i])*(hh[i]||1)*sf;let dealt=0,hit=false;
  for(const t of tg){if((t>>2)!==si){if(m.spread&&wide[1-si])continue;if(o>0&&m.pri<5){const ts=s.act[t>>2];if(ts.some(z=>z>=0&&s.hp[z]>0&&NOPRI.has(G.M[z].ab)))continue;if(s.terr==='psychic'&&G.M[t].grounded)continue;}}
   let pr=prot[t]&&m.id!=='feint'?1-prot[t]:1;if(pr<=0)continue;let d=Df(G,i,a.mi,t)*mult*m.acc*pr;if(d<=0)continue;
   if(m.id==='suckerpunch'||m.id==='thunderclap'){const nx=list.slice(q+1).find(z=>z.i===t);if(!nx||!nx.m||!nx.m.dmg)continue;}
   if(G.t!==s.terr){const c=m.type==='Grass'&&x.grounded;if(c&&s.terr==='grassy')d*=1.3;if(c&&G.t==='grassy')d/=1.3;}
   hit=true;let h=s.hp[t];if(G.M[t].item==='focussash'&&h>=.999&&d>=h&&m.hits===1)d=h-.01;if(G.M[t].ab==='sturdy'&&h>=.999&&d>=h)d=h-.01;
   d=Math.min(d,h);s.hp[t]=h-d;if(s.hp[t]<.005)s.hp[t]=0;dealt+=d*G.M[t].maxhp;
   if(s.hp[t]>0&&h>.5&&s.hp[t]<=.5&&G.M[t].item==='sitrusberry')s.hp[t]+=.25;
   if(m.id==='fakeout'&&s.hp[t]>0&&G.M[t].ab!=='innerfocus'&&G.M[t].ab!=='shielddust')flin[t]=1;
   if(SLOW.has(m.id))s.spm[t]*=.667;if(m.id==='snarl')s.sm[t]*=.667;if(m.id==='spiritbreak'||m.id==='strugglebug')s.sm[t]*=.667;if(m.id==='lunge'||m.id==='breakingswipe')s.am[t]*=.667;
   if(m.contact&&G.M[t].item==='rockyhelmet')s.hp[i]-=.16;if(m.contact&&G.M[t].ab==='roughskin')s.hp[i]-=.12;}
  if(hit){if(x.item==='lifeorb')s.hp[i]-=.1;if(m.recoil&&x.ab!=='rockhead')s.hp[i]-=m.recoil*dealt/x.maxhp;if(m.drain)s.hp[i]=Math.min(1,s.hp[i]+m.drain*dealt/x.maxhp);
   if(m.self&&m.self.spa<0)s.sm[i]*=m.self.spa===-2?.5:.667;if(m.id==='closecombat'||m.id==='superpower'||m.id==='armorcannon'||m.id==='headlongrush')s.bonus[si]-=.04;if(m.id==='explosion'||m.id==='selfdestruct'||m.id==='mistyexplosion')s.hp[i]=0;
   if(s.hp[i]<0)s.hp[i]=0;
   if(PIV.has(m.id)&&s.hp[i]>0){const b=bestBench(G,s,si);if(b>=0)enter(G,s,si,sl,b);}}
 }
 for(let si=0;si<2;si++){for(const i of s.act[si])if(i>=0&&s.hp[i]>0){const x=G.M[i];if(s.terr==='grassy'&&x.grounded)s.hp[i]=Math.min(1,s.hp[i]+.0625);if(x.item==='leftovers')s.hp[i]=Math.min(1,s.hp[i]+.0625);if(x.status==='brn')s.hp[i]-=.06;if(x.status==='psn'||x.status==='tox')s.hp[i]-=.125;if(s.hp[i]<0)s.hp[i]=0;}
  for(let sl=0;sl<2;sl++){const i=s.act[si][sl];if(i>=0&&s.hp[i]<=0){s.act[si][sl]=-1;const b=bestBench(G,s,si);if(b>=0)enter(G,s,si,sl,b);}else if(i<0&&!(G.cmd&&G.cmd[si]===sl)){const b=bestBench(G,s,si);if(b>=0)enter(G,s,si,sl,b);}}}
 for(const k of [0,1])if(s.tw[k]>0)s.tw[k]--;if(s.tr>0)s.tr--;for(let k=0;k<8;k++)if(s.stall[k]&&!prot[k])s.stall[k]=0;}
function greedy(G,s,si){const acts={};const foe=s.act[1-si].filter(f=>f>=0&&s.hp[f]>0);const left={};for(const f of foe)left[f]=s.hp[f];
 for(let sl=0;sl<2;sl++){const i=s.act[si][sl];if(i<0||s.hp[i]<=0)continue;const x=G.M[i];let best=null,bv=-1;
  x.moves.forEach((m,mi)=>{if(m.disabled||!m.pp)return;if(!m.dmg){if(m.id==='tailwind'&&s.tw[si]<=0&&s.fresh[i]){if(bv<.55){bv=.55;best={k:'m',mi,t:-1};}}if(m.id==='trickroom'&&!s.tr&&x.st.spe<80){if(bv<.6){bv=.6;best={k:'m',mi,t:-1};}}return;}
   const mult=(m.cat==='Physical'?s.am[i]:s.sm[i])*m.acc;if(m.id==='fakeout'&&!s.fresh[i])return;if(m.id==='firstimpression'&&!s.fresh[i])return;
   if(m.spread){let v=0;for(const f of foe){const d=Df(G,i,mi,f)*mult*(foe.length>1?.75:1);v+=Math.min(d,left[f])+(d>=left[f]?.35:0);}if(m.hitsAlly){const al=s.act[si][1-sl];if(al>=0&&s.hp[al]>0)v-=1.2*Math.min(s.hp[al],Df(G,i,mi,al)*.75);}if(v>bv){bv=v;best={k:'m',mi,t:-1};}}
   else for(const f of foe){const d=Df(G,i,mi,f)*mult;let v=Math.min(d,left[f])+(d>=left[f]?.35:0);if(m.id==='fakeout')v+=.35;if(v>bv){bv=v;best={k:'m',mi,t:f};}}});
  if(best){acts[i]=best;const m=x.moves[best.mi];if(best.t>=0&&m.dmg)left[best.t]=Math.max(.01,left[best.t]-Df(G,i,best.mi,best.t)*m.acc*(m.cat==='Physical'?s.am[i]:s.sm[i]));}}
 return acts;}
function evalS(G,s){let v=0;for(let k=0;k<8;k++){if(!G.M[k]||s.hp[k]<=0)continue;v+=(k<4?1:-1)*(.45+.55*s.hp[k]);}v+=s.bonus[0]-s.bonus[1]+.06*(Math.max(0,s.tw[0])-Math.max(0,s.tw[1]));return v;}
function roll(G,s,n){for(let r=0;r<n;r++){const a0=s.act[0].some(i=>i>=0&&s.hp[i]>0),a1=s.act[1].some(i=>i>=0&&s.hp[i]>0);if(!a0||!a1)break;turn(G,s,{...greedy(G,s,0),...greedy(G,s,1)});}return evalS(G,s);}
function options(G,s,si,req,slots){ // per-slot action lists
 const foe=s.act[1-si];return [0,1].map(sl=>{const i=G.act[si][sl];if(i<0)return [null];const r=req&&req.active&&req.active[sl];const x=G.M[i];const out=[];
  x.moves.forEach((m,mi)=>{let rm=null;if(r){rm=r.moves.find(z=>z.id===m.id);if(!rm||rm.disabled)return;}else if(m.disabled||!m.pp)return;
   if((m.id==='fakeout'||m.id==='firstimpression')&&!s.fresh[i])return;
   if(m.dmg&&!m.bp)return;
   if(m.spread||/^(self|allySide|foeSide|all|allyTeam|allies|adjacentAlly|adjacentAllyOrSelf|randomNormal|scripted)$/.test(m.tgt)){if(m.dmg){let any=0;for(const f of foe)if(f>=0&&s.hp[f]>0)any+=Df(G,i,mi,f);if(any<=0.02)return;}if(m.id==='tailwind'&&s.tw[si]>0)return;out.push({k:'m',mi,t:-1});}
   else for(let fs=0;fs<2;fs++){const f=foe[fs];if(f<0||s.hp[f]<=0)continue;if(m.dmg&&Df(G,i,mi,f)<=.02)continue;out.push({k:'m',mi,t:f,ts:fs});}});
  if(r&&!r.trapped&&!r.maybeTrapped||!r)for(const b of G.bench[si])out.push({k:'s',to:b});
  // prune: keep best damaging moves
  const sc=a=>{if(a.k==='s')return 5;const m=x.moves[a.mi];if(!m.dmg)return 5;if(m.id==='fakeout'||PIV.has(m.id)||SLOW.has(m.id)||priOf(G,s,i,m)>0)return 4;let v=0;const ts=a.t>=0?[a.t]:foe.filter(f=>f>=0&&s.hp[f]>0);for(const t of ts)v+=Math.min(1,Df(G,i,a.mi,t)*m.acc*(m.spread&&ts.length>1?.75:1)/Math.max(.05,s.hp[t]));return v;};
  out.sort((a,b)=>sc(b)-sc(a));const keep=out.slice(0,11);if(!keep.length)keep.push(null);return keep;});}
function joint(o){const j=[];for(const a of o[0])for(const b of o[1]){if(a&&b&&a.k==='s'&&b.k==='s'&&a.to===b.to)continue;j.push([a,b]);}return j;}
const mkActs=(G,si,j)=>{const x={};[0,1].forEach(sl=>{const i=G.act[si][sl];if(i>=0&&j[sl])x[i]=j[sl];});return x;};
function decide(battle,si,rng,cfg){const G=build(battle);const s0=S0(G);const req=battle.sides[si].activeRequest;
 const mine=joint(options(G,s0,si,req)),opp=joint(options(G,s0,1-si,battle.sides[1-si].activeRequest));const sg=si===0?1:-1;
 const gm=greedy(G,s0,si),go=greedy(G,s0,1-si);
 const ev=(a,b,n)=>{const s=cl(s0);turn(G,s,{...a,...b});return sg*roll(G,s,n);};
 // opponent's likely replies against my greedy play
 const mA=mine.map(j=>mkActs(G,si,j)),oA=opp.map(j=>mkActs(G,1-si,j));
 const os=oA.map(b=>[ev(gm,b,1),b]).sort((x,y)=>x[0]-y[0]).slice(0,cfg.K);
 const pre=mA.map((a,k)=>[ev(a,go,1),k]).sort((x,y)=>y[0]-x[0]).slice(0,cfg.N);
 const replies=[go,...os.map(o=>o[1])];
 if(cfg.random)pre.sort(()=>rng()-.5);
 let best=null;const res=(cfg.random?pre.slice(0,1):pre).map(([_,k])=>{let t=0,mn=9;replies.forEach((b,q)=>{const v=ev(mA[k],b,cfg.R);t+=v;if(v<mn)mn=v;});return [.7*t/replies.length+.3*mn+(rng()-.5)*cfg.noise,k];});
 res.sort((x,y)=>y[0]-x[0]);const j=mine[res[0][1]];
 return [0,1].map(sl=>{const a=j[sl];if(G.act[si][sl]<0)return 'pass';if(!a)return 'move 1';const i=G.act[si][sl];
  if(a.k==='s')return 'switch '+(a.to-si*4+1);
  const x=G.M[i];const m=x.moves[a.mi];const r=req.active[sl];const n=r.moves.findIndex(z=>z.id===m.id)+1;let c='move '+n;const tg=r.moves[n-1].target;
  if(tg==='normal'||tg==='any'||tg==='adjacentFoe'){const ts=a.t>=0?G.act[1-si].indexOf(a.t):0;c+=' '+(ts+1);}else if(tg==='adjacentAlly')c+=' -'+(2-sl);else if(tg==='adjacentAllyOrSelf')c+=' -'+(sl+1);
  if(r.canMegaEvo&&x.mega)c+=' mega';return c;}).join(', ');}
function forceSwitch(battle,si,rng){const req=battle.sides[si].activeRequest;const G=build(battle);const used=new Set();
 return req.forceSwitch.map((f,sl)=>{if(!f)return 'pass';let b=-1,bv=-99;for(const k of G.bench[si]){if(used.has(k))continue;const s=S0(G);const cur=s.act[si][sl];s.act[si][sl]=-1;enter(G,s,si,sl,k);const v=(si===0?1:-1)*roll(G,s,2)+(rng()-.5)*.02;if(v>bv){bv=v;b=k;}}if(b<0)return 'pass';used.add(b);return 'switch '+(b-si*4+1);}).join(', ');}
function choose(battle,si,rng,cfg){const sd=battle.sides[si];const r=sd.activeRequest;if(!r||r.wait)return null;if(r.forceSwitch)return forceSwitch(battle,si,rng);if(r.teamPreview)return 'team 1234';
 return decide(battle,si,rng,cfg);}
// Team preview: score orderings (4 of 6, first two lead) with greedy rollouts on the abstract model.
function preview(teamA,teamB,rng,n){const b=new Battle({formatid:FMT,seed:[1,2,3,4]});b.setPlayer('p1',{name:'a',team:JSON.parse(JSON.stringify(teamA))});b.setPlayer('p2',{name:'b',team:JSON.parse(JSON.stringify(teamB))});
 const perm=()=>{const a=[0,1,2,3,4,5];for(let i=5;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,4);};
 const infos=b.sides.map(s=>s.pokemon.map(p=>p));
 const cache=[0,1].map(si=>infos[si].map(p=>({mega:p.canMegaEvo?info(b,p,true):null,base:info(b,p,false)})));
 const Dg=new Map();
 const mkG=(pa,pb)=>{const G={w:'',t:'',tr:0,scr:[[0,0],[0,0]],tw:[0,0],M:[],act:[[0,1],[4,5]],bench:[[2,3],[6,7]],D:new Map()};[pa,pb].forEach((pp,si)=>{let pend=true;pp.forEach((x,i)=>{const c=cache[si][x];let y=c.base;if(c.mega&&pend){y=c.mega;pend=false;}G.M[si*4+i]=y;});});
  [[0,1,pa],[4,5,pb]].forEach(([i,j,pp],si)=>{const a=G.M[i],c=G.M[j];if(a.name==='Dondozo'&&/^Tatsugiri$/.test(c.name)&&c.ab==='commander'){G.M[i]={...a,b:{atk:2,def:2,spa:2,spd:2,spe:2,accuracy:0,evasion:0}};G.M[j]={...c,cmdg:true};G.act[si][1]=-1;G.cmd=G.cmd||[-1,-1];G.cmd[si]=1;}});
  for(const y of G.M){if(y.ab==='drought')G.w='sun';if(y.ab==='drizzle')G.w='rain';if(y.ab==='sandstream')G.w='sand';if(y.ab==='snowwarning')G.w='snow';}return G;};
 const val=(pa,pb)=>{const G=mkG(pa,pb);const s=S0(G);for(const [si,sl] of [[0,0],[0,1],[1,0],[1,1]])if(G.act[si][sl]>=0)enter(G,s,si,sl,G.act[si][sl]);return roll(G,s,7);};
 if(process.env.PREVIEW==='full'){ // every choice of leads and back: 90 per side, ranked against the other side's best
  const all=[];for(let i=0;i<6;i++)for(let j=i+1;j<6;j++)for(let k=0;k<6;k++)for(let l=k+1;l<6;l++)if(![i,j].includes(k)&&![i,j].includes(l))all.push([i,j,k,l]);
  const rank=(mine,theirs,f)=>mine.map(x=>[theirs.reduce((t,y)=>t+f(x,y),0)/theirs.length,x]).sort((x,y)=>y[0]-x[0]).map(x=>x[1]);
  const sample=[];for(let i=0;i<12;i++)sample.push(all[Math.floor(rng()*90)]);
  const fa=(x,y)=>val(x,y),fb=(y,x)=>-val(x,y);
  // Dondozo + Tatsugiri teams always lead the pair (first two slots).
  const pair=teamB[0].species==='Dondozo'&&teamB[1].species==='Tatsugiri';const allB=pair?all.filter(x=>x[0]===0&&x[1]===1):all;if(pair)sample.forEach((x,i)=>{sample[i]=allB[i%allB.length];});
  const topA=rank(all,sample,fa).slice(0,12),topB=rank(allB,topA,fb).slice(0,12),A2=rank(all,topB,fa).slice(0,5);
  return [A2,topB.slice(0,5)];}
 let A=[],B=[];for(let i=0;i<n;i++){A.push(perm());B.push(perm());}
 const mat=A.map(a=>B.map(bb=>val(a,bb)));const sa=A.map((a,i)=>[mat[i].reduce((x,y)=>x+y,0)/n,a]).sort((x,y)=>y[0]-x[0]),sb=B.map((bb,j)=>[mat.reduce((x,r)=>x+r[j],0)/n,bb]).sort((x,y)=>x[0]-y[0]);
 return [sa.slice(0,5).map(x=>x[1]),sb.slice(0,5).map(x=>x[1])];}
const rngOf=seed=>{let q=seed>>>0||1;return ()=>{q^=q<<13;q>>>=0;q^=q>>>17;q^=q<<5;q>>>=0;return q/4294967296;};};
const CFG={K:3,N:14,R:2,noise:.06};
const pvCache=new Map();
function play(teamA,teamB,seed,cfg=CFG,log,stats){const rng=rngOf(seed*2654435761+17);for(let k=0;k<5;k++)rng();
 const key=teamA._id+'|'+teamB._id;let pv=teamA._id&&teamB._id?pvCache.get(key):null;if(!pv){pv=preview(teamA,teamB,rngOf(99),22);if(teamA._id&&teamB._id)pvCache.set(key,pv);}
 const w=()=>{const r=rng();return r<.4?0:r<.65?1:r<.82?2:r<.93?3:4;};const pa=pv[0][Math.min(w(),pv[0].length-1)],pb=pv[1][Math.min(w(),pv[1].length-1)];
 const b=new Battle({formatid:FMT,seed:[seed&65535,(seed*7)&65535,(seed*13)&65535,(seed*31)&65535]});
 b.setPlayer('p1',{name:'a',team:JSON.parse(JSON.stringify(teamA))});b.setPlayer('p2',{name:'b',team:JSON.parse(JSON.stringify(teamB))});
 b.makeChoices('team '+pa.map(x=>x+1).join(''),'team '+pb.map(x=>x+1).join(''));
 let g=0;while(!b.ended&&b.turn<35&&g++<150){for(const si of [0,1]){if(b.ended)break;}
  const cs=[0,1].map(si=>choose(b,si,rng,Array.isArray(cfg)?cfg[si]:cfg));
  for(const si of [0,1])if(cs[si]&&!b.sides[si].isChoiceDone()){if(!b.choose(b.sides[si].id,cs[si])){if(stats)stats.err=(stats.err||0)+1,stats.ex=stats.ex||b.sides[si].choice.error+' :: '+cs[si];b.sides[si].clearChoice();b.sides[si].autoChoose();}}
  if(b.allChoicesDone())b.commitChoices();}
 if(log)console.log(b.log.filter(l=>/^\|(turn|move|switch|faint|-damage|-mega|win|cant|drag|-fieldstart|-sidestart)/.test(l)).join('\n'));
 let r;if(b.winner==='a')r=1;else if(b.winner==='b')r=0;else{const v=s=>s.pokemon.slice(0,4).reduce((x,p)=>x+(p.fainted?0:.45+.55*p.hp/p.maxhp),0);const d=v(b.sides[0])-v(b.sides[1]);r=d>0?1:d<0?0:.5;}
 if(stats){stats.turns=(stats.turns||0)+b.turn;}
 return {r,turns:b.turn,pa,pb,log:b.log};}
module.exports={damage,info,build,play,Battle,Teams,Dex,dex,FMT,rngOf,CFG,preview};
module.exports._clear=()=>pvCache.clear();
