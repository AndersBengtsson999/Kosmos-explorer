import {useMemo,useRef,useState} from 'react';
import {useFrame} from '@react-three/fiber';
import {Color,Group,Mesh,ShaderMaterial,Vector3} from 'three';
import {spatialCatalog} from '../data/spatial';
import type {Star} from '../data/catalog';
import {useStore} from '../state';
import {angularDiameter,radiusInfo,sphereBlend,stellarColor} from '../math/stellar';
// Camera-relative coordinates are computed in double precision before GPU upload.
export function NearStars(){
 const stars=useStore(s=>s.stars),index=useMemo(()=>spatialCatalog(stars),[stars]),[near,setNear]=useState<number[]>([]),last=useRef('');
 useFrame(({camera})=>{const next=index.close(camera.position.toArray()).map(s=>s.index),key=next.join(',');if(key!==last.current){last.current=key;setNear(next);}});
 return <>{near.map(i=>stars[i]&&<NearStar key={stars[i].id} star={stars[i]}/>)}</>;
}
function NearStar({star}:{star:Star}){
 const group=useRef<Group>(null),mesh=useRef<Mesh>(null),glow=useRef<Mesh>(null),relative=useMemo(()=>new Vector3(),[]);
 useFrame(({camera})=>{if(!mesh.current||!group.current||!glow.current||!star)return;const r=radiusInfo(star).ly;relative.fromArray(star.position).sub(camera.position);const blend=sphereBlend(angularDiameter(r,relative.length()));group.current.visible=blend>0;if(!blend)return;
 // Unit sphere and camera-space distance scaled by radius avoid float32 cancellation.
 relative.applyQuaternion(camera.quaternion.clone().invert()).divideScalar(r);
 group.current.position.copy(relative);mesh.current.quaternion.copy(camera.quaternion).invert();
 (mesh.current.material as ShaderMaterial).uniforms.opacity.value=blend;
 (glow.current.material as ShaderMaterial).uniforms.opacity.value=blend;
 });
 if(!star)return null;
 return <group ref={group}><mesh ref={glow} frustumCulled={false} renderOrder={9} raycast={()=>{}}><planeGeometry args={[2.8,2.8]}/><shaderMaterial transparent depthTest={false} depthWrite={false} uniforms={{opacity:{value:0},tint:{value:new Color(stellarColor(star))}}} vertexShader={`varying vec2 uvp;void main(){uvp=uv;gl_Position=projectionMatrix*modelMatrix*vec4(position,1.);}`} fragmentShader={`uniform float opacity;uniform vec3 tint;varying vec2 uvp;void main(){float r=length(uvp-.5)*2.8;float halo=exp(-max(0.,r-1.)*12.)*.12*(1.-smoothstep(1.2,1.4,r));gl_FragColor=vec4(tint,halo*opacity);}`}/></mesh><mesh ref={mesh} frustumCulled={false} renderOrder={10} raycast={()=>{}}>
 <sphereGeometry args={[1,48,32]}/><shaderMaterial transparent depthTest={false} depthWrite={false} uniforms={{opacity:{value:0},tint:{value:new Color(stellarColor(star))}}} vertexShader={`varying vec3 n;varying vec3 p;void main(){n=mat3(modelMatrix)*normal;p=position;vec4 v=modelMatrix*vec4(position,1.);gl_Position=projectionMatrix*v;}`} fragmentShader={`uniform float opacity;uniform vec3 tint;varying vec3 n;varying vec3 p;void main(){float grain=sin(p.x*93.)*sin(p.y*107.)*sin(p.z*83.);float limb=.65+.35*abs(n.z);gl_FragColor=vec4(tint*(limb+grain*.025),opacity);}`}/></mesh></group>;
}
