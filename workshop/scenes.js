import * as THREE from './vendor/three.module.js';

const C={flower:0xD9472B,stem:0x5E6B4E,ink:0x1E1B18,paper:0xF8F4EC,sage:0x9AA08A,line:0xFFD3C2,taupe:0x6B625C,white:0xffffff};
const M=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.5,metalness:.08,...o});
const mesh=(g,c,o)=>new THREE.Mesh(g,M(c,o));
const V=(x,y,z)=>new THREE.Vector3(x,y,z);

function rr(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()}
function label(text,{w=1.7,h=.5,color='#1E1B18',bg=null,size=64,mono=false}={}){
  const cv=document.createElement('canvas');cv.width=512;cv.height=Math.round(512*h/w);const x=cv.getContext('2d');
  if(bg){x.fillStyle=bg;rr(x,4,4,cv.width-8,cv.height-8,cv.height/2.4);x.fill()}
  x.fillStyle=color;x.font=mono?`500 ${size*.8}px "DM Mono", monospace`:`700 ${size}px Amiri, "IBM Plex Sans Arabic", sans-serif`;
  x.textAlign='center';x.textBaseline='middle';x.direction=mono?'ltr':'rtl';x.fillText(text,cv.width/2,cv.height/2+4);
  const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));s.scale.set(w,h,1);s.renderOrder=10;return s}
function panelTex(lines,w=512,h=320){
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d');
  x.fillStyle='#1E1B18';x.fillRect(0,0,w,h);
  lines.forEach((l,i)=>{x.fillStyle=l[0];x.fillRect(28,34+i*38,l[1],14)});
  const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;return t}
const doc=(w=.7,h=.9)=>{const g=new THREE.Group();g.add(mesh(new THREE.BoxGeometry(w,h,.06),C.paper,{roughness:.8}));
  for(let i=0;i<4;i++){const l=mesh(new THREE.BoxGeometry(w*(i===0?.5:.72),.05,.07),i===0?C.flower:C.sage);l.position.set(0,h*.28-i*h*.2,.01);g.add(l)}return g};
function glow(o,on){o.traverse(n=>{if(n.material&&n.material.isMeshStandardMaterial)n.material.emissive.setHex(on?0x8a2a12:0)})}
function group(...c){const g=new THREE.Group();c.forEach(x=>g.add(x));return g}

/* ---------- scenes: each returns {root, items:[Object3D], tick(t,dt)} ---------- */
const S={};

S.folder=()=>{
  const root=new THREE.Group();
  const core=new THREE.Group();
  core.add(mesh(new THREE.IcosahedronGeometry(.85,1),C.flower,{roughness:.3,flatShading:true}));
  const rg=mesh(new THREE.TorusGeometry(1.2,.035,8,80),C.ink);rg.rotation.x=1.2;core.add(rg);
  const lb=label('كلود كود',{w:1.6,h:.46,color:'#fff',bg:'#1E1B18'});lb.position.set(0,-1.55,0);core.add(lb);
  const files=new THREE.Group();
  for(let i=0;i<6;i++){const d=doc();const a=i/6*Math.PI*2;d.position.set(Math.cos(a)*2.5,Math.sin(i*1.7)*.7,Math.sin(a)*2.5);d.userData.a=a;files.add(d)}
  const req=new THREE.Group();const sp=mesh(new THREE.SphereGeometry(.2,20,20),C.stem);req.add(sp);
  const rl=label('طلبك',{w:1,h:.34,color:'#fff',bg:'#5E6B4E',size:58});rl.position.set(0,.45,0);req.add(rl);
  const ctx=new THREE.Mesh(new THREE.IcosahedronGeometry(3.0,2),new THREE.MeshBasicMaterial({color:C.sage,wireframe:true,transparent:true,opacity:.28}));
  root.add(core,files,req,ctx);
  return {root,items:[core,files,req,ctx],tick(t){core.rotation.y=t*.5;files.rotation.y=t*.22;files.children.forEach((d,i)=>{d.position.y=Math.sin(t*.8+i)*.5;d.lookAt(0,d.position.y,0)});
    req.position.set(Math.cos(t*1.3)*1.7,Math.sin(t*1.9)*.6+.2,Math.sin(t*1.3)*1.7);ctx.rotation.y=-t*.05}};
};

