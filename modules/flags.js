(function () {
  const FLAG_DEFS = {
    urgent: { label: 'Urgent', color: '#E8656A' },
    reviewed: { label: 'Reviewed', color: '#8AA4FF' },
    recurring: { label: 'Recurring', color: '#4FD1C5' },
    'tax-exempt': { label: 'Tax Exempt', color: '#9B6EE3' },
    final: { label: 'Final', color: '#F2B84B' },
  };

  function normalizeFlag(flag) {
    return String(flag || '').trim().toLowerCase();
  }

  function getFlagDefinition(flag) {
    const key = normalizeFlag(flag);
    return FLAG_DEFS[key] || { label: key || 'Flag', color: '#8B98A5' };
  }

  function getFlagLabel(flag) {
    return getFlagDefinition(flag).label;
  }

  function getFlagColor(flag) {
    return getFlagDefinition(flag).color;
  }

  window.FLAG_DEFS = FLAG_DEFS;
  window.normalizeFlag = normalizeFlag;
  window.getFlagLabel = getFlagLabel;
  window.getFlagColor = getFlagColor;
})();