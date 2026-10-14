// Real heliocentric positions and separately scaled local cameras never share
// coordinates. The bridge camera follows the real map; render-target blending
// communicates the change of scale rather than pretending this is physical speed.
export const TOUR_DURATION = 160;
export const OVERVIEW_POSITION = [112, 74, 82];
export const smooth = value => { const x = Math.max(0, Math.min(1, value)); return x*x*x*(x*(x*6-15)+10); };
const mix = (a,b,f) => a.map((v,i)=>v+(b[i]-v)*f);
export function createTour(destinations, positions) {
  const stations = destinations.map((destination,index) => {
    const start=index===0?0:22+(index-1)*24;
    const arrival=index===0?6:8;
    return {id:destination.id,index,start,holdStart:start+arrival,holdEnd:start+arrival+10,end:start+arrival+16};
  });
  const offsets = [[.035,.05,.08],[-.04,.065,.09],[-.22,.18,.36],[.38,.32,.65],[-.65,.5,1.1],[.06,.06,.1]];
  const nodes=[];
  stations.forEach((s,i)=>{
    const target=positions[s.id],position=target.map((v,j)=>v+offsets[i][j]);
    if(i===0)nodes.push({time:0,position,target});
    nodes.push({time:s.holdStart,position,target},{time:s.holdEnd,position,target});
  });
  nodes.push({time:TOUR_DURATION,position:OVERVIEW_POSITION,target:[0,0,0]});
  function worldPose(time){
    const right=nodes.findIndex(n=>n.time>time);
    if(right<0)return {position:[...OVERVIEW_POSITION],target:[0,0,0]};
    if(right===0)return nodes[0];
    const a=nodes[right-1],b=nodes[right],f=smooth((time-a.time)/(b.time-a.time));
    return {position:mix(a.position,b.position,f),target:mix(a.target,b.target,f)};
  }
  function getFrame(time){
    const elapsed=Math.min(TOUR_DURATION,Math.max(0,time));
    const station=stations.find(s=>elapsed<s.end)??stations[5];
    const phase=elapsed>=142?'pullback':elapsed<station.holdStart?'arrival':elapsed<station.holdEnd?'hold':'departure';
    let localWeight=0,progress=1;
    if(elapsed<142){
      if(elapsed<station.holdStart){const f=(elapsed-station.start)/(station.holdStart-station.start);localWeight=station.index===0?1:smooth(f);progress=.3*f;}
      else if(elapsed<station.holdEnd){localWeight=1;progress=.3+.44*(elapsed-station.holdStart)/10;}
      else{const f=(elapsed-station.holdEnd)/6;localWeight=1-smooth(f);progress=.74+.26*f;}
    }
    return {station,phase,localWeight,progress,worldPose:worldPose(elapsed),holdRemaining:phase==='hold'?station.holdEnd-elapsed:0};
  }
  return {duration:TOUR_DURATION,stations,getFrame,worldPose};
}

