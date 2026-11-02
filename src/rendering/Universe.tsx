import {StarCloud} from './StarCloud';
import {Canvas} from '@react-three/fiber';
import {Line} from '@react-three/drei';
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
 return <><color attach="background" args={['#070c16']}/><Navigation/>{showScale&&<gridHelper args={[100,20,'#203047','#121e30']} position={[0,-0.02,0]}/>}{showAxes&&<><Line points={[[0,0,0],[10,0,0]]} color="#a76f6f"/><Line points={[[0,0,0],[0,0,-10]]} color="#73a084"/><Line points={[[0,0,0],[0,10,0]]} color="#738fae"/></>}<DestinationLine/>
 <StarCloud/></>;
}
const initialCamera = {position:[24,16,30] as [number,number,number],fov:55,near:0.01,far:100000};
export const Universe=memo(function Universe(){return <Boundary><Canvas camera={initialCamera} dpr={[1,1.75]} fallback={<div className="fallback">WebGL saknas. Katalogen kan fortfarande utforskas via sökningen.</div>}><Scene/></Canvas></Boundary>;});
