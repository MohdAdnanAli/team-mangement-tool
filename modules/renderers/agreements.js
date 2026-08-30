function renderAgreements(){
  const view = document.getElementById('view');
  view.innerHTML = `
    <div class="view-head">
      <div>
        <div class="view-title">Agreements</div>
        <div class="view-sub">VERBAL DEALS &amp; BILLING TERMS — MANUAL, KEPT VISIBLE HERE</div>
      </div>
      <div class="view-actions"><button class="btn btn-primary" id="addAgrBtn">+ Log an agreement</button></div>
    </div>
    <div class="agr-list" id="agrList">
      ${window.state.agreements.length ? window.state.agreements.map(a=>agreementHTML(a)).join('') : '<div class="empty">No agreements logged yet — add the terms you\'ve verbally agreed on so they stay visible to everyone.</div>'}
    </div>
  `;
  document.getElementById('addAgrBtn').addEventListener('click', window.openAgreementModal);
  document.querySelectorAll('[data-agr-del]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      window.state.agreements = window.state.agreements.filter(a=>a.id!==btn.dataset.agrDel);
      DB.remove('agreements', 'id', btn.dataset.agrDel);
      window.renderNav(); window.renderAgreements();
      window.toast('Agreement removed');
    });
  });
}
window.renderAgreements = renderAgreements;

function agreementHTML(a){
  return `
    <div class="agr-card">
      <div class="agr-head">
        <div>
          <div class="agr-title">${window.escapeHTML(a.title)}</div>
          <div class="agr-party">${window.escapeHTML(a.party)}</div>
        </div>
        <div class="agr-badges">
          <span class="agr-amount">${window.escapeHTML(a.amount || '')}</span>
          <span class="status-pill ${a.status}">${a.status}</span>
        </div>
      </div>
      <div class="agr-terms">${window.escapeHTML(a.terms)}</div>
      <div class="agr-foot">
        <span class="agr-date">Agreed ${window.fmtDate(a.dateAgreed)}</span>
        <button class="agr-del" data-agr-del="${a.id}">Remove</button>
      </div>
    </div>`;
}
