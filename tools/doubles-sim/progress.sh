#!/usr/bin/env bash
# Live progress bar. Pass --once for a single print.
cd "$(dirname "$0")" || exit 1
draw() { node -e '
const fs=require("fs");let p;try{p=JSON.parse(fs.readFileSync("results/progress.json"))}catch{console.log("no progress yet");process.exit()}
const S=["s1","s2","s3","t1","t2","t3","t4","val"],G=[16800,17600,14400,25600,13440,9600,7200,11000];
const all=G.reduce((a,b)=>a+b,0),i=S.indexOf(p.stage);const done=p.stage==="complete"?all:G.slice(0,i).reduce((a,b)=>a+b,0)+G[i]*p.done/Math.max(1,p.total);
const r=p.gamesThisRun/Math.max(1,p.secondsThisRun),f=done/all,n=Math.floor(f*40);
const old=(Date.now()-new Date(p.at))/60000;
process.stdout.write("\r["+"#".repeat(n)+"-".repeat(40-n)+"] "+(100*f).toFixed(0)+"%  stage "+p.stage+" "+p.done+"/"+p.total+"  "+(p.stage==="complete"?"complete: results/RESULTS.md":(r?"about "+Math.ceil((all-done)/r/60)+" min left":"")+(old>15?"  (no update for "+Math.round(old)+" min: check that it runs)":""))+"      ");'; }
if [ "$1" = --once ]; then draw; echo; else while :; do draw; grep -q '"complete"' results/progress.json 2>/dev/null && break; sleep 5; done; echo; fi
