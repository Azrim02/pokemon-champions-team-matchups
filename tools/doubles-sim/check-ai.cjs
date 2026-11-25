(async()=>{const fs=require('fs');const P=require('./pool.cjs');const A=JSON.parse(fs.readFileSync(__dirname+'/data/oppA.json'));
const full={K:3,N:14,R:2,noise:.06};
for(const [n,c] of [['vs no lookahead (1 reply, 1 plan)',{K:0,N:1,R:0,noise:0}],['vs random among 14 good plans',{K:0,N:14,R:0,noise:0,random:1}],['vs less depth',{K:1,N:6,R:1,noise:.06}],['vs deeper (K5 N24 R3)',{K:5,N:24,R:3,noise:.06}]]){
 const jobs=[];for(let i=0;i<40;i++)for(const s of [0,1])jobs.push({id:s,oi:i,team:A[i],opp:A[(i+1)%40],games:5,seed:3,cfg:s?[c,full]:[full,c]});let w=0,n2=0;await P.run(jobs,m=>{w+=m.id?m.n-m.w:m.w;n2+=m.n;});console.log('full AI',n,(100*w/n2).toFixed(1)+'%',n2);}
P.close();})();
