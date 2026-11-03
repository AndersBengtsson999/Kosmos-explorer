import {formatDistance} from '../math/distanceFormat';
import {useMemo,useState} from 'react';
import {useStore} from '../state';
import {categories,discover,fact,type Category} from '../data/discovery';
import {distance} from '../math/coordinates';
export function Discover({close}:{close:()=>void}){
 const stars=useStore(s=>s.stars);const [category,setCategory]=useState<Category>('nearest'),[page,setPage]=useState(0),[origin,setOrigin]=useState(()=>useStore.getState().position);
 const results=useMemo(()=>discover(stars,category,origin),[stars,category,origin]);const current=Math.min(page,Math.max(0,Math.ceil(results.length/10)-1));
 return <section className="discover panel" aria-label="Upptäck stjärnor"><button className="discover-close" onClick={close} aria-label="Stäng Upptäck">×</button><h2>Upptäck</h2><label>Kategori <select value={category} onChange={e=>{setCategory(e.target.value as Category);setOrigin([...useStore.getState().position]);setPage(0);}}>{Object.entries(categories).map(([key,label])=><option value={key} key={key}>{label}</option>)}</select></label><p className="muted">Ur den inlästa katalogen, inte hela himlen. {category==='brightest'?'Skenbar ljusstyrka i G-bandet, sedd från solsystemet.':category==='planets'?'Begränsat verifierat urval: Proxima b och d.':category==='largest'?'Endast radier med angiven källa visas.':category==='hottest'?'Effektiv temperatur är en modellskattning.':''}</p>{category==='nearby'&&<button onClick={()=>{setOrigin([...useStore.getState().position]);setPage(0);}}>Uppdatera från min position</button>}
 {!results.length&&<p role="status">Tillräckliga verifierade uppgifter saknas i denna katalog.</p>}
 {results.slice(current*10,current*10+10).map(star=><article className="discovery-item" key={star.id}><strong>{star.name}</strong><small>{formatDistance(distance(star.position,category==='nearby'?origin:undefined))} från {category==='nearby'?'din valda position':'solen'} · {fact(star,category)}</small><div><button onClick={()=>{useStore.getState().select(star.id);close();}}>Visa</button><button onClick={()=>{useStore.getState().go(star.id);close();}}>Res dit ↗</button></div></article>)}<nav className="pagination"><button disabled={!current} onClick={()=>setPage(current-1)}>Föregående</button><span>{results.length?current+1:0} / {Math.ceil(results.length/10)}</span><button disabled={(current+1)*10>=results.length} onClick={()=>setPage(current+1)}>Visa fler</button></nav>
 </section>;
}