S.loop=()=>{
  const root=new THREE.Group();root.rotation.x=-.55;
  const R=2.5;root.add(mesh(new THREE.TorusGeometry(R,.04,8,120),C.sage));
  const names=['تطلبين','يخطّط','ينفّذ','يفحص','تراجعين'];const cols=[C.flower,C.stem,C.ink,C.stem,C.flower];
  const nodes=names.map((n,i)=>{const g=new THREE.Group();const a=Math.PI/2-i/5*Math.PI*2;
    g.add(mesh(new THREE.SphereGeometry(.42,24,24),cols[i]));
    const num=label(String(i+1),{w:.5,h:.5,color:'#fff',size:90});g.add(num);
    const l=label(n,{w:1.5,h:.44,color:'#1E1B18',bg:'#F8F4EC',size:60});l.position.set(0,.82,0);g.add(l);
    g.position.set(Math.cos(a)*R,Math.sin(a)*R,0);root.add(g);return g});
  const tr=mesh(new THREE.SphereGeometry(.14,16,16),C.ink);root.add(tr);
  return {root,items:nodes,tick(t){const a=Math.PI/2-(t*.25%1)*Math.PI*2;tr.position.set(Math.cos(a)*R,Math.sin(a)*R,.2)},noSpin:false};
};

S.cube=()=>{
  const root=new THREE.Group();root.add(mesh(new THREE.OctahedronGeometry(.7),C.ink,{flatShading:true}));
  const names=['يبني','يعدّل','يشرح','يصلح','يرتّب','يؤتمت'];const cols=[C.flower,C.stem,C.ink,C.flower,C.stem,C.ink];
  const pos=[[2.3,0,0],[-2.3,0,0],[0,2.1,0],[0,-2.1,0],[0,0,2.3],[0,0,-2.3]];
  const items=names.map((n,i)=>{const g=new THREE.Group();const b=mesh(new THREE.BoxGeometry(1.1,1.1,1.1),cols[i],{roughness:.35});g.add(b);
    const l=label(n,{w:1.3,h:.42,color:'#1E1B18',bg:'#F8F4EC',size:60});l.position.set(0,1.0,0);g.add(l);
    g.position.set(...pos[i]);root.add(g);const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0,0,0),V(...pos[i])]),new THREE.LineBasicMaterial({color:C.sage}));root.add(ln);return g});
  return {root,items,tick(t){items.forEach((g,i)=>{g.children[0].rotation.x=t*.4+i;g.children[0].rotation.y=t*.5})}};
};

S.devices=()=>{
  const root=new THREE.Group();
  const laptop=new THREE.Group();laptop.add(mesh(new THREE.BoxGeometry(2.3,.1,1.5),C.ink));
  const scr=new THREE.Group();scr.add(mesh(new THREE.BoxGeometry(2.3,1.45,.07),C.ink));
  const pl=new THREE.Mesh(new THREE.PlaneGeometry(2.1,1.25),new THREE.MeshBasicMaterial({map:panelTex([[ '#D9472B',80],['#F8F4EC',300],['#9AA08A',220],['#F8F4EC',340],['#5E6B4E',160],['#F8F4EC',260]])}));pl.position.z=.04;scr.add(pl);
  scr.position.set(0,.75,-.7);scr.rotation.x=-.18;laptop.add(scr);laptop.position.set(-2.4,-.9,0);
  const lb1=label('الطرفية',{w:1.2,h:.4,size:56});lb1.position.set(0,2.0,0);laptop.add(lb1);
  const mon=new THREE.Group();mon.add(mesh(new THREE.BoxGeometry(2.6,1.6,.1),C.ink));
  const pm=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.4),new THREE.MeshBasicMaterial({map:panelTex([[ '#5E6B4E',120],['#F8F4EC',280],['#F8F4EC',200],['#D9472B',100],['#F8F4EC',320],['#9AA08A',180]])}));pm.position.z=.06;mon.add(pm);
  const st=mesh(new THREE.CylinderGeometry(.08,.08,.7),C.taupe);st.position.y=-1.1;mon.add(st);const bs=mesh(new THREE.CylinderGeometry(.6,.6,.06),C.taupe);bs.position.y=-1.45;mon.add(bs);
  mon.position.set(.9,1.3,-.4);const lb2=label('محرر الأكواد',{w:1.5,h:.4,size:56});lb2.position.set(0,1.3,0);mon.add(lb2);
  const phone=new THREE.Group();phone.add(mesh(new THREE.BoxGeometry(.75,1.45,.09),C.ink));
  const pp=new THREE.Mesh(new THREE.PlaneGeometry(.64,1.3),new THREE.MeshBasicMaterial({map:panelTex([[ '#D9472B',60],['#F8F4EC',200],['#F8F4EC',160],['#9AA08A',120]],256,512)}));pp.position.z=.055;phone.add(pp);
  phone.position.set(3.2,-.7,.3);phone.rotation.y=-.3;const lb3=label('الجوال',{w:1.1,h:.4,size:56});lb3.position.set(0,1.2,0);phone.add(lb3);
  const cloud=new THREE.Group();[[0,0,.55],[.6,.15,.45],[-.6,.1,.42],[.25,.45,.4]].forEach(a=>{const s=mesh(new THREE.SphereGeometry(a[2],24,24),C.paper,{roughness:.9});s.position.set(a[0],a[1],0);cloud.add(s)});
  cloud.position.set(-.6,2.5,.4);const lb4=label('الويب والسحابة',{w:1.7,h:.4,size:54});lb4.position.set(0,-.95,0);cloud.add(lb4);
  root.add(laptop,mon,phone,cloud);root.scale.setScalar(.9);
  return {root,items:[laptop,mon,cloud,phone],tick(t){cloud.position.y=2.5+Math.sin(t)*.12}};
};

