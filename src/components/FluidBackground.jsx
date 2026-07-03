import React, { useEffect, useRef } from 'react';

// Raw-WebGL fluid shader — domain-warped fbm noise that flows toward the cursor.
// Ported from the novalab-sandbox FluidHero (which used three.js) to plain
// WebGL so it adds ZERO dependencies. Recoloured to the warm Bright Studio
// palette and kept light + subtle so it sits behind text. Reduced-motion safe.

const VERT = `attribute vec2 aPos; varying vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `precision highp float;
varying vec2 vUv;
uniform float uTime; uniform vec2 uMouse; uniform float uAspect;
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC;
float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a=hash(i), b=hash(i+vec2(1.0,0.0)), c=hash(i+vec2(0.0,1.0)), d=hash(i+vec2(1.0,1.0));
  vec2 u = f*f*(3.0-2.0*f);
  return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
}
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5; } return v; }
void main(){
  vec2 p = vUv; p.x *= uAspect;
  vec2 m = uMouse * 0.5;
  float t = uTime * 0.05;
  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2,1.3) - t));
  vec2 r = vec2(fbm(p + 1.8*q + m + vec2(1.7,9.2)), fbm(p + 1.8*q + m + vec2(8.3,2.8)));
  float f = fbm(p + 2.2*r);
  vec3 col = mix(uA, uB, clamp(f*f*2.0, 0.0, 1.0));
  col = mix(col, uC, clamp(length(r), 0.0, 1.0));
  // soft glow toward the cursor
  float d = distance(vUv*vec2(uAspect,1.0), (uMouse*0.5+0.5)*vec2(uAspect,1.0));
  col += uC * smoothstep(0.5, 0.0, d) * 0.16;
  gl_FragColor = vec4(col, 1.0);
}`;

// Warm pastels (cream → light coral → soft amber)
const DEFAULT_COLORS = [
  [0.984, 0.957, 0.918], // cream
  [1.0, 0.74, 0.68],     // light coral
  [1.0, 0.86, 0.62],     // soft amber
];

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn('[fluid] shader error', gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

export default function FluidBackground({ className, colors = DEFAULT_COLORS }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false });
    if (!gl) return; // graceful no-op if WebGL unavailable

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Fullscreen triangle
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = {
      time: gl.getUniformLocation(prog, 'uTime'),
      mouse: gl.getUniformLocation(prog, 'uMouse'),
      aspect: gl.getUniformLocation(prog, 'uAspect'),
      a: gl.getUniformLocation(prog, 'uA'),
      b: gl.getUniformLocation(prog, 'uB'),
      c: gl.getUniformLocation(prog, 'uC'),
    };
    gl.uniform3fv(u.a, colors[0]);
    gl.uniform3fv(u.b, colors[1]);
    gl.uniform3fv(u.c, colors[2]);

    let w = 0, h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const cw = canvas.clientWidth || 1;
      const ch = canvas.clientHeight || 1;
      w = Math.floor(cw * dpr);
      h = Math.floor(ch * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform1f(u.aspect, cw / ch);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // eased pointer in -1..1 relative to the canvas
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      target.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    if (!reduced) window.addEventListener('pointermove', onMove, { passive: true });

    let raf, start = performance.now();
    const render = (now) => {
      if (reduced) {
        gl.uniform1f(u.time, 8.0);
        gl.uniform2f(u.mouse, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        return; // one static frame
      }
      cur.x += (target.x - cur.x) * 0.04;
      cur.y += (target.y - cur.y) * 0.04;
      gl.uniform1f(u.time, (now - start) / 1000);
      gl.uniform2f(u.mouse, cur.x, cur.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    // Pause when the tab is hidden (saves battery / GPU)
    const onVis = () => {
      if (document.hidden) { cancelAnimationFrame(raf); }
      else if (!reduced) { start = performance.now() - 0; raf = requestAnimationFrame(render); }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    };
  }, [colors]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
