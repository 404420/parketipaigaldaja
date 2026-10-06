import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { options } from './state.js';
import { floorTexture } from './floor.js';
export function createRoom(container,initial,onError) {
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  container.append(renderer.domElement);renderer.domElement.setAttribute('aria-label','3D elutuba valitud parketi, seinte ja mööbliga');renderer.domElement.setAttribute('role','img');
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();onError();});
  const world=new THREE.Scene();world.background=new THREE.Color('#e5dfd3');
  const camera=new THREE.PerspectiveCamera(43,1,.1,60);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.enablePan=false;controls.minPolarAngle=.18;controls.maxPolarAngle=Math.PI/2-.12;controls.minAzimuthAngle=.12;controls.maxAzimuthAngle=1.43;controls.minDistance=4;controls.maxDistance=16;
  // Mobile keeps native page scrolling; use the accessible viewpoint buttons there.
  if(matchMedia('(pointer: coarse)').matches){controls.enabled=false;renderer.domElement.style.touchAction='pan-y';}
  world.add(new THREE.HemisphereLight('#fff8e7','#a39882',1.45));
  const sunlight=new THREE.DirectionalLight('#fff3d8',2);sunlight.position.set(-3,7,3);sunlight.castShadow=true;sunlight.shadow.mapSize.set(1024,1024);sunlight.shadow.camera.left=-7;sunlight.shadow.camera.right=7;sunlight.shadow.camera.top=7;sunlight.shadow.camera.bottom=-7;sunlight.shadow.normalBias=.035;sunlight.shadow.bias=-.00015;world.add(sunlight);
  const fill=new THREE.DirectionalLight('#dce7ed',.8);fill.position.set(4,4,-3);world.add(fill);
  const wallMat=new THREE.MeshStandardMaterial({color:'#eee8dc',roughness:.94});
  const fabric=new THREE.MeshStandardMaterial({color:'#e4dccb',roughness:.95});
  const oak=new THREE.MeshStandardMaterial({color:'#a87d4c',roughness:.65});
  const dark=new THREE.MeshStandardMaterial({color:'#343c31',roughness:.75});
  const ceramic=new THREE.MeshStandardMaterial({color:'#ded3bd',roughness:.85});
  const floorMat=new THREE.MeshStandardMaterial({roughness:.82,metalness:0});
  let group=new THREE.Group();world.add(group);let floorMap=null,current=initial;
  function box(w,h,d,x,y,z,material,parent=group){const geometry=material===fabric?new RoundedBoxGeometry(w,h,d,3,Math.min(w,h,d)*.28):new THREE.BoxGeometry(w,h,d);const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  function cylinder(r1,r2,h,x,y,z,mat,parent=group){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,32),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  function sofa(x,z,rotation=0,small=false){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;group.add(g);const w=small?.85:2.5;
    box(w,.25,.85,0,.37,0,fabric,g);box(w,.55,.2,0,.76,-.36,fabric,g);
    box(.16,.4,.9,-w/2,.62,0,fabric,g);box(.16,.4,.9,w/2,.62,0,fabric,g);
    const seats=small?1:3;for(let i=0;i<seats;i++){box((w-.12)/seats-.025,.13,.7,-w/2+.06+(i+.5)*(w-.12)/seats,.56,.02,fabric,g);box((w-.18)/seats-.035,.36,.13,-w/2+.09+(i+.5)*(w-.18)/seats,.79,-.21,fabric,g);}
    for(const px of [-w/2+.12,w/2-.12])for(const pz of [-.3,.3])cylinder(.026,.023,.23,px,.13,pz,dark,g);
  }
  function build(d){
    world.remove(group);group.traverse(o=>{if(o.geometry)o.geometry.dispose();});group=new THREE.Group();world.add(group);
    const w=d.width,l=d.length,h=2.65;
    floorMap?.dispose();floorMap=new THREE.CanvasTexture(floorTexture(d));floorMap.colorSpace=THREE.SRGBColorSpace;floorMap.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);floorMat.map=floorMap;floorMat.bumpMap=floorMap;floorMat.bumpScale=.008;floorMat.needsUpdate=true;
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(w,l),floorMat);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;group.add(floor);
    box(w,.12,l,0,-.075,0,oak);box(w,h,.12,0,h/2,-l/2,wallMat);
    // Side wall with a real window opening and physical frames.
    const winWidth=l*.47,winHeight=1.7,winZ=-l*.1;
    box(.12,.6,l,-w/2,.3,0,wallMat);box(.12,.35,l,-w/2,h-.175,0,wallMat);
    const leftLen=winZ-winWidth/2+l/2,rightLen=l/2-winZ-winWidth/2;
    box(.12,winHeight,leftLen,-w/2,1.45,-l/2+leftLen/2,wallMat);box(.12,winHeight,rightLen,-w/2,1.45,l/2-rightLen/2,wallMat);
    const windowMat=new THREE.MeshStandardMaterial({color:'#e2e9df',emissive:'#d5e1d9',emissiveIntensity:.4,roughness:.2});
    box(.035,winHeight,winWidth,-w/2-.04,1.45,winZ,windowMat);
    for(const yy of [.6,2.3])box(.2,.055,winWidth+.1,-w/2+.035,yy,winZ,ceramic);
    for(const zz of [winZ-winWidth/2,winZ,winZ+winWidth/2])box(.19,winHeight,.05,-w/2+.035,1.45,zz,ceramic);
    box(w,.075,.045,0,.06,-l/2+.075,ceramic);box(.045,.075,l,-w/2+.075,.06,0,ceramic);
    const scale=Math.min(w/5,l/4,1);const sx=Math.max(-.1,w/2-1.65),sz=-l/2+.74;
    sofa(sx,sz);sofa(-w/2+.9,l/2-.9,-Math.PI/5,true);
    const table=cylinder(.55,.55,.09,sx-.25,.43,sz+1.17,oak);table.scale.z=.7;
    for(const xx of [-.33,.33])for(const zz of [-.18,.18])cylinder(.025,.035,.38,sx-.25+xx,.21,sz+1.17+zz,dark);
    cylinder(.08,.065,.18,sx-.1,.56,sz+1.15,ceramic);box(.24,.025,.18,sx-.5,.49,sz+1.16,ceramic);
    const plantX=-w/2+.55,plantZ=-l/2+.48;cylinder(.19,.13,.38,plantX,.2,plantZ,ceramic);
    for(let i=0;i<9;i++){const leaf=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),dark);leaf.scale.set(.14,.42,.045);leaf.position.set(plantX+Math.sin(i*2.4)*.17,.65+(i%3)*.18,plantZ+Math.cos(i*2.4)*.16);leaf.rotation.z=Math.sin(i)*.6;leaf.rotation.y=i*2.4;leaf.castShadow=true;group.add(leaf);}
    const frame=box(.75,.9,.05,sx,1.8,-l/2+.09,oak);box(.66,.81,.055,sx,1.8,-l/2+.12,ceramic);const art=box(.33,.48,.015,sx+.05,1.8,-l/2+.155,dark);art.rotation.z=.2;
    // Linen curtain beside the window, never obscuring the floor.
    for(let i=0;i<7;i++)box(.035,2.25,.045,-w/2+.16+Math.sin(i)*.018,1.25,winZ+winWidth/2+.06+i*.028,ceramic);
  }
  function render(){try{renderer.render(world,camera);}catch{onError();}}
  function view(mode='perspective'){const radius=Math.max(current.width,current.length);controls.target.set(0,.55,0);camera.position.set(mode==='top'?radius*.12:radius*1.12,mode==='top'?radius*1.8:radius*.95,mode==='top'?radius*.2:radius*1.22);camera.lookAt(controls.target);controls.update();render();}
  function update(d){const dimensions=current.width!==d.width||current.length!==d.length;const floorChanged=dimensions||current.floor!==d.floor||current.pattern!==d.pattern;
    wallMat.color.set(options.wall.find(o=>o.id===d.wall).color);fabric.color.set(options.furniture.find(o=>o.id===d.furniture).color);floorMat.roughness=d.finish==='satin'?.38:.82;
    if(floorChanged)build(d);current={...d};if(dimensions)view();else render();
  }
  controls.addEventListener('change',render);
  new ResizeObserver(()=>{const width=container.clientWidth,height=container.clientHeight;if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();render();}).observe(container);
  build(initial);current={...initial};wallMat.color.set(options.wall.find(o=>o.id===initial.wall).color);fabric.color.set(options.furniture.find(o=>o.id===initial.furniture).color);floorMat.roughness=initial.finish==='satin'?.38:.82;view();
  return {update,view};
}
