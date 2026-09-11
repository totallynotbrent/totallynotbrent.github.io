// Site chrome plugin — three components: the animated flow-field hero, a plain
// left "projects" nav, and a right dithered snapshot of the Sage wallpaper.

const css = `
.flow-hero {
  width: 100%;
  height: 200px;
  margin: 0 0 1.5rem;
  border: 1px solid var(--lightgray, #444440);
  box-sizing: border-box;
  overflow: hidden;
  background: rgba(26, 26, 25, 0.62);
  position: relative;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.18);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}
.flow-hero canvas {
  width: 100%;
  height: 100%;
  display: block;
  image-rendering: pixelated;
}

/* left intro blurb */
.intro-blurb {
  margin-top: 1.5rem;
}
.intro-blurb p {
  margin: 0 0 0.5rem;
  color: var(--darkgray, #f0efe8);
  font-size: 0.95rem;
  line-height: 1.6;
}
.intro-blurb .signature {
  display: block;
  margin-top: 1rem;
  max-width: 105px;
  height: auto;
  /* smooth gold -> black morph when swapping to light mode */
  transition: filter 0.5s ease;
}
:root[saved-theme="light"] .intro-blurb .signature {
  filter: brightness(0) saturate(0);
}
.intro-blurb .signature-github {
  display: block;
  margin-top: 0.6rem;
  font-size: 0.85rem;
  color: var(--secondary, #c4a7e7);
  text-decoration: none;
}
.intro-blurb .signature-github:hover {
  text-decoration: underline;
}

/* staggered per-element fade-up, all under 3s total
   (opacity + translateY on leaf elements only — never on .center, which
   must stay transform-free so the fixed background isn't contained) */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
}
/* title journey: 0.5 -> 1.2s */
.page-title {
  animation: fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
}
/* blurb (0.7 -> 1.4s) */
.intro-blurb p {
  animation: fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.7s both;
}
/* signature, github, cfd (0.9 -> 1.6s) */
.intro-blurb .signature,
.intro-blurb .signature-github,
.flow-hero {
  animation: fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.9s both;
}
/* projects (1.1 -> 1.8s) */
.center article {
  animation: fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 1.1s both;
}
/* sage snippet (1.3 -> 2.0s) */
.sage-snippet {
  animation: fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 1.3s both;
}

/* full-page isocontour background, behind everything */
.flow-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
}
.flow-bg canvas {
  width: 100%;
  height: 100%;
  display: block;
  opacity: 0.4;
  filter: blur(9px);
}

/* let the background show through: transparent page/body layers (not body — it hosts the sunrise) */
.page,
.center,
article {
  background: transparent !important;
}

/* sunrise theme transition: pass through warm rose-pine tones on toggle */
@keyframes sunrise-to-light {
  0%   { background-color: rgba(26, 26, 25, 0.92); }
  35%  { background-color: rgba(235, 188, 186, 0.88); }
  65%  { background-color: rgba(246, 193, 119, 0.90); }
  100% { background-color: rgba(246, 239, 228, 0.86); }
}
@keyframes sunrise-to-dark {
  0%   { background-color: rgba(246, 239, 228, 0.86); }
  35%  { background-color: rgba(246, 193, 119, 0.90); }
  65%  { background-color: rgba(235, 188, 186, 0.88); }
  100% { background-color: rgba(26, 26, 25, 0.92); }
}
:root[saved-theme="light"] body {
  animation: sunrise-to-light 1.6s ease both;
  background-color: rgba(246, 239, 228, 0.86);
}
:root[saved-theme="dark"] body {
  animation: sunrise-to-dark 1.6s ease both;
  background-color: rgba(26, 26, 25, 0.92);
}
:root[saved-theme="light"] .page,
:root[saved-theme="light"] .center,
:root[saved-theme="light"] article {
  background: transparent !important;
}

/* desktop only: no scroll + vertically centered columns */
@media (min-width: 800px) {
  html,
  body {
    height: 100%;
    overflow: hidden;
  }
  .page {
    height: 100vh;
    overflow: hidden;
  }

  /* center column keeps its existing vertical centering (the anchor) */
  .center {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 100vh;
  }

  /* sidebars share the center column's top line via a measured padding offset */
  .page > #quartz-body .sidebar.left,
  .page > #quartz-body .sidebar.right {
    position: static !important;
    height: 100vh !important;
    width: auto !important;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 2rem !important;
    top: unset !important;
    padding-top: calc(2rem + var(--center-top, 0px)) !important;
    align-items: flex-start;
  }
}

/* mobile: restore normal scroll + natural stacking */
@media (max-width: 800px) {
  html,
  body {
    height: auto;
    overflow: auto;
  }
  .page {
    height: auto;
    overflow: visible;
  }
  .center {
    min-height: 0;
  }
  /* stack the left sidebar vertically: title on top, blurb under it */
  .page > #quartz-body .sidebar.left {
    flex-direction: column !important;
    align-items: flex-start;
    gap: 1rem;
  }
  .intro-blurb {
    margin-top: 1rem;
  }
  /* sage snippet matches the cfd width, no gap above it */
  .page > #quartz-body .sidebar.right {
    grid-area: grid-sidebar-right;
    padding-top: 0 !important;
    margin-top: 0 !important;
  }
  .sage-snippet {
    width: 100%;
    max-width: 100%;
    height: 200px;
    aspect-ratio: auto;
    margin-top: 0;
  }
}

/* right dithered sage snippet — phone aspect, 250px wide like the graph box */
.sage-snippet {
  width: 250px;
  max-width: 100%;
  aspect-ratio: 9 / 16;
  border: 1px solid var(--lightgray, #444440);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(25, 23, 36, 0.62);
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.18);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}
.sage-snippet canvas {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 25% center;
  display: block;
  image-rendering: pixelated;
}

/* restyle the content divider into an invisible spacer instead of a line */
hr {
  text-align: center;
  border: none;
  width: 100%;
  height: 0;
  margin: 2em auto;
  padding: 0;
  overflow: visible;
}
hr:after {
  content: " ";
  color: transparent;
  margin: -1em 0 0.5em;
  padding: 0.5em 1em;
  font-size: 1.5em;
  display: inline-block;
}

/* breathing room between the title and the dark mode toggle */
.left.sidebar .flex-component {
  gap: 1.5rem;
}

/* project list uses dashes instead of default bullets */
article ul {
  padding-left: 1.2em;
}
article ul li::marker {
  content: "-  ";
  color: var(--tertiary, #f6c177);
}
`;

