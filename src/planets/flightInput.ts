export class LocalFlightInput{
 readonly keys=new Set<string>();lookX=0;lookY=0;
 clear(){this.keys.clear();this.lookX=this.lookY=0;}
}
export const localFlightInput=new LocalFlightInput();
export const localFlightCodes=new Set(['KeyW','KeyS','KeyA','KeyD','Space','KeyC','ShiftLeft','ShiftRight','KeyB']);
