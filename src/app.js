import { filterDestinations } from './catalog-utils.js';
import { separateMarkers } from './marker-layout.js';
import {createSceneClock,SOLAR_IDS,SOLAR_SPECS} from './motion.js';
import {createGalaxyEnvironment} from './galaxy-environment.js';
import {createDeepSky} from './deep-sky.js';
import {COSMIC_LEVELS,scaleState,createCosmicAtlas} from './cosmic-scales.js';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { createGalaxy, SUN_POSITION, GALAXY_MODEL, galacticToScene } from './galaxy.js';
import { createLocalScenes } from './local-scenes.js';
import { createTour, TOUR_DURATION, OVERVIEW_POSITION, smooth } from './tour.js';
import { DESTINATIONS, MAP_DESTINATIONS, TOUR_DESTINATIONS } from './data.js';
import { LANGUAGES, t, applyTranslations } from './i18n.js';

const SEED=731927, $=id=>document.getElementById(id);
const params=new URLSearchParams(location.search);
const profiles={low:{dpr:1,bloom:false,samples:2,smaa:false},medium:{dpr:1.5,bloom:true,samples:4,smaa:true},high:{dpr:2,bloom:true,samples:4,smaa:true}};
const byId=Object.fromEntries(DESTINATIONS.map(d=>[d.id,d]));
const truePositions=Object.fromEntries(DESTINATIONS.map(d=>[d.id,d.id==='solar-system'?[...SUN_POSITION]:d.id==='sagittarius-a'?[0,0,0]:galacticToScene(d.galactic.lDeg,d.galactic.bDeg,d.distanceLy)]));
const positions=Object.fromEntries(DESTINATIONS.map(d=>[d.id,d.display.position]));
const tour=createTour(TOUR_DESTINATIONS,truePositions);
let language='zh';try{language=localStorage.getItem('galaxy-language')||'zh';}catch{}
if(LANGUAGES.includes(params.get('lang')))language=params.get('lang');if(!LANGUAGES.includes(language))language='zh';
let quality=profiles[params.get('quality')]?params.get('quality'):'medium';
let elapsed=THREE.MathUtils.clamp(Number(params.get('time'))||0,0,TOUR_DURATION);
let mode=elapsed>=TOUR_DURATION?'explore':'tour',playing=mode==='tour'&&params.get('paused')!=='1';
let exploreView=null,viewStarted=0,localControls,catalogQuery='',catalogCategory='all';
const sceneClock=createSceneClock({time:Number(params.get('motionTime'))||0,paused:params.get('paused')==='1'||params.get('motionPaused')==='1'});
let environmentView=false,environment,followId=null,followPrevious=null,bodyTransition=null;
let skyWorld,skyLocal,cosmicAtlas,cosmicState={level:0,weights:[1,0,0,0,0,0]},cmbLoaded=false,cmbRequested=false;
let atlasLoaded=false,atlasRequested=false;
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let pointerStart=null;
if(params.get('reduced')==='1')document.body.classList.add('reduced-motion');
let selectedId=null, uiHidden=false, contextLost=false, imageState='idle', imageId=null, forcedFailureUsed=false;
let markersVisible=true;try{const saved=localStorage.getItem('galaxy-markers-visible');if(saved!==null)markersVisible=saved==='1';}catch{}
let renderer,composer,worldScene,localScene,worldCamera,localCamera,galaxy,locals,controls,worldTarget,localTarget,mixPass,bloom,film,smaa;
let lastTime=0,lastUI=0,lastQa=0,activeLocal=null,transition=null,graphics='',frameCount=0,frames=[],fps=0,mean=0,p95=0,drawCalls=0;
let scrubbing=false,scrubWasPlaying=false,toastTimer,toastKey=null;
const errors=[],markers=new Map(),anchorLabels=new Map(),anchorLeaders=new Map();
let benchmark,phaseStats,lastInteraction=null;
const point=new THREE.Vector3(),projected=new THREE.Vector3();
const mixVector=(a,b,f)=>a.map((v,i)=>v+(b[i]-v)*f);
const locale=()=>language==='zh'?'zh-CN':language==='ja'?'ja-JP':'en-US';
const formatNumber=v=>new Intl.NumberFormat(locale(),{maximumFractionDigits:v>100?0:2}).format(v);
const distance=d=>d.primaryDistance?textOf(d.primaryDistance.value):`${formatNumber(d.distanceLy)} ${t(language,'distanceUnit')}`;
const textOf=value=>typeof value==='string'?value:value?.[language]??value?.en??'';
const anchorName=key=>byId[key]?.names[language]??t(language,key);
function paragraphs(element,lines){element.replaceChildren(...(Array.isArray(lines)?lines:[lines]).filter(Boolean).map(line=>{const p=document.createElement('p');p.textContent=line;return p;}));}
function link(label,url){const a=document.createElement('a');a.textContent=label;a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
function announce(key){toastKey=key;$('toast').textContent=t(language,key);$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('toast').hidden=true;toastKey=null;},4500);}
window.addEventListener('error',e=>errors.push(e.message));window.addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));
function resetMetrics(){frames=[];fps=mean=p95=0;frameCount=0;lastTime=0;lastQa=0;drawCalls=0;$('draw-calls').textContent='—';phaseStats=Array.from({length:7},()=>({frames:0,milliseconds:0,worst:0}));benchmark={frames:0,milliseconds:0,startElapsed:elapsed,seeks:0,pauses:0,completed:false,uninterrupted:false};for(const id of ['fps','frame-time','target-fps'])$(id).textContent=t(language,'resampling');}
function resize(){
 const previousLocalScale=localFitScale();
 const previousEnvironmentScale=cosmicFitScale();
 const dpr=profiles[quality].dpr,width=innerWidth,height=innerHeight;
 renderer.setPixelRatio(dpr);renderer.setSize(width,height,false);
 const pixels=renderer.getDrawingBufferSize(new THREE.Vector2());composer.setPixelRatio(1);composer.setSize(pixels.x,pixels.y);worldTarget.setSize(pixels.x,pixels.y);localTarget.setSize(pixels.x,pixels.y);
 for(const camera of [worldCamera,localCamera]){camera.aspect=width/height;camera.updateProjectionMatrix();}
 if(mode==='explore'&&!exploreView&&frameCount>0){const ratio=cosmicFitScale()/previousEnvironmentScale;worldCamera.position.sub(controls.target).multiplyScalar(ratio).add(controls.target);if(transition)transition.to=mixVector(transition.target,transition.to,ratio);}if(controls)controls.maxDistance=160000*cosmicFitScale();
 if(exploreView){const fit=localFitScale(),ratio=fit/previousLocalScale;localCamera.position.sub(localControls.target).multiplyScalar(ratio).add(localControls.target);if(bodyTransition){bodyTransition.fromOffset.multiplyScalar(ratio);bodyTransition.toOffset.multiplyScalar(ratio);bodyTransition.fromTarget.multiplyScalar(ratio);}if(!followId){localControls.minDistance=exploreView==='solar-system'?2:12*fit;localControls.maxDistance=exploreView==='solar-system'?110*fit:32*fit;}if(!bodyTransition)localControls.update();}
 galaxy.resize(pixels.y/dpr,dpr);locals.resize(pixels.y,dpr);$('render-size').textContent=`${pixels.x} × ${pixels.y}`;
}
function setQuality(next){
 if(!profiles[next])return;const nextGalaxy=createGalaxy(THREE,{seed:SEED,quality:next}),nextLocals=createLocalScenes(THREE,{seed:SEED,quality:next,catalog:DESTINATIONS});if(activeLocal)nextLocals.setDestination(activeLocal);
 nextGalaxy.update(sceneClock.time);nextLocals.update(sceneClock.time);
 const nextEnvironment=createGalaxyEnvironment(THREE,{catalog:MAP_DESTINATIONS,quality:next});nextEnvironment.show(false);
 if(skyWorld){worldScene.remove(skyWorld.group,cosmicAtlas.group);localScene.remove(skyLocal.group);skyWorld.dispose();skyLocal.dispose();cosmicAtlas.dispose();}
 skyWorld=createDeepSky(THREE,{quality:next});skyLocal=createDeepSky(THREE,{quality:next});cosmicAtlas=createCosmicAtlas(THREE,{quality:next});worldScene.add(skyWorld.group,cosmicAtlas.group);localScene.add(skyLocal.group);
 if(galaxy){worldScene.remove(galaxy.group);galaxy.dispose();localScene.remove(locals.group);locals.dispose();worldScene.remove(environment.group);environment.dispose();}
 environment=nextEnvironment;worldScene.add(environment.group);
 galaxy=nextGalaxy;locals=nextLocals;quality=next;worldScene.add(galaxy.group);localScene.add(locals.group);activeLocal=null;bloom.enabled=profiles[quality].bloom;$('quality').value=quality;resize();resetMetrics();
 const gl=renderer.getContext(),supported=Array.from(gl.getInternalformatParameter(gl.RENDERBUFFER,gl.RGBA16F,gl.SAMPLES)||[]);const samples=params.get('aa')==='off'?0:Math.max(0,...supported.filter(n=>n<=profiles[quality].samples));worldTarget.dispose();localTarget.dispose();worldTarget.samples=localTarget.samples=samples;smaa.enabled=params.get('aa')!=='off'&&profiles[quality].smaa;
}
function playbackUI(){
 const exploring=mode==='explore';document.body.classList.toggle('free-explore',exploring);$('timeline-wrap').hidden=exploring;$('replay-top').hidden=!exploring;
 const isPlaying=mode==='tour'?playing:!sceneClock.paused;
 $('play-label').textContent=t(language,mode==='explore'?(sceneClock.paused?'resumeDynamics':'pauseDynamics'):isPlaying?'pause':'resume');$('play').setAttribute('aria-label',$('play-label').textContent);
 $('play-icon').innerHTML=isPlaying?'<path d="M8 5v14M16 5v14"/>':'<path d="m8 4 11 8-11 8Z"/>';
 $('mode-badge').textContent=t(language,mode==='explore'?'explore':'auto');$('skip').disabled=mode==='explore'||tour.getFrame(elapsed).phase!=='hold';
 document.body.classList.toggle('environment-view',environmentView&&!exploreView);
 $('explore-controls').hidden=mode!=='explore';$('map-legend').hidden=mode!=='explore'||!!exploreView;
 $('galaxy-return').hidden=mode!=='explore';$('cosmic-toolbar').hidden=mode!=='explore'||!!exploreView;
 $('fullscreen').title=t(language,document.fullscreenElement?'exitFullscreen':'fullscreen');$('fullscreen').setAttribute('aria-label',$('fullscreen').title);
}
function togglePlayback(){if(mode==='explore')sceneClock.setPaused(!sceneClock.paused);else{if(playing)benchmark.pauses++;playing=!playing;sceneClock.setPaused(!playing);}lastTime=0;playbackUI();}
function replay(){elapsed=0;mode='tour';playing=true;sceneClock.setPaused(false);environmentView=false;followId=null;followPrevious=null;bodyTransition=null;transition=null;exploreView=null;localControls.enabled=false;controls.enabled=false;selectedId=null;closeSidebar();resetMetrics();playbackUI();renderCatalog();renderMarkersText();updateUI(true);}
function clearSelection(){selectedId=null;closeSidebar();renderMarkersText();renderCatalog();}
function closeSidebar(){$('sidebar').hidden=true;document.body.classList.remove('sidebar-open');}
function togglePanel(id,button,force){const open=typeof force==='boolean'?force:$(id).hidden;$(id).hidden=!open;if(button)$(button).setAttribute('aria-expanded',String(open));}
function toggleUI(){uiHidden=!uiHidden;document.body.classList.toggle('ui-hidden',uiHidden);$('restore-ui').hidden=!uiHidden;}
function markerVisibilityUI(){document.body.classList.toggle('markers-hidden',!markersVisible);$('markers-toggle').textContent=t(language,markersVisible?'hideMarkers':'showMarkers');$('markers-toggle').setAttribute('aria-pressed',String(!markersVisible));}
function toggleMarkers(){markersVisible=!markersVisible;try{localStorage.setItem('galaxy-markers-visible',markersVisible?'1':'0');}catch{}markerVisibilityUI();}
async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{announce('fullscreenDenied');}}
function setLanguage(next){if(!LANGUAGES.includes(next))return;language=next;try{localStorage.setItem('galaxy-language',next);}catch{}applyTranslations(language);document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===language)));renderCatalog();renderMarkersText();if(selectedId)renderDetail(false);renderModelSources();playbackUI();if(toastKey)$('toast').textContent=t(language,toastKey);if(!$('error').hidden)$('error-message').textContent=t(language,contextLost?'contextLost':'errorWebGL');if(frameCount<120)for(const id of ['fps','frame-time','target-fps'])$(id).textContent=t(language,'resampling');updateUI(true);}
function renderCatalog(){
 const filtered=filterDestinations(DESTINATIONS,catalogQuery,catalogCategory).sort((a,b)=>a.distanceLy-b.distanceLy);$('catalog-count').textContent=t(language,'catalogCount',{count:filtered.length,total:DESTINATIONS.length});$('catalog-empty').hidden=filtered.length>0;
 $('catalog-list').replaceChildren(...filtered.map((d,index)=>{const b=document.createElement('button');b.className='catalog-entry';b.dataset.id=d.id;b.classList.toggle('selected',d.id===selectedId);b.setAttribute('aria-label',t(language,'markerLabel',{name:d.names[language]}));
 const number=document.createElement('span');number.className='catalog-number';number.textContent=String(index+1).padStart(2,'0');
 const body=document.createElement('span'),name=document.createElement('strong'),meta=document.createElement('small');name.textContent=d.names[language];meta.textContent=`${d.types[language]} · ${distance(d)}`;body.append(name,meta);b.append(number,body);b.onclick=()=>selectDestination(d.id);return b;}));
 $('milestones').replaceChildren(...tour.stations.map((s,index)=>{const span=document.createElement('span');span.style.left=`${s.holdStart/TOUR_DURATION*100}%`;span.textContent=String(index+1).padStart(2,'0');span.title=byId[s.id].names[language];return span;}));
}
function selectDestination(id){if(!byId[id])return;const d=byId[id];
 if(d.scope==='solar'){if(activeLocal==='solar-system'&&mode==='tour'){mode='explore';playing=false;exploreView='solar-system';viewStarted=performance.now()-1200;controls.enabled=false;localControls.enabled=true;localControls.target.set(.5,0,.2);configureLocal('solar-system');}else if(exploreView!=='solar-system')solarOverview();}
 else if(exploreView&&exploreView!==id)observeDestination(id);
 if(followId&&followId!==id){followId=null;followPrevious=null;bodyTransition=null;}
 selectedId=id;$('sidebar').hidden=false;document.body.classList.add('sidebar-open');if(innerWidth<=760)togglePanel('catalog','catalog-toggle',false);renderCatalog();renderDetail(true);$('sidebar').scrollTop=0;renderMarkersText();playbackUI();}
