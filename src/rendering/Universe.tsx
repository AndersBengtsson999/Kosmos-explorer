import {Canvas} from '@react-three/fiber';
import {Html,Line} from '@react-three/drei';
import {Component,memo,type ReactNode} from 'react';
import {useStore} from '../state';
import {color} from '../math/coordinates';
import {useFrame} from '@react-three/fiber';
import {useRef} from 'react';
import {Vector3,BufferGeometry} from 'three';
import {Navigation} from '../navigation/Navigation';
class Boundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true};}render(){return this.state.failed?<div className="fallback">3D-vyn kunde inte starta. Aktivera WebGL i webbläsaren. Sökning och katalogen är fortfarande tillgängliga.</div>:this.props.children;}}
function DestinationLine(){
 const geometry=useRef<BufferGeometry>(null);
 useFrame(({camera})=>{const state=useStore.getState();const target=state.stars.find(star=>star.id===(state.journey.active?state.travel.id:state.selected));if(target&&geometry.current)geometry.current.setFromPoints([camera.position.clone().add(new Vector3(0,-.15,0)),new Vector3(...target.position)]);});
 return <line><bufferGeometry ref={geometry}/><lineBasicMaterial color="#65988e" transparent opacity={.3}/></line>;
}
function Scene(){const showScale=useStore(s=>s.showScale),showAxes=useStore(s=>s.showAxes);const stars=useStore(s=>s.stars),selected=useStore(s=>s.selected),select=useStore(s=>s.select),go=useStore(s=>s.go);
 return <><color attach="background" args={['#070c16']}/><Navigation/>{showScale&&<gridHelper args={[100,20,'#203047','#121e30']} position={[0,-0.02,0]}/>}{showAxes&&<><Line points={[[0,0,0],[10,0,0]]} color="#a76f6f"/><Line points={[[0,0,0],[0,0,-10]]} color="#73a084"/><Line points={[[0,0,0],[0,10,0]]} color="#738fae"/>{[[[10,0,0],'ICRS X · RA 0°'],[[0,0,-10],'ICRS Y · RA 90°'],[[0,10,0],'ICRS Z · nord']].map(([p,label])=><Html key={String(label)} position={p as [number,number,number]}><span className="star-label">{String(label)}</span></Html>)}</>}<DestinationLine/>
 {stars.map(s=><group key={s.id} position={s.position}><mesh onClick={e=>{e.stopPropagation();select(s.id);}} onDoubleClick={e=>{e.stopPropagation();go(s.id);}}><sphereGeometry args={[s.id==='sun'?0.22:0.12,12,8]}/><meshBasicMaterial color={s.id==='sun'?'#ffe5a0':color(s.bpRp)}/></mesh>{(s.id==='sun'||s.name==='Proxima Centauri'||s.name==='Barnards stjärna'||s.id===selected)&&<><mesh><sphereGeometry args={[0.32,16,12]}/><meshBasicMaterial color="#81d9cc" wireframe transparent opacity={0.35}/></mesh><Html center position={[0,0.65,0]} style={{pointerEvents:'none'}}><span className="star-label">{s.name}</span></Html></>}</group>)}</>;
}
const initialCamera = {position:[24,16,30] as [number,number,number],fov:55,near:0.01,far:100000};
export const Universe=memo(function Universe(){return <Boundary><Canvas camera={initialCamera} dpr={[1,1.75]} fallback={<div className="fallback">WebGL saknas. Katalogen kan fortfarande utforskas via sökningen.</div>}><Scene/></Canvas></Boundary>;});
