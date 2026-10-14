// Fixed celestial directions, camera-centred translation: no false local orbit.
// Anonymous galaxy lights are an artistic backdrop, not a measured sky catalog.
export function createDeepSky(THREE,{quality='medium',seed=731928}={}){
 let s=seed>>>0;const random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};const stars=quality==='low'?6000:quality==='high'?14000:10000,galaxies=quality==='low'?140:260,count=stars+galaxies;
 const p=[],color=[],sizes=[],kinds=[],angles=[];
 for(let i=0;i<count;i++){const z=random()*2-1,a=random()*Math.PI*2,r=Math.sqrt(1-z*z);p.push(r*Math.cos(a)*10000,z*10000,r*Math.sin(a)*10000);const bright=random(),gal=i>=stars;
  color.push(...(gal?[.91,.74,.53]:bright<.3?[.55,.74,1]:[.94,.90,.80]));sizes.push(gal?5+random()**3*22:.8+random()**5*2.8);kinds.push(gal?1+random():0);angles.push(random()*6.283);}
 const geo=new THREE.BufferGeometry();for(const [key,array,width]of [['position',p,3],['aColor',color,3],['aSize',sizes,1],['aKind',kinds,1],['aAngle',angles,1]])geo.setAttribute(key,new THREE.Float32BufferAttribute(array,width));
 const mat=new THREE.ShaderMaterial({uniforms:{uDpr:{value:1},uOpacity:{value:1}},vertexShader:`attribute vec3 aColor;attribute float aSize,aKind,aAngle;uniform float uDpr;varying vec3 vColor;varying float vKind,vAngle;void main(){vColor=aColor;vKind=aKind;vAngle=aAngle;gl_PointSize=aSize*uDpr;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform float uOpacity;varying vec3 vColor;varying float vKind,vAngle;void main(){vec2 uv=gl_PointCoord*2.-1.;float c=cos(vAngle),s=sin(vAngle);uv=mat2(c,-s,s,c)*uv;float d=dot(uv,uv),alpha;if(vKind>0.){vec2 q=uv*vec2(1.,vKind>1.5?3.2:1.65);float r=length(q),a=atan(q.y,q.x);alpha=exp(-r*r*6.)*.7+exp(-r*r*17.)*.5;if(vKind<1.5)alpha*=.76+.24*sin(a*2.-r*13.);}else{alpha=exp(-d*9.); }alpha*=smoothstep(1.,.68,d)*uOpacity;gl_FragColor=vec4(vColor,alpha);#include <tonemapping_fragment>\n#include <colorspace_fragment>}`,transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending});
 mat.fragmentShader=mat.fragmentShader.replace(';#include',';\n#include');
 // Infinite reference sky: keep the local camera's original depth precision.
 mat.vertexShader=mat.vertexShader.replace('gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);','gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position.z=gl_Position.w*.9999;');
 const points=new THREE.Points(geo,mat);points.frustumCulled=false;points.renderOrder=-20;points.name='Fixed stellar and anonymous distant-galaxy backdrop';
 return {group:points,starCount:stars,galaxyCount:galaxies,update(camera,opacity=1,dpr=1){points.position.copy(camera.position);mat.uniforms.uOpacity.value=opacity;mat.uniforms.uDpr.value=dpr;},dispose(){geo.dispose();mat.dispose();}};
}
