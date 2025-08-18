export function getGraph(){
  return {
    nodes:[{ id:'1', type:'Start' }, { id:'2', type:'End' }],
    links:[{ from:'1', to:'2' }]
  };
}

export default { getGraph };
