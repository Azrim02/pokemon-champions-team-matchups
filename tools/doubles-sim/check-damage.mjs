import { createRequire } from 'module';const require=createRequire(import.meta.url);const ai=require('./ai.cjs');
const R=new URL('../../',import.meta.url).pathname;const {calcSetVsSet}=await import(R+'src/index.js');const { dataset }=await import(R+'test/helpers/dataset.js');import fs from 'fs';
const L=k=>JSON.parse(fs.readFileSync(new URL(`./data/opp${k}.json`,import.meta.url)));const A=L('A'),C=L('B');let n=0,bad=[];
for(let k=0;k<30;k++){const a=A[k],c=C[k];[a,c].forEach(t=>t.forEach(s=>s.level=50));const b=new ai.Battle({formatid:ai.FMT,seed:[1,2,3,4]});b.setPlayer('p1',{name:'a',team:JSON.parse(JSON.stringify(a))});b.setPlayer('p2',{name:'b',team:JSON.parse(JSON.stringify(c))});
 const G={w:'',t:'',scr:[[0,0],[0,0]]};
 for(const p of b.sides[0].pokemon)for(const d of b.sides[1].pokemon){const x=ai.info(b,p,true),y=ai.info(b,d,true);
  const sa=a.find(s=>s.species===p.set.species),sd=c.find(s=>s.species===d.set.species);let res;try{res=calcSetVsSet(sa,sd,dataset,{gameType:'Singles'});}catch{continue}
  for(const r of res){if(!r.percent||/Last Resp|Solar|Electro Shot|Hyper Beam|Focus Punch|Fling|Meteor Beam|Weather/.test(r.move))continue;const m=x.moves.find(z=>z.id===r.move.toLowerCase().replace(/[^a-z0-9]/g,''));if(!m)continue;const mine=100*ai.damage(G,x,y,m,0,4),th=(r.percent[0]+r.percent[1])/2;n++;if(Math.abs(mine-th)>Math.max(8,.12*th))bad.push(`${x.name}(${x.ab},${x.item}) ${r.move} -> ${y.name}(${y.ab},${y.item}): ${mine.toFixed(0)} vs ${th.toFixed(0)}`);}}}
console.log('checked',n,'off',bad.length);const u=[...new Set(bad.map(s=>s.replace(/: .*/,'').replace(/ -> .*/,'')))];console.log(u.slice(0,30).join('\n'));console.log(bad.slice(0,14).join('\n'));
