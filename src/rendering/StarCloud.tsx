import {spatialCatalog} from '../data/spatial';
import {stellarColor} from '../math/stellar';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {BufferAttribute,BufferGeometry,Color,Matrix4,ShaderMaterial,Vector3} from 'three';
import {useStore} from '../state';
export const renderMetrics={frames:[] as number[],drawCalls:0,points:0,geometries:0};
export function StarCloud(){
 const stars=useStore(s=>s.stars),{camera,gl}=useThree(),previous=useRef(0);
 const geometry=useMemo(()=>{
  const indices=new Float32Array(stars.length);
  const positions=new Float32Array(stars.length*3),colors=new Float32Array(stars.length*3),magnitudes=new Float32Array(stars.length);
  stars.forEach((star,i)=>{indices[i]=i;positions.set(star.position,i*3);const c=new Color(stellarColor(star));colors.set(c.toArray(),i*3);magnitudes[i]=star.id==='sun'?0:star.mag??12;});
  const geometry=new BufferGeometry();geometry.setAttribute('starIndex',new BufferAttribute(indices,1));geometry.setAttribute('position',new BufferAttribute(positions,3));geometry.setAttribute('color',new BufferAttribute(colors,3));geometry.setAttribute('magnitude',new BufferAttribute(magnitudes,1));geometry.computeBoundingSphere();return geometry;
 },[stars]);
 const material=useMemo(()=>new ShaderMaterial({vertexColors:true,transparent:true,depthWrite:false,uniforms:{pixelRatio:{value:gl.getPixelRatio()},nearIndex:{value:new Float32Array(8).fill(-1)},nearBlend:{value:new Float32Array(8)}},vertexShader:`
 attribute float starIndex;uniform float nearIndex[8];uniform float nearBlend[8];attribute float magnitude; varying vec3 starColor; varying float brightness; uniform float pixelRatio;
 void main(){vec4 p=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*p;
 float luminance=clamp(pow(10.0,-0.12*(magnitude-4.0)),0.18,1.0);
 brightness=luminance;for(int i=0;i<8;i++){if(abs(starIndex-nearIndex[i])<.5)brightness*=1.-nearBlend[i];}starColor=color;
 gl_PointSize=clamp((5.0-0.18*magnitude)*pow(40.0/max(0.1,-p.z),0.18),1.0,6.0)*pixelRatio;
 }`,fragmentShader:`varying vec3 starColor;varying float brightness;
 void main(){float r=length(gl_PointCoord-vec2(0.5))*2.0;if(r>1.0)discard;gl_FragColor=vec4(starColor,brightness*smoothstep(1.0,0.3,r));}`}),[gl]);
 useEffect(()=>()=>{geometry.dispose();},[geometry]);useEffect(()=>()=>material.dispose(),[material]);
 const spatial=useMemo(()=>spatialCatalog(stars),[stars]);
 useFrame(()=>{const close=spatial.close(camera.position.toArray());material.uniforms.nearIndex.value.fill(-1);material.uniforms.nearBlend.value.fill(0);close.forEach((s,i)=>{material.uniforms.nearIndex.value[i]=s.index;material.uniforms.nearBlend.value[i]=s.blend;});const now=performance.now();if(previous.current){renderMetrics.frames.push(now-previous.current);if(renderMetrics.frames.length>600)renderMetrics.frames.shift();}previous.current=now;renderMetrics.drawCalls=gl.info.render.calls;renderMetrics.points=stars.length;renderMetrics.geometries=gl.info.memory.geometries;});
 useEffect(()=>{
  let downX=0,downY=0;const point=new Vector3(),matrix=new Matrix4();
  const down=(e:PointerEvent)=>{downX=e.clientX;downY=e.clientY;};
  const pick=(event:MouseEvent,travel=false)=>{
   if(Math.hypot(event.clientX-downX,event.clientY-downY)>5)return;
   const rect=gl.domElement.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;
   camera.updateMatrixWorld();matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
   let best=-1,score=64,depth=Infinity;
   for(let i=0;i<stars.length;i++){
    point.fromArray(stars[i].position).applyMatrix4(matrix);
    if(point.z< -1||point.z>1||Math.abs(point.x)>1||Math.abs(point.y)>1)continue;
    const d=((point.x+1)*rect.width/2-x)**2+((1-point.y)*rect.height/2-y)**2;
    if(d<score||(d===score&&point.z<depth)){score=d;depth=point.z;best=i;}
   }
   if(best>=0){const state=useStore.getState();travel?state.go(stars[best].id):state.select(stars[best].id);}
  };
  const click=(event:MouseEvent)=>pick(event),double=(event:MouseEvent)=>pick(event,true);
  gl.domElement.addEventListener('pointerdown',down);gl.domElement.addEventListener('click',click);gl.domElement.addEventListener('dblclick',double);
  return()=>{gl.domElement.removeEventListener('pointerdown',down);gl.domElement.removeEventListener('click',click);gl.domElement.removeEventListener('dblclick',double);};
 },[stars,camera,gl]);
 return <points geometry={geometry} material={material} raycast={()=>{}}/>;
}
