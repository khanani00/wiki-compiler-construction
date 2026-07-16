// ── CheckExp case click handler ─────────────────────────────────
(function () {
  var cases   = document.querySelectorAll('.ce-case');
  var panels  = document.querySelectorAll('.explain-panel');
  var placeholder = document.querySelector('.explain-placeholder');

  cases.forEach(function (el) {
    el.addEventListener('click', function () {
      var key = el.dataset.case;

      // toggle active on code spans
      cases.forEach(function (c) { c.classList.remove('active'); });
      el.classList.add('active');

      // show matching panel
      if (placeholder) placeholder.style.display = 'none';
      panels.forEach(function (p) {
        p.style.display = p.dataset.panel === key ? 'block' : 'none';
      });
    });
  });
})();


// ── Step-by-step trace ──────────────────────────────────────────
(function () {
  var steps = [
    {
      title: 'Start: top-level call',
      tree: [
        { text: 'CheckExp(if x < 5 then x+1 else 0, vtable, ftable)', state: 'active' },
        { text: '  \u251C\u2500 CheckExp(x < 5, ...)', state: 'pending' },
        { text: '  \u251C\u2500 CheckExp(x + 1, ...)', state: 'pending' },
        { text: '  \u2514\u2500 CheckExp(0, ...)',     state: 'pending' },
      ],
      detail: '<h4>Case: <code>if Exp1 then Exp2 else Exp3</code></h4>' +
              '<p>The outermost expression is a conditional. CheckExp identifies the <strong>if-then-else</strong> case and will make three recursive calls: one for the condition, one for each branch.</p>' +
              '<p>It has not yet computed anything — it is about to recurse.</p>',
    },
    {
      title: 'Call 1: check the condition x < 5',
      tree: [
        { text: 'CheckExp(if x < 5 then x+1 else 0, ...)', state: 'done' },
        { text: '  \u251C\u2500 CheckExp(x < 5, ...)', state: 'active' },
        { text: '  |   \u251C\u2500 CheckExp(x, ...)   \u2192 ?', state: 'pending' },
        { text: '  |   \u2514\u2500 CheckExp(5, ...)   \u2192 ?', state: 'pending' },
        { text: '  \u251C\u2500 CheckExp(x + 1, ...)', state: 'pending' },
        { text: '  \u2514\u2500 CheckExp(0, ...)',     state: 'pending' },
      ],
      detail: '<h4>Case: <code>Exp1 &lt; Exp2</code></h4>' +
              '<p>The condition is a comparison. CheckExp now recurses into <strong>both operands</strong>: <code>x</code> and <code>5</code>.</p>' +
              '<p>It needs to check that both sides have the same type before returning <code>bool</code>.</p>',
    },
    {
      title: 'Resolve x and 5',
      tree: [
        { text: 'CheckExp(if x < 5 then x+1 else 0, ...)', state: 'done' },
        { text: '  \u251C\u2500 CheckExp(x < 5, ...)', state: 'active' },
        { text: '  |   \u251C\u2500 CheckExp(x, ...)   \u2192 number \u2713', state: 'done' },
        { text: '  |   \u2514\u2500 CheckExp(5, ...)   \u2192 number \u2713', state: 'done' },
        { text: '  |   both number \u2192 return bool', state: 'active' },
        { text: '  \u251C\u2500 CheckExp(x + 1, ...)', state: 'pending' },
        { text: '  \u2514\u2500 CheckExp(0, ...)',     state: 'pending' },
      ],
      detail: '<h4>Looking up x, evaluating 5</h4>' +
              '<p><span class="step-call">lookup(vtable, "x")</span> returns <span class="step-result">number</span> &mdash; x was declared as a number variable.</p>' +
              '<p>The literal <span class="step-call">5</span> matches the <code>num</code> case and returns <span class="step-result">number</span> immediately.</p>' +
              '<p>Both sides are <code>number</code> &mdash; the same type &mdash; so the comparison returns <span class="step-result">bool</span>.</p>',
    },
    {
      title: 'Call 2: check the then-branch x + 1',
      tree: [
        { text: 'CheckExp(if x < 5 then x+1 else 0, ...)', state: 'done' },
        { text: '  \u251C\u2500 CheckExp(x < 5, ...)       \u2192 bool \u2713', state: 'done' },
        { text: '  \u251C\u2500 CheckExp(x + 1, ...)', state: 'active' },
        { text: '  |   \u251C\u2500 CheckExp(x, ...)   \u2192 ?', state: 'pending' },
        { text: '  |   \u2514\u2500 CheckExp(1, ...)   \u2192 ?', state: 'pending' },
        { text: '  \u2514\u2500 CheckExp(0, ...)',     state: 'pending' },
      ],
      detail: '<h4>Case: <code>Exp1 + Exp2</code></h4>' +
              '<p>The then-branch is an addition. Both operands must be <code>number</code>.</p>' +
              '<p>CheckExp recurses into <code>x</code> and <code>1</code>.</p>',
    },
    {
      title: 'Resolve x + 1',
      tree: [
        { text: 'CheckExp(if x < 5 then x+1 else 0, ...)', state: 'done' },
        { text: '  \u251C\u2500 CheckExp(x < 5, ...)       \u2192 bool \u2713',   state: 'done' },
        { text: '  \u251C\u2500 CheckExp(x + 1, ...)', state: 'active' },
        { text: '  |   \u251C\u2500 CheckExp(x, ...)   \u2192 number \u2713', state: 'done' },
        { text: '  |   \u2514\u2500 CheckExp(1, ...)   \u2192 number \u2713', state: 'done' },
        { text: '  |   both number \u2192 return number', state: 'active' },
        { text: '  \u2514\u2500 CheckExp(0, ...)',     state: 'pending' },
      ],
      detail: '<h4>Addition resolves</h4>' +
              '<p><code>x</code> &rarr; <span class="step-result">number</span> (lookup). &nbsp; <code>1</code> &rarr; <span class="step-result">number</span> (literal).</p>' +
              '<p>Both are <code>number</code> &mdash; addition succeeds and returns <span class="step-result">number</span>.</p>',
    },
    {
      title: 'Call 3: check the else-branch 0',
      tree: [
        { text: 'CheckExp(if x < 5 then x+1 else 0, ...)', state: 'done' },
        { text: '  \u251C\u2500 CheckExp(x < 5, ...)       \u2192 bool   \u2713', state: 'done' },
        { text: '  \u251C\u2500 CheckExp(x + 1, ...)       \u2192 number \u2713', state: 'done' },
        { text: '  \u2514\u2500 CheckExp(0, ...)', state: 'active' },
        { text: '      literal 0 \u2192 return number', state: 'active' },
      ],
      detail: '<h4>Case: <code>num</code></h4>' +
              '<p>The literal <code>0</code> immediately matches the <code>num</code> case and returns <span class="step-result">number</span> with no recursive calls needed.</p>',
    },
    {
      title: 'Final check: assemble the result',
      tree: [
        { text: 'CheckExp(if x < 5 then x+1 else 0, ...)', state: 'active' },
        { text: '  \u251C\u2500 t1 = bool   (condition) \u2713',  state: 'done' },
        { text: '  \u251C\u2500 t2 = number (then)      \u2713',  state: 'done' },
        { text: '  \u2514\u2500 t3 = number (else)      \u2713',  state: 'done' },
        { text: '  t1 = bool \u2714  t2 = t3 \u2714  \u2192 return number', state: 'active' },
      ],
      detail: '<h4>If-then-else checks pass</h4>' +
              '<p>Three conditions are verified:</p>' +
              '<ul style="padding-left:1.2rem; font-size:0.88rem">' +
              '<li><code>t1 = bool</code> &mdash; condition is a boolean &nbsp; <span class="step-result">\u2713</span></li>' +
              '<li><code>t2 = t3</code> &mdash; both branches have the same type &nbsp; <span class="step-result">\u2713</span></li>' +
              '</ul>' +
              '<p>All checks pass. The whole expression returns <span class="step-result">number</span>.</p>' +
              '<p style="font-size:0.82rem; color:var(--col-muted)">No errors were reported. The type checker moves on to the next expression.</p>',
    },
  ];

  var current = 0;
  var treeEl   = document.getElementById('stepTree');
  var detailEl = document.getElementById('stepDetail');
  var counterEl= document.getElementById('stepCounter');
  var prevBtn  = document.getElementById('prevStep');
  var nextBtn  = document.getElementById('nextStep');

  function stateClass(s) {
    if (s === 'active')  return 'tree-line--active';
    if (s === 'done')    return 'tree-line--done';
    return 'tree-line--pending';
  }

  function render() {
    var step = steps[current];

    // tree
    treeEl.innerHTML = step.tree.map(function (line) {
      return '<span class="tree-line ' + stateClass(line.state) + '">' +
             line.text + '</span>';
    }).join('\n');

    // detail
    detailEl.innerHTML = step.detail;

    // counter
    counterEl.textContent = 'Step ' + (current + 1) + ' of ' + steps.length;

    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === steps.length - 1;
  }

  prevBtn.addEventListener('click', function () {
    if (current > 0) { current--; render(); }
  });

  nextBtn.addEventListener('click', function () {
    if (current < steps.length - 1) { current++; render(); }
  });

  render();
})();
