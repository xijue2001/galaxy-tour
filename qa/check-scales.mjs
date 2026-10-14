import assert from 'node:assert/strict';
import * as THREE from 'three';
import {scaleState,SCALE_THRESHOLDS,COSMIC_LEVELS,createCosmicAtlas} from '../src/cosmic-scales.js';
import {createDeepSky} from '../src/deep-sky.js';
let checks=0;const check=(v,m)=>{assert.ok(v,m);checks++;};
let last=0;for(let d=1;d<200000;d*=1.031){const {level,weights}=scaleState(d);check(level>=last,'Zoom levels are monotonic');last=level;check(Math.abs(weights.reduce((a,b)=>a+b)-1)<1e-10,'Blend weights sum to one');check(weights.every(w=>w>=0&&w<=1),'Bounded blend');}
for(const t of SCALE_THRESHOLDS){const a=scaleState(t*.9999).weights,b=scaleState(t*1.0001).weights;check(a.every((w,i)=>Math.abs(w-b[i])<.001),'Threshold has continuous opacity');}
check(scaleState(160).level===0&&scaleState(90000).level===5,'Galaxy to CMB endpoints');
for(const l of COSMIC_LEVELS)for(const language of ['zh','en','ja'])check(l.name[language]&&l.note[language]&&l.size[language],'Complete scale translations');
for(const quality of ['low','medium','high']){const atlas=createCosmicAtlas(THREE,{quality});for(const o of atlas.group.children)check([...o.geometry.attributes.position.array].every(Number.isFinite),'Finite scale geometry');atlas.update([0,0,1,0,0,0]);check(atlas.group.children.filter(o=>o.visible).length===1,'Only the selected atlas level draws');atlas.dispose();
 const sky=createDeepSky(THREE,{quality}),camera=new THREE.PerspectiveCamera();const before=sky.group.geometry.attributes.position.array.slice();camera.position.set(1234,2345,-3456);sky.update(camera);check(sky.group.position.equals(camera.position),'Background follows translation only');check(before.every((v,i)=>v===sky.group.geometry.attributes.position.array[i]),'Celestial directions stay fixed');check(sky.galaxyCount>=140,'Distant galaxies present');sky.dispose();}
console.log(`PASS: ${checks} continuous-scale, translation, geometry and fixed-sky checks.`);
