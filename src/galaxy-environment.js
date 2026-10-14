import {createObservationStage} from './observation-scenes.js';
export function createGalaxyEnvironment(THREE,{catalog,quality}){
 const group=new THREE.Group();group.name='stable-extragalactic-environment';group.visible=false;
 const items=new Map();
 for(const d of catalog.filter(d=>d.scope==='extragalactic')){
  const anchor=new THREE.Group();anchor.position.fromArray(d.display.position);group.add(anchor);
  const photo=createObservationStage(THREE,{id:d.id,src:d.image.src,width:d.display.width,maxHeight:54,quality,kind:'galaxy'});anchor.add(photo.group);items.set(d.id,{anchor,photo});
 }
 return {group,setOpacity(value){group.visible=value>.002;for(const {photo}of items.values())photo.setOpacity(value);},show(visible){group.visible=visible;if(visible)for(const {photo}of items.values())photo.load();},update(time,camera){if(!group.visible)return;for(const {anchor,photo}of items.values()){anchor.lookAt(camera.position);photo.update(time);}},get states(){return Object.fromEntries([...items].map(([id,{photo}])=>[id,photo.status]));},dispose(){for(const {photo}of items.values())photo.dispose();group.clear();}};
}
