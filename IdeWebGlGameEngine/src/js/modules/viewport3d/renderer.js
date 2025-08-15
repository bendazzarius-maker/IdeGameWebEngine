const VS = `attribute vec3 p; uniform mat4 mvp; void main(){ gl_Position = mvp * vec4(p,1.0); }`;
const FS = `precision mediump float; uniform vec3 col; void main(){ gl_FragColor = vec4(col,1.0); }`;

function compile(gl, type, src){ const s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s); if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(s); return s; }
function makeProg(gl){ const p=gl.createProgram(); gl.attachShader(p,compile(gl,gl.VERTEX_SHADER,VS)); gl.attachShader(p,compile(gl,gl.FRAGMENT_SHADER,FS)); gl.linkProgram(p); if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw gl.getProgramInfoLog(p); return p; }

function makeMVP(state){
  const c = state.camera;
  const [px,py,pz] = c.pos, [tx,ty,tz] = c.target, [ux,uy,uz] = c.up;
  const z0 = norm([px-tx,py-ty,pz-tz]);
  const x0 = norm(cross(c.up, z0));
  const y0 = cross(z0, x0);
  const view = [
    x0[0], y0[0], z0[0], 0,
    x0[1], y0[1], z0[1], 0,
    x0[2], y0[2], z0[2], 0,
    -dot(x0,[px,py,pz]), -dot(y0,[px,py,pz]), -dot(z0,[px,py,pz]), 1
  ];
  const aspect = state.canvas.width/state.canvas.height;
  const proj = (c.mode==='persp') ? persp(c.fov*Math.PI/180, aspect, 0.1, 100.0)
                                  : ortho(-c.orthoSize*aspect, c.orthoSize*aspect, -c.orthoSize, c.orthoSize, -100, 100);
  return mul(proj, view);
}
const mul=(a,b)=>{const r=new Array(16).fill(0); for(let i=0;i<4;i++)for(let j=0;j<4;j++)for(let k=0;k<4;k++)r[i*4+j]+=a[i*4+k]*b[k*4+j]; return r;};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const norm=(v)=>{const l=Math.hypot(v[0],v[1],v[2])||1; return [v[0]/l,v[1]/l,v[2]/l];}
const persp=(fov,asp,n,f)=>{const t=Math.tan(fov/2); return [1/(asp*t),0,0,0, 0,1/t,0,0, 0,0,(f+n)/(n-f),-1, 0,0,(2*f*n)/(n-f),0];};
const ortho=(l,r,b,t,n,f)=>[2/(r-l),0,0,0, 0,2/(t-b),0,0, 0,0,-2/(f-n),0, -(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1];

let program, loc = {}, posBuf;

export function initRenderer(gl, state){
  program = makeProg(gl);
  loc.p = gl.getAttribLocation(program, 'p');
  loc.mvp = gl.getUniformLocation(program, 'mvp');
  loc.col = gl.getUniformLocation(program, 'col');
  posBuf = gl.createBuffer();
}

export function drawScene(gl, state){
  gl.viewport(0,0,gl.canvas.width, gl.canvas.height);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.07,0.09,0.12,1); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

  const mvp = makeMVP(state);
  gl.useProgram(program);
  gl.uniformMatrix4fv(loc.mvp,false,new Float32Array(mvp));

  for(const obj of state.scene.objects){
    gl.uniform3fv(loc.col, new Float32Array(obj.color||[0.8,0.8,0.8]));
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertices), gl.STREAM_DRAW);
    gl.enableVertexAttribArray(loc.p); gl.vertexAttribPointer(loc.p, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(obj.mode||gl.TRIANGLES, 0, obj.vertices.length/3);
  }
}
