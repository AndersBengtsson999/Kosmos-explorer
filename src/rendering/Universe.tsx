import {Canvas} from '@react-three/fiber';
import {Html,Line} from '@react-three/drei';
import {Component,type ReactNode} from 'react';
import {useStore} from '../state';
import {color} from '../math/coordinates';
import {Navigation} from '../navigation/Navigation';
class Boundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true};}render(){return this.state.failed?<div className="fallback">3D-vyn kunde inte starta. Aktivera WebGL i webbläsaren. Sökning och katalogen är fortfarande tillgängliga.</div>:this.props.children;}}
function Scene(){const stars=useStore(s=>s.stars),selected=useStore(s=>s.selected),select=useStore(s=>s.select),go=useStore(s=>s.go);const chosen=stars.find(s=>s.id===selected)!;
 return <><color attach="background" args={['#070c16']}/><Navigation/><gridHelper args={[100,20,'#203047','#121e30']} position={[0,-0.02,0]}/>{chosen.id!=='sun'&&<Line points={[[0,0,0],chosen.position]} color="#4f9d96" transparent opacity={0.5} dashed dashSize={0.4} gapSize={0.25}/>}
 {stars.map(s=><group key={s.id} position={s.position}><mesh onClick={e=>{e.stopPropagation();select(s.id);}} onDoubleClick={e=>{e.stopPropagation();go(s.id);}}><sphereGeometry args={[s.id==='sun'?0.22:0.12,12,8]}/><meshBasicMaterial color={s.id==='sun'?'#ffe5a0':color(s.bpRp)}/></mesh>{(s.id==='sun'||s.name==='Proxima Centauri'||s.name==='Barnards stjärna'||s.id===selected)&&<><mesh><sphereGeometry args={[0.32,16,12]}/><meshBasicMaterial color="#81d9cc" wireframe transparent opacity={0.35}/></mesh><Html center position={[0,0.65,0]} style={{pointerEvents:'none'}}><span className="star-label">{s.name}</span></Html></>}</group>)}</>;
}
export function Universe(){return <Boundary><Canvas camera={{position:[24,16,30],fov:55,near:0.01,far:100000}} dpr={[1,1.75]} fallback={<div className="fallback">WebGL saknas. Katalogen kan fortfarande utforskas via sökningen.</div>}><Scene/></Canvas></Boundary>;}
