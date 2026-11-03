import type {Planet} from './model';
const rad=Math.PI/180;
/** Fixed osculating elements, two-body propagation. Render axes: (ecliptic X,Z,-Y). */
export function orbitalPosition(p:Planet,days:number):[number,number,number]{
 const m=((p.mean*rad+2*Math.PI*days/p.period)%(2*Math.PI)+2*Math.PI)%(2*Math.PI);
 let E=m;for(let n=0;n<20;n++){const step=(E-p.e*Math.sin(E)-m)/(1-p.e*Math.cos(E));E-=step;if(Math.abs(step)<1e-13)break;}
 const x=p.a*(Math.cos(E)-p.e),y=p.a*Math.sqrt(1-p.e*p.e)*Math.sin(E);
 const w=p.peri*rad,o=p.node*rad,i=p.i*rad;
 const u=Math.cos(w)*x-Math.sin(w)*y,v=Math.sin(w)*x+Math.cos(w)*y;
 return [Math.cos(o)*u-Math.sin(o)*v*Math.cos(i),v*Math.sin(i),-(Math.sin(o)*u+Math.cos(o)*v*Math.cos(i))];
}
export function advanceDays(days:number,delta:number,rate:number,paused:boolean){return paused?days:days+Math.min(Math.max(delta,0),.1)*rate;}