const afterDOMLoaded = `
(function () {
  var RW = 320, RH = 128;
  var raf = 0;
  var done = false;

  function start(gl, prog, buf, loc, uRes, uTime) {
    var t0 = performance.now();
    var last = 0;
    function frame(now) {
      if (now - last >= 33) {
        last = now;
        gl.useProgram(prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        gl.uniform2f(uRes, RW, RH);
        gl.uniform1f(uTime, (performance.now() - t0) / 1000);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
  }

  function init() {
    if (done) return;
    var canvas = document.getElementById("flow-hero-canvas");
    if (!canvas || !canvas.isConnected) return;
    done = true;

    var gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) { done = false; return; }

    canvas.width = RW; canvas.height = RH;
    gl.viewport(0, 0, RW, RH);

    var VERT = ["attribute vec2 p;","void main(){ gl_Position = vec4(p,0.0,1.0); }"].join(String.fromCharCode(10));
    var FRAG = [
      "precision highp float;",
      "uniform vec2 uRes;",
      "uniform float uTime;",
      "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }",
      "float noise(vec2 p){",
      "  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);",
      "  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y);",
      "}",
      "float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<4;i++){ v+=a*noise(p); p=p*2.0+vec2(17.3); a*=0.5; } return v; }",
      "void main(){",
      "  vec2 uv = gl_FragCoord.xy/uRes.xy;",
      "  vec2 p = uv*vec2(uRes.x/uRes.y,1.0)*2.0;",
      "  float t = uTime*0.14;",
      "  vec2 q = vec2(fbm(p+vec2(0.0,t)), fbm(p+vec2(5.2,t*0.7)));",
      "  vec2 r = vec2(fbm(p+3.0*q+vec2(1.7,t*1.3)), fbm(p+3.0*q+vec2(9.2,-t)));",
      "  float f = fbm(p+3.0*r);",
      "  vec3 base   = vec3(0.102,0.102,0.098);",
      "  vec3 iris   = vec3(0.769,0.655,0.906);",
      "  vec3 foam   = vec3(0.612,0.812,0.847);",
      "  vec3 gold   = vec3(0.965,0.757,0.467);",
      "  vec3 love   = vec3(0.922,0.435,0.573);",
      "  vec3 col = mix(base, foam, smoothstep(0.25,0.7,f));",
      "  col = mix(col, iris, smoothstep(0.6,0.9,f)*0.7);",
      "  col = mix(col, gold, smoothstep(0.85,1.0,f)*0.6);",
      "  col = mix(col, love, smoothstep(0.95,1.0,f)*0.4);",
      "  gl_FragColor = vec4(col,1.0);",
      "}",
    ].join(String.fromCharCode(10));

    function sh(type, src){
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { done = false; return null; }
      return s;
    }
    var vs = sh(gl.VERTEX_SHADER, VERT);
    var fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { done = false; return; }

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p");
    var uRes = gl.getUniformLocation(prog, "uRes");
    var uTime = gl.getUniformLocation(prog, "uTime");

    start(gl, prog, buf, loc, uRes, uTime);
  }

  init();
  document.addEventListener("nav", init);
})();
`;