function renderDetail(loadImage){
 const d=byId[selectedId];if(!d)return;$('detail-name').textContent=d.names[language];$('detail-type').textContent=d.types[language];
 const entries=[{label:d.primaryDistance?.label??{zh:t(language,'distance'),en:t(language,'distance'),ja:t(language,'distance')},value:d.primaryDistance?.value??{zh:distance(d),en:distance(d),ja:distance(d)}},...(d.parameters||[])];
 $('detail-parameters').replaceChildren(...entries.map(item=>{const div=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=textOf(item.label);dd.textContent=textOf(item.value);div.append(dt,dd);return div;}));
 paragraphs($('detail-story'),d.detail[language]);$('detail-scale-note').textContent=textOf(d.scaleNote);$('detail-caption').textContent=textOf(d.image.caption);$('detail-credit').textContent=d.image.credit;$('image-kind').textContent=textOf(d.image.kind);$('image-source').href=d.image.sourceUrl;
 $('detail-sources').replaceChildren(...d.sources.map(source=>{const li=document.createElement('li');li.append(link(textOf(source.title)||new URL(source.url).hostname,source.url));return li;}));
 $('detail-image').alt=t(language,'imageAlt',{name:d.names[language]});
 $('follow-object').hidden=d.scope!=='solar';$('follow-object').textContent=t(language,followId===d.id?'stopFollowing':'follow');$('solar-return').hidden=d.scope!=='solar'&&d.id!=='solar-system';
 if(loadImage&&imageId!==d.id){imageId=d.id;loadDetailImage();}
}
function loadDetailImage(retry=false){
 const d=byId[selectedId];if(!d)return;imageId=d.id;imageState='loading';$('image-loading').hidden=false;$('image-error').hidden=true;$('detail-image').classList.remove('loaded');
 const forced=params.get('imageFailure');const fail=!retry&&!forcedFailureUsed&&(forced==='all'||forced===d.id);if(fail)forcedFailureUsed=true;
 $('detail-image').src=fail?'/assets/qa-missing-image.jpg':d.image.src;
}
$('detail-image').addEventListener('load',()=>{imageState='loaded';$('image-loading').hidden=true;$('image-error').hidden=true;$('detail-image').classList.add('loaded');});
$('detail-image').addEventListener('error',()=>{imageState='error';$('image-loading').hidden=true;$('image-error').hidden=false;});
function renderModelSources(){
 $('model-version').textContent=GALAXY_MODEL.version;
 $('model-sources').replaceChildren(...GALAXY_MODEL.sources.map((url,index)=>{const p=document.createElement('p');p.append(link(`${String(index+1).padStart(2,'0')} · ${new URL(url).hostname}`,url));return p;}));
 for(const l of COSMIC_LEVELS.filter(l=>l.source)){const p=document.createElement('p');p.append(link(l.name[language],l.source));$('model-sources').append(p);}
}
function buildMarkers(){
 for(const [index,d]of MAP_DESTINATIONS.entries()){const leader=document.createElement('div');leader.className='leader';leader.hidden=true;leader.dataset.for=d.id;const button=document.createElement('button');button.hidden=true;button.className='marker compact';button.dataset.id=d.id;button.style.setProperty('--phase',`${-index*.73}s`);button.classList.toggle('warm',d.id==='solar-system');const dot=document.createElement('i'),label=document.createElement('span');dot.className='marker-dot';label.className='marker-label';button.append(dot,label);button.onclick=()=>selectDestination(d.id);$('world-markers').append(leader,button);markers.set(d.id,{button,leader});}renderMarkersText();
}
function renderMarkersText(){document.body.classList.toggle('has-selection',!!selectedId);for(const[id,{button}]of markers){const name=byId[id].names[language];button.querySelector('.marker-label').textContent=name;button.querySelector('.marker-label').dataset.short=({'large-magellanic-cloud':'LMC','small-magellanic-cloud':'SMC',andromeda:'M31','centaurus-a':'Cen A',triangulum:'M33','bodes-galaxy':'M81',whirlpool:'M51','messier-87':'M87'})[id]||name;button.style.setProperty('--label-y',([-8,8,-14,14,14,-8,8,-14][MAP_DESTINATIONS.filter(d=>d.scope==='extragalactic').findIndex(d=>d.id===id)]||0)+'px');button.title=name;button.setAttribute('aria-label',t(language,'markerLabel',{name}));button.setAttribute('aria-pressed',String(id===selectedId));button.classList.toggle('selected',id===selectedId);button.classList.toggle('external',byId[id].scope==='extragalactic');}for(const[key,b]of anchorLabels){b.querySelector('.marker-label').textContent=anchorName(key);b.setAttribute('aria-label',t(language,'openDetail')+' · '+anchorName(key));b.setAttribute('aria-pressed',String(key===selectedId));b.classList.toggle('selected',key===selectedId);}}
function project(position,camera){point.fromArray(position);projected.copy(point).project(camera);const forward=point.clone().sub(camera.position).dot(camera.getWorldDirection(new THREE.Vector3()));return {x:(projected.x*.5+.5)*innerWidth,y:(-.5*projected.y+.5)*innerHeight,visible:forward>0&&projected.z<1&&Math.abs(projected.x)<1.1&&Math.abs(projected.y)<1.1};}
function place(element,p){element.hidden=!p.visible;element.style.left=`${p.x}px`;element.style.top=`${p.y}px`;const left=p.x>innerWidth/2&&!(environmentView&&innerWidth<760&&element.dataset.id==='large-magellanic-cloud');element.classList.toggle('label-left',left);element.style.setProperty('--label-width',`${Math.max(75,left?p.x-35:innerWidth-p.x-35)}px`);}
function updateMarkers(frame){
 const visible=markersVisible&&mode==='explore'&&frame.localWeight<.12;$('world-markers').hidden=!visible;$('local-labels').hidden=!markersVisible||frame.localWeight<.8||(mode==='explore'&&!exploreView);
 if(visible){const projectedPoints=MAP_DESTINATIONS.filter(d=>cosmicState.level>=2?false:environmentView?d.scope==='extragalactic':true).map(d=>({id:d.id,...project(mapPosition(d.id),worldCamera)}));const layout=separateMarkers(projectedPoints,innerWidth,innerHeight,40,environmentView?{top:245,bottom:175}:{top:116,bottom:138});const placed=new Map(layout.map(p=>[p.id,p]));
 for(const[id,{button,leader}]of markers){const p=placed.get(id);if(!p){button.hidden=true;leader.hidden=true;continue;}place(button,p);const dx=p.x-p.anchorX,dy=p.y-p.anchorY,len=Math.hypot(dx,dy);leader.hidden=len<8;leader.style.left=p.anchorX+'px';leader.style.top=p.anchorY+'px';leader.style.width=len+'px';leader.style.transform='rotate('+Math.atan2(dy,dx)+'rad)';}}
 if(markersVisible&&frame.localWeight>=.8){const anchors=locals.getAnchors(activeLocal),layout=separateMarkers(anchors.map(a=>({id:a.key,...project(a.position,localCamera)})),innerWidth,innerHeight);for(const b of anchorLabels.values())b.hidden=true;for(const l of anchorLeaders.values())l.hidden=true;for(const p of layout){const b=anchorLabels.get(p.id);if(b)place(b,p);const l=anchorLeaders.get(p.id),dx=p.x-p.anchorX,dy=p.y-p.anchorY,len=Math.hypot(dx,dy);if(l){l.hidden=len<8;l.style.left=p.anchorX+'px';l.style.top=p.anchorY+'px';l.style.width=len+'px';l.style.transform='rotate('+Math.atan2(dy,dx)+'rad)';}}}
}
function updateAnchors(id){$('local-labels').replaceChildren();anchorLabels.clear();anchorLeaders.clear();for(const [index,anchor]of locals.getAnchors(id).entries()){const b=document.createElement('button');b.className='marker compact local';b.dataset.bodyId=anchor.bodyId||'';b.style.setProperty('--phase',`${-index*.73}s`);b.classList.toggle('warm',anchor.key==='sun');const dot=document.createElement('i'),label=document.createElement('span');dot.className='marker-dot';label.className='marker-label';b.append(dot,label);b.onclick=()=>selectDestination(anchor.bodyId||id);const leader=document.createElement('div');leader.className='leader local-leader';leader.hidden=true;anchorLeaders.set(anchor.key,leader);$('local-labels').append(leader,b);anchorLabels.set(anchor.key,b);}renderMarkersText();}
function mapPosition(id){return byId[id].scope==='extragalactic'?[...positions[id]]:galaxy.toWorld(positions[id]);}
function overviewScale(){return innerWidth/innerHeight<1?1+(.95/(innerWidth/innerHeight)-1)*.65:1;}
function localFitScale(){return Math.max(1,.95/(localCamera?.aspect||1));}
function environmentFitScale(){return Math.max(1,(16/9)/(worldCamera?.aspect||innerWidth/innerHeight));}
function cosmicFitScale(){return Math.max(1,1.25/(worldCamera?.aspect||innerWidth/innerHeight));}
function returnGalaxy(){clearSelection();togglePanel('catalog','catalog-toggle',false);enterExplore();}
function jumpScale(index){
 if(index===0){returnGalaxy();return;}
 const from=worldCamera.position.clone(),direction=from.clone().sub(controls.target).normalize();if(direction.lengthSq()<.5)direction.set(.6,.4,.7).normalize();
 enterExplore();transition.from=from.toArray();transition.fromTarget=controls.target.toArray();transition.to=direction.multiplyScalar(COSMIC_LEVELS[index].radius*cosmicFitScale()).toArray();transition.target=[0,0,0];transition.duration=1000;closeSidebar();
}
function buildScaleControls(){for(const [index,l]of COSMIC_LEVELS.entries()){const b=document.createElement('button');b.dataset.scale=index;b.onclick=()=>jumpScale(index);$('scale-levels').append(b);}}
function updateCosmic(weight){
 const enabled=mode==='explore'&&!exploreView&&weight<.12,dist=worldCamera.position.distanceTo(controls.target)/cosmicFitScale();
 cosmicState=enabled?scaleState(dist):{level:0,weights:[1,0,0,0,0,0]};const {level,weights}=cosmicState;
 if(enabled)environmentView=level===1;document.body.classList.toggle('environment-view',enabled&&level===1);const modelWeights=[...weights];if(atlasLoaded)modelWeights[3]=0;cosmicAtlas.update(modelWeights);galaxy.setOpacity(weights[0]+weights[1]*.6);if(weight<.999&&weights[0]+weights[1]>.002)environment.show(true);environment.setOpacity((weights[0]*.6+weights[1])*(mode==='tour'?1:.95));
 skyWorld.update(worldCamera,1-weights[5],renderer.getPixelRatio());skyLocal.update(localCamera,1,renderer.getPixelRatio());
 const cmb=weights[5];$('cmb-view').hidden=cmb<.002;$('cmb-view').style.opacity=cmb;document.body.classList.toggle('cosmic-wide',enabled&&level>=2);
 if(cmb>0&&!cmbRequested){cmbRequested=true;$('cmb-image').src='/assets/planck-cmb-2018.jpg';}
 $('atlas-view').hidden=weights[3]<.002;$('atlas-view').style.opacity=weights[3];if(weights[3]>0&&!atlasRequested){atlasRequested=true;$('atlas-image').src='/assets/laniakea-flow.jpg';}
}
function renderScaleText(){const {level}=cosmicState,l=COSMIC_LEVELS[level];$('scale-size').textContent=l.size[language];$('cmb-image').alt=COSMIC_LEVELS[5].note[language];$('atlas-image').alt=COSMIC_LEVELS[3].note[language];for(const b of $('scale-levels').children){const i=Number(b.dataset.scale);b.textContent=COSMIC_LEVELS[i].name[language];b.setAttribute('aria-pressed',String(i===level));}}
function enterExplore(focusId=null){
 if(focusId&&byId[focusId].scope==='solar'){focusBody(focusId);return;}
 followId=null;followPrevious=null;bodyTransition=null;
 environmentView=!!focusId&&byId[focusId].scope==='extragalactic';controls.maxDistance=160000*cosmicFitScale();
 const frame=tour.getFrame(elapsed);const initialWeight=exploreView?1:transition?.localWeight??(mode==='tour'?frame.localWeight:0);exploreView=null;localControls.enabled=false;const target=focusId?mapPosition(focusId):[0,0,0];const scale=overviewScale();const dest=focusId?target.map((v,i)=>v+(environmentView?[25,18,100]:[9,8,13])[i]):OVERVIEW_POSITION.map(v=>v*scale);
 transition={start:performance.now(),duration:950,localId:activeLocal,from:worldCamera.position.toArray(),fromTarget:controls.target.toArray(),to:dest,target:[...target],fromWeight:initialWeight,localWeight:initialWeight};
 mode='explore';playing=false;controls.enabled=false;playbackUI();updateUI(true);
}
function galaxyEnvironment(){jumpScale(1);}
function configureLocal(id){const fit=localFitScale(),imageView=!['solar-system','alpha-centauri'].includes(id);localControls.minDistance=id==='solar-system'?.2:12*fit;localControls.maxDistance=id==='solar-system'?110*fit:32*fit;localControls.enablePan=false;localControls.minAzimuthAngle=imageView?-.16:-Infinity;localControls.maxAzimuthAngle=imageView?.16:Infinity;localControls.minPolarAngle=imageView?Math.PI/2-.14:.1;localControls.maxPolarAngle=imageView?Math.PI/2+.14:Math.PI-.1;}
function observeDestination(id){
 if(!byId[id])return;if(byId[id].scope==='solar'){focusBody(id);return;}if(id==='solar-system'){solarOverview();return;}
 followId=null;followPrevious=null;bodyTransition=null;environmentView=false;mode='explore';playing=false;transition=null;controls.enabled=false;exploreView=id;viewStarted=performance.now();locals.setDestination(id);activeLocal=id;updateAnchors(id);const pose=locals.getPose(id,.5),fit=localFitScale();localCamera.position.fromArray(pose.position).multiplyScalar(fit);localControls.target.set(0,0,0);configureLocal(id);localControls.enabled=true;localControls.update();$('sidebar').scrollTop=0;playbackUI();updateUI(true);
}
function solarOverview(){
 const hadSolar=exploreView==='solar-system';mode='explore';playing=false;environmentView=false;transition=null;bodyTransition=null;followId=null;followPrevious=null;exploreView='solar-system';viewStarted=hadSolar?performance.now()-650:performance.now();locals.setDestination('solar-system');locals.update(sceneClock.time);activeLocal='solar-system';controls.enabled=false;configureLocal('solar-system');localControls.enabled=true;localCamera.position.set(12,24,49).multiplyScalar(localFitScale());localControls.target.set(0,0,0);localControls.update();updateAnchors('solar-system');playbackUI();updateUI(true);
}
function focusBody(id){
 if(!SOLAR_IDS.includes(id))return;if(exploreView!=='solar-system')solarOverview();
 const p=new THREE.Vector3().fromArray(locals.getBodyPosition(id)),r=locals.getBodyRadius(id),fit=localFitScale(),range=id==='saturn'?5:r<.1?6:4.7;
 const towardSun=id==='sun'?new THREE.Vector3(.45,0,1).normalize():p.clone().negate().normalize(),side=new THREE.Vector3(-towardSun.z,0,towardSun.x);
 const toOffset=towardSun.multiplyScalar(r*range).addScaledVector(side,r*range*.3);toOffset.y=r*range*.35;toOffset.multiplyScalar(fit);
 bodyTransition={start:performance.now(),fromOffset:localCamera.position.clone().sub(p),fromTarget:localControls.target.clone().sub(p),toOffset};
 followId=id;followPrevious=p;localControls.minDistance=r*1.5;localControls.maxDistance=Math.max(r*15,3);localControls.enabled=false;renderDetail(false);
}
function updateBodyCamera(now){
 if(!followId||exploreView!=='solar-system')return;const p=new THREE.Vector3().fromArray(locals.getBodyPosition(followId));
 if(bodyTransition){const f=smooth((now-bodyTransition.start)/900);localCamera.position.copy(p).add(bodyTransition.fromOffset.clone().lerp(bodyTransition.toOffset,f));localControls.target.copy(p).add(bodyTransition.fromTarget.clone().multiplyScalar(1-f));localCamera.lookAt(localControls.target);if(f>=1){bodyTransition=null;localControls.enabled=true;localControls.update();}}
 else if(followPrevious){const delta=p.clone().sub(followPrevious);localCamera.position.add(delta);localControls.target.add(delta);}
 followPrevious=p;
}
function toggleFollow(){if(!selectedId||byId[selectedId].scope!=='solar')return;if(followId===selectedId){followId=null;followPrevious=null;bodyTransition=null;localControls.enabled=true;renderDetail(false);}else focusBody(selectedId);}
function pickBody(event){
 if(activeLocal!=='solar-system'||!pointerStart||Math.hypot(event.clientX-pointerStart.x,event.clientY-pointerStart.y)>5)return;
 if(mode==='tour'&&tour.getFrame(elapsed).localWeight<.8)return;
 pointer.set(event.clientX/innerWidth*2-1,1-event.clientY/innerHeight*2);raycaster.setFromCamera(pointer,localCamera);const hit=raycaster.intersectObjects(locals.getPickMeshes(),false)[0];
 if(hit){selectDestination(hit.object.userData.bodyId);return;}
 const near=locals.getAnchors('solar-system').map(a=>({...a,p:project(a.position,localCamera)})).filter(a=>a.p.visible).map(a=>({...a,dist:Math.hypot(a.p.x-event.clientX,a.p.y-event.clientY)})).sort((a,b)=>a.dist-b.dist)[0];
 if(near?.dist<18)selectDestination(near.bodyId);else clearSelection();
}
function transitionCamera(now){if(!transition)return;const f=smooth((now-transition.start)/transition.duration);controls.target.fromArray(mixVector(transition.fromTarget,transition.target,f));const a=new THREE.Vector3().fromArray(transition.from).sub(new THREE.Vector3().fromArray(transition.fromTarget)),b=new THREE.Vector3().fromArray(transition.to).sub(new THREE.Vector3().fromArray(transition.target)),ra=a.length(),rb=b.length();if(ra>0&&rb>0&&Math.max(ra/rb,rb/ra)>8){const dir=a.normalize(),q=new THREE.Quaternion().setFromUnitVectors(dir,b.normalize()),rot=new THREE.Quaternion().slerp(q,f);worldCamera.position.copy(controls.target).add(dir.applyQuaternion(rot).multiplyScalar(Math.exp(Math.log(ra)*(1-f)+Math.log(rb)*f)));}else worldCamera.position.fromArray(mixVector(transition.from,transition.to,f));worldCamera.lookAt(controls.target);transition.localWeight=transition.fromWeight*(1-f);if(f>=1){transition=null;controls.enabled=true;controls.update();}}
function adjustExplore(action){if(mode!=='explore'||transition||bodyTransition)return;const camera=exploreView?localCamera:worldCamera,control=exploreView?localControls:controls;const offset=camera.position.clone().sub(control.target),spherical=new THREE.Spherical().setFromVector3(offset);if(action==='left')spherical.theta-=.16;if(action==='right')spherical.theta+=.16;if(action==='in')spherical.radius*=.8;if(action==='out')spherical.radius*=1.25;spherical.radius=THREE.MathUtils.clamp(spherical.radius,control.minDistance,control.maxDistance);camera.position.copy(control.target).add(new THREE.Vector3().setFromSpherical(spherical));control.update();}
function formatTime(value){return `${String(Math.floor(value/60)).padStart(2,'0')}:${String(Math.floor(value%60)).padStart(2,'0')}`;}
function updateUI(force=false){
 const frame=tour.getFrame(elapsed),d=byId[exploreView||frame.station.id];
 $('station-number').textContent=mode==='explore'?t(language,elapsed>=TOUR_DURATION?'tourComplete':'explore'):frame.phase==='pullback'?'06 / 06':t(language,'stationNumber',{number:frame.station.index+1});
 $('station-name').textContent=mode==='explore'?(exploreView?d.names[language]:t(language,environmentView?'environmentTitle':'exploreTitle')):frame.phase==='pullback'?t(language,'pullback'):d.names[language];
 $('phase-label').textContent=mode==='explore'?t(language,'explore'):t(language,frame.phase);$('hold-clock').textContent=frame.phase==='hold'&&mode==='tour'?`${Math.ceil(frame.holdRemaining)} ${t(language,'seconds')}`:'';
 const summary=mode==='explore'?(exploreView==='solar-system'?[t(language,'solarHint')]:exploreView?d.short[language]:[t(language,environmentView?'environmentText':'exploreText')]):frame.phase==='pullback'?[t(language,'pullbackText')]:d.short[language];paragraphs($('station-story'),summary);
 $('station-type').textContent=mode==='tour'&&frame.phase!=='pullback'?d.types[language]:t(language,'modelVersion');$('station-distance').textContent=mode==='tour'&&frame.phase!=='pullback'?distance(d):GALAXY_MODEL.version;
 $('scale-note').textContent=mode==='explore'?(exploreView?(['solar-system','alpha-centauri','sagittarius-a'].includes(exploreView)?textOf(d.scaleNote):t(language,'observedDepth')):t(language,'scaleText')):frame.localWeight>.75?`${t(language,'localView')} · ${textOf(d.scaleNote)}`:t(language,'transitNote');
 if(mode==='explore'&&!exploreView)$('scale-note').textContent=t(language,environmentView?'environmentNote':'motionNote');
 if(mode==='explore'&&!exploreView){const l=COSMIC_LEVELS[cosmicState.level];$('station-name').textContent=l.name[language];paragraphs($('station-story'),[cosmicState.level===0?t(language,'exploreText'):l.note[language]]);$('scale-note').textContent=l.size[language];}renderScaleText();
 markerVisibilityUI();
 $('timeline').value=elapsed;$('timeline').style.setProperty('--progress',`${elapsed/TOUR_DURATION*100}%`);$('timeline').setAttribute('aria-valuetext',`${formatTime(elapsed)} · ${d.names[language]}`);$('time-display').textContent=`${formatTime(elapsed)} / 02:40`;
 $('tour-card').classList.toggle('exploring',mode==='explore');document.querySelector('.station-meta').hidden=mode==='explore'||frame.phase==='pullback';if(force)playbackUI();else $('skip').disabled=mode==='explore'||frame.phase!=='hold';
}
function updateMetrics(now,frame,weight){
 if(now-lastQa<500)return;lastQa=now;
 mean=frames.reduce((a,b)=>a+b,0)/(frames.length||1);fps=mean?1000/mean:0;const sorted=[...frames].sort((a,b)=>a-b);p95=sorted[Math.floor(sorted.length*.95)]||0;
 const sampled=frameCount>=120,target=fps>=52?60:fps>=27?30:24;
 const localCount=locals.getCounts(exploreView||frame.station.id);
 const galaxyVisible=weight<.999&&cosmicState.weights[0]+cosmicState.weights[1]>.002;
 const stars=(galaxyVisible?galaxy.starCount:0)+(weight>.001?localCount.starCount+localCount.stellarMeshCount:0)+(cosmicState.weights[5]<.999?skyWorld.starCount:0);
 $('star-count').textContent=formatNumber(stars);$('dust-count').textContent=formatNumber((weight<.999?galaxy.dustCount:0)+(weight>.001?localCount.dustCount:0));
 $('fps').textContent=sampled?fps.toFixed(1):t(language,'resampling');$('frame-time').textContent=sampled?`${mean.toFixed(2)} / ${p95.toFixed(2)} ms`:t(language,'resampling');$('target-fps').textContent=sampled?`${target} FPS`:t(language,'sampling');$('draw-calls').textContent=String(drawCalls);
 $('qa-data').textContent=JSON.stringify({version:'5.1',markersVisible,cosmicLevel:cosmicState.level,cosmicWeights:cosmicState.weights,cmbLoaded,atlasLoaded,deepSky:{stars:skyWorld.starCount,galaxies:skyWorld.galaxyCount},atlasPoints:cosmicAtlas.pointCount,catalogCount:DESTINATIONS.length,mapCount:MAP_DESTINATIONS.length,tourIds:TOUR_DESTINATIONS.map(d=>d.id),sceneTime:sceneClock.time,motionPaused:sceneClock.paused,galaxyAngle:galaxy.rotatingGroup.rotation.y,bodyMotion:locals.getMotionState(),followId,environmentView,environmentAssets:environment.states,exploreView,assets:locals.getAssetStates(),antialias:{samples:localTarget.samples,smaa:smaa.enabled,localTarget:[localTarget.width,localTarget.height],worldTarget:[worldTarget.width,worldTarget.height],composer:[composer.renderTarget1.width,composer.renderTarget1.height],smaaTarget:[smaa._edgesRT.width,smaa._edgesRT.height],canvas:[$('universe').width,$('universe').height]},localMarkerPositions:[...anchorLabels].map(([id,b])=>({id,visible:!$('local-labels').hidden&&!b.hidden,x:parseFloat(b.style.left),y:parseFloat(b.style.top)})),markerPositions:[...markers].map(([id,m])=>({id,visible:!$('world-markers').hidden&&!m.button.hidden,x:parseFloat(m.button.style.left),y:parseFloat(m.button.style.top),anchor:mapPosition(id)})),seed:SEED,threeVersion:THREE.REVISION,graphics,language,quality,mode,elapsed,playing,phase:frame.phase,destinationId:frame.station.id,holdRemaining:frame.holdRemaining,localWeight:weight,selectedId,sidebarOpen:!$('sidebar').hidden,imageId,imageState,starCount:stars,galaxyStarCount:galaxy.starCount,localCounts:localCount,dustCount:galaxy.dustCount,populations:galaxy.populations,armCounts:galaxy.armCounts,positions,truePositions,model:GALAXY_MODEL.version,viewport:{width:innerWidth,height:innerHeight,dpr:renderer.getPixelRatio()},fps,frameMean:mean,p95,drawCalls,sampling:!sampled,benchmark,phaseStats,lastInteraction,errors,contextLost,camera:worldCamera.position.toArray(),localCamera:localCamera.position.toArray()});
}
function render(now){
 requestAnimationFrame(render);if(contextLost)return;if(document.hidden){lastTime=0;sceneClock.tick(now,false);return;}sceneClock.tick(now);
 const delta=lastTime?(now-lastTime)/1000:0;lastTime=now;const advancing=mode==='tour'&&playing;
 if(advancing){elapsed=Math.min(TOUR_DURATION,elapsed+delta);if(elapsed>=TOUR_DURATION){playing=false;mode='explore';controls.enabled=true;benchmark.completed=true;benchmark.uninterrupted=benchmark.startElapsed===0&&benchmark.seeks===0&&benchmark.pauses===0;playbackUI();announce('tourComplete');}}
 const frame=tour.getFrame(elapsed);
 if(delta>0&&frameCount>5&&delta<2){const ms=delta*1000;frames.push(ms);if(frames.length>300)frames.shift();if(!benchmark.completed){benchmark.frames++;benchmark.milliseconds+=ms;}if(advancing){const p=phaseStats[frame.phase==='pullback'?6:frame.station.index];p.frames++;p.milliseconds+=ms;p.worst=Math.max(p.worst,ms);}}
 frameCount++;
 const activeId=exploreView||transition?.localId||frame.station.id;if(activeLocal!==activeId){activeLocal=activeId;locals.setDestination(activeLocal);updateAnchors(activeLocal);}
 locals.update(sceneClock.time);galaxy.update(sceneClock.time);environment.update(sceneClock.time,worldCamera);
 let weight=mode==='tour'?frame.localWeight:exploreView?smooth((now-viewStarted)/650):0;
 if(mode==='tour'){const pose=frame.worldPose;worldCamera.position.fromArray(galaxy.toWorld(pose.position));controls.target.fromArray(galaxy.toWorld(pose.target));if(elapsed>136){const f=smooth((elapsed-136)/24),s=overviewScale();worldCamera.position.multiplyScalar(1+(s-1)*f);}worldCamera.lookAt(controls.target);const local=locals.getPose(frame.station.id,frame.progress),target=new THREE.Vector3().fromArray(local.target),localPosition=new THREE.Vector3().fromArray(local.position);if(frame.station.id==='solar-system'){const angle=-sceneClock.time*Math.PI*2/SOLAR_SPECS.find(s=>s.id==='earth').orbitSec,axis=new THREE.Vector3(0,1,0);target.applyAxisAngle(axis,angle);localPosition.applyAxisAngle(axis,angle);}localCamera.position.copy(localPosition).sub(target).multiplyScalar(localFitScale()).add(target);localCamera.lookAt(target);}
 else if(transition){transitionCamera(now);weight=transition?.localWeight||0;}else if(exploreView){updateBodyCamera(now);if(!bodyTransition)localControls.update();}else controls.update();
 updateCosmic(weight);
 renderer.info.reset();renderer.setClearColor(0x03050a,1);
 if(weight<.999){renderer.setRenderTarget(worldTarget);renderer.clear();renderer.render(worldScene,worldCamera);}
 if(weight>.001){renderer.setRenderTarget(localTarget);renderer.clear();renderer.render(localScene,localCamera);}
 renderer.setRenderTarget(null);mixPass.uniforms.uBlend.value=weight;film.uniforms.uTime.value=sceneClock.time;composer.render();drawCalls=renderer.info.render.calls;
 worldCamera.updateMatrixWorld();localCamera.updateMatrixWorld();updateMarkers({...frame,localWeight:weight});
 if(now-lastUI>120){lastUI=now;updateUI();}updateMetrics(now,frame,weight);
}
function bindEvents(){
 $('replay-top').onclick=replay;
 document.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>setLanguage(b.dataset.lang));$('play').onclick=togglePlayback;$('replay').onclick=replay;$('skip').onclick=()=>{if(mode==='tour'&&elapsed<142){const f=tour.getFrame(elapsed);elapsed=f.station.holdEnd;benchmark.seeks++;lastTime=0;updateUI(true);}};
 $('overview').onclick=returnGalaxy;$('galaxy-return').onclick=returnGalaxy;$('observe-object').onclick=()=>{if(selectedId)observeDestination(selectedId);};$('catalog-search').oninput=e=>{catalogQuery=e.target.value;renderCatalog();};$('catalog-filter').onchange=e=>{catalogCategory=e.target.value;renderCatalog();};$('locate-object').onclick=()=>{if(selectedId)enterExplore(selectedId);};$('previous-object').onclick=()=>selectDestination(DESTINATIONS[(DESTINATIONS.findIndex(d=>d.id===selectedId)+DESTINATIONS.length-1)%DESTINATIONS.length].id);$('next-object').onclick=()=>selectDestination(DESTINATIONS[(DESTINATIONS.findIndex(d=>d.id===selectedId)+1)%DESTINATIONS.length].id);
 $('solar-overview').onclick=solarOverview;$('solar-return').onclick=solarOverview;$('environment').onclick=galaxyEnvironment;$('follow-object').onclick=toggleFollow;$('clear-selection').onclick=clearSelection;
 $('universe').addEventListener('pointerdown',e=>{pointerStart={x:e.clientX,y:e.clientY};});$('universe').addEventListener('pointerup',e=>{pickBody(e);pointerStart=null;});
 $('sidebar-close').onclick=closeSidebar;$('image-retry').onclick=()=>loadDetailImage(true);$('catalog-toggle').onclick=()=>togglePanel('catalog','catalog-toggle');$('catalog-close').onclick=()=>togglePanel('catalog','catalog-toggle',false);
 $('sources-toggle').onclick=()=>togglePanel('sources-panel','sources-toggle');$('scale-toggle').onclick=()=>togglePanel('sources-panel','sources-toggle',true);$('sources-close').onclick=()=>togglePanel('sources-panel','sources-toggle',false);
 $('technical-toggle').onclick=()=>togglePanel('technical-panel','technical-toggle');$('technical-close').onclick=()=>togglePanel('technical-panel','technical-toggle',false);$('quality').onchange=e=>setQuality(e.target.value);
 $('fullscreen').onclick=fullscreen;$('hide-ui').onclick=toggleUI;$('restore-ui').onclick=toggleUI;$('reload').onclick=()=>location.reload();
 $('markers-toggle').onclick=toggleMarkers;
 $('cmb-image').onload=()=>{cmbLoaded=true;$('cmb-loading').hidden=true;$('cmb-error').hidden=true;};$('cmb-image').onerror=()=>{$('cmb-loading').hidden=true;$('cmb-error').hidden=false;};$('cmb-retry').onclick=()=>{$('cmb-loading').hidden=false;$('cmb-error').hidden=true;$('cmb-image').src='/assets/planck-cmb-2018.jpg?retry='+Date.now();};
 $('atlas-image').onload=()=>{atlasLoaded=true;$('atlas-loading').hidden=true;$('atlas-error').hidden=true;};$('atlas-image').onerror=()=>{$('atlas-loading').hidden=true;$('atlas-error').hidden=false;};$('atlas-retry').onclick=()=>{$('atlas-loading').hidden=false;$('atlas-error').hidden=true;$('atlas-image').src='/assets/laniakea-flow.jpg?retry='+Date.now();};
 for(const [id,action]of [['rotate-left','left'],['rotate-right','right'],['zoom-in','in'],['zoom-out','out']])$(id).onclick=()=>adjustExplore(action);
 $('timeline').addEventListener('pointerdown',()=>{scrubbing=true;scrubWasPlaying=playing;playing=false;});
 const endScrub=()=>{if(!scrubbing)return;scrubbing=false;playing=mode==='tour'&&scrubWasPlaying;lastTime=0;playbackUI();};window.addEventListener('pointerup',endScrub);window.addEventListener('pointercancel',endScrub);
 $('timeline').addEventListener('input',e=>{lastInteraction={type:'seek',trusted:e.isTrusted,value:e.target.value,previous:elapsed,active:document.activeElement?.id};elapsed=Number(e.target.value);benchmark.seeks++;mode=elapsed>=TOUR_DURATION?'explore':'tour';if(mode==='tour')controls.enabled=false;else{playing=false;const p=tour.worldPose(TOUR_DURATION);worldCamera.position.fromArray(galaxy.toWorld(p.position));controls.target.fromArray(galaxy.toWorld(p.target));controls.enabled=true;}followId=null;bodyTransition=null;environmentView=false;environment.show(false);transition=null;exploreView=null;localControls.enabled=false;updateUI(true);});
 window.addEventListener('resize',resize);document.addEventListener('fullscreenchange',playbackUI);
 window.addEventListener('keydown',e=>{if(e.target.matches('input,select,textarea')&&e.key!=='Escape')return;if(e.code==='Space'){e.preventDefault();togglePlayback();}if(e.key.toLowerCase()==='r')replay();if(e.key.toLowerCase()==='h')toggleUI();if(e.key.toLowerCase()==='i')togglePanel('technical-panel','technical-toggle');if(e.key.toLowerCase()==='f')fullscreen();if(e.key==='Escape'){closeSidebar();togglePanel('catalog','catalog-toggle',false);togglePanel('sources-panel','sources-toggle',false);togglePanel('technical-panel','technical-toggle',false);if(uiHidden)toggleUI();}});
 $('universe').addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;playing=false;$('error').hidden=false;$('error-message').textContent=t(language,'contextLost');});
}
function initialize(){
 setLanguage(language);renderer=new THREE.WebGLRenderer({canvas:$('universe'),antialias:false,alpha:false,powerPreference:'high-performance'});renderer.autoClear=false;renderer.info.autoReset=false;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;renderer.outputColorSpace=THREE.SRGBColorSpace;
 const gl=renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info');graphics=debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);
 worldScene=new THREE.Scene();localScene=new THREE.Scene();worldCamera=new THREE.PerspectiveCamera(48,1,.001,2000000);localCamera=new THREE.PerspectiveCamera(45,1,.005,1000);localControls=new OrbitControls(localCamera,$('universe'));localControls.enabled=false;localControls.enableDamping=true;
 worldCamera.position.fromArray(OVERVIEW_POSITION.map(v=>v*overviewScale()));controls=new OrbitControls(worldCamera,$('universe'));controls.target.set(0,0,0);controls.enableDamping=true;controls.dampingFactor=.065;controls.minDistance=1.5;controls.maxDistance=600;controls.maxPolarAngle=Math.PI*.92;controls.enablePan=false;controls.enabled=mode==='explore';
 const options={type:THREE.HalfFloatType,depthBuffer:true,stencilBuffer:false};worldTarget=new THREE.WebGLRenderTarget(1,1,options);localTarget=new THREE.WebGLRenderTarget(1,1,options);
 const shader={uniforms:{uWorld:{value:null},uLocal:{value:null},uBlend:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform sampler2D uWorld;uniform sampler2D uLocal;uniform float uBlend;varying vec2 vUv;void main(){gl_FragColor=mix(texture2D(uWorld,vUv),texture2D(uLocal,vUv),uBlend);}'};
 composer=new EffectComposer(renderer);mixPass=new ShaderPass(shader);mixPass.uniforms.uWorld.value=worldTarget.texture;mixPass.uniforms.uLocal.value=localTarget.texture;composer.addPass(mixPass);bloom=new UnrealBloomPass(new THREE.Vector2(1,1),.14,.34,.82);composer.addPass(bloom);
 film=new ShaderPass({uniforms:{tDiffuse:{value:null},uTime:{value:0}},vertexShader:shader.vertexShader,fragmentShader:'uniform sampler2D tDiffuse;uniform float uTime;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);float v=1.-.22*smoothstep(.12,.72,length(vUv-.5));gl_FragColor=vec4(c.rgb*v,1.);}'});composer.addPass(film);smaa=new SMAAPass();composer.addPass(smaa);composer.addPass(new OutputPass());
 controls.maxDistance=160000*cosmicFitScale();controls.zoomSpeed=1.65;setQuality(quality);buildMarkers();buildScaleControls();bindEvents();playbackUI();$('loading').hidden=true;updateUI(true);requestAnimationFrame(render);
}
document.querySelectorAll('[data-lang]').forEach(button=>button.onclick=()=>setLanguage(button.dataset.lang));
try{initialize();}catch(error){console.error(error);errors.push(String(error));$('loading').hidden=true;$('error').hidden=false;$('error-message').textContent=t(language,'errorWebGL');}