S.lock=()=>{
  const root=new THREE.Group();
  const lockG=new THREE.Group();lockG.add(mesh(new THREE.BoxGeometry(1.5,1.2,.8),C.flower,{roughness:.3}));
  const sh=mesh(new THREE.TorusGeometry(.5,.13,14,32,Math.PI),C.ink,{metalness:.5});sh.position.y=.6;lockG.add(sh);
  const kh=mesh(new THREE.CylinderGeometry(.11,.11,.1,20),C.ink);kh.rotation.x=Math.PI/2;kh.position.set(0,.1,.42);lockG.add(kh);
  const kb=mesh(new THREE.BoxGeometry(.08,.3,.1),C.ink);kb.position.set(0,-.18,.42);lockG.add(kb);
  const l1=label('الإذن',{w:1,h:.4,size:56});l1.position.set(0,-1.15,0);lockG.add(l1);
  const cage=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(5.2,3.8,3)),new THREE.LineBasicMaterial({color:C.stem}));
  const cl=label('نطاق المجلد',{w:1.7,h:.4,color:'#fff',bg:'#5E6B4E',size:52});cl.position.set(0,2.15,0);cage.add(cl);
  const warn=new THREE.Group();warn.add(mesh(new THREE.SphereGeometry(.5,24,24),C.ink));const ex=label('!',{w:.5,h:.5,color:'#FFD3C2',size:110});warn.add(ex);
  const wl=label('بيانات حساسة',{w:1.7,h:.4,size:52});wl.position.set(0,-.85,0);warn.add(wl);warn.position.set(3.4,1,0);
  const eye=new THREE.Group();eye.add(mesh(new THREE.SphereGeometry(.48,24,24),C.paper));const pu=mesh(new THREE.SphereGeometry(.22,16,16),C.ink);pu.position.z=.32;eye.add(pu);
  const el=label('مراجعتك',{w:1.3,h:.4,size:54});el.position.set(0,-.85,0);eye.add(el);eye.position.set(-3.4,1,0);
  const bk=new THREE.Group();for(let i=0;i<3;i++){const d=mesh(new THREE.BoxGeometry(1,.14,.7),i===0?C.flower:C.sage);d.position.y=i*.17;d.rotation.y=i*.2;bk.add(d)}
  const bl=label('نسخة احتياطية',{w:1.9,h:.4,size:50});bl.position.set(0,-.7,0);bk.add(bl);bk.position.set(0,-2.7,0);
  root.add(lockG,cage,warn,eye,bk);root.scale.setScalar(.82);
  return {root,items:[lockG,cage,warn,eye,bk],tick(t){eye.children[1].position.x=Math.sin(t*1.2)*.15;warn.position.y=1+Math.sin(t*1.5)*.1}};
};

S.memory=()=>{
  const root=new THREE.Group();
  const main=new THREE.Group();const d=doc(1.7,2.2);main.add(d);
  const tl=label('CLAUDE.md',{w:1.7,h:.42,color:'#fff',bg:'#1E1B18',mono:true,size:64});tl.position.set(0,-1.5,0);main.add(tl);
  const tiles=[['/init',-3.1,1.4],['/clear',3.1,1.4],['/compact',-3.1,-1],['/model',3.1,-1]].map(([n,x,y])=>{
    const g=new THREE.Group();g.add(mesh(new THREE.BoxGeometry(1.7,.7,.14),C.paper,{roughness:.7}));
    const l=label(n,{w:1.6,h:.5,color:'#D9472B',mono:true,size:78});l.position.z=.1;g.add(l);g.position.set(x,y,0);root.add(g);
    root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0,0,0),V(x,y,0)]),new THREE.LineBasicMaterial({color:C.sage})));return g});
  root.add(main);root.scale.setScalar(.95);
  return {root,items:[main,...tiles],tick(t){tiles.forEach((g,i)=>g.position.z=Math.sin(t*1.2+i*1.5)*.25)}};
};