// the dithered sage snapshot: load the wallpaper, extract 8 colors, bayer-dither
const sageAfterDOMLoaded = `
(function () {
  function luma(c) { return 0.2126*c[0] + 0.7152*c[1] + 0.0722*c[2]; }

  // 4x4 bayer threshold matrix, normalized to [0,1)
  var BAYER = [
    [0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]
  ];

  function extractPalette(data, w, h, k) {
    var pts = [];
    for (var i = 0; i < data.length; i += 4) pts.push([data[i], data[i+1], data[i+2]]);
    // greedy farthest-point seed then a few k-means passes
    var means = [pts[0].slice()];
    var dist2 = new Array(pts.length).fill(Infinity);
    while (means.length < k) {
      var last = means[means.length - 1];
      var best = -1, bestD = -1;
      for (var j = 0; j < pts.length; j++) {
        var dx = pts[j][0]-last[0], dy = pts[j][1]-last[1], dz = pts[j][2]-last[2];
        var d = dx*dx+dy*dy+dz*dz;
        if (d < dist2[j]) dist2[j] = d;
        if (dist2[j] > bestD) { bestD = dist2[j]; best = j; }
      }
      if (best < 0) break;
      means.push(pts[best].slice());
    }
    for (var it = 0; it < 8; it++) {
      var sums = [], cnt = [];
      for (var m = 0; m < k; m++) { sums.push([0,0,0]); cnt.push(0); }
      for (var p = 0; p < pts.length; p++) {
        var bi = 0, bd = Infinity;
        for (var m2 = 0; m2 < k; m2++) {
          var ex = pts[p][0]-means[m2][0], ey = pts[p][1]-means[m2][1], ez = pts[p][2]-means[m2][2];
          var dd = ex*ex+ey*ey+ez*ez;
          if (dd < bd) { bd = dd; bi = m2; }
        }
        sums[bi][0]+=pts[p][0]; sums[bi][1]+=pts[p][1]; sums[bi][2]+=pts[p][2]; cnt[bi]++;
      }
      for (var m3 = 0; m3 < k; m3++) if (cnt[m3]) means[m3] = [sums[m3][0]/cnt[m3], sums[m3][1]/cnt[m3], sums[m3][2]/cnt[m3]];
    }
    return means.map(function(c){ return [Math.round(c[0]), Math.round(c[1]), Math.round(c[2])]; })
      .sort(function(a,b){ return luma(a) - luma(b); });
  }

  function render() {
    var canvas = document.getElementById("sage-snippet-canvas");
    if (!canvas || !canvas.isConnected) return;
    var ctx = canvas.getContext("2d");
    var img = new Image();
    img.onload = function () {
      // downscale to a working size, extract 12 colors, dither
      var w = 512, h = Math.round(512 * img.height / img.width);
      var oc = document.createElement("canvas");
      oc.width = w; oc.height = h;
      var octx = oc.getContext("2d", { willReadFrequently: true });
      octx.drawImage(img, 0, 0, w, h);
      var id = octx.getImageData(0, 0, w, h);
      var pal = extractPalette(id.data, w, h, 12);
      var N = pal.length;

      canvas.width = w; canvas.height = h;

      // pixelation bloom: coarse blocks -> fine, ease-out, ~2.5s.
      // runs immediately so the fade-in reveals the coarse frame resolving.
      var DUR = 2500;
      function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

      function ditherAt(res) {
        // res = block size in px (big = coarse). sample one luma per block.
        var out = ctx.createImageData(w, h);
        for (var y = 0; y < h; y++) {
          var by = Math.floor(y / res) * res;
          for (var x = 0; x < w; x++) {
            var bx = Math.floor(x / res) * res;
            var gi = (by * w + bx) * 4;
            var g = luma([id.data[gi], id.data[gi+1], id.data[gi+2]]) / 255;
            var val = g * (N - 1);
            var b = BAYER[y & 3][x & 3] / 16 - 0.5;
            var idx = Math.max(0, Math.min(N - 1, Math.round(val + b)));
            var c = pal[idx];
            var i = (y * w + x) * 4;
            out.data[i] = c[0]; out.data[i+1] = c[1]; out.data[i+2] = c[2]; out.data[i+3] = 255;
          }
        }
        return out;
      }

      function drawFrame(t0, now) {
        var t = Math.min(1, (now - t0) / DUR);
        var e = easeOut(t);
        // block size sweeps from 32px (chunky) down to 1px (full detail)
        var res = Math.max(1, Math.round(32 * (1 - e)));
        ctx.putImageData(ditherAt(res), 0, 0);
        if (t < 1) requestAnimationFrame(function (n) { drawFrame(t0, n); });
      }

      // start on the coarse frame immediately so the fade-in reveals the
      // pixelated image mid-bloom, resolving to full detail
      var t0 = performance.now();
      requestAnimationFrame(function (n) { drawFrame(t0, n); });
    };
    img.src = "/static/wallpaper.jpg";
  }

  render();
  document.addEventListener("nav", render);
})();
`;

