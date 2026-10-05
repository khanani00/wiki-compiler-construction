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

// ── Clickable SLR states and highlighted DFA ────────────────────
(function () {
  var table = document.querySelector('#slr-final-table .slr-table');
  var detail = document.getElementById('slr-state-detail');

  if (!table || !detail) return;

  var rows = Array.prototype.slice.call(table.querySelectorAll('tbody tr[data-state]'));
  detail.querySelectorAll('.slr-state-panel').forEach(function (panel) {
    var diagram = panel.querySelector('.slr-state-diagram');
    if (!diagram || diagram.parentElement !== panel) return;

    var body = document.createElement('div');
    body.className = 'slr-state-panel__body';
    var explanation = document.createElement('div');
    explanation.className = 'slr-state-panel__explanation';
    panel.insertBefore(body, diagram);
    body.appendChild(diagram);

    while (body.nextElementSibling) {
      explanation.appendChild(body.nextElementSibling);
    }
    body.appendChild(explanation);
  });

  var states = [
    { id: 0, x: 160, y: 264 },
    { id: 1, x: 360, y: 110 },
    { id: 2, x: 360, y: 190 },
    { id: 3, x: 360, y: 320 },
    { id: 4, x: 360, y: 410 },
    { id: 5, x: 560, y: 190 },
    { id: 6, x: 530, y: 280 },
    { id: 7, x: 530, y: 380 },
    { id: 8, x: 810, y: 60 },
    { id: 9, x: 810, y: 145 },
    { id: 10, x: 810, y: 220 },
    { id: 11, x: 810, y: 305 },
  ];
  var transitions = [
    { from: 0, to: 1, label: 'STAT', d: 'M190 250 C235 205 290 145 330 115', x: 245, y: 170 },
    { from: 0, to: 2, label: 'VAR', d: 'M190 264 C235 240 285 210 330 190', x: 255, y: 222 },
    { from: 0, to: 3, label: 'VTYPE', d: 'M190 280 C235 295 285 315 330 320', x: 255, y: 300 },
    { from: 0, to: 4, label: 'number', d: 'M190 290 C235 330 285 375 330 400', x: 250, y: 355 },
    { from: 2, to: 5, label: ':=', d: 'M390 190 H500', x: 445, y: 180 },
    { from: 3, to: 6, label: 'VNAME', d: 'M390 320 C435 312 470 285 500 280', x: 445, y: 292 },
    { from: 3, to: 7, label: '_vname', d: 'M390 330 C430 350 470 375 500 380', x: 445, y: 355 },
    { from: 5, to: 8, label: 'EXPR', d: 'M590 170 C645 125 720 75 780 62', x: 680, y: 105 },
    { from: 5, to: 9, label: 'TERM', d: 'M590 185 C650 165 720 150 780 145', x: 685, y: 157 },
    { from: 5, to: 10, label: 'FACTOR', d: 'M590 200 C650 207 720 217 780 220', x: 680, y: 216 },
    { from: 5, to: 11, label: '_number', d: 'M590 210 C650 250 720 285 780 300', x: 680, y: 267 },
  ];

  function appendSvgElement(parent, name, attributes, text) {
    var element = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.keys(attributes).forEach(function (key) {
      element.setAttribute(key, attributes[key]);
    });
    if (text) element.textContent = text;
    parent.appendChild(element);
    return element;
  }

  function createDfa(selectedState) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'slr-dfa-svg');
    svg.setAttribute('viewBox', '0 0 900 470');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'SLR DFA with state I' + selectedState + ' highlighted');
    appendSvgElement(svg, 'title', {}, 'SLR DFA, state I' + selectedState + ' highlighted');

    var defs = appendSvgElement(svg, 'defs', {}, '');
    var marker = appendSvgElement(defs, 'marker', {
      id: 'slr-dfa-arrow', markerWidth: '8', markerHeight: '8', refX: '7', refY: '4',
      orient: 'auto', markerUnits: 'strokeWidth',
    }, '');
    appendSvgElement(marker, 'path', { d: 'M0 0 L8 4 L0 8 z', fill: '#64748b' }, '');

    var edgeLayer = appendSvgElement(svg, 'g', { class: 'slr-dfa-edges' }, '');
    transitions.forEach(function (transition) {
      appendSvgElement(edgeLayer, 'path', {
        class: 'slr-dfa-edge', d: transition.d, fill: 'none',
        'marker-end': 'url(#slr-dfa-arrow)',
      }, '');
      appendSvgElement(edgeLayer, 'text', {
        class: 'slr-dfa-edge-label', x: transition.x, y: transition.y,
        'text-anchor': 'middle',
      }, transition.label);
    });

    var stateLayer = appendSvgElement(svg, 'g', { class: 'slr-dfa-states' }, '');
    states.forEach(function (state) {
      var node = appendSvgElement(stateLayer, 'g', {
        class: 'slr-dfa-state' + (state.id === Number(selectedState) ? ' is-highlighted' : ''),
        'data-state': state.id,
      }, '');
      appendSvgElement(node, 'circle', { cx: state.x, cy: state.y, r: '30' }, '');
      appendSvgElement(node, 'text', {
        x: state.x, y: state.y + 1, 'text-anchor': 'middle', 'dominant-baseline': 'middle',
      }, 'I' + state.id);
    });

    return svg;
  }

  function clearSelection() {
    rows.forEach(function (row) { row.classList.remove('is-selected'); });
    detail.querySelectorAll('.slr-state-panel').forEach(function (panel) {
      panel.hidden = true;
      panel.classList.remove('is-open');
    });
  }

  function showState(stateId) {
    var panel = document.getElementById('slr-state-' + stateId);
    if (!panel) return;

    clearSelection();
    var row = rows.find(function (candidate) {
      return candidate.dataset.state === String(stateId);
    });
    if (row) row.classList.add('is-selected');

    panel.hidden = false;
    panel.classList.add('is-open');
    var diagram = panel.querySelector('.slr-state-diagram');
    if (diagram) {
      diagram.replaceChildren(createDfa(stateId));
      diagram.setAttribute('aria-label', 'DFA with state I' + stateId + ' highlighted');
    }
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  rows.forEach(function (row) {
    row.tabIndex = 0;
    row.setAttribute('aria-label', 'Show details for state I' + row.dataset.state);
    row.addEventListener('click', function () { showState(row.dataset.state); });
    row.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        showState(row.dataset.state);
      }
    });
  });

  detail.querySelectorAll('.slr-state-panel__close').forEach(function (button) {
    button.addEventListener('click', function () {
      clearSelection();
    });
  });
})();