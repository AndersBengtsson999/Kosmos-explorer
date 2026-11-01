export type Vec3 = [number,number,number];
export const PC_TO_LY=3.261563777;
// ICRS axes: X toward RA 0°, Y toward RA 90°, Z north. Render: (X,Z,-Y).
export function position(ra:number,dec:number,parallax:number):Vec3 {
 const a=ra*Math.PI/180,d=dec*Math.PI/180,r=1000/parallax*PC_TO_LY;
 return [r*Math.cos(d)*Math.cos(a),r*Math.sin(d),-r*Math.cos(d)*Math.sin(a)];
}
export function distance(a:Vec3,b:Vec3=[0,0,0]){return Math.hypot(...a.map((n,i)=>n-b[i]));}
export function color(bpRp:number|null){if(bpRp===null)return '#e6e8ed'; return bpRp<0?'#9bbcff':bpRp<0.7?'#dce8ff':bpRp<1.3?'#fff0c2':bpRp<2?'#ffc58c':'#ff9c70';}