// isocontour background: animated contour lines of a drifting noise field,
// colored on a rose-pine gradient, dark and blurred for a subtle glow.
const bgAfterDOMLoaded = `
(function () {
  var raf = 0, done = false;

  function start(gl, prog, buf, loc, uRes, uTime) {
    var t0 = performance.now();
    var last = 0;
    function frame(now) {
      if (now - last >= 33) {
        last = now;
        var w = gl.canvas.clientWidth, h = gl.canvas.clientHeight;
        if (w === 0 || h === 0) { raf = requestAnimationFrame(frame); return; }
        if (gl.canvas.width !== w || gl.canvas.height !== h) {
          gl.canvas.width = w; gl.canvas.height = h;
          gl.viewport(0, 0, w, h);
        }
        gl.useProgram(prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        gl.uniform2f(uRes, w, h);
        gl.uniform1f(uTime, (performance.now() - t0) / 1000);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
  }

  function init() {
    if (done) return;
    var canvas = document.getElementById("flow-bg-canvas");
    if (!canvas || !canvas.isConnected) return;
    done = true;

    var gl = canvas.getContext("webgl", { antialias: true, alpha: true });
    if (!gl) { done = false; return; }

    var VERT = ["attribute vec2 p;","void main(){ gl_Position = vec4(p,0.0,1.0); }"].join(String.fromCharCode(10));
    var FRAG = [
      "precision highp float;",
      "uniform vec2 uRes;",
      "uniform float uTime;",
      "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }",
      "float noise(vec2 p){",
      "  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);",
      "  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y);",
      "}",
      "float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<3;i++){ v+=a*noise(p); p=p*2.0+vec2(9.3); a*=0.5; } return v; }",
      "void main(){",
      "  vec2 uv = gl_FragCoord.xy/uRes.xy;",
      "  vec2 p = uv * vec2(uRes.x/uRes.y, 1.0) * 3.5;",
      "  float t = uTime * 0.05;",
      "  float n = fbm(p + vec2(t, t*0.6));",
      "  float cells = 10.0;",
      "  float g = fract(n * cells);",
      "  float ring = smoothstep(0.0, 0.03, g) * (1.0 - smoothstep(0.03, 0.06, g));",
      "  vec3 iris = vec3(0.45,0.35,0.62);",
      "  vec3 foam = vec3(0.35,0.52,0.55);",
      "  vec3 gold = vec3(0.55,0.42,0.22);",
      "  vec3 col = mix(iris, foam, smoothstep(0.0, 0.55, n));",
      "  col = mix(col, gold, smoothstep(0.5, 1.0, n));",
      "  col = col * (0.10 + 0.90 * ring) * 0.7;",
      "  gl_FragColor = vec4(col, 0.30);",
      "}",
    ].join(String.fromCharCode(10));

    function sh(type, src){
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { done = false; return null; }
      return s;
    }
    var vs = sh(gl.VERTEX_SHADER, VERT);
    var fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { done = false; return; }

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p");
    var uRes = gl.getUniformLocation(prog, "uRes");
    var uTime = gl.getUniformLocation(prog, "uTime");

    start(gl, prog, buf, loc, uRes, uTime);
  }

  init();
  document.addEventListener("nav", init);
})();
`;