S.network=()=>{
  const root=new THREE.Group();
  const hub=new THREE.Group();hub.add(mesh(new THREE.IcosahedronGeometry(.8,1),C.flower,{flatShading:true,roughness:.3}));
  const hl=label('كلود كود',{w:1.5,h:.42,color:'#fff',bg:'#1E1B18',size:56});hl.position.set(0,-1.2,0);hub.add(hl);root.add(hub);
  const defs=[['MCP',new THREE.BoxGeometry(.9,.9,.9),C.stem],['وكلاء فرعيون',new THREE.OctahedronGeometry(.65),C.ink],['Skills',new THREE.TorusGeometry(.5,.2,12,24),C.stem],['Hooks',new THREE.ConeGeometry(.55,1,5),C.ink],['وضع التخطيط',new THREE.DodecahedronGeometry(.6),C.flower]];
  const items=defs.map(([n,g,c],i)=>{const a=i/5*Math.PI*2+Math.PI/2;const gr=new THREE.Group();gr.add(mesh(g,c,{flatShading:true}));
    const l=label(n,{w:1.7,h:.42,color:'#1E1B18',bg:'#F8F4EC',size:54,mono:n==='MCP'||n==='Skills'||n==='Hooks'});l.position.set(0,1.05,0);gr.add(l);
    const p=V(Math.cos(a)*3.1,Math.sin(a)*2.2,Math.sin(a*2)*.8);gr.position.copy(p);root.add(gr);
    root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0,0,0),p]),new THREE.LineBasicMaterial({color:C.sage})));return gr});
  root.add(hub);
  return {root,items,tick(t){hub.rotation.y=t*.6;items.forEach((g,i)=>{g.children[0].rotation.y=t*.7+i;g.children[0].rotation.x=t*.3})}};
};

/* ---------- shared renderer ---------- */
let renderer=null,scene=null,camera=null,cur=null,raf=0,lastT=0,drag=null,spinPause=0,failed=false;
const cache={};
function init(){
  if(renderer||failed)return;
  try{
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
    renderer.setPixelRatio(Math.min(2,devicePixelRatio||1));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    scene=new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff,0xd9cdb8,1.1));
    const dl=new THREE.DirectionalLight(0xffffff,1.9);dl.position.set(3,5,6);scene.add(dl);
    const dl2=new THREE.DirectionalLight(0xffe2d6,.7);dl2.position.set(-4,-2,3);scene.add(dl2);
    camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.set(0,1.1,11);camera.lookAt(0,0,0);
    const cv=renderer.domElement;cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;touch-action:pan-y;cursor:grab';
    cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing'});
    cv.addEventListener('pointermove',e=>{if(!drag||!cur)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag={x:e.clientX,y:e.clientY};
      cur.sc.root.rotation.y+=dx*.01;cur.sc.root.rotation.x=Math.max(-.8,Math.min(.8,cur.sc.root.rotation.x+dy*.006));spinPause=performance.now()+2500});
    const up=()=>{drag=null;cv.style.cursor='grab'};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
    new ResizeObserver(()=>fit()).observe(document.body);
    addEventListener('resize',fit);
  }catch(e){failed=true;renderer=null}
}
function fit(){if(!renderer||!cur)return;const s=cur.stage;const w=s.clientWidth||300,h=s.clientHeight||300;renderer.setSize(w,h,false);camera.aspect=w/h;
  camera.position.z=w/h<.9?14:(w/h<1.6?11.5:10.5);camera.updateProjectionMatrix()}
function loop(now){
  raf=requestAnimationFrame(loop);if(!cur)return;const t=now/1000,dt=Math.min(.05,(now-lastT)/1000||.016);lastT=now;
  const sc=cur.sc;
  if(now>spinPause&&!sc.noSpin&&!drag)sc.root.rotation.y+=dt*.35;
  sc.tick&&sc.tick(t,dt);
  sc.items.forEach(o=>{const b=o.userData.base||(o.userData.base=o.scale.x);const tg=o.userData.hi?1.22:1;const s=o.scale.x+(b*tg-o.scale.x)*.15;o.scale.setScalar(s)});
  renderer.render(scene,camera);
}
export function mount(stage){
  init();
  if(failed){stage.insertAdjacentHTML('beforeend','<div class="nogl">المجسم ثلاثي الأبعاد غير مدعوم في هذا المتصفح</div>');return}
  const name=stage.dataset.scene;
  if(!cache[name])cache[name]={sc:S[name](),stage};
  if(cur)scene.remove(cur.sc.root);
  cur={sc:cache[name].sc,stage,name};cur.stage=stage;
  scene.add(cur.sc.root);
  stage.appendChild(renderer.domElement);fit();
  if(!raf)raf=requestAnimationFrame(loop);
}
export function unmount(){if(cur){scene.remove(cur.sc.root);cur=null}}
export function focusItem(i){if(!cur)return;cur.sc.items.forEach((o,k)=>{o.userData.hi=(k===i);glow(o,k===i)});spinPause=performance.now()+3000}
window.__scenes={mount,unmount,focusItem};
window.dispatchEvent(new Event('scenes-ready'));
