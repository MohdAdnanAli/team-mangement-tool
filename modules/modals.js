function openModal(html){
  const body = document.getElementById('modalBody');
  if(!body) return;
  body.innerHTML = html;
  const bd = document.getElementById('modalBackdrop');
  if(bd) bd.classList.add('open');
}
function closeModal(){ const bd = document.getElementById('modalBackdrop'); if(bd) bd.classList.remove('open'); }
function initModalBackdrop(){ const bd = document.getElementById('modalBackdrop'); if(!bd) return; bd.addEventListener('click', e=>{ if(e.target.id==='modalBackdrop') closeModal(); }); }
Object.assign(window,{openModal,closeModal,initModalBackdrop});
