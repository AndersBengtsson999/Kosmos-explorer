import {create} from 'zustand';
import {catalog,mergeCatalog,type Star} from './data/catalog';
import type {Vec3} from './math/coordinates';
import {flightInput} from './navigation/flightInput';
interface State {catalogStatus:string;catalogError:boolean;showOverview:boolean;
 journey:{active:boolean;progress:number;paused:boolean;remaining:number;arrived:boolean};duration:number;
 cancelRequest:number;aimRequest:number;stopRequest:number;
 cancelTravel:()=>void;aim:()=>void;stop:()=>void;togglePause:()=>void;setDuration:(duration:number)=>void;
 setJourney:(active:boolean,progress:number,remaining?:number,arrived?:boolean)=>void;
 stars:Star[];selected:string;mode:'map'|'ship';speed:number;position:Vec3;forward:Vec3;velocity:Vec3;moving:boolean;
 indicator:{x:number;y:number;visible:boolean;behind:boolean;angle:number};
 travel:{id:string;nonce:number};showScale:boolean;showAxes:boolean;
 select:(id:string)=>void;go:(id:string)=>void;setMode:(mode:'map'|'ship')=>void;setSpeed:(speed:number)=>void;
 telemetry:(position:Vec3,moving:boolean,forward?:Vec3,velocity?:Vec3,indicator?:State['indicator'])=>void;
 resetCatalog:()=>void;importStars:(stars:Star[])=>void;
}
export const useStore=create<State>((set)=>({catalogStatus:`Lokal startkatalog · ${catalog.length-1} stjärnor`,catalogError:false,showOverview:true,
 journey:{active:false,progress:0,paused:false,remaining:0,arrived:false},duration:20,
 cancelRequest:0,aimRequest:0,stopRequest:0,showScale:false,showAxes:false,
 cancelTravel:()=>set(s=>({cancelRequest:s.cancelRequest+1})),aim:()=>set(s=>({aimRequest:s.aimRequest+1})),
 stop:()=>{flightInput.clear();set(s=>({speed:0,stopRequest:s.stopRequest+1,journey:{...s.journey,paused:s.journey.active}}));},
 togglePause:()=>set(s=>({journey:{...s.journey,paused:!s.journey.paused}})),
 setDuration:duration=>{if([10,20,40,60].includes(duration))set({duration});},
 setJourney:(active,progress,remaining=0,arrived=false)=>set(s=>({journey:{active,progress,remaining,arrived,paused:active?s.journey.paused:false}})),
 stars:catalog,selected:'sun',mode:'map',speed:2,position:[24,16,30],forward:[0,0,-1],velocity:[0,0,0],moving:false,
 indicator:{x:0,y:0,visible:true,behind:false,angle:0},travel:{id:'sun',nonce:0},
 select:selected=>set(s=>({selected,journey:{...s.journey,arrived:false}})),go:id=>set(s=>({selected:id,journey:{...s.journey,paused:false,arrived:false},travel:{id,nonce:s.travel.nonce+1}})),
 setMode:mode=>{flightInput.clear();set({mode});},setSpeed:speed=>set({speed}),
 telemetry:(position,moving,forward,velocity,indicator)=>set(s=>({position,moving,forward:forward??s.forward,velocity:velocity??s.velocity,indicator:indicator??s.indicator})),
 resetCatalog:()=>set(s=>({stars:catalog,selected:'sun',journey:{...s.journey,paused:false},travel:{id:'sun',nonce:s.travel.nonce+1}})),
 importStars:stars=>set(s=>({stars:mergeCatalog(stars),selected:'sun',journey:{...s.journey,paused:false},travel:{id:'sun',nonce:s.travel.nonce+1}})),
}));
