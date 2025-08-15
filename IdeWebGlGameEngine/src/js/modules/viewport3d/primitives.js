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
  scene.objects.push({ vertices:v, color });
  return scene.objects[scene.objects.length-1];
}
export function addPlane(scene, { size=10, color=[0.2,0.2,0.25], grid=false }={}){
  if (!grid){
    const s=size/2;
    const v=[-s,0,-s, s,0,-s, s,0,s, -s,0,-s, s,0,s, -s,0,s];
    scene.objects.push({ vertices:v, color });
    return;
  }
  const step=1, half=size/2;
  const verts=[];
  for(let i=-half;i<=half;i+=step){
    verts.push(-half,0,i, half,0,i,  i,0,-half, i,0,half);
  }
  scene.objects.push({ vertices:verts, color, mode:WebGLRenderingContext.LINES });
}
