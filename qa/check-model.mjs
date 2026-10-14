/**
 * Run: node qa/check-model.mjs
 * Data/coordinate/timeline/buffer regression checks, independent of a browser.
 * The small Canvas stub permits construction of the procedural Earth texture;
 * shader compilation, photographs and visual quality remain browser QA tasks.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access } from 'node:fs/promises';
import * as THREE from 'three';
import { DESTINATIONS, TOUR_DESTINATIONS, DESTINATION_BY_ID, MODEL } from '../src/data.js';
import { LANGUAGES, DICTIONARIES, t } from '../src/i18n.js';
import { createGalaxy, GALAXY_MODEL, SUN_POSITION, galacticToScene } from '../src/galaxy.js';
import { createLocalScenes } from '../src/local-scenes.js';
import { createTour, TOUR_DURATION, OVERVIEW_POSITION } from '../src/tour.js';

const started = performance.now();
let checks = 0, checkedAttributes = 0, checkedValues = 0;
const results = { model:MODEL.version, seed:MODEL.seed, threeRevision:THREE.REVISION, qualities:{} };
const check = (condition, message) => { checks++;assert.ok(condition, message); };
const equal = (actual, expected, message) => { checks++;assert.deepEqual(actual, expected, message); };
const near = (actual, expected, tolerance, message) => check(Number.isFinite(actual) && Math.abs(actual-expected)<=tolerance, `${message}: ${actual} vs ${expected}`);
const norm = vector => Math.hypot(...vector);
const difference = (a,b) => a.map((v,i)=>v-b[i]);
const vec = (v,label) => check(Array.isArray(v)&&v.length===3&&v.every(Number.isFinite), `${label}: finite three-component vector`);
const pose = (value,label) => {
  vec(value.position,`${label} position`);vec(value.target,`${label} target`);
  check(norm(difference(value.position,value.target))>.00001,`${label}: camera must not coincide with target`);
};
const text = (value,label) => check(typeof value==='string'&&value.trim().length>0,`${label}: nonempty text`);
const translations = (value,label,array=false) => {
  equal(Object.keys(value??{}).sort(),[...LANGUAGES].sort(),`${label}: exactly three languages`);
  for(const language of LANGUAGES){
    if(array){check(Array.isArray(value[language])&&value[language].length>=2,`${label}.${language}: at least two sentences`);value[language].forEach((v,i)=>text(v,`${label}.${language}[${i}]`));}
    else text(value[language],`${label}.${language}`);
  }
};
const https = (value,label) => { const url=new URL(value);equal(url.protocol,'https:',`${label}: HTTPS source`); };

equal(LANGUAGES,['zh','en','ja'],'Supported language IDs');
const dictionaryKeys=Object.keys(DICTIONARIES.zh).sort();
for(const language of LANGUAGES){
  equal(Object.keys(DICTIONARIES[language]).sort(),dictionaryKeys,`${language}: dictionary key parity`);
  for(const key of dictionaryKeys){
    text(DICTIONARIES[language][key],`${language}.${key}`);
    const tokens=Array.from(DICTIONARIES[language][key].matchAll(/\{(\w+)\}/g),m=>m[1]).sort();
    const reference=Array.from(DICTIONARIES.zh[key].matchAll(/\{(\w+)\}/g),m=>m[1]).sort();
    equal(tokens,reference,`${language}.${key}: placeholder parity`);
  }
  check(t(language,'markerLabel',{name:'M42'}).includes('M42'),`${language}: label substitution`);
}
equal(TOUR_DESTINATIONS.map(d=>d.id),['solar-system','alpha-centauri','pleiades','orion-nebula','crab-nebula','sagittarius-a'],'Six stable route IDs');
equal(new Set(DESTINATIONS.map(d=>d.id)).size,DESTINATIONS.length,'Unique destination IDs');
equal(Object.keys(DESTINATION_BY_ID).sort(),DESTINATIONS.map(d=>d.id).sort(),'ID lookup matches unified content data');
for(const [index,destination] of DESTINATIONS.entries()){
  const d=destination, prefix=d.id;
  equal(DESTINATION_BY_ID[d.id],d,`${prefix}: lookup uses the same record`);
  check(Number.isFinite(d.distanceLy)&&d.distanceLy>=0,`${prefix}: distance is finite and nonnegative`);
  if(index>0&&index<6)check(d.distanceLy>DESTINATIONS[index-1].distanceLy,`${prefix}: strictly farther from the Solar System`);
  check(Number.isFinite(d.galactic.lDeg)&&d.galactic.lDeg>=0&&d.galactic.lDeg<360,`${prefix}: valid Galactic longitude`);
  check(Number.isFinite(d.galactic.bDeg)&&Math.abs(d.galactic.bDeg)<=90,`${prefix}: valid Galactic latitude`);
  for(const key of ['names','types','scaleNote'])translations(d[key],`${prefix}.${key}`);
  for(const key of ['short','detail'])translations(d[key],`${prefix}.${key}`,true);
  text(d.astrometry.frame,`${prefix}: astrometric frame`);
  if(index&&d.scope!=='solar'){text(d.astrometry.source,`${prefix}: astrometric provenance`);text(d.astrometry.ra,`${prefix}: RA`);text(d.astrometry.dec,`${prefix}: Dec`);}
  check(Array.isArray(d.parameters)&&d.parameters.length>=2,`${prefix}: useful key parameters`);
  for(const [i,parameter] of d.parameters.entries())for(const key of ['label','value'])translations(parameter[key],`${prefix}.parameters[${i}].${key}`);
  for(const key of ['kind','caption'])translations(d.image[key],`${prefix}.image.${key}`);
  text(d.image.credit,`${prefix}: complete image credit`);
  https(d.image.sourceUrl,`${prefix}: original image page`);https(d.image.resourceUrl,`${prefix}: image resource provenance`);
  check(d.image.src.startsWith('/assets/')&&!d.image.src.includes('..'),`${prefix}: local bounded image path`);
  await access(new URL(`..${d.image.src}`,import.meta.url));checks++;
  check(Array.isArray(d.sources)&&d.sources.length>=1,`${prefix}: scientific sources`);
  for(const s of d.sources){text(s.title,`${prefix}: source title`);https(s.url,`${prefix}: scientific link`);}
}

equal(MODEL.version,GALAXY_MODEL.version,'Content and geometry model versions agree');
near(MODEL.solarRadiusKpc,GALAXY_MODEL.sunGalactocentricKpc,1e-12,'Solar radius agrees');
near(MODEL.solarHeightKpc*1000,GALAXY_MODEL.sunHeightPc,1e-10,'Solar height agrees');
near(MODEL.parsecToLy,GALAXY_MODEL.lightYearsPerKpc/1000,.00001,'Parsec conversion agrees within published rounding');
near(SUN_POSITION[0],MODEL.solarRadiusKpc*GALAXY_MODEL.unitsPerKpc,1e-12,'Solar X registration');
near(SUN_POSITION[1],MODEL.solarHeightKpc*GALAXY_MODEL.unitsPerKpc,1e-12,'Solar height registration');
for(const s of MODEL.sources)check(GALAXY_MODEL.sources.includes(s.url),'The content model and geometry share their NASA references');
equal(galacticToScene(0,0,0),[...SUN_POSITION],'Zero distance is the Solar System');
const oneKpc=GALAXY_MODEL.lightYearsPerKpc, units=GALAXY_MODEL.unitsPerKpc;
for(const [l,b,offset] of [[0,0,[-units,0,0]],[90,0,[0,0,units]],[180,0,[units,0,0]],[270,0,[0,0,-units]],[0,90,[0,units,0]],[0,-90,[0,-units,0]]]){
  const measured=galacticToScene(l,b,oneKpc);
  offset.forEach((v,i)=>near(measured[i],SUN_POSITION[i]+v,1e-10,`Coordinate basis l=${l},b=${b},axis=${i}`));
}
const positions=Object.fromEntries(DESTINATIONS.map(d=>{
  const measured=galacticToScene(d.galactic.lDeg,d.galactic.bDeg,d.distanceLy);
  vec(measured,`${d.id}: converted position`);
  near(norm(difference(measured,SUN_POSITION)),d.distanceLy/oneKpc*units,1e-10,`${d.id}: radial distance survives coordinate conversion`);
  if(d.id==='sagittarius-a'){
    text(d.astrometry.displayRegistration,'Galactic-center registration explanation');
    check(norm(measured)<.1,'Observed Sagittarius A* direction/distance is consistent with the adopted Galactic origin');
    return [d.id,[0,0,0]];
  }
  return [d.id,measured];
}));

// The Canvas stub only records no pixels. Explicit supported operations avoid
// hiding accidental dependencies on browser-only drawing APIs in the factories.
const savedDocument=globalThis.document;
const context={fillStyle:'',globalAlpha:1,globalCompositeOperation:'source-over',fillRect(){},beginPath(){},lineTo(){},moveTo(){},closePath(){},fill(){}};
globalThis.document={createElement(tag){assert.equal(tag,'canvas');return {width:0,height:0,getContext(kind){assert.equal(kind,'2d');return context;}};}};

function validateBuffers(root,label){
  const seen=new Set();
  root.traverse(object=>{
    const geometry=object.geometry;if(!geometry||seen.has(geometry))return;seen.add(geometry);
    for(const [name,attribute] of Object.entries(geometry.attributes)){
      check(attribute.isBufferAttribute||attribute.isInterleavedBufferAttribute,`${label}/${object.name}/${name}: BufferAttribute`);
      check(attribute.count>0&&Number.isInteger(attribute.count),`${label}/${name}: valid attribute count`);
      const array=attribute.array??attribute.data.array;
      for(const value of array)if(!Number.isFinite(value))assert.fail(`${label}/${object.name}/${name}: nonfinite value`);
      checkedAttributes++;checkedValues+=array.length;
    }
    if(geometry.index){
      const count=geometry.attributes.position.count;
      check(geometry.index.array.every(v=>Number.isInteger(v)&&v>=0&&v<count),`${label}: indices stay inside position buffer`);
      checkedAttributes++;checkedValues+=geometry.index.array.length;
    }
  });
}
function digest(root){
  const hash=createHash('sha256'),seen=new Set();
  root.traverse(object=>{
    const geometry=object.geometry;if(!geometry||seen.has(geometry))return;seen.add(geometry);
    hash.update(object.name);
    for(const name of Object.keys(geometry.attributes).sort()){
      const attribute=geometry.attributes[name],array=attribute.array??attribute.data.array;
      hash.update(name);hash.update(Buffer.from(array.buffer,array.byteOffset,array.byteLength));
    }
  });return hash.digest('hex');
}
function visibleLocalCounts(root){
  let stars=0,dust=0,gas=0;
  const visit=(object,visible=true)=>{
    visible=visible&&object.visible;if(!visible)return;
    if(object.isPoints)stars+=object.geometry.attributes.position.count;
    if(object.geometry?.isInstancedBufferGeometry){
      if(object.material.blending===THREE.NormalBlending)dust+=object.geometry.instanceCount;
      else gas+=object.geometry.instanceCount;
    }
    object.children.forEach(child=>visit(child,visible));
  };visit(root);return {stars,dust,gas};
}

let previousStars=0;
try{
  for(const quality of ['low','medium','high']){
    const galaxy=createGalaxy(THREE,{quality});
    const locals=createLocalScenes(THREE,{seed:MODEL.seed,quality,catalog:DESTINATIONS});
    try{
      equal(galaxy.seed,MODEL.seed,`${quality}: default rendering seed matches the content model`);
      equal(galaxy.model.version,MODEL.version,`${quality}: rendered model version`);
      galaxy.resize(720,1.25);galaxy.update(93.5);locals.resize(900,1.25);locals.update(93.5);
      validateBuffers(galaxy.group,`${quality}: galaxy`);validateBuffers(locals.group,`${quality}: local scenes`);
      const starBatches=[],cloudBatches=[];
      galaxy.group.traverse(o=>{if(o.isPoints)(o.geometry.attributes.aBrightness?starBatches:cloudBatches).push(o.geometry.attributes.position.count);});
      equal(starBatches.sort((a,b)=>a-b),[galaxy.backgroundStarCount,galaxy.galaxyStarCount].sort((a,b)=>a-b),`${quality}: real star buffers match reported counts`);
      equal(starBatches.reduce((a,b)=>a+b,0),galaxy.starCount,`${quality}: total actual star count`);
      equal(cloudBatches.sort((a,b)=>a-b),[galaxy.dustCount,galaxy.hazeCount].sort((a,b)=>a-b),`${quality}: actual cloud/dust buffers match reported counts`);
      equal(Object.values(galaxy.populations).reduce((a,b)=>a+b,0),galaxy.galaxyStarCount,`${quality}: stellar populations partition the galaxy`);
      equal(Object.values(galaxy.armCounts).reduce((a,b)=>a+b,0),galaxy.populations.arms+galaxy.populations.youngClusters,`${quality}: arm populations reconcile`);
      check(galaxy.starCount>previousStars,`${quality}: increasing quality increases actual star density`);previousStars=galaxy.starCount;
      const localCounts={};
      for(const d of DESTINATIONS){
        locals.setDestination(d.id);
        const count=locals.getCounts(),actual=visibleLocalCounts(locals.group);
        equal(actual.stars,count.starCount,`${quality}/${d.id}: visible star count`);
        equal(actual.dust,count.dustCount,`${quality}/${d.id}: visible dust instance count`);
        equal(actual.gas,count.gasCount,`${quality}/${d.id}: visible gas instance count`);
        check(count.starCount>0,`${quality}/${d.id}: a stellar backdrop exists`);
        localCounts[d.id]=count;
        for(let p=0;p<=1.00001;p+=.01)pose(locals.getPose(d.id,p),`${quality}/${d.id}/p=${p.toFixed(2)}`);
        for(const p of [.3,.74]){
          const a=locals.getPose(d.id,p-1e-7),b=locals.getPose(d.id,p+1e-7);
          check(norm(difference(a.position,b.position))<.00001,`${d.id}: continuous camera position at local phase ${p}`);
          check(norm(difference(a.target,b.target))<.00001,`${d.id}: continuous target at local phase ${p}`);
        }
        for(const a of locals.getAnchors(d.id))vec(a.position,`${d.id}: anchor ${a.key}`);
      }
      results.qualities[quality]={starCount:galaxy.starCount,dustCount:galaxy.dustCount,hazeCount:galaxy.hazeCount,localCounts};
      if(quality==='medium'){
        const replayGalaxy=createGalaxy(THREE,{seed:MODEL.seed,quality});
        const replayLocals=createLocalScenes(THREE,{seed:MODEL.seed,quality,catalog:DESTINATIONS});
        const alternateGalaxy=createGalaxy(THREE,{seed:MODEL.seed+1,quality});
        try{
          equal(digest(galaxy.group),digest(replayGalaxy.group),'Identical seeds reproduce every Galactic geometry buffer');
          for(const d of DESTINATIONS)replayLocals.setDestination(d.id);equal(digest(locals.group),digest(replayLocals.group),'Identical seeds reproduce every local geometry buffer');
          check(digest(galaxy.group)!==digest(alternateGalaxy.group),'Changing the seed changes the Galactic buffers');
        }finally{replayGalaxy.dispose();replayLocals.dispose();alternateGalaxy.dispose();}
      }
      const tour=createTour(TOUR_DESTINATIONS,positions);
      equal(tour.duration,160,'Full tour duration');equal(TOUR_DURATION,160,'Exported tour duration');equal(tour.stations.length,6,'Six tour stations');
      for(const [index,s] of tour.stations.entries()){
        equal(s.id,TOUR_DESTINATIONS[index].id,'Tour follows the distance-sorted shared data');
        near(s.holdEnd-s.holdStart,10,1e-12,`${s.id}: ten-second reading hold`);
        equal(s.start,index?tour.stations[index-1].end:0,`${s.id}: no missing or overlapping station interval`);
        const hold=tour.getFrame(s.holdStart);
        equal(hold.phase,'hold',`${s.id}: hold begins at the documented time`);near(hold.holdRemaining,10,1e-10,`${s.id}: remaining hold time`);near(hold.localWeight,1,1e-12,`${s.id}: full local visibility during reading`);
        const middle=tour.getFrame((s.holdStart+s.holdEnd)/2);equal(middle.phase,'hold',`${s.id}: midpoint still in hold`);
        equal(hold.worldPose,middle.worldPose,`${s.id}: world camera remains stationary while reading`);
        equal(tour.getFrame(s.holdEnd).phase,'departure',`${s.id}: departure begins after reading`);
      }
      equal(tour.stations.at(-1).end,142,'Last local scene ends at 142 seconds');
      for(let time=0;time<=160;time+=.125){
        const frame=tour.getFrame(time);
        check(frame.localWeight>=0&&frame.localWeight<=1&&Number.isFinite(frame.localWeight),`t=${time}: bounded transition weight`);
        check(frame.progress>=0&&frame.progress<=1&&Number.isFinite(frame.progress),`t=${time}: bounded local progress`);
        pose(frame.worldPose,`t=${time}: world camera`);pose(locals.getPose(frame.station.id,frame.progress),`t=${time}: local camera`);
      }
      for(const time of [...new Set(tour.stations.flatMap(s=>[s.start,s.holdStart,s.holdEnd,s.end]))].filter(time=>time>0&&time<160)){
        const a=tour.getFrame(time-1e-6),b=tour.getFrame(time+1e-6);
        check(norm(difference(a.worldPose.position,b.worldPose.position))<.0001,`t=${time}: continuous world position across phase boundary`);
        check(norm(difference(a.worldPose.target,b.worldPose.target))<.0001,`t=${time}: continuous world target across phase boundary`);
        check(Math.abs(a.localWeight-b.localWeight)<.00001,`t=${time}: continuous scene blend`);
        if(a.station.id===b.station.id){
          const p=locals.getPose(a.station.id,a.progress),q=locals.getPose(b.station.id,b.progress);
          check(norm(difference(p.position,q.position))<.0001,`t=${time}: continuous visible local camera`);
          check(norm(difference(p.target,q.target))<.0001,`t=${time}: continuous visible local target`);
        }else check(a.localWeight<.000001&&b.localWeight<.000001,`t=${time}: local-coordinate changes occur only while the local stage is hidden`);
      }
      const end=tour.getFrame(160);equal(end.phase,'pullback','End remains in overview chapter');equal(end.localWeight,0,'Final view has no local layer');equal(end.worldPose.position,OVERVIEW_POSITION,'Final camera is the complete Galaxy overview');equal(end.worldPose.target,[0,0,0],'Overview looks at the Galactic center');
      equal(tour.getFrame(-1).worldPose,tour.getFrame(0).worldPose,'Negative timeline input clamps to start');equal(tour.getFrame(999).worldPose,end.worldPose,'Oversized timeline input clamps to overview');
    }finally{galaxy.dispose();locals.dispose();}
  }
}finally{
  if(savedDocument===undefined)delete globalThis.document;else globalThis.document=savedDocument;
}
results.checks=checks;results.bufferAttributesChecked=checkedAttributes;results.numericBufferValuesChecked=checkedValues;results.elapsedMs=Math.round(performance.now()-started);
console.log(`PASS: ${checks} assertions; ${checkedAttributes} buffer attributes; ${checkedValues.toLocaleString('en-US')} finite values.`);
console.log(JSON.stringify(results,null,2));