const centerTopAfterDOMLoaded = `
(function () {
  function measure() {
    var body = document.getElementById("quartz-body");
    var center = body && body.querySelector(".center");
    var article = center && center.firstElementChild;
    var left = body && body.querySelector(".sidebar.left");
    if (!body || !center || !article || !left) return;
    var base = 32; // matches the sidebar's 2rem base padding
    var contentTop = article.getBoundingClientRect().top - body.getBoundingClientRect().top;
    var offset = Math.max(0, Math.round(contentTop - base));
    body.style.setProperty("--center-top", offset + "px");
  }
  measure();
  requestAnimationFrame(function () { requestAnimationFrame(measure); });
  window.addEventListener("load", measure);
  document.addEventListener("nav", measure);
  window.addEventListener("resize", measure);
})();
`;

import { h } from "preact";

const FlowHeroComponent = () => {
  return h("div", { class: "flow-hero", "aria-hidden": "true" }, [
    h("canvas", { id: "flow-hero-canvas" }),
  ]);
};

const ProjectNavComponent = () => {
  return h("div", { class: "intro-blurb" }, [
    h("p", {}, "Hey, I'm Brent. Aerospace Engineering student, and I build small self-hosted things for fun."),
    h("img", { class: "signature", src: "/static/signature.png", alt: "Brent's signature" }),
    h("a", { class: "signature-github", href: "https://github.com/totallynotbrent", target: "_blank", rel: "noopener" }, "GitHub"),
  ]);
};

const SageSnippetComponent = () => {
  return h("div", { class: "sage-snippet" }, [
    h("canvas", { id: "sage-snippet-canvas" }),
  ]);
};

const FlowBackgroundComponent = () => {
  return h("div", { class: "flow-bg", "aria-hidden": "true" }, [
    h("canvas", { id: "flow-bg-canvas" }),
  ]);
};

FlowHeroComponent.css = css;
FlowHeroComponent.afterDOMLoaded = afterDOMLoaded;
FlowHeroComponent.displayName = "FlowHero";

ProjectNavComponent.css = css;
ProjectNavComponent.displayName = "ProjectNav";

SageSnippetComponent.css = css;
SageSnippetComponent.afterDOMLoaded = sageAfterDOMLoaded;
SageSnippetComponent.displayName = "SageSnippet";

FlowBackgroundComponent.css = css;
FlowBackgroundComponent.afterDOMLoaded = bgAfterDOMLoaded + centerTopAfterDOMLoaded;
FlowBackgroundComponent.displayName = "FlowBackground";

export { FlowHeroComponent as FlowHero, ProjectNavComponent as ProjectNav, SageSnippetComponent as SageSnippet, FlowBackgroundComponent as FlowBackground };
export default FlowHeroComponent;