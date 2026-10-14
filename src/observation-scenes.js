// Observed 2-D detail with shallow artistic depth. Camera motion must stay near
// the image normal. No layer is presented as measured 3-D gas or orbital data.
const texturePool=new Map();
export function createObservationStage(THREE,{id,src,width=12,aspect=1,quality='medium',kind='nebula',maxHeight=12}){
  const group=new THREE.Group();group.name=`observation-${id}`;
  const resources=[],materials=[];let disposed=false,status='idle',loadedAt=0,opacity=1;
  const empty=new THREE.DataTexture(new Uint8Array([0,0,0,0]),1,1);empty.needsUpdate=true;resources.push(empty);
  const geo=new THREE.PlaneGeometry(width,width/aspect,quality==='low'?24:64,quality==='low'?20:48);resources.push(geo);
  const vertex=`uniform sampler2D uMap;uniform float uDepth;varying vec2 vUv;
  void main(){vUv=uv;vec3 p=position;vec3 c=texture2D(uMap,uv).rgb;
  float shape=dot(c,vec3(.25,.5,.25));p.z+=uDepth*(shape-.25);
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;
  const fragment=`uniform sampler2D uMap;uniform float uLayer;uniform float uReady;uniform float uTime;uniform float uKind;varying vec2 vUv;
  void main(){vec4 tex=texture2D(uMap,vUv);vec3 c=tex.rgb;
    float light=max(c.r,max(c.g,c.b));float edge=min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y));
    float feather=smoothstep(0.,.12,edge);float faint=smoothstep(.002,.065,light);
    float opacity=feather*faint;
    if(uLayer>.5){float warm=smoothstep(-.01,.13,c.r-c.b*.7);
      float detail=smoothstep(.035,.4,light);opacity*=warm*detail*.19;
      c*=1.05;
    }else if(uLayer<-.5){opacity*=.14;c*=.65;}
    // Tiny coherent variation belongs to the illustrative depth layers only.
    if(abs(uLayer)>.5)opacity*=.985+.015*sin(uTime*.13+vUv.x*5.);
    gl_FragColor=vec4(c,clamp(opacity*uReady,0.,1.));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;
  for(const [index,z] of [-.8,0,.42].entries()){
    const layer=index===0?-1:index===1?0:1;
    const mat=new THREE.ShaderMaterial({uniforms:{uMap:{value:empty},uDepth:{value:index===1?.22:.08},uLayer:{value:layer},uReady:{value:0},uTime:{value:0},uKind:{value:kind==='cluster'?1:0}},vertexShader:vertex,fragmentShader:fragment,transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:index===1?THREE.NormalBlending:THREE.AdditiveBlending});
    const mesh=new THREE.Mesh(geo,mat);mesh.position.z=z;mesh.renderOrder=20+index;mesh.frustumCulled=false;group.add(mesh);materials.push(mat);resources.push(mat);
  }
  let poolEntry;
  function accept(tex,instant=false){if(disposed)return;tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
    const ratio=tex.image.width/tex.image.height,fit=Math.min(1,maxHeight/(width/ratio));group.scale.x=fit;group.scale.y=aspect/ratio*fit;
    for(const m of materials)m.uniforms.uMap.value=tex;loadedAt=instant?0:performance.now();status='loaded';
  }
  function load(){if(status!=='idle')return;if(typeof Image==='undefined'){status='deferred';return;}status='loading';
    poolEntry=texturePool.get(src);
    if(poolEntry){poolEntry.refs++;if(poolEntry.status==='loaded')accept(poolEntry.texture,true);else poolEntry.listeners.push(accept);return;}
    poolEntry={refs:1,status:'loading',listeners:[accept],texture:null};texturePool.set(src,poolEntry);
    const entry=poolEntry;entry.texture=new THREE.TextureLoader().load(src,tex=>{entry.status='loaded';for(const listener of entry.listeners)listener(tex);entry.listeners=[];},undefined,()=>{entry.status='error';if(!disposed)status='error';});
  }
  return {group,load,setOpacity(value){opacity=value;},get status(){return status;},update(time){for(const m of materials){m.uniforms.uTime.value=time;m.uniforms.uReady.value=status==='loaded'?opacity*Math.min(1,(performance.now()-loadedAt)/700):0;}},dispose(){disposed=true;if(poolEntry&&--poolEntry.refs===0){poolEntry.texture.dispose();texturePool.delete(src);}for(const r of new Set(resources))r.dispose();group.clear();}};
}
