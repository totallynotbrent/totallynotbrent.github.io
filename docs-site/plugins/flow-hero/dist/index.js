// Flow Hero — a small, framed, low-resolution procedural flow-field "picture".
// Renders to a fixed tiny buffer (cheap) and lets CSS upscale it pixelated,
// matching the feel of a contained ambient visual rather than a full-res shader.

const css = `
.flow-hero {
  width: 100%;
  height: 180px;
  margin: 1.5rem 0 1.5rem;
  padding: 2px;
  border: 2px solid var(--lightgray, #555);
  box-sizing: border-box;
  overflow: hidden;
  background: #0b0f14;
  position: relative;
}
.flow-hero canvas {
  width: 100%;
  height: 100%;
  display: block;
  image-rendering: pixelated;
}
`;

const afterDOMLoaded = `
(function () {
  // fixed internal resolution — cheap, upscaled by CSS to stay light
  var RW = 200, RH = 112;
  var raf = 0;
  var done = false;

  function start(gl, prog, buf, loc, uRes, uTime) {
    var t0 = performance.now();
    function frame() {
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(uRes, RW, RH);
      gl.uniform1f(uTime, (performance.now() - t0) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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
      "float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.0+vec2(17.3); a*=0.5; } return v; }",
      "float bayer(vec2 p){",
      // 4x4 ordered-dither matrix, normalized to [0,1)
      "  const float m[16] = float[16](",
      "    0.0/16.0, 8.0/16.0, 2.0/16.0, 10.0/16.0,",
      "    12.0/16.0, 4.0/16.0, 14.0/16.0, 6.0/16.0,",
      "    3.0/16.0, 11.0/16.0, 1.0/16.0, 9.0/16.0,",
      "    15.0/16.0, 7.0/16.0, 13.0/16.0, 5.0/16.0);",
      "  vec2 ip = mod(floor(p), 4.0);",
      "  return m[int(ip.y)*4 + int(ip.x)];",
      "}",
      "void main(){",
      "  vec2 uv = gl_FragCoord.xy/uRes.xy;",
      "  vec2 p = uv*vec2(uRes.x/uRes.y,1.0)*2.0;",
      "  float t = uTime*0.14;",
      "  vec2 q = vec2(fbm(p+vec2(0.0,t)), fbm(p+vec2(5.2,t*0.7)));",
      "  vec2 r = vec2(fbm(p+3.0*q+vec2(1.7,t*1.3)), fbm(p+3.0*q+vec2(9.2,-t)));",
      "  float f = fbm(p+3.0*r);",
      "  vec3 a = vec3(0.05,0.08,0.15);",
      "  vec3 b = vec3(0.10,0.35,0.45);",
      "  vec3 c = vec3(0.95,0.62,0.30);",
      "  vec3 col = mix(a, b, smoothstep(0.35,0.85,f));",
      "  col = mix(col, c, smoothstep(0.82,1.0,f)*0.55);",
      // ordered dithering: posterize to 4 levels, then add a bayer offset
      "  float levels = 4.0;",
      "  float dith = bayer(gl_FragCoord.xy) - 0.5;",
      "  col = floor(col * levels + dith) / levels;",
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

// The QuartzComponent is a function returning JSX. In compiled plugin form,
// JSX must be pre-transpiled to hyperscript calls. Quartz uses preact, so we
// import its `h` to build the node tree without JSX syntax.
import { h } from "preact";

const FlowHeroComponent = () => {
  return h("div", { class: "flow-hero", "aria-hidden": "true" }, [
    h("canvas", { id: "flow-hero-canvas" }),
  ]);
};

FlowHeroComponent.css = css;
FlowHeroComponent.afterDOMLoaded = afterDOMLoaded;
FlowHeroComponent.displayName = "FlowHero";

export { FlowHeroComponent as FlowHero };
export default FlowHeroComponent;