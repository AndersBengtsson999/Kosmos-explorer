import {formatDistance} from '../math/distanceFormat';
import {useStore} from '../state';
import {position,distance} from '../math/coordinates';
const centre=position(266.4051,-28.936175,1000);
export function Overview(){
 const s=useStore(),target=s.stars.find(star=>star.id===(s.journey.active?s.travel.id:s.selected))!;
 if(!s.showOverview)return null;
 const radius=Math.max(10,distance(s.position),distance(target.position))*1.2;
 const xy=(p:number[])=>[100+p[0]/radius*72,95+p[2]/radius*72];const ship=xy(s.position),goal=xy(target.position);
 const length=Math.hypot(centre[0],centre[2]);
 return <section className="overview panel" aria-label="Navigeringsöversikt"><div className="overview-title">Översikt <button aria-label="Dölj översikt" onClick={()=>useStore.setState({showOverview:false})}>×</button></div>
 <svg viewBox="0 0 200 180" role="img" aria-label="Solen, din position, destinationen och riktningen mot Vintergatans centrum"><circle cx="100" cy="95" r="70" fill="none" stroke="#283c4f"/><path d="M20 95H180M100 15V165" stroke="#213347"/><line x1="100" y1="95" x2={100+centre[0]/length*65} y2={95+centre[2]/length*65} stroke="#9d7da7" strokeDasharray="3 3"/><text x="10" y="16" fill="#b99fc4" fontSize="8">GC: RA 266,405° / Dec −28,936°</text><line x1={ship[0]} y1={ship[1]} x2={goal[0]} y2={goal[1]} stroke="#6dada2"/><circle cx="100" cy="95" r="3" fill="#ffe2a3"/><text x="105" y="91" fill="#d8c29d" fontSize="9">Solen</text><circle cx={ship[0]} cy={ship[1]} r="4" fill="#9ce9da"/><text x={ship[0]+6} y={ship[1]+12} fill="#9ce9da" fontSize="9">Du</text><path d={`M${goal[0]} ${goal[1]-5}l5 5 -5 5 -5 -5Z`} fill="none" stroke="#d8eff1"/><text x="10" y="175" fill="#849eb4" fontSize="8">X → · −Y ↓ (ICRS) · radie {radius.toFixed(0)} ljusår</text></svg>
 <small>{formatDistance(distance(s.position))} från solen<br/>Nordhöjd (ICRS Z): {s.position[1]<0?'−':''}{formatDistance(Math.abs(s.position[1]))}</small></section>;
}
