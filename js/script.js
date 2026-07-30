// ── Interactive symbol table hover ─────────────────────────────
// When a user hovers a .var-ref span in the code block,
// the corresponding row(s) in the symbol table highlight.

(function () {
  const varRefs  = document.querySelectorAll('.var-ref');
  const symRows  = document.querySelectorAll('.sym-row');
  const hintEl   = document.getElementById('demoHint');

  // Build a lookup: varKey -> [row elements]
  const rowMap = {};
  symRows.forEach(function (row) {
    const keys = (row.dataset.row || '').split(' ');
    keys.forEach(function (key) {
      if (!key) return;
      if (!rowMap[key]) rowMap[key] = [];
      rowMap[key].push(row);
    });
  });

  function clearAll() {
    varRefs.forEach(function (el) { el.classList.remove('active'); });
    symRows.forEach(function (el) { el.classList.remove('highlighted'); });
  }

  varRefs.forEach(function (el) {
    var varKey = el.dataset.var;

    el.addEventListener('mouseenter', function () {
      clearAll();
      el.classList.add('active');

      var targets = rowMap[varKey] || [];
      targets.forEach(function (row) { row.classList.add('highlighted'); });

      if (hintEl) {
        hintEl.textContent = targets.length
          ? 'Showing entry for \u201c' + el.textContent.trim() + '\u201d in the symbol table.'
          : 'This use resolves to a declaration shown elsewhere in the table.';
      }
    });

    el.addEventListener('mouseleave', function () {
      clearAll();
      if (hintEl) {
        hintEl.textContent = 'Hover over a name in the code to highlight its table entry.';
      }
    });
  });
})();
