export function addCube(scene, { size=1, color=[0.8,0.8,0.8] }={}){
  const s=size/2;
  const v = [
    -s,-s,-s,  s,-s,-s,  s, s,-s,  -s,-s,-s,  s, s,-s,  -s, s,-s,
    -s,-s, s,  s,-s, s,  s, s, s,  -s,-s, s,  s, s, s,  -s, s, s,
    -s,-s,-s, -s, s,-s, -s, s, s,  -s,-s,-s, -s, s, s,  -s,-s, s,
     s,-s,-s,  s, s,-s,  s, s, s,   s,-s,-s,  s, s, s,   s,-s, s,
    -s, s,-s,  s, s,-s,  s, s, s,  -s, s,-s,  s, s, s,  -s, s, s,
    -s,-s,-s,  s,-s,-s,  s,-s, s,  -s,-s,-s,  s,-s, s,  -s,-s, s
  ];
  const obj = { vertices:v, color };
  scene.objects.push(obj);
  return obj;
}
export function addPlane(scene, { size=10, color=[0.2,0.2,0.25], grid=false }={}){
  let obj;
  if (!grid){
    const s=size/2;
    const v=[-s,0,-s, s,0,-s, s,0,s, -s,0,-s, s,0,s, -s,0,s];
    obj = { vertices:v, color };
  } else {
    const step=1, half=size/2;
    const verts=[];
    for(let i=-half;i<=half;i+=step){
      verts.push(-half,0,i, half,0,i,  i,0,-half, i,0,half);
    }
    obj = { vertices:verts, color, mode:WebGLRenderingContext.LINES };
  }
  scene.objects.push(obj);
  return obj;
}
