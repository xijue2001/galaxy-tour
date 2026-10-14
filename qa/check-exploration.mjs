import assert from 'node:assert/strict';
import {DESTINATIONS,MAP_DESTINATIONS,TOUR_DESTINATIONS} from '../src/data.js';
import {filterDestinations} from '../src/catalog-utils.js';
import {separateMarkers} from '../src/marker-layout.js';
let count=0;
const check=(x,m)=>{assert.ok(x,m);count++;};
for(const [query,id] of [['创生之柱','eagle-nebula'],['Pillars of Creation','eagle-nebula'],['創造の柱','eagle-nebula'],['M 16','eagle-nebula'],['马头','horsehead-nebula'],['Horsehead','horsehead-nebula'],['M13','hercules-cluster'],['NGC 884','double-cluster'],['宇宙悬崖','carina-cliffs']]) check(filterDestinations(DESTINATIONS,query).some(d=>d.id===id),`Search ${query}`);
check(filterDestinations(DESTINATIONS,'not-an-object').length===0,'Empty search');
check(filterDestinations(DESTINATIONS,'','planetary').length===4,'Four planetary nebulae');
check(filterDestinations(DESTINATIONS,'','cluster').length===4,'Four star clusters');
check(filterDestinations(DESTINATIONS,'','remnant').length===2,'Two remnants');
check(TOUR_DESTINATIONS.length===6,'Exploration additions never extend tour');
const unique=new Set();
for(const d of MAP_DESTINATIONS){check(d.display.position.length===3&&d.display.position.every(Number.isFinite),`${d.id} display vector`);check(!unique.has(d.display.position.join(',')),`${d.id} independent display position`);unique.add(d.display.position.join(','));check(d.aliases.length>0,`${d.id} aliases`);}
for(const [w,h] of [[1280,720],[390,844],[707,503]]){
 const points=MAP_DESTINATIONS.map((d,i)=>({id:d.id,x:w*.6+(i%5)*2,y:h*.5+Math.floor(i/5)*2,visible:true}));
 const nodes=separateMarkers(points,w,h);
 check(nodes.length===MAP_DESTINATIONS.length,`${w} all individual markers retained`);
 for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++) check(Math.abs(nodes[i].x-nodes[j].x)>=28||Math.abs(nodes[i].y-nodes[j].y)>=28,`${w} hit boxes ${i}/${j} do not overlap`);
 check(JSON.stringify(nodes)===JSON.stringify(separateMarkers(points,w,h)),`${w} deterministic layout`);
}
console.log(`PASS: ${count} exploration/search/hit-area checks.`);
