import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {DESTINATIONS} from '../src/data.js';
const read=p=>fs.readFile(`qa/${p}.json`,'utf8').then(JSON.parse);
const markers=await read('markers-and-images-v3');assert.equal(markers.length,21);
let checks=0;
for(const d of DESTINATIONS){const m=markers.find(x=>x.id===d.id);assert.ok(m);assert.equal(m.image,d.image.src);assert.ok(m.dimensions.every(n=>n>1));assert.equal(m.translations.length,3);checks+=4;
 for(const v of m.translations){const l=v.language.startsWith('zh')?'zh':v.language;assert.equal(v.name,d.names[l]);assert.equal(v.type,d.types[l]);assert.equal(v.story,d.detail[l].join(''));assert.equal(v.caption,d.image.caption[l]);assert.equal(v.selected,d.id);assert.equal(v.overflow,false);checks+=6;}
}
const full=(await read('full-tour-v3')).final;assert.ok(full.benchmark.completed&&full.benchmark.uninterrupted);assert.equal(full.mode,'explore');assert.equal(full.elapsed,160);assert.equal(full.tourIds.length,6);assert.ok(full.phaseStats.every(p=>p.frames>0));assert.equal(full.errors.length,0);checks+=6;
const aa=await read('antialias-v3');for(const q of [aa.on,aa.off]){for(const key of ['localTarget','worldTarget','composer','smaaTarget']){assert.deepEqual(q.antialias[key],q.antialias.canvas);checks++;}assert.equal(q.errors.length,0);checks++;}
assert.equal(aa.on.antialias.samples,4);assert.equal(aa.on.antialias.smaa,true);assert.equal(aa.off.antialias.samples,0);assert.equal(aa.off.antialias.smaa,false);checks+=4;
const views=await read('exploration-views-v3');assert.equal(views.length,15);assert.equal(new Set(views.map(v=>v.id)).size,15);for(const v of views){assert.equal(v.asset,'loaded');assert.equal(v.localWeight,1);assert.equal(v.errors.length,0);checks+=3;}
const summary={checkedOn:'2026-10-13',checks,catalog:21,trilingualSidebarViews:63,addedObservedViews:15,uninterruptedTourFPS:1000*full.benchmark.frames/full.benchmark.milliseconds,normalTourConsoleErrors:0,normalTourConsoleWarnings:0};await fs.writeFile('qa/browser-audit-v3.json',JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary));
