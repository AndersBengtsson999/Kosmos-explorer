import type {FlightModel} from './flight';
import {localFlightInput} from './flightInput';
import {systemFor} from './model';
import {create} from 'zustand';
export const usePlanetStore=create<{flight:boolean;flightModel:FlightModel;cruiseAU:number;acceleration:number;braking:boolean;speedMs:number;nearestName:string;nearestAU:number;surfaceStop:boolean;targetKind:'planet'|'star';labels:{id:string;name:string;x:number;y:number}[];host:string|null;selected:string;days:number;paused:boolean;rate:number;enlarged:boolean;request:number;cancel:number;travelPaused:boolean;active:boolean;progress:number;remaining:number;distance:number;arrived:boolean}>(()=>({flight:false,flightModel:'exploration',cruiseAU:.1,acceleration:1000,braking:false,speedMs:0,nearestName:'',nearestAU:0,surfaceStop:false,targetKind:'planet',labels:[],host:null,selected:'399',days:0,paused:true,rate:1,enlarged:false,request:0,cancel:0,travelPaused:false,active:false,progress:0,remaining:0,distance:0,arrived:false}));

export function openPlanetSystem(hostId:string,planetId?:string){
 const system=systemFor(hostId);if(!system)return;
 const selected=system.planets.find(p=>p.id===planetId)?.id??system.defaultPlanetId??system.planets[0].id;
 localFlightInput.clear();
 usePlanetStore.setState({flight:false,braking:false,speedMs:0,surfaceStop:false,nearestName:'',nearestAU:0,targetKind:'planet',host:hostId,selected,labels:[],days:0,enlarged:false,request:0,cancel:0,active:false,arrived:false,progress:0,paused:true,travelPaused:false,rate:1,remaining:0,distance:0});
}
