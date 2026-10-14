// Scene time is independent of the 160-second camera timeline. Hidden pages and
// pauses establish a new timestamp; no accumulated background time is replayed.
export function createSceneClock({time=0,paused=false,maxStep=.08}={}){
 let last=null;
 return {get time(){return time;},get paused(){return paused;},setPaused(value){paused=Boolean(value);last=null;},tick(now,visible=true){if(!visible){last=null;return 0;}const dt=last===null?0:Math.max(0,Math.min(maxStep,(now-last)/1000));last=now;if(!paused)time+=dt;return paused?0:dt;}};
}
export const GALAXY_DISPLAY_RADIANS_PER_SECOND=.008;
export const ALPHA_DISPLAY_ORBIT_SECONDS=600;
// Rounded real parameters; animation periods are comfortable illustrative seconds.
// Axes tilted beyond 90° express retrograde Venus/Uranus without reversing twice.
export const SOLAR_SPECS=[
 {id:'sun',radiusKm:695700,spinHours:609.6,spinSec:360,radius:1.15,tilt:7.25},
 {id:'mercury',radiusKm:2439.7,au:.387,orbitDays:88.0,spinHours:1407.6,orbitSec:300,spinSec:540,r:2.2,radius:.075,phase:2.45,tilt:.034,color:0x87807a},
 {id:'venus',radiusKm:6051.8,au:.723,orbitDays:224.7,spinHours:5832.5,orbitSec:480,spinSec:780,r:3.8,radius:.19,phase:-.5,tilt:177.36,color:0xbcb095},
 {id:'earth',radiusKm:6371,au:1,orbitDays:365.2,spinHours:23.934,orbitSec:720,spinSec:180,r:5.8,radius:.34,phase:.524,tilt:23.44,color:0x316cb1},
 {id:'moon',radiusKm:1737.4,earthDistanceKm:385000,orbitDays:27.3,spinHours:655.7,orbitSec:60,spinSec:60,r:.91,radius:.093,phase:1.25,tilt:5.145,parent:'earth',color:0x97938b},
 {id:'mars',radiusKm:3389.5,au:1.524,orbitDays:687.0,spinHours:24.623,orbitSec:1080,spinSec:195,r:7.6,radius:.14,phase:2,tilt:25.19,color:0xa2583b},
 {id:'jupiter',radiusKm:69911,au:5.203,orbitDays:4331,spinHours:9.925,orbitSec:1800,spinSec:90,r:10.6,radius:.67,phase:3.8,tilt:3.13,color:0xa78660},
 {id:'saturn',radiusKm:58232,au:9.537,orbitDays:10747,spinHours:10.7,orbitSec:2400,spinSec:120,r:14,radius:.54,phase:.83,tilt:26.73,color:0xb7a074},
 {id:'uranus',radiusKm:25362,au:19.19,orbitDays:30589,spinHours:17.24,orbitSec:3200,spinSec:150,r:18,radius:.30,phase:2.15,tilt:97.77,color:0x74bfc5},
 {id:'neptune',radiusKm:24622,au:30.07,orbitDays:59800,spinHours:16.11,orbitSec:4000,spinSec:160,r:22,radius:.29,phase:-.88,tilt:28.32,color:0x386dbc}
];
export const SOLAR_IDS=SOLAR_SPECS.map(s=>s.id);
// v5: clearer motion, without changing real scientific parameters or resetting time.
for(const s of SOLAR_SPECS){s.spinSec/=2;if(s.orbitSec)s.orbitSec/=s.id==='moon'?2:3;}
