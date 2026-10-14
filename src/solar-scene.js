import {SOLAR_SPECS} from './motion.js';
const TAU=Math.PI*2;
export function buildSolarSystem(THREE,{stage,track,sphere,addStar,ringLine,noiseGLSL,earthMap}){
 const bodies=new Map(),pickMeshes=[],moonOrbit=new THREE.Group(),moonPlane=new THREE.Group();
 const solar=stage.object;
 const vertex=`varying vec2 vUv;varying vec3 vNormal;varying vec3 vPosition;varying vec3 vLocal;
 void main(){vUv=uv;vNormal=normalize(mat3(modelMatrix)*normal);vPosition=(modelMatrix*vec4(position,1.)).xyz;vLocal=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
 const fragment=`uniform sampler2D uMap;uniform float uEarth;uniform float uPlanet;uniform vec3 uColor;uniform float uTime;
 varying vec2 vUv;varying vec3 vNormal;varying vec3 vPosition;varying vec3 vLocal;${noiseGLSL}
 void main(){vec3 n=normalize(vNormal),sunDirection=normalize(-vPosition);float day=max(0.,dot(n,sunDirection));vec3 base=uColor;
 if(uEarth>.5){base=texture2D(uMap,vec2(fract(vUv.x+.04),vUv.y)).rgb;float cloud=smoothstep(.57,.73,fbm(vLocal*8.+vec3(uTime*.001,0,0)));base=mix(base,vec3(.74,.81,.87),cloud*.64);}
 else if(uPlanet>7.5){float terrain=fbm(vLocal*42.);float maria=exp(-pow(length(normalize(vLocal)-normalize(vec3(1.,.12,.3)))/.64,2.));base*=.57+.57*terrain;base*=1.-.38*maria;float pits=smoothstep(.37,.43,noise3(vLocal*93.));base*=.85+.15*pits;}
 else if(uPlanet>5.5){float bands=.94+.06*sin(vLocal.y*34.+fbm(vLocal*7.)*3.);base*=bands*(.86+.16*fbm(vLocal*9.));}
 else if(uPlanet>3.5){float bands=sin(vLocal.y*47.+fbm(vLocal*5.)*4.);base=mix(uColor*.90,vec3(.90,.78,.63),.5+.18*bands);float eye=exp(-pow((vLocal.y+.24)/.10,2.)-pow((vLocal.x-.45)/.24,2.));if(uPlanet<4.5)base=mix(base,vec3(.61,.24,.13),eye*.65);}
 else if(uPlanet<.5){base*=.60+.67*fbm(vLocal*38.);}
 else if(uPlanet<1.5){base=mix(uColor,vec3(.84,.77,.59),fbm(vLocal*7.));}
 else{base*=.52+.69*fbm(vLocal*9.);base=mix(base,vec3(.83,.79,.69),smoothstep(.88,.99,abs(vLocal.y)));}
 vec3 view=normalize(cameraPosition-vPosition);float limb=pow(max(0.,dot(n,view)),.22);vec3 c=base*(.026+day*1.35)*(.65+.35*limb);
 if(uEarth>.5){float sea=smoothstep(.02,.13,base.b-base.r);float spec=pow(max(0.,dot(reflect(-sunDirection,n),view)),35.);c+=vec3(.24,.31,.40)*spec*sea*day;}
 gl_FragColor=vec4(c,1.);#include <tonemapping_fragment>
 #include <colorspace_fragment>}`.replace('1.);#include','1.);\n#include');
 const planetIndices={mercury:0,venus:1,earth:2,mars:3,jupiter:4,saturn:5,uranus:6,neptune:7,moon:8};
 for(const spec of SOLAR_SPECS){
  const root=new THREE.Group(),axis=new THREE.Group();root.name=spec.id;axis.name=`${spec.id}-axis`;root.add(axis);solar.add(root);let mesh;
  axis.rotation.z=THREE.MathUtils.degToRad(spec.tilt||0);
  if(spec.id==='sun'){const holder={object:axis,stellarMeshes:0};mesh=addStar(holder,[0,0,0],spec.radius,[1,.84,.54],1.58);stage.stellarMeshes+=holder.stellarMeshes;}
  else{
   const material=track(new THREE.ShaderMaterial({uniforms:{uMap:{value:earthMap},uEarth:{value:spec.id==='earth'?1:0},uPlanet:{value:planetIndices[spec.id]},uColor:{value:new THREE.Color(spec.color)},uTime:{value:0}},vertexShader:vertex,fragmentShader:fragment}));
   mesh=new THREE.Mesh(sphere,material);mesh.scale.setScalar(spec.radius);axis.add(mesh);
   if(spec.id!=='moon')ringLine(stage,spec.r,spec.id==='earth'?0x82a6c9:0x526179,spec.id==='earth'?.19:.095);
  }
  mesh.name=`surface-${spec.id}`;mesh.userData.bodyId=spec.id;pickMeshes.push(mesh);bodies.set(spec.id,{spec,root,axis,mesh});
 }
 const earth=bodies.get('earth'),moon=bodies.get('moon');earth.root.add(moonPlane);moonPlane.rotation.x=THREE.MathUtils.degToRad(moon.spec.tilt);moonPlane.add(moonOrbit);moonOrbit.add(moon.root);moon.root.position.set(moon.spec.r,0,0);moon.axis.rotation.set(0,Math.PI,0);
 const moonReference=ringLine({object:moonPlane},moon.spec.r,0x6c819b,.11);moonReference.name='moon-orbit-reference';
 const atmosphereMat=track(new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.BackSide,
  vertexShader:`varying vec3 vNormal;varying vec3 vView;void main(){vec4 p=modelViewMatrix*vec4(position,1.);vNormal=normalMatrix*normal;vView=-p.xyz;gl_Position=projectionMatrix*p;}`,
  fragmentShader:`varying vec3 vNormal;varying vec3 vView;void main(){float rim=pow(1.-abs(dot(normalize(vNormal),normalize(vView))),3.);gl_FragColor=vec4(.1,.42,.8,rim*.43);}`}));
 const atmosphere=new THREE.Mesh(sphere,atmosphereMat);atmosphere.name='earth-atmosphere';atmosphere.scale.setScalar(earth.spec.radius*1.018);earth.axis.add(atmosphere);
 const saturn=bodies.get('saturn'),ringGeo=track(new THREE.RingGeometry(.68,1.2,480,5));
 const ringMat=track(new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,
  vertexShader:`varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec3 p;void main(){float r=length(p.xy),gap=1.-.75*exp(-pow((r-.93)/.026,2.));float bands=.78+.22*sin(r*220.);gl_FragColor=vec4(vec3(.55,.47,.33)*bands,.36*gap);#include <tonemapping_fragment>
  #include <colorspace_fragment>}`.replace(');#include',');\n#include')}));
 const rings=new THREE.Mesh(ringGeo,ringMat);rings.name='saturn-rings';rings.rotation.x=-Math.PI/2;saturn.axis.add(rings);
 const localPosition=id=>{solar.updateMatrixWorld(true);return bodies.get(id)?.root.getWorldPosition(new THREE.Vector3()).toArray();};
 function update(time){for(const b of bodies.values()){
  if(b.spec.id==='moon')continue;
  if(b.spec.r){const a=b.spec.phase+time*TAU/b.spec.orbitSec;b.root.position.set(Math.cos(a)*b.spec.r,0,Math.sin(a)*b.spec.r);}
  // x=cos(a), z=sin(a) gives orbital angular momentum along -Y. Use
  // that same sign for prograde spin; >90° axial tilt supplies retrograde spin.
  b.mesh.rotation.y=-time*TAU/b.spec.spinSec;if(b.mesh.material.uniforms?.uTime)b.mesh.material.uniforms.uTime.value=time;
 }moonOrbit.rotation.y=-(moon.spec.phase+time*TAU/moon.spec.orbitSec);solar.updateMatrixWorld(true);}
 update(0);
 return {bodies,pickMeshes,update,getPosition:localPosition,getRadius:id=>bodies.get(id)?.spec.radius,
  getAnchors(){return SOLAR_SPECS.map(s=>({key:s.id,bodyId:s.id,position:localPosition(s.id)}));},
  getMotionState(){const ep=earth.root.getWorldPosition(new THREE.Vector3()),mp=moon.root.getWorldPosition(new THREE.Vector3()),face=new THREE.Vector3(1,0,0).applyQuaternion(moon.mesh.getWorldQuaternion(new THREE.Quaternion()));return {positions:Object.fromEntries(SOLAR_SPECS.map(s=>[s.id,localPosition(s.id)])),spinAngles:Object.fromEntries(SOLAR_SPECS.map(s=>[s.id,s.id==='moon'?moonOrbit.rotation.y+Math.PI:bodies.get(s.id).mesh.rotation.y])),moonFacingDot:face.dot(ep.sub(mp).normalize()),atmosphereParent:atmosphere.parent.name,ringsParent:rings.parent.name,moonParent:moon.root.parent.parent.parent.name};}
 };
}
