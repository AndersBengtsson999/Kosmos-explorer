import {StarCloud} from './StarCloud';
import {Canvas} from '@react-three/fiber';
import {Line} from '@react-three/drei';
import {Component,memo,type ReactNode} from 'react';
import {useStore} from '../state';
import {useFrame} from '@react-three/fiber';
import {useMemo,useEffect} from 'react';
import {BufferAttribute,BufferGeometry,Line as ThreeLine,LineBasicMaterial} from 'three';
import {Navigation} from '../navigation/Navigation';
class Boundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true};}render(){return this.state.failed?<div className="fallback">3D-vyn kunde inte starta. Aktivera WebGL i webbläsaren. Sökning och katalogen är fortfarande tillgängliga.</div>:this.props.children;}}
function DestinationLine(){
 const stars=useStore(s=>s.stars),id=useStore(s=>s.journey.active?s.travel.id:s.selected);
 const target=useMemo(()=>stars.find(star=>star.id===id),[stars,id]);
 const positions=useMemo(()=>new BufferAttribute(new Float32Array(6),3),[]);
 const line=useMemo(()=>{const geometry=new BufferGeometry();geometry.setAttribute('position',positions);const line=new ThreeLine(geometry,new LineBasicMaterial({color:'#65988e',transparent:true,opacity:.3}));line.frustumCulled=false;return line;},[positions]);
 useEffect(()=>()=>{line.geometry.dispose();line.material.dispose();},[line]);
 useFrame(({camera})=>{if(target){positions.setXYZ(0,camera.position.x,camera.position.y-.15,camera.position.z);positions.setXYZ(1,...target.position);positions.needsUpdate=true;}});
 return <primitive object={line}/>;
}
function Scene(){const showScale=useStore(s=>s.showScale),showAxes=useStore(s=>s.showAxes);
 return <><color attach="background" args={['#070c16']}/><Navigation/>{showScale&&<gridHelper args={[100,20,'#203047','#121e30']} position={[0,-0.02,0]}/>}{showAxes&&<><Line points={[[0,0,0],[10,0,0]]} color="#a76f6f"/><Line points={[[0,0,0],[0,0,-10]]} color="#73a084"/><Line points={[[0,0,0],[0,10,0]]} color="#738fae"/></>}<DestinationLine/>
 <StarCloud/></>;
}
const initialCamera = {position:[24,16,30] as [number,number,number],fov:55,near:0.01,far:100000};
export const Universe=memo(function Universe(){return <Boundary><Canvas camera={initialCamera} dpr={[1,1.75]} fallback={<div className="fallback">WebGL saknas. Katalogen kan fortfarande utforskas via sökningen.</div>}><Scene/></Canvas></Boundary>;});
