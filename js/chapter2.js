// ── Parse table cell click handler ─────────────────────────────
(function () {
  var cells   = document.querySelectorAll('.pt-cell');
  var panel   = document.getElementById('cellExplain');
  var prodEl  = document.getElementById('cellProd');
  var ruleEl  = document.getElementById('cellRule');
  var whyEl   = document.getElementById('cellWhy');
  var hintEl  = document.getElementById('tableHint');

  var ruleLabels = {
    '1': 'Rule 1 (FIRST): the lookahead token is in FIRST of this production\'s right-hand side.',
    '2': 'Rule 2 (FOLLOW): this production is Nullable and the lookahead is in FOLLOW of this nonterminal.',
  };

  cells.forEach(function (cell) {
    cell.addEventListener('click', function () {
      // clear previous
      cells.forEach(function (c) { c.classList.remove('active'); });
      cell.classList.add('active');

      var prod  = cell.dataset.prod;
      var rule  = cell.dataset.rule;
      var why   = cell.dataset.why;

      if (panel) panel.style.display = 'block';
      if (prodEl) prodEl.textContent = prod;
      if (ruleEl) ruleEl.textContent = ruleLabels[rule] || '';
      if (whyEl)  whyEl.textContent  = why;
      if (hintEl) hintEl.style.display = 'none';

      // scroll panel into view smoothly
      if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

  // click anywhere else to clear
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.pt-cell') && !e.target.closest('.cell-explain')) {
      cells.forEach(function (c) { c.classList.remove('active'); });
      if (panel) panel.style.display = 'none';
      if (hintEl) hintEl.style.display = 'block';
    }
  });
})();