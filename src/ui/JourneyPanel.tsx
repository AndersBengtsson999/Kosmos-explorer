import {useStore} from '../state';
import {distance} from '../math/coordinates';
export function JourneyPanel(){
 const s=useStore();const destination=s.stars.find(star=>star.id===s.travel.id);
 if(!s.journey.active)return s.journey.arrived?<div className="arrival-notice panel" role="status">Framme vid {destination?.name} · 3 ljusår från stjärnan <button onClick={s.aim}>Rikta mot destination</button><button aria-label="Stäng ankomstmeddelande" onClick={()=>useStore.setState({journey:{...s.journey,arrived:false}})}>×</button></div>:null;
 return <section className="travel-status panel" aria-label="Pågående resa">
  <span role="status">{s.journey.paused?'Pausad':'På väg till'} · {destination?.name}</span>
  <small>{s.journey.remaining.toFixed(2)} ljusår kvar till ankomst · {destination?distance(destination.position,s.position).toFixed(2):'—'} till stjärnan</small>
  <progress aria-label="Resans förlopp" max="1" value={s.journey.progress}/>
  <div className="journey-actions"><button onClick={s.togglePause}>{s.journey.paused?'Återuppta':'Pausa'}</button><button onClick={s.cancelTravel}>Avbryt resa</button><button onClick={s.aim}>Rikta mot destination</button></div>
  <small>Dra för att titta omkring · färdvägen ändras inte</small>
 </section>;
}
