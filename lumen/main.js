const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = window.matchMedia('(pointer:fine)').matches;
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------------------------------------- WebGL liquid-gold hero */
(function(){
  const canvas = document.getElementById('gl');
  if(!canvas){ return; }
  let gl;
  try { gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl'); } catch(e){}
  if(!gl){ canvas.style.display='none'; return; }
  const vert = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.0,1.0); }`;
  const frag = `
    precision highp float;
    uniform float u_time; uniform vec2 u_res; uniform vec2 u_mouse;
    float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
    float noise(vec2 p){ vec2 i=floor(p),f=fract(p);
      float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));
      vec2 u=f*f*(3.-2.*f); return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y; }
    float fbm(vec2 p){ float v=0.,a=0.5; for(int i=0;i<6;i++){ v+=a*noise(p); p*=2.0; a*=0.5; } return v; }
    void main(){
      vec2 uv = gl_FragCoord.xy/u_res.xy;
      vec2 p = uv; p.x *= u_res.x/u_res.y;
      float t = u_time*0.045;
      vec2 q = vec2(fbm(p+vec2(0.0,t)), fbm(p+vec2(5.2,1.3-t)));
      vec2 r = vec2(fbm(p+4.0*q+vec2(1.7,9.2)+t*0.5), fbm(p+4.0*q+vec2(8.3,2.8)-t*0.3));
      float f = fbm(p+4.0*r);
      float md = distance(uv, u_mouse);
      f += smoothstep(0.6,0.0,md)*0.30;
      vec3 ink=vec3(0.043,0.043,0.051), bronze=vec3(0.42,0.30,0.16), champ=vec3(0.86,0.70,0.42);
      vec3 col = mix(ink,bronze, smoothstep(0.25,0.72,f));
      col = mix(col,champ, smoothstep(0.66,0.97,f+r.x*0.3));
      col += champ*pow(max(0.,r.y),3.0)*0.22;
      float vig = smoothstep(1.2,0.25,length(uv-0.5));
      col *= vig*0.92+0.08;
      gl_FragColor = vec4(col,1.0);
    }`;
  function sh(t,s){ const o=gl.createShader(t); gl.shaderSource(o,s); gl.compileShader(o); return o; }
  const prog=gl.createProgram();
  gl.attachShader(prog,sh(gl.VERTEX_SHADER,vert)); gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,frag));
  gl.linkProgram(prog); gl.useProgram(prog);
  const buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(prog,'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  const uT=gl.getUniformLocation(prog,'u_time'), uR=gl.getUniformLocation(prog,'u_res'), uM=gl.getUniformLocation(prog,'u_mouse');
  let mouse=[0.7,0.65], tMouse=[0.7,0.65];
  function resize(){ const dpr=Math.min(window.devicePixelRatio||1,1.6);
    canvas.width=canvas.clientWidth*dpr; canvas.height=canvas.clientHeight*dpr; gl.viewport(0,0,canvas.width,canvas.height); }
  window.addEventListener('resize',resize); resize();
  window.addEventListener('pointermove',e=>{ tMouse=[e.clientX/window.innerWidth, 1-e.clientY/window.innerHeight]; });
  const start=performance.now();
  function render(now){
    if(!document.hidden){
      mouse[0]+=(tMouse[0]-mouse[0])*0.04; mouse[1]+=(tMouse[1]-mouse[1])*0.04;
      gl.uniform1f(uT,(now-start)/1000); gl.uniform2f(uR,canvas.width,canvas.height); gl.uniform2f(uM,mouse[0],mouse[1]);
      gl.drawArrays(gl.TRIANGLES,0,3);
    }
    if(!reduceMotion) requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
})();

/* ---------------------------------------- preloader */
function startSite(){
  document.body.classList.remove('loading');
  const tl = gsap.timeline();
  const pth=document.querySelector('#preloader .pre-mark path'); const L=pth.getTotalLength();
  gsap.set(pth,{strokeDasharray:L,strokeDashoffset:L});
  tl.to('#preNum',{innerText:100,duration:1.1,snap:{innerText:1},ease:'power2.out'},0)
    .to(pth,{strokeDashoffset:0,duration:1.1,ease:'power2.inOut'},0)
    .to('#preloader',{opacity:0,duration:.5,ease:'power2.out'},'+=0.15')
    .set('#preloader',{display:'none'})
    .to('#preCurtain',{scaleY:0,transformOrigin:'bottom',duration:.9,ease:'expo.inOut'},'-=0.1')
    .set('#preCurtain',{display:'none'})
    .add(heroIn,'-=0.5')
    .to('#announce',{opacity:1,duration:.6},'-=0.2');
}
function heroIn(){
  gsap.to('#heroKicker span',{y:0,opacity:1,duration:.9,ease:'expo.out'});
  gsap.set('.hero h1 .word',{yPercent:115});
  gsap.to('.hero h1 .word',{yPercent:0,duration:1.1,ease:'expo.out',stagger:.08});
  gsap.to('[data-hero-fade]',{opacity:1,y:0,duration:1,ease:'power3.out',stagger:.12,delay:.45});
}
gsap.set('#heroKicker span',{y:24,opacity:0});
gsap.set('[data-hero-fade]',{opacity:0,y:24});

if(reduceMotion){
  document.body.classList.add('no-anim','loading');
  document.body.classList.remove('loading');
  document.getElementById('preloader').style.display='none';
  document.getElementById('preCurtain').style.display='none';
  document.getElementById('announce').style.opacity=1;
  gsap.set('#heroKicker span,[data-hero-fade]',{opacity:1,y:0});
  gsap.set('.hero h1 .word',{yPercent:0});
} else {
  window.addEventListener('load',()=>setTimeout(startSite,200));
  setTimeout(()=>{ if(document.body.classList.contains('loading')) startSite(); },2600);
}

/* ---------------------------------------- Lenis smooth scroll */
let lenis;
if(!reduceMotion){
  lenis = new Lenis({duration:1.1,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t))});
  lenis.on('scroll',()=>ScrollTrigger.update());
  gsap.ticker.add(t=>lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0);
}
/* anchor links through Lenis */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{ const id=a.getAttribute('href'); if(id.length<2) return;
    const el=document.querySelector(id); if(!el) return; e.preventDefault();
    document.getElementById('nav').classList.remove('open'); document.getElementById('navToggle').classList.remove('open');
    if(lenis) lenis.scrollTo(el,{offset:-70}); else el.scrollIntoView({behavior:'smooth'});
  });
});

/* ---------------------------------------- reveals */
gsap.registerPlugin(ScrollTrigger);
if(!reduceMotion){
  ScrollTrigger.batch('[data-reveal]',{start:'top 86%',onEnter:b=>gsap.to(b,{opacity:1,y:0,duration:.9,ease:'power3.out',stagger:.09})});
  /* image clip reveal */
  document.querySelectorAll('[data-clip]').forEach(el=>{
    gsap.to(el,{clipPath:'inset(0 0 0% 0)',duration:1.3,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 82%'}});
  });
  /* manifesto word-by-word */
  const m=document.getElementById('manifesto');
  if(m){
    /* wrap plain words */
    m.innerHTML = m.innerHTML.replace(/(\b[\w'-]+\b)(?![^<]*>)/g, '<span class="reveal-word">$1</span>');
    gsap.to('#manifesto .reveal-word',{opacity:1,duration:.5,stagger:.04,ease:'none',
      scrollTrigger:{trigger:'#manifesto',start:'top 78%',end:'bottom 60%',scrub:true}});
  }
}

/* ---------------------------------------- velocity marquee */
if(!reduceMotion){
  const track=document.getElementById('marquee');
  if(track){
    let mx=0; const half=track.scrollWidth/2;
    let vel=0;
    if(lenis) lenis.on('scroll',({velocity})=>{ vel=velocity||0; });
    gsap.ticker.add(()=>{ mx -= (1.0 + Math.abs(vel)*0.6); if(-mx>=half) mx=0; track.style.transform=`translateX(${mx}px)`; });
  }
}

/* ---------------------------------------- method sticky scale */
if(!reduceMotion && window.innerWidth>900){
  gsap.utils.toArray('.method-card').forEach((card,i,arr)=>{
    if(i===arr.length-1) return;
    gsap.to(card,{scale:.92,filter:'brightness(.6)',ease:'none',
      scrollTrigger:{trigger:card,start:'top 16%',end:'+=420',scrub:true}});
  });
}

/* ---------------------------------------- horizontal treatments pin */
if(!reduceMotion){
  ScrollTrigger.matchMedia({
    '(min-width:901px)':function(){
      const track=document.getElementById('hTrack');
      if(!track) return;
      const dist=()=>track.scrollWidth - window.innerWidth + 80;
      const tween=gsap.to(track,{x:()=>-dist(),ease:'none',
        scrollTrigger:{trigger:'#treatments',start:'top top',end:()=>'+='+dist(),
          scrub:1,pin:true,anticipatePin:1,invalidateOnRefresh:true,
          onUpdate:s=>{ document.getElementById('hProgress').style.width=(8+s.progress*92)+'%'; }}});
    }
  });
}

/* ---------------------------------------- stats count-up */
document.querySelectorAll('[data-count]').forEach(el=>{
  const target=parseFloat(el.dataset.count), dec=+(el.dataset.dec||0);
  ScrollTrigger.create({trigger:el,start:'top 88%',once:true,onEnter:()=>{
    gsap.to({v:0},{v:target,duration:1.6,ease:'power2.out',
      onUpdate(){ el.textContent = dec? this.targets()[0].v.toFixed(dec) : Math.round(this.targets()[0].v); }});
  }});
});

/* ---------------------------------------- header + announce on scroll */
const header=document.getElementById('header'), announceEl=document.getElementById('announce');
ScrollTrigger.create({start:'top -40',onUpdate:s=>{ const sc=s.scroll()>40; header.classList.toggle('scrolled',sc); announceEl.classList.toggle('hide',sc); }});

/* ---------------------------------------- custom cursor + magnetic */
if(fine && !reduceMotion){
  const dot=document.querySelector('.cursor-dot'), ring=document.querySelector('.cursor-ring');
  let rx=0,ry=0,dx=0,dy=0;
  window.addEventListener('pointermove',e=>{ dx=e.clientX;dy=e.clientY; dot.style.transform=`translate(${dx}px,${dy}px) translate(-50%,-50%)`; });
  gsap.ticker.add(()=>{ rx+=(dx-rx)*0.16; ry+=(dy-ry)*0.16; ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`; });
  document.querySelectorAll('a,button,[data-cursor]').forEach(el=>{
    el.addEventListener('mouseenter',()=>ring.classList.add('hov'));
    el.addEventListener('mouseleave',()=>ring.classList.remove('hov'));
  });
  document.querySelectorAll('.magnetic').forEach(el=>{
    el.addEventListener('pointermove',e=>{ const r=el.getBoundingClientRect();
      gsap.to(el,{x:(e.clientX-r.left-r.width/2)*0.4,y:(e.clientY-r.top-r.height/2)*0.5,duration:.4,ease:'power3.out'}); });
    el.addEventListener('pointerleave',()=>gsap.to(el,{x:0,y:0,duration:.5,ease:'elastic.out(1,.4)'}));
  });
}

/* ---------------------------------------- nav + whatsapp toggles */
const navToggle=document.getElementById('navToggle'), nav=document.getElementById('nav');
navToggle.addEventListener('click',()=>{ const o=nav.classList.toggle('open'); navToggle.classList.toggle('open',o); navToggle.setAttribute('aria-expanded',o); });
const waFloat=document.getElementById('waFloat'), waToggle=document.getElementById('waToggle');
waToggle.addEventListener('click',()=>{ const o=waFloat.classList.toggle('open'); waToggle.setAttribute('aria-expanded',o); });
document.addEventListener('click',e=>{ if(!waFloat.contains(e.target)) waFloat.classList.remove('open'); });
setTimeout(()=>ScrollTrigger.refresh(),800);
