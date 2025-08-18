export function initOutliner(root){
  root.addEventListener('contextmenu', (e)=>{
    e.preventDefault();
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.innerHTML = '<div>Rename</div><div>Delete</div><div>Move to...</div>';
    document.body.appendChild(menu);
    menu.style.left = e.pageX + 'px';
    menu.style.top = e.pageY + 'px';
    const close = () => menu.remove();
    document.addEventListener('click', close, { once:true });
  });
}

export default { initOutliner };
