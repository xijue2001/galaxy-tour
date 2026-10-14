import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createSceneClock,SOLAR_IDS,SOLAR_SPECS} from '../src/motion.js';
import {createLocalScenes} from '../src/local-scenes.js';
import {createGalaxy} from '../src/galaxy.js';
import {DESTINATIONS,MAP_DESTINATIONS} from '../src/data.js';
let checks=0;const check=(v,m)=>{assert.ok(v,m);checks++;};
const clock=createSceneClock();clock.tick(0);clock.tick(20);check(clock.time===.02,'Clock integrates small steps');clock.setPaused(true);clock.tick(5000);clock.tick(9000);check(clock.time===.02,'Paused time remains fixed');clock.setPaused(false);clock.tick(10000);clock.tick(10020);check(Math.abs(clock.time-.04)<1e-9,'Resume establishes a timestamp without a phase jump');clock.tick(200000);check(Math.abs(clock.time-.12)<1e-9,'A stalled frame is capped');clock.tick(300000,false);clock.tick(900000);check(Math.abs(clock.time-.12)<1e-9,'Background restoration discards accumulated time');
check(DESTINATIONS.length===39&&MAP_DESTINATIONS.length===29,'39 records, 29 galactic/extragalactic map destinations');
const context={createImageData:()=>({data:new Uint8ClampedArray(512*256*4)}),putImageData(){},fillRect(){},beginPath(){},ellipse(){},fill(){},moveTo(){},lineTo(){},closePath(){}};
globalThis.document={createElement:()=>({width:512,height:256,getContext:()=>context})};
let previous;
for(const quality of ['low','medium','high']){
 const locals=createLocalScenes(THREE,{quality,seed:731927,catalog:DESTINATIONS});locals.setDestination('solar-system');locals.update(321.25);const start=locals.getMotionState();
 check(locals.getPickMeshes().length===10,'Ten surface-only pick meshes');check(locals.getAnchors().length===10,'Ten independent anchors');
 if(previous)assert.deepEqual(start.positions,previous.positions,'Quality rebuild retains exact phase');previous=start;
 for(let time=321.25;time<1000;time+=13.7){locals.update(time);const state=locals.getMotionState();check(Math.abs(state.moonFacingDot-1)<1e-12,'Moon always faces Earth');check(state.atmosphereParent==='earth-axis'&&state.ringsParent==='saturn-axis'&&state.moonParent==='earth','Companions inherit their correct parent');}
 locals.update(331.25);const later=locals.getMotionState();for(const id of SOLAR_IDS){if(id==='sun')check(later.spinAngles.sun!==start.spinAngles.sun,'Sun rotates');else check(JSON.stringify(later.positions[id])!==JSON.stringify(start.positions[id]),id+' orbits');}
 for(const id of ['sun','mercury','earth','mars','jupiter','saturn','neptune'])check(later.spinAngles[id]<start.spinAngles[id],'Prograde spin uses the same -Y convention as orbital motion: '+id);
 for(const id of ['venus','uranus']){const spec=SOLAR_SPECS.find(s=>s.id===id);check(Math.cos(THREE.MathUtils.degToRad(spec.tilt))<0,'Tilt reverses the projected spin axis for '+id);}
 const planetMesh=locals.getPickMeshes().find(m=>m.userData.bodyId==='earth');check(!planetMesh.children.some(m=>m.name==='earth-atmosphere'),'Atmosphere is not a selectable surface');
 const galaxy=createGalaxy(THREE,{quality,seed:731927});const background=galaxy.group.children.filter(c=>c!==galaxy.rotatingGroup).map(c=>c.matrix.toArray());galaxy.update(0);const p=galaxy.toWorld([32,0,0]);galaxy.update(20);check(JSON.stringify(galaxy.toWorld([32,0,0]))!==JSON.stringify(p),'Galaxy anchor rotates');check(JSON.stringify(background)===JSON.stringify(galaxy.group.children.filter(c=>c!==galaxy.rotatingGroup).map(c=>c.matrix.toArray())),'Background field stays fixed');
 galaxy.dispose();locals.dispose();
}
check(new Set(SOLAR_SPECS.map(s=>s.orbitSec).filter(Boolean)).size===9,'Separate illustrative planetary and lunar periods');
console.log(`PASS: ${checks} independent-clock, phase, parent, synchronous-Moon and anchor checks.`);
