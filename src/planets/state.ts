import {systemFor} from './model';
import {create} from 'zustand';
export const usePlanetStore=create<{labels:{id:string;name:string;x:number;y:number}[];host:string|null;selected:string;days:number;paused:boolean;rate:number;enlarged:boolean;request:number;cancel:number;travelPaused:boolean;active:boolean;progress:number;remaining:number;distance:number;arrived:boolean}>(()=>({labels:[],host:null,selected:'399',days:0,paused:true,rate:1,enlarged:false,request:0,cancel:0,travelPaused:false,active:false,progress:0,remaining:0,distance:0,arrived:false}));

export function openPlanetSystem(hostId:string,planetId?:string){
 const system=systemFor(hostId);if(!system)return;
 const selected=system.planets.find(p=>p.id===planetId)?.id??system.defaultPlanetId??system.planets[0].id;
 usePlanetStore.setState({host:hostId,selected,labels:[],days:0,enlarged:false,request:0,cancel:0,active:false,arrived:false,progress:0,paused:true,travelPaused:false,rate:1,remaining:0,distance:0});
}
