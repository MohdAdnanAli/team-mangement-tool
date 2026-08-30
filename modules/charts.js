function initDashboardCharts(charts){
  try{
    Object.values(charts).forEach(c=>c && c.destroy && c.destroy());

    const statusCounts = window.STATUS_COLS.map(s=> window.state.tasks.filter(t=>t.status===s.key).length);
    charts.status = new Chart(document.getElementById('chartStatus'), {
      type:'doughnut',
      data:{ labels: window.STATUS_COLS.map(s=>s.label), datasets:[{ data: statusCounts, backgroundColor:['#8B98A5','#F2B84B','#8AA4FF','#5FBF7A'], borderColor:'#161D22', borderWidth:2 }]},
      options:{ plugins:{ legend:{ position:'bottom', labels:{ color:'#8B98A5', font:{family:'Inter', size:11}, boxWidth:10 } } }, maintainAspectRatio:false }
    });

    const wlLabels = window.state.members.map(m=>m.name.split(' ')[0]);
    const wlData = window.state.members.map(m => window.state.tasks.filter(t=>t.assigneeId===m.id && t.status!=='done').reduce((a,t)=>a+t.hours,0));
    charts.workload = new Chart(document.getElementById('chartWorkload'), {
      type:'bar',
      data:{ labels: wlLabels, datasets:[{ label:'Assigned hrs', data: wlData, backgroundColor:'#F2B84B', borderRadius:4, maxBarThickness:34 }]},
      options:{ scales:{ x:{ ticks:{color:'#8B98A5'}, grid:{display:false} }, y:{ ticks:{color:'#8B98A5'}, grid:{color:'#232C33'} } }, plugins:{legend:{display:false}}, maintainAspectRatio:false }
    });

    const projDone = window.state.projects.map(p => window.state.tasks.filter(t=>t.projectId===p.id && t.status==='done').length);
    const projTotal = window.state.projects.map(p => window.state.tasks.filter(t=>t.projectId===p.id).length);
    const projRemaining = projTotal.map((t,i)=>t - projDone[i]);
    charts.projects = new Chart(document.getElementById('chartProjects'), {
      type:'bar',
      data:{ labels: window.state.projects.map(p=>p.name), datasets:[
        { label:'Done', data: projDone, backgroundColor:'#5FBF7A', stack:'s', borderRadius:4 },
        { label:'Remaining', data: projRemaining, backgroundColor:'#2A333C', stack:'s', borderRadius:4 },
      ]},
      options:{ indexAxis:'y', scales:{ x:{ stacked:true, ticks:{color:'#8B98A5'}, grid:{color:'#232C33'} }, y:{ stacked:true, ticks:{color:'#E8EDF1'}, grid:{display:false} } }, plugins:{ legend:{ position:'bottom', labels:{color:'#8B98A5', boxWidth:10} } }, maintainAspectRatio:false }
    });
  }catch(err){
    throw err;
  }
}
window.initDashboardCharts = initDashboardCharts;
