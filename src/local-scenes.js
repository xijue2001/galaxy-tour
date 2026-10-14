import { buildSolarSystem } from './solar-scene.js';
import { SOLAR_IDS, ALPHA_DISPLAY_ORBIT_SECONDS } from './motion.js';
import { createObservationStage } from './observation-scenes.js';
/**
 * Six tour stages plus lazy exploration stages. Observed photographs retain
 * identifiable morphology with shallow illustrative depth. Local display units are
 * deliberately unrelated to Galactic-map parsecs; radii/separations are enlarged.
 * Stars and gas are drawn in batches. A handful of named stars/planets use meshes.
 */
const TWO_PI = Math.PI * 2;
// One bounded, page-lifetime Earth texture survives quality reconstruction.
let earthAsset=null;
const aliases = {
  solar: 'solar-system', sun: 'solar-system', alpha: 'alpha-centauri',
  'm45': 'pleiades', 'm42': 'orion-nebula', orion: 'orion-nebula',
  'm1': 'crab-nebula', crab: 'crab-nebula', 'sgr-a': 'sagittarius-a',
  'sgr-a-star': 'sagittarius-a', 'sagittarius-a-star': 'sagittarius-a',
};

function rng(seed) {
  let s = seed >>> 0;
  const random = () => {
    s += 0x6d2b79f5;
    let n = Math.imul(s ^ (s >>> 15), 1 | s);
    n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
  const normal = () => Math.sqrt(-2 * Math.log(Math.max(0.000001, random()))) * Math.cos(TWO_PI * random());
  return { random, normal };
}

const noiseGLSL = /* glsl */`
  float hash3(vec3 p) { p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z); }
  float noise3(vec3 p) {
    vec3 i=floor(p), f=fract(p);f=f*f*(3.-2.*f);
    return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),
      mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);
  }
  float fbm(vec3 p) { float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise3(p);p=p*2.03+vec3(13.1,4.7,7.9);a*=.5;}return v; }
`;

export function createLocalScenes(THREE, { seed = 731927, quality = 'medium', catalog = [] } = {}) {
  const density = quality === 'high' ? 1.5 : quality === 'low' ? .62 : 1;
  const group = new THREE.Group();
  group.name = 'procedural-local-destinations';
  const photos = new Map();let disposed=false;const records=new Map(catalog.map(d=>[d.id,d]));
  const stages = new Map(), resources = new Set(), timeMaterials = new Set(), pixelMaterials = new Set();
  const { random, normal } = rng(seed + 910177);
  let activeId = 'solar-system', height = 720, dpr = 1;
  const track = resource => { resources.add(resource); return resource; };
  const sphere = track(new THREE.SphereGeometry(1, quality === 'low' ? 64 : quality === 'high' ? 192 : 128, quality === 'low' ? 48 : quality === 'high' ? 128 : 96));
  const uniforms = () => ({ uHeight:{value:height}, uPixelRatio:{value:dpr}, uTime:{value:0} });
  const stage = (id, anchors = []) => {
    const object = new THREE.Group();object.name = id;object.visible = false;
    const item = { object, anchors, stars:0, dust:0, gas:0, stellarMeshes:0, animated:[] };
    stages.set(id, item);group.add(object);return item;
  };
  const attribute = (geo, name, values, width) => geo.setAttribute(name, new THREE.Float32BufferAttribute(values, width));

  function points(parent, samples, foreground = false) {
    const positions=[],colors=[],sizes=[],brightness=[],halos=[];
    for (const s of samples) { positions.push(...s.p);colors.push(...s.c);sizes.push(s.s);brightness.push(s.b ?? 1);halos.push(s.h ?? .06); }
    const geo = track(new THREE.BufferGeometry());
    attribute(geo,'position',positions,3);attribute(geo,'aColor',colors,3);attribute(geo,'aSize',sizes,1);
    attribute(geo,'aBrightness',brightness,1);attribute(geo,'aHalo',halos,1);geo.computeBoundingSphere();
    const mat = track(new THREE.ShaderMaterial({
      uniforms:uniforms(),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
      vertexShader:/* glsl */`
        attribute vec3 aColor;attribute float aSize;attribute float aBrightness;attribute float aHalo;
        uniform float uHeight;uniform float uPixelRatio;
        varying vec3 vColor;varying float vBrightness;varying float vHalo;
        void main(){vec4 p=modelViewMatrix*vec4(position,1.);
          float projected=aSize*uHeight*.5*projectionMatrix[1][1]/max(.08,-p.z);
          gl_PointSize=clamp(projected,.7*uPixelRatio,(aHalo>.2?21.:5.2)*uPixelRatio);
          vColor=aColor;vBrightness=aBrightness;vHalo=aHalo;
          gl_Position=projectionMatrix*p;}
      `,
      fragmentShader:/* glsl */`
        varying vec3 vColor;varying float vBrightness;varying float vHalo;
        void main(){vec2 p=gl_PointCoord*2.-1.;float r2=dot(p,p);if(r2>1.)discard;
          float a=exp(-r2*34.)+vHalo*exp(-r2*4.6);
          gl_FragColor=vec4(vColor*vBrightness,a*smoothstep(1.,.6,r2));
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
    }));pixelMaterials.add(mat);
    const obj = new THREE.Points(geo,mat);obj.name = foreground?'nearby-parallax-stars':'batched-local-stars';obj.renderOrder = foreground?18:4;
    parent.object.add(obj);parent.stars += samples.length;return obj;
  }

  // A single instanced mesh per gas/dust batch: coherent textured wisps, rather
  // than large capped GL points. Billboards preserve soft density at every scale.
  function clouds(parent, samples, dark = false) {
    const base = new THREE.PlaneGeometry(1,1);
    const geo = track(new THREE.InstancedBufferGeometry());
    geo.index=base.index;geo.attributes.position=base.attributes.position;geo.attributes.uv=base.attributes.uv;
    base.dispose();
    const centers=[],sizes=[],colors=[],opacities=[],phases=[],stretch=[];
    for (const s of samples) {
      centers.push(...s.p);sizes.push(s.s);colors.push(...s.c);opacities.push(s.a);phases.push(s.phase ?? random()*100);
      stretch.push(...(s.stretch ?? [1,1]));
    }
    geo.setAttribute('aCenter',new THREE.InstancedBufferAttribute(new Float32Array(centers),3));
    geo.setAttribute('aSize',new THREE.InstancedBufferAttribute(new Float32Array(sizes),1));
    geo.setAttribute('aColor',new THREE.InstancedBufferAttribute(new Float32Array(colors),3));
    geo.setAttribute('aOpacity',new THREE.InstancedBufferAttribute(new Float32Array(opacities),1));
    geo.setAttribute('aPhase',new THREE.InstancedBufferAttribute(new Float32Array(phases),1));
    geo.setAttribute('aStretch',new THREE.InstancedBufferAttribute(new Float32Array(stretch),2));
    geo.instanceCount=samples.length;
    const mat=track(new THREE.ShaderMaterial({
      uniforms:{uTime:{value:0}},transparent:true,depthWrite:false,side:THREE.DoubleSide,
      blending:dark?THREE.NormalBlending:THREE.AdditiveBlending,
      vertexShader:/* glsl */`
        attribute vec3 aCenter;attribute float aSize;attribute vec3 aColor;attribute float aOpacity;
        attribute float aPhase;attribute vec2 aStretch;
        varying vec2 vUv;varying vec3 vColor;varying float vOpacity;varying float vPhase;
        void main(){vUv=uv;vColor=aColor;vOpacity=aOpacity;vPhase=aPhase;
          vec4 center=modelViewMatrix*vec4(aCenter,1.);
          center.xy+=position.xy*aSize*aStretch;
          gl_Position=projectionMatrix*center;}
      `,
      fragmentShader:/* glsl */`
        varying vec2 vUv;varying vec3 vColor;varying float vOpacity;varying float vPhase;
        ${noiseGLSL}
        void main(){vec2 p=vUv*2.-1.;float r2=dot(p,p);if(r2>1.)discard;
          float turbulence=fbm(vec3(p*3.1,vPhase));
          float filaments=fbm(vec3(p.x*12.+turbulence*2.,p.y*5.,vPhase+11.));
          float shape=pow(max(0.,1.-r2),2.2);
          float density=smoothstep(.22,.74,turbulence)*(.28+filaments*.8);
          float opacity=shape*density*vOpacity;
          gl_FragColor=vec4(vColor,opacity);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
    }));
    const obj = new THREE.Mesh(geo,mat);obj.frustumCulled=false;obj.name=dark?'batched-dust-filaments':'batched-nebular-gas';obj.renderOrder=dark?14:8;
    parent.object.add(obj);if(dark)parent.dust+=samples.length;else parent.gas+=samples.length;return obj;
  }

  function addStar(parent, position, radius, color, energy = 1) {
    const mat=track(new THREE.ShaderMaterial({uniforms:{uColor:{value:new THREE.Color(...color)},uEnergy:{value:energy},uTime:{value:0}},
      vertexShader:'varying vec3 vNormal;varying vec3 vView;varying vec3 vPoint;void main(){vec4 p=modelViewMatrix*vec4(position,1.);vNormal=normalMatrix*normal;vView=-p.xyz;vPoint=position;gl_Position=projectionMatrix*p;}',
      fragmentShader:`uniform vec3 uColor;uniform float uEnergy;uniform float uTime;varying vec3 vNormal;varying vec3 vView;varying vec3 vPoint;
      ${noiseGLSL}
      vec2 hash2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}
      float cells(vec2 p){vec2 i=floor(p),f=fract(p);float d=10.;for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 q=vec2(float(x),float(y));d=min(d,length(q+hash2(i+q)-f));}return d;}
      float spot(vec3 p,vec3 center,float size){float r=length(p-normalize(center))/size;float broken=1.+.12*noise3(p*97.);return exp(-r*r*broken);}
      void main(){vec3 p=normalize(vPoint);float mu=max(0.,dot(normalize(vNormal),normalize(vView)));
      vec2 uv=vec2(atan(p.z,p.x)/6.2831853+.5,asin(p.y)/3.14159265+.5);
      float cell=cells(uv*vec2(260.,130.));float detail=1.-smoothstep(.26,.61,cell);
      float anti=1.-smoothstep(.65,2.0,length(fwidth(uv*vec2(260.,130.))));
      float granulation=mix(.84,.74+.24*detail,anti);
      float broad=.94+.10*fbm(p*7.);
      float spots=spot(p,vec3(-.38,.19,-.91),.062)+spot(p,vec3(-.30,.14,-.95),.028)+spot(p,vec3(.38,-.17,-.91),.047);
      float penumbra=spot(p,vec3(-.37,.19,-.91),.104)+spot(p,vec3(.38,-.17,-.91),.072);
      float limb=.40+.60*pow(mu,.5);
      vec3 c=uColor*uEnergy*limb*granulation*broad*(1.-.40*min(1.,penumbra))*(1.-.88*min(1.,spots));
      c+=uColor*.06*max(0.,penumbra-spots)*mu;
      gl_FragColor=vec4(c,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`
    }));timeMaterials.add(mat);const star=new THREE.Mesh(sphere,mat);star.position.set(...position);star.scale.setScalar(radius);parent.object.add(star);parent.stellarMeshes++;
    const glowGeo=track(new THREE.PlaneGeometry(radius*7,radius*7));
    const glowMat=track(new THREE.ShaderMaterial({uniforms:{uColor:{value:new THREE.Color(...color)}},transparent:true,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;vec4 p=modelViewMatrix*vec4(0,0,0,1.);p.xy+=position.xy;gl_Position=projectionMatrix*p;}',
    fragmentShader:'uniform vec3 uColor;varying vec2 vUv;void main(){float r=length(vUv-.5)*7.;float glow=.10*exp(-pow((r-1.05)/.44,2.))+.018*exp(-r*1.2);float edge=smoothstep(1.,1.15,r);gl_FragColor=vec4(uColor,glow*edge);}'
    }));const glow=new THREE.Mesh(glowGeo,glowMat);glow.position.set(...position);glow.renderOrder=3;parent.object.add(glow);return star;
  }
  function ringLine(parent,radius,color,opacity){
    const geo=track(new THREE.RingGeometry(radius-.006,radius+.006,720));
    const mat=track(new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,side:THREE.DoubleSide}));
    const ring=new THREE.Mesh(geo,mat);ring.rotation.x=-Math.PI/2;parent.object.add(ring);return ring;
  }
  function earthTexture() {
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#071d44';ctx.fillRect(0,0,512,256);
    // Recognizable schematic coastlines are hand-defined geographic outlines,
    // generated on a small canvas. This is not a downloaded Earth photograph.
    const land=[
      [[-168,71],[-132,69],[-124,52],[-125,39],[-116,32],[-105,23],[-93,17],[-83,9],[-77,21],[-82,28],[-79,34],[-70,44],[-59,50],[-64,61],[-87,71],[-112,76]],
      [[-80,12],[-70,10],[-59,7],[-48,-1],[-35,-6],[-38,-20],[-50,-31],[-55,-42],[-68,-55],[-75,-45],[-70,-30],[-75,-14],[-81,-3]],
      [[-17,34],[3,37],[11,32],[32,31],[43,12],[50,11],[40,-6],[35,-20],[18,-35],[9,-23],[11,-4],[-4,4],[-17,15]],
      [[-10,36],[-10,44],[3,51],[10,55],[5,61],[20,71],[35,70],[35,59],[45,54],[52,57],[61,53],[72,55],[86,73],[119,73],[139,61],[158,58],[174,66],[180,52],[154,48],[142,37],[129,34],[121,20],[110,20],[103,8],[112,1],[98,-6],[96,17],[85,23],[77,7],[68,22],[57,25],[42,14],[34,29],[27,35],[14,41]],
      [[113,-22],[125,-14],[138,-12],[153,-25],[146,-39],[131,-33],[114,-35]],
      [[-53,60],[-42,61],[-20,75],[-29,83],[-48,82],[-60,70]],
      [[47,-13],[50,-16],[49,-25],[44,-24]], [[130,33],[142,44],[146,42],[139,34]],
    ];
    for(const polygon of land){ctx.beginPath();polygon.forEach(([lon,lat],i)=>{const x=(lon+180)/360*512,y=(90-lat)/180*256;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);});ctx.closePath();ctx.fillStyle='#537750';ctx.fill();}
    // Subtle dry belts and polar caps; alpha preserves the ocean outlines.
    ctx.globalCompositeOperation='source-atop';ctx.globalAlpha=.2;ctx.fillStyle='#d2a16d';ctx.fillRect(0,74,512,36);ctx.globalAlpha=1;
    ctx.globalCompositeOperation='source-over';ctx.fillStyle='#b4c4cd';ctx.fillRect(0,244,512,12);
    const texture=track(new THREE.CanvasTexture(canvas));texture.colorSpace=THREE.SRGBColorSpace;return texture;
  }

  // Solar surfaces, companions, atmosphere and rings share moving parents.
  const solar=stage('solar-system',[]),earthMap=earthTexture();let earthReady=earthAsset?.status==='loaded';
  if(!earthAsset&&typeof document!=='undefined'&&typeof Image!=='undefined'){
    earthAsset={status:'loading',texture:null};earthAsset.texture=new THREE.TextureLoader().load('/assets/earth-blue-marble.jpg',tex=>{tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;earthAsset.status='loaded';},undefined,()=>earthAsset.status='error');
  }
  const solarModel=buildSolarSystem(THREE,{stage:solar,track,sphere,addStar,ringLine,noiseGLSL,earthMap:earthReady?earthAsset.texture:earthMap});

  // ── Alpha Centauri: two Sun-like stars plus a separate faint red dwarf. ──
  const alpha=stage('alpha-centauri',[{key:'alphaAB',position:[0,0,0]},{key:'proxima',position:[8.6,-1.1,-7.5]}]);
  const alphaMembers=[[-2.6,.12,0,.94,[1,.82,.56],1.43],[2.2,-.15,-.8,.663,[1,.56,.26],1.30],[8.6,-1.1,-7.5,.118,[1,.24,.09],.86]].map(([x,y,z,r,c,b])=>{
    const root=new THREE.Group();alpha.object.add(root);root.position.set(x,y,z);
    const holder={object:root,stellarMeshes:0},mesh=addStar(holder,[0,0,0],r,c,b);alpha.stellarMeshes+=holder.stellarMeshes;return {root,mesh,initial:[x,y,z]};
  });
  // A very faint orbital reference deliberately does not pretend the three
  // components have the same physical separation in this compressed stage.
  const binaryReference=ringLine(alpha,2.5,0x6a5a46,.105);binaryReference.scale.z=.76;

  // ── Pleiades: blue stellar cluster and shredded reflection nebulosity. ──
  const pleiades=stage('pleiades',[{key:'pleiades',position:[0,0,0]}]);
  const sisters=[[-3.1,.25,.8],[-1.8,1.35,-.5],[-.45,.1,0],[.7,1.8,-.5],[2.5,.8,.6],[1.3,-1.5,-.7],[-1.0,-1.3,.35]];
  const cluster=sisters.map((p,i)=>({p,c:[.49,.72,1],s:.23+(i%3)*.026,b:1.5,h:.38}));
  for(let i=0;i<Math.round(470*density);i++){
    const radial=Math.pow(random(),.65)*7, a=random()*TWO_PI;
    cluster.push({p:[Math.cos(a)*radial,normal()*1.55,Math.sin(a)*radial*.52],c:random()<.78?[.54,.73,1]:[1,.83,.62],s:.02+random()*.045,b:.3+random()*.6,h:.07});
  }
  // The seven bright members are in the registered observation.
  const reflection=[];
  for(let i=0;i<Math.round(115*density);i++){
    const star=sisters[i%sisters.length], f=random()*2-1;
    reflection.push({p:[star[0]+f*1.6,star[1]+normal()*.65,star[2]+normal()*.5-.3],s:1.8+random()*3.4,c:[.13,.37,.74],a:.085+random()*.09,stretch:[1.2+random()*.7,.4+random()*.6]});
  }
  photograph(pleiades,'/assets/pleiades.jpg',13.4); // reflection filaments actually wrap the observed bright stars

  const crossing=[];
  // Positions around the arrival path give genuine near/far stellar parallax.
  for(let i=0;i<Math.round(70*density);i++){
    const side=i%2?-1:1;
    crossing.push({p:[side*(3.0+random()*7),normal()*3.5,4+random()*12],c:random()<.7?[.56,.76,1]:[1,.82,.61],s:.035+random()*.055,b:.7+random()*.65,h:.09});
  }
  points(pleiades,crossing,true);

  // ── M42: asymmetric ionized wings, central cavity and foreground dust. ──
  const orion=stage('orion-nebula',[{key:'trapezium',position:[-.55,.35,.8]}]);
  const orionGas=[];
  for(let i=0;i<Math.round(250*density);i++){
    const t=random()*TWO_PI;
    const r=1.4+Math.pow(random(),.7)*4.6;
    const right=Math.cos(t)>0;
    const x=Math.cos(t)*r*(right?1.1:.9),y=Math.sin(t)*r*.64+.4*Math.sin(x*.8);
    const central=r<2.5;
    const c=central?[.67,.37,.38]:(right?[.44,.16,.34]:[.52,.22,.24]);
    orionGas.push({p:[x,y,normal()*1.0-1.3],s:2.4+random()*3.5,c,a:.12+random()*.15,stretch:[1.1,.7+random()*.5]});
  }
  for(let i=0;i<Math.round(48*density);i++)orionGas.push({p:[normal()*1.35-.3,normal()*.9+.35,normal()*.35+.2],s:1.5+random()*2.7,c:[.27,.41,.61],a:.08});
  photograph(orion,'/assets/orion-nebula.jpg',13.0);

  const obscuration=[];
  for(let i=0;i<Math.round(95*density);i++){
    const t=random()*2-1,x=t*6.3,y=-.75+.9*Math.sin(t*2.7)+normal()*.23;
    obscuration.push({p:[x,y,1.9+normal()*.35],s:1.5+random()*1.8,c:[.006,.007,.012],a:.30+random()*.29,stretch:[1.15,.42+random()*.45]});
  }
  // The observed dark bay replaces the former regular procedural dust stripe.
  const trapezium=[[-.81,.54,.81],[-.40,.52,.78],[-.68,.20,.82],[-.25,.17,.76]];
  const orionStars=trapezium.map(p=>({p,c:[.67,.79,1],s:.17,b:1.65,h:.28}));
  for(let i=0;i<Math.round(660*density);i++)orionStars.push({p:[normal()*4,normal()*2.9,normal()*2.2],c:random()<.7?[.75,.82,1]:[1,.76,.57],s:.02+random()*.065,b:.3+random()*.65,h:.07});
  points(orion,orionStars.slice(4));

  // Crab: the observed asymmetric fingers, cavities and filament widths share
  // one silhouette, with shallow colour-selected layers rather than a shell cage.
  const crab=stage('crab-nebula',[{key:'pulsar',position:[.15,-.28,.65]}]);
  const pulsar=points(crab,[{p:[.15,-.28,.65],c:[.67,.82,1],s:.10,b:1.35,h:.30}]);pulsar.renderOrder=30;
  function photograph(item,src,width=12){const photo=createObservationStage(THREE,{id:item.object.name,src,width,quality});item.object.add(photo.group);photos.set(item.object.name,photo);return photo;}
  photograph(crab,'/assets/crab-nebula.jpg',12.5);

  // ── Sagittarius A*: illustrative inclined flow and light-bending arcs.
  // This is an explanatory appearance, not a GR ray-traced accretion simulation.
  // No UI light point inside the shadow. Explain it in the station card instead.
  const blackhole=stage('sagittarius-a');
  const ringGeo=track(new THREE.PlaneGeometry(10,10));
  // Composite the dark mask and emission together AFTER the stellar backdrop.
  // A separate opaque sphere was overwritten by transparent sky stars.
  const ringMat=track(new THREE.ShaderMaterial({uniforms:{uTime:{value:0}},transparent:true,depthWrite:false,depthTest:false,blending:THREE.NormalBlending,
    vertexShader:/* glsl */`varying vec2 vUv;void main(){vUv=uv;vec4 p=modelViewMatrix*vec4(0,0,0,1);p.xy+=position.xy;gl_Position=projectionMatrix*p;}`,
    fragmentShader:/* glsl */`
      uniform float uTime;varying vec2 vUv;${noiseGLSL}
      void main(){vec2 p=(vUv-.5)*10.;p.y*=1.045;float r=length(p),a=atan(p.y,p.x);
        if(r>4.8)discard;
        // Use periodic directions everywhere; fractional atan harmonics caused
        // the old hard seam across the left half of the ring.
        vec2 orbit=vec2(cos(a),sin(a));
        float gas=fbm(vec3(orbit*(5.+r*1.4),r*5.-uTime*.04));
        // An inclined disk, upper light-bending image and faint lower image.
        // This is a visual explanation, not a fitted Sgr A* inclination.
        vec2 diskP=vec2(p.x,(p.y+.13)/.23);float diskR=length(diskP);
        float diskGas=fbm(vec3(diskP*2.8,uTime*.04));
        float disk=exp(-pow((diskR-2.65)/.78,2.));
        disk*=smoothstep(1.7,2.0,diskR)*(.62+.75*diskGas);
        disk*=.92+.08*sin(diskR*24.+diskGas*10.-uTime*.07);
        float beam=.45+1.35*(1.-smoothstep(-3.,3.,p.x));
        float shadow=1.-smoothstep(1.65,1.73,r);
        float front=1.-smoothstep(-.22,.02,p.y);
        float visibleDisk=disk*(1.-shadow*(1.-front));
        float ridge=1.79+.025*cos(a*2.)+.035*(gas-.45);
        float arc=exp(-pow((r-ridge)/(.12+.055*gas),2.));
        arc*=.13+.87*smoothstep(-.05,.65,p.y);
        float detail=.68+.48*gas;
        float innerArc=exp(-pow((r-1.68)/.030,2.))*(.06+.12*beam);
        float halo=.024*exp(-pow((r-1.87)/.42,2.));
        vec3 ember=vec3(.83,.13,.022),gold=vec3(1.3,.65,.24),hot=vec3(1.5,1.18,.79);
        vec3 c=gold*visibleDisk*beam+mix(ember,gold,clamp(beam*.55,0.,1.))*arc*detail*beam;
        c+=hot*innerArc+ember*halo;
        float gasAlpha=clamp(visibleDisk*1.3+arc*1.2+innerArc+halo,0.,1.);
        float alpha=max(shadow,gasAlpha)*(1.-smoothstep(4.35,4.8,r));
        gl_FragColor=vec4(c,alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  }));timeMaterials.add(ringMat);
  const photonRing=new THREE.Mesh(ringGeo,ringMat);photonRing.name='Asymmetric gas and opaque shadow composite';photonRing.renderOrder=50;photonRing.frustumCulled=false;blackhole.object.add(photonRing);
  const centralStars=[];
  for(let i=0;i<Math.round(330*density);i++){
    const r=7+Math.pow(random(),.7)*25,a=random()*TWO_PI;
    centralStars.push({p:[Math.cos(a)*r,normal()*9,Math.sin(a)*r-12],c:random()<.8?[1,.68,.41]:[.66,.78,1],s:.025+random()*.055,b:.3+random()*.7,h:.08});
  }
  points(blackhole,centralStars);

  // Sparse common celestial background has fixed points in 3D, not a static
  // screen texture, so foreground stars and the distant field parallax properly.
  const background=stage('background');background.object.visible=true;
  const field=[];
  for(let i=0;i<Math.round(1650*density);i++){
    const z=random()*2-1,a=random()*TWO_PI,r=95+random()*300,horizontal=Math.sqrt(1-z*z);
    field.push({p:[Math.cos(a)*horizontal*r,z*r,Math.sin(a)*horizontal*r],c:random()<.8?[.60,.68,.83]:[.89,.72,.54],s:.06+random()*.17,b:.2+random()*.65,h:.04});
  }
  points(background,field);

  function resolve(id) { if(SOLAR_IDS.includes(id))return 'solar-system';return aliases[String(id).toLowerCase()] ?? id; }
  function setDestination(id) {
    const next=resolve(id);if(!stages.has(next)&&records.has(next)){const item=stage(next,[{key:next,position:[0,0,.3]}]);photograph(item,records.get(next).image.src,13);}
    if(!stages.has(next)||next==='background')return;photos.get(next)?.load();
    activeId=next;for(const [key,item] of stages)item.object.visible=key===next||key==='background';
  }
  function update(sceneTime=0) {
    solarModel.update(sceneTime);
    // Illustrative A/B orbital phase (real period about 79.9 y). The much more
    // distant Proxima is held at its separately compressed display position.
    const binaryPhase=sceneTime*TWO_PI/ALPHA_DISPLAY_ORBIT_SECONDS;
    for(const [i,m]of alphaMembers.entries()){if(i<2){const [px,y,pz]=m.initial,x=px+.43,z=pz+.36;m.root.position.set(-.43+x*Math.cos(binaryPhase)+z*Math.sin(binaryPhase),y,-.36-x*Math.sin(binaryPhase)+z*Math.cos(binaryPhase));}m.mesh.rotation.y=sceneTime*TWO_PI/(i===2?500:380);}
    if(!earthReady&&earthAsset?.status==='loaded'){solar.object.traverse(o=>{if(o.material?.uniforms?.uEarth?.value===1)o.material.uniforms.uMap.value=earthAsset.texture;});earthReady=true;}
    for(const photo of photos.values())photo.update(sceneTime);
    for(const material of timeMaterials)material.uniforms.uTime.value=sceneTime;
    for(const item of stages.values())for(const a of item.animated)a.obj.rotation[a.axis]=sceneTime*a.speed;
  }
  function resize(nextHeight,nextDpr=1) {
    height=nextHeight;dpr=nextDpr;
    for(const material of pixelMaterials){material.uniforms.uHeight.value=height;material.uniforms.uPixelRatio.value=dpr;}
  }
  function getCounts(id=activeId) {
    const item=stages.get(resolve(id)) ?? stages.get(activeId);
    return {starCount:item.stars+background.stars,dustCount:item.dust,gasCount:item.gas,stellarMeshCount:item.stellarMeshes};
  }
  function getAnchors(id=activeId) { if(resolve(id)==='solar-system')return solarModel.getAnchors();return (stages.get(resolve(id))?.anchors ?? []).map(a=>({...a,position:[...a.position]})); }
  const poses={
    // The camera opens from Earth's sunward hemisphere: the procedural ocean,
    // continents and cloud cover remain readable, with the Sun on the left.
    'solar-system':{entry:[1.8,2.3,-5.2],hold:[-10.2,7.1,-16],exit:[-14,9.5,-22],target:[.5,0,.2],entryTarget:[1.8,0,.5]},
    'alpha-centauri':{entry:[-5,3,17],hold:[1.4,2.5,15],exit:[4.6,3.7,19],target:[1.1,0,-.4]},
    'pleiades':{entry:[-.6,.5,20],hold:[-.15,.2,18],exit:[.6,.4,21],target:[0,.1,0]},
    'orion-nebula':{entry:[-.65,.5,20],hold:[.15,.2,18],exit:[.65,.5,21],target:[-.2,.15,0]},
    'crab-nebula':{entry:[-3.8,2.8,20],hold:[1.1,2.0,17.5],exit:[4.4,2.6,20],target:[0,0,0]},
    'sagittarius-a':{entry:[-2.7,2.0,16],hold:[.6,1.35,12.8],exit:[2.3,2.3,17],target:[0,0,0]},
  };
  const lerp=(a,b,f)=>a.map((v,i)=>v+(b[i]-v)*f);
  const smooth=t=>{const s=Math.min(1,Math.max(0,t));return s*s*s*(s*(s*6-15)+10);};
  function getPose(id=activeId,progress=.5) {
    const spec=poses[resolve(id)] ?? {entry:[-.5,.4,20],hold:[.15,.2,18],exit:[.5,.4,21],target:[0,0,0]};
    const p=Math.min(1,Math.max(0,progress));
    let position,target=[...spec.target];
    if(p<.3){const f=smooth(p/.3),holdStart=[spec.hold[0]-.25,spec.hold[1],spec.hold[2]+.12];position=lerp(spec.entry,holdStart,f);if(spec.entryTarget)target=lerp(spec.entryTarget,spec.target,f);}
    else if(p<.74){
      // Ten seconds of almost-stationary framing during the introduction.
      const f=smooth((p-.3)/.44);position=[spec.hold[0]+(f-.5)*.5,spec.hold[1]+Math.sin(f*Math.PI)*.08,spec.hold[2]-(f-.5)*.24];
    } else position=lerp([spec.hold[0]+.25,spec.hold[1],spec.hold[2]-.12],spec.exit,smooth((p-.74)/.26));
    return {position,target};
  }
  setDestination(activeId);
  return {
    group,setDestination,update,resize,getCounts,getPose,getAnchors,
    getBodyPosition:id=>solarModel.getPosition(id),getBodyRadius:id=>solarModel.getRadius(id),getPickMeshes:()=>activeId==='solar-system'?solarModel.pickMeshes:[],getMotionState:()=>solarModel.getMotionState(),
    getAssetStates(){return {earth:earthReady?'loaded':'loading',...Object.fromEntries([...photos].map(([id,p])=>[id,p.status]))};},
    preload(id){photos.get(id)?.load();},
    get starCount(){return getCounts().starCount;},get dustCount(){return getCounts().dustCount;},
    dispose(){disposed=true;for(const p of photos.values())p.dispose();photos.clear();for(const resource of resources)resource.dispose();group.clear();stages.clear();timeMaterials.clear();pixelMaterials.clear();},
  };
}

