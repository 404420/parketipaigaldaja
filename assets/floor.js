import { options } from './state.js';
/** Deterministic procedural wood. Dimensions and grain follow actual planks. */
export function floorTexture(design, resolution = 1536) {
  const canvas = document.createElement('canvas'); canvas.width = resolution; canvas.height = Math.round(resolution * design.length / design.width);
  const ctx = canvas.getContext('2d'); const scale = resolution/design.width;
  const color = options.floor.find(o=>o.id===design.floor).color;
  ctx.fillStyle=color;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.save();ctx.scale(scale,scale);
  let seed=12345; const random=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
  function plank(x,y,w,h,angle=0,polygon=null) {
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.beginPath();
    if(polygon){ctx.moveTo(...polygon[0]);polygon.slice(1).forEach(p=>ctx.lineTo(...p));ctx.closePath();}else ctx.rect(0,0,w,h);
    ctx.fillStyle=color;ctx.fill();ctx.save();ctx.clip();
    ctx.fillStyle=random()>.5?`rgba(255,242,210,${random()*.15})`:`rgba(35,22,8,${random()*.15})`;ctx.fillRect(-1,-1,w+2,h+2);
    for(let i=0;i<16;i++){ const yy=random()*h;ctx.beginPath();ctx.moveTo(-.04,yy);ctx.bezierCurveTo(w*.25,yy+.009,w*.65,yy-.008,w+.04,yy);ctx.strokeStyle=`rgba(58,35,14,${.035+random()*.09})`;ctx.lineWidth=.0008+random()*.0015;ctx.stroke(); }
    if(random()>.86){ctx.beginPath();ctx.ellipse(w*(.2+random()*.6),h*.5,.025,.008,0,0,Math.PI*2);ctx.strokeStyle='#52321535';ctx.lineWidth=.001;ctx.stroke();}
    ctx.restore();ctx.strokeStyle='#46341f66';ctx.lineWidth=.003;ctx.stroke();ctx.restore();
  }
  const w=.16,L=.8;
  if(design.pattern==='straight'){
    for(let row=0;row<design.length/w;row++)for(let col=-1;col<design.width/L;col++)plank(col*L+(row%3)*L/3,row*w,L,w);
  } else if(design.pattern==='herringbone') {
    // An L pair tiles a lattice with vectors (n,n) and (-1,1), then rotates 45°.
    ctx.translate(design.width/2,design.length/2);ctx.rotate(Math.PI/4);const n=5;
    for(let i=-12;i<13;i++)for(let j=-45;j<46;j++){
      const x=(i*n-j)*w,y=(i*n+j)*w;
      if(Math.abs(x)>12||Math.abs(y)>12)continue;
      plank(x,y,L,w);plank(x+L+w,y,w*5,w,Math.PI/2);
    }
  } else {
    // Mitred parallelograms meet at a V; unlike square-ended herringbone.
    const span=.64;
    for(let col=-1;col<design.width/span+1;col++)for(let row=-7;row<design.length/w+7;row++){
      const slope=col%2===0?1:-1;const offset=col%2===0?0:span;
      const x=col*span,y=row*w+offset;
      ctx.save();ctx.translate(x,y);ctx.transform(1,slope,0,1,0,0);
      plank(0,0,span,w);ctx.restore();
    }
  }
  ctx.restore();return canvas;
}
export function drawFallback(canvas, design) {
  const width = canvas.clientWidth || 800, height = canvas.clientHeight || 550;
  const ratio=Math.min(devicePixelRatio||1,2);canvas.width=width*ratio;canvas.height=height*ratio;
  const c=canvas.getContext('2d');c.scale(ratio,ratio);c.fillStyle='#e5dfd3';c.fillRect(0,0,width,height);
  const wall=options.wall.find(o=>o.id===design.wall).color,cloth=options.furniture.find(o=>o.id===design.furniture).color;
  const sx=width*.75,sy=Math.min(height*.5,width*.42),x=width*.5,y=height*.6;
  const polygon=(points,fill)=>{c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle='#77705a30';c.stroke();};
  polygon([[x-sx/2,y],[x,y-sy/2],[x,y-sy/2-height*.3],[x-sx/2,y-height*.3]],wall);
  polygon([[x,y-sy/2],[x+sx/2,y],[x+sx/2,y-height*.3],[x,y-sy/2-height*.3]],wall);
  c.save();c.translate(x,y-sy/2);c.transform(sx/2,sy/2,-sx/2,sy/2,0,0);const tex=floorTexture(design,768);c.drawImage(tex,0,0,1,1);c.restore();
  // Window, sofa and chair provide a room context while leaving most floor visible.
  polygon([[x-sx*.39,y-height*.26],[x-sx*.11,y-sy*.27-height*.26],[x-sx*.11,y-sy*.27-height*.09],[x-sx*.39,y-height*.09]],'#e8eff0');
  c.fillStyle='#20252025';c.beginPath();c.ellipse(x+sx*.13,y-sy*.08,sx*.23,sy*.065,-.35,0,Math.PI*2);c.fill();
  polygon([[x+sx*.02,y-sy*.27],[x+sx*.36,y-sy*.03],[x+sx*.36,y-sy*.03-height*.095],[x+sx*.02,y-sy*.27-height*.095]],cloth);
  polygon([[x+sx*.02,y-sy*.27],[x-sx*.07,y-sy*.13],[x+sx*.26,y+sy*.1],[x+sx*.36,y-sy*.03]],cloth);
  polygon([[x-sx*.07,y-sy*.13],[x+sx*.26,y+sy*.1],[x+sx*.26,y+sy*.1+height*.06],[x-sx*.07,y-sy*.13+height*.06]],cloth);
  c.fillStyle='#9c7750';c.beginPath();c.ellipse(x-sx*.04,y+sy*.13,sx*.12,sy*.07,0,0,Math.PI*2);c.fill();
  polygon([[x-sx*.33,y+sy*.09],[x-sx*.2,y+sy*.17],[x-sx*.12,y+sy*.07],[x-sx*.25,y-sy*.01]],cloth);
  if(design.finish==='satin'){c.save();c.globalAlpha=.12;c.fillStyle='#fff';c.beginPath();c.ellipse(x,y+sy*.22,sx*.3,sy*.13,-.3,0,Math.PI*2);c.fill();c.restore();}
}
