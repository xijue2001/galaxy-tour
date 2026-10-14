// Independent 28px hit boxes, never an aggregate. Leaders retain the projected
// display-map anchor while this deterministic relaxation separates hit regions.
export function separateMarkers(points,width,height,gap=40,bounds={top:116,bottom:138}){
 const nodes=points.filter(p=>p.visible).map(p=>({...p,anchorX:p.x,anchorY:p.y}));
 const clamp=n=>{n.x=Math.max(18,Math.min(width-18,n.x));n.y=Math.max(bounds.top,Math.min(height-bounds.bottom,n.y));};
 for(const n of nodes)clamp(n);
 for(let step=0;step<50;step++){
  let collided=false;
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
   const a=nodes[i],b=nodes[j];let x=b.x-a.x,y=b.y-a.y,d=Math.hypot(x,y);
   if(d>=gap)continue;collided=true;
   if(d<.01){const angle=(i*2.399+j)*1.77;x=Math.cos(angle);y=Math.sin(angle);d=1;}
   const move=(gap-d)*.52;a.x-=x/d*move;a.y-=y/d*move;b.x+=x/d*move;b.y+=y/d*move;
  }
  for(const n of nodes)clamp(n);if(!collided)break;
 }
 return nodes;
}
