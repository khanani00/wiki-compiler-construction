(function () {
  var steps = [
    {
      detail: `
        <h5 class="mb-2">Step 1: Regex to NFA (_vname)</h5>
        <p class="text-primary small fw-bold mb-2">Pattern: <code>[a-zA-Z][a-zA-Z0-9]*</code></p>
        <p class="text-muted">We begin by converting the regular expression for variable names into a Non-Deterministic Finite Automaton (NFA) using Thompson's Construction.</p>
        <ul class="text-muted small">
          <li>Must start with a letter (a-z or A-Z).</li>
          <li>Can be followed by any number of letters or digits.</li>
          <li>Uses $\\epsilon$-transitions (epsilon transitions) to handle optional repeating characters.</li>
        </ul>`,
      tree: [
        { text: "", state: "active" }
      ]
    },
    {
      detail: `
        <h5 class="mb-2">Step 2: NFA to DFA Conversion</h5>
        <p class="text-primary small fw-bold mb-2">Algorithm: Subset Construction</p>
        <p class="text-muted">We convert the <code>_vname</code> NFA into a Deterministic Finite Automaton (DFA) to eliminate state ambiguity.</p>
        <ul class="text-muted small">
          <li>Each DFA state represents a set of reachable NFA states.</li>
          <li>Calculates $\\epsilon$-closures for every transition.</li>
          <li>Ensures every character input leads to exactly one predictable next state.</li>
        </ul>`,
      tree: [
        { text: "", state: "active" }
      ]
    },
    {
      detail: `
        <h5 class="mb-2">Step 3: DFA Minimization</h5>
        <p class="text-primary small fw-bold mb-2">Algorithm: Hopcroft's Algorithm</p>
        <p class="text-muted">We optimize the DFA for <code>_vname</code> by merging equivalent states into their simplest possible form.</p>
        <ul class="text-muted small">
          <li>Identifies redundant or equivalent states producing identical outcomes.</li>
          <li>Combines states to produce the smallest valid state machine.</li>
          <li>Reduces memory footprint and transition overhead during scanning.</li>
        </ul>`,
      tree: [
        { text: "[ Minimized DFA Diagram Placeholder ]", state: "active" }
      ]
    },
    {
      detail: `
        <h5 class="mb-2">Step 4: Minimized DFAs for Remaining Patterns</h5>
        <p class="text-primary small fw-bold mb-2">Direct Construction</p>
        <p class="text-muted">Since the Regex $\\rightarrow$ NFA $\\rightarrow$ DFA $\\rightarrow$ Minimized DFA pipeline was demonstrated above, we skip directly to the minimized DFAs for the rest of our grammar tokens:</p>
        <ul class="text-muted small">
          <li><strong>_number:</strong> <code>[0-9]+</code></li>
          <li><strong>Assignment:</strong> <code>:=</code></li>
          <li><strong>Symbols:</strong> <code>+</code> and <code>;</code></li>
        </ul>`,
      tree: [
        { text: "[ Minimized DFAs Diagram Placeholder ]", state: "active" }
      ]
    },
    {
      detail: `
        <h5 class="mb-2">Step 5: Combine All DFAs</h5>
        <p class="text-primary small fw-bold mb-2">Master DFA Construction</p>
        <p class="text-muted">We join all individual minimized DFAs into a single unified scanner system.</p>
        <ul class="text-muted small">
          <li>Creates a single start state ($S_0$) branching out to all token paths.</li>
          <li>Resolves overlap between keywords, symbols, numbers, and identifiers.</li>
          <li>Prepares the full transition lookup grid.</li>
        </ul>`,
      tree: [
        { text: "[ Master Combined DFA Placeholder ]", state: "active" }
      ]
    },
    {
      detail: `
        <h5 class="mb-2">Step 6: Lexical Scanner Ready</h5>
        <p class="text-primary small fw-bold mb-2">Execution Phase</p>
        <div class="alert alert-success mt-2 mb-2">
          <h6 class="alert-heading fw-bold mb-1">DFA Ready for Action</h6>
          <p class="mb-0 small">The lexical analyzer reads source code stream, transitions between states, and emits recognized tokens at accepting states.</p>
        </div>`,
      tree: [
        { text: "[ Lexer Execution Flow Placeholder ]", state: "active" }
      ]
    }
  ];

  var current = 0;
  var treeEl    = document.getElementById('constructTree');
  var detailEl  = document.getElementById('constructDetail');
  var counterEl = document.getElementById('constructCounter');
  var prevBtn   = document.getElementById('constructPrev');
  var nextBtn   = document.getElementById('constructNext');

  if (!treeEl) return;

  function render() {
    var step = steps[current];

    // diagrams
    treeEl.innerHTML = step.tree.map(function (line) {
      return '<div class="p-4 border border-dashed rounded text-center bg-light h-100 d-flex align-items-center justify-content-center">' +
             '<span class="text-muted small font-monospace">' + line.text + '</span>' +
             '</div>';
    }).join('\n');

    detailEl.innerHTML = step.detail;

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


//Scanning the input (token-by-token trace) ──────────
(function () {
  var steps = [
    {
      title: 'Start: scanning begins',
      dfa: { states: ['S0'], edges: [] },
      tree: [
        { text: 'scan("x := 5 ; y := x + 1")', state: 'active' },
        { text: '  pos = 0,  state = S0',       state: 'pending' },
        { text: '  tokens = []',                state: 'pending' },
      ],
      detail: '<h4>Ready to scan</h4>' +
              '<p><code>scan()</code> starts at position 0, in state <strong>S0</strong> &mdash; the start state of the combined DFA.</p>' +
              '<p>No tokens have been emitted yet. Each step below consumes one token &mdash; watch the diagram above light up the path taken.</p>',
    },
    {
      title: 'Token 1: x',
      dfa: { states: ['S0', 'S1'], edges: ['edge-S0-S1'] },
      tree: [
        { text: 'scan("x := 5 ; y := x + 1")', state: 'done' },
        { text: '  \u251C\u2500 read \'x\'          S0 \u2192 S1', state: 'active' },
        { text: '  |    (space) forces accept: S1 \u2192 _vname', state: 'active' },
        { text: '  \u251C\u2500 read \':=\'          ...', state: 'pending' },
        { text: '  \u251C\u2500 read \'5\'           ...', state: 'pending' },
        { text: '  \u251C\u2500 read \';\'           ...', state: 'pending' },
        { text: '  \u251C\u2500 read \'y\'           ...', state: 'pending' },
        { text: '  \u251C\u2500 read \':=\'          ...', state: 'pending' },
        { text: '  \u251C\u2500 read \'x\'           ...', state: 'pending' },
        { text: '  \u251C\u2500 read \'+\'           ...', state: 'pending' },
        { text: '  \u2514\u2500 read \'1\'           ...', state: 'pending' },
        { text: 'tokens = [ _vname("x") ]', state: 'active' },
      ],
      detail: '<h4>Case: <code>[a-zA-Z][a-zA-Z0-9]*</code></h4>' +
              '<p><span class="step-call">S0 \u2192 S1</span> on the first character <code>x</code>.</p>' +
              '<p>The next character is a space &mdash; no transition exists, so longest-match forces an accept: <span class="step-result">_vname("x")</span>.</p>',
    },
    {
      title: 'Token 2: :=',
      dfa: { states: ['S0', 'S3', 'S4'], edges: ['edge-S0-S3', 'edge-S3-S4'] },
      tree: [
        { text: 'scan("x := 5 ; y := x + 1")', state: 'done' },
        { text: '  \u251C\u2500 read \'x\'           \u2192 _vname("x") \u2713', state: 'done' },
        { text: '  \u251C\u2500 read \':=\'         S0 \u2192 S3 \u2192 S4', state: 'active' },
        { text: '  |    (space) forces accept: S4 \u2192 :=',              state: 'active' },
        { text: '  \u251C\u2500 read \'5\'           ...', state: 'pending' },
        { text: '  \u251C\u2500 read \';\'           ...', state: 'pending' },
        { text: '  \u251C\u2500 read \'y\'           ...', state: 'pending' },
        { text: '  \u251C\u2500 read \':=\'          ...', state: 'pending' },
        { text: '  \u251C\u2500 read \'x\'           ...', state: 'pending' },
        { text: '  \u251C\u2500 read \'+\'           ...', state: 'pending' },
        { text: '  \u2514\u2500 read \'1\'           ...', state: 'pending' },
        { text: 'tokens = [ _vname("x"), := ]', state: 'active' },
      ],
      detail: '<h4>Case: <code>":="</code></h4>' +
              '<p><span class="step-call">S0 \u2192 S3</span> on <code>:</code>, then <span class="step-call">S3 \u2192 S4</span> on <code>=</code>.</p>' +
              '<p>Space forces accept: <span class="step-result">:=</span>. S3 alone (dashed in the diagram, non-accepting) has no accepting transition &mdash; a lone <code>:</code> would be a lexical error.</p>',
    },
    {
      title: 'Token 3: 5',
      dfa: { states: ['S0', 'S2'], edges: ['edge-S0-S2'] },
      tree: [
        { text: 'scan("x := 5 ; y := x + 1")', state: 'done' },
        { text: '  \u251C\u2500 read \'x\'           \u2192 _vname("x") \u2713', state: 'done' },
        { text: '  \u251C\u2500 read \':=\'          \u2192 := \u2713', state: 'done' },
        { text: '  \u251C\u2500 read \'5\'          S0 \u2192 S2', state: 'active' },
        { text: '  |    \';\' forces accept: S2 \u2192 _number',    state: 'active' },
        { text: '  \u251C\u2500 read \';\'           ...', state: 'pending' },
        { text: '  \u251C\u2500 read \'y\'           ...', state: 'pending' },
        { text: '  \u251C\u2500 read \':=\'          ...', state: 'pending' },
        { text: '  \u251C\u2500 read \'x\'           ...', state: 'pending' },
        { text: '  \u251C\u2500 read \'+\'           ...', state: 'pending' },
        { text: '  \u2514\u2500 read \'1\'           ...', state: 'pending' },
        { text: 'tokens = [ _vname("x"), :=, _number("5") ]', state: 'active' },
      ],
      detail: '<h4>Case: <code>[0-9][0-9]*</code></h4>' +
              '<p><span class="step-call">S0 \u2192 S2</span> on <code>5</code>. The next character is <code>;</code>, not a space &mdash; but <code>;</code> has no <code>[0-9]</code> transition either, so accept still fires.</p>' +
              '<p>Result: <span class="step-result">_number("5")</span>.</p>',
    },
    {
      title: 'Token 4: ;',
      dfa: { states: ['S0'], edges: ['edge-S0-S0'] },
      tree: [
        { text: 'scan("x := 5 ; y := x + 1")', state: 'done' },
        { text: '  \u251C\u2500 read \'x\'           \u2192 _vname("x") \u2713', state: 'done' },
        { text: '  \u251C\u2500 read \':=\'          \u2192 := \u2713', state: 'done' },
        { text: '  \u251C\u2500 read \'5\'           \u2192 _number("5") \u2713', state: 'done' },
        { text: '  \u251C\u2500 read \';\'          S0 \u2192 accept', state: 'active' },
        { text: '  \u251C\u2500 read \'y\'           ...', state: 'pending' },
        { text: '  \u251C\u2500 read \':=\'          ...', state: 'pending' },
        { text: '  \u251C\u2500 read \'x\'           ...', state: 'pending' },
        { text: '  \u251C\u2500 read \'+\'           ...', state: 'pending' },
        { text: '  \u2514\u2500 read \'1\'           ...', state: 'pending' },
        { text: 'tokens = [ _vname("x"), :=, _number("5"), ; ]', state: 'active' },
      ],
      detail: '<h4>Case: <code>";"</code></h4>' +
              '<p><code>;</code> accepts immediately from S0 &mdash; single-character tokens need no lookahead. This is the dashed loop back onto S0 in the diagram, not a real "self transition" &mdash; it just means scanning resets to S0 for the next token.</p>' +
              '<p>Result: <span class="step-result">;</span>. This separates the two <code>STAT</code> productions &mdash; it does not terminate the first one.</p>',
    },
    {
      title: 'Token 5: y',
      dfa: { states: ['S0', 'S1'], edges: ['edge-S0-S1'] },
      tree: [
        { text: 'scan("x := 5 ; y := x + 1")', state: 'done' },
        { text: '  \u251C\u2500 read \'x\'           \u2192 _vname("x") \u2713', state: 'done' },
        { text: '  \u251C\u2500 read \':=\'          \u2192 := \u2713', state: 'done' },
        { text: '  \u251C\u2500 read \'5\'           \u2192 _number("5") \u2713', state: 'done' },
        { text: '  \u251C\u2500 read \';\'           \u2192 ; \u2713', state: 'done' },
        { text: '  \u251C\u2500 read \'y\'          S0 \u2192 S1', state: 'active' },
        { text: '  |    (space) forces accept: S1 \u2192 _vname',   state: 'active' },
        { text: '  \u251C\u2500 read \':=\'          ...', state: 'pending' },
        { text: '  \u251C\u2500 read \'x\'           ...', state: 'pending' },
        { text: '  \u251C\u2500 read \'+\'           ...', state: 'pending' },
        { text: '  \u2514\u2500 read \'1\'           ...', state: 'pending' },
        { text: 'tokens = [ ..., _vname("y") ]', state: 'active' },
      ],
      detail: '<h4>Case: <code>[a-zA-Z][a-zA-Z0-9]*</code> (again)</h4>' +
              '<p>Same path as token 1: <span class="step-call">S0 \u2192 S1</span>, accept on space.</p>' +
              '<p>Result: <span class="step-result">_vname("y")</span>.</p>',
    },
    {
      title: 'Tokens 6\u20138: :=, x, +',
      dfa: { states: ['S0', 'S1', 'S3', 'S4'], edges: ['edge-S0-S3', 'edge-S3-S4', 'edge-S0-S1', 'edge-S0-S0'] },
      tree: [
        { text: 'scan("x := 5 ; y := x + 1")', state: 'done' },
        { text: '  \u251C\u2500 read \'x\'           \u2192 _vname("x") \u2713', state: 'done' },
        { text: '  \u251C\u2500 read \':=\'          \u2192 := \u2713', state: 'done' },
        { text: '  \u251C\u2500 read \'5\'           \u2192 _number("5") \u2713', state: 'done' },
        { text: '  \u251C\u2500 read \';\'           \u2192 ; \u2713', state: 'done' },
        { text: '  \u251C\u2500 read \'y\'           \u2192 _vname("y") \u2713', state: 'done' },
        { text: '  \u251C\u2500 read \':=\'         S0 \u2192 S3 \u2192 S4 \u2192 := \u2713', state: 'active' },
        { text: '  \u251C\u2500 read \'x\'          S0 \u2192 S1 \u2192 _vname("x") \u2713',    state: 'active' },
        { text: '  \u251C\u2500 read \'+\'          S0 \u2192 accept \u2192 + \u2713',            state: 'active' },
        { text: '  \u2514\u2500 read \'1\'           ...', state: 'pending' },
        { text: 'tokens = [ ..., :=, _vname("x"), + ]', state: 'active' },
      ],
      detail: '<h4>No new cases</h4>' +
              '<p>All three highlighted paths repeat ones already seen: <code>:=</code> (token 2), <code>[a-zA-Z]...</code> (token 1), and immediate accept (token 4, same pattern as <code>;</code>).</p>' +
              '<p>Grouped here since nothing new happens &mdash; the point of practice is recognizing when a token type repeats, which the lit-up diagram makes obvious.</p>',
    },
    {
      title: 'Token 9: 1 (end of input)',
      dfa: { states: ['S0', 'S2'], edges: ['edge-S0-S2'] },
      tree: [
        { text: 'scan("x := 5 ; y := x + 1")', state: 'done' },
        { text: '  \u251C\u2500 read \'x\'           \u2192 _vname("x") \u2713', state: 'done' },
        { text: '  \u251C\u2500 read \':=\'          \u2192 := \u2713', state: 'done' },
        { text: '  \u251C\u2500 read \'5\'           \u2192 _number("5") \u2713', state: 'done' },
        { text: '  \u251C\u2500 read \';\'           \u2192 ; \u2713', state: 'done' },
        { text: '  \u251C\u2500 read \'y\'           \u2192 _vname("y") \u2713', state: 'done' },
        { text: '  \u251C\u2500 read \':=\'          \u2192 := \u2713', state: 'done' },
        { text: '  \u251C\u2500 read \'x\'           \u2192 _vname("x") \u2713', state: 'done' },
        { text: '  \u251C\u2500 read \'+\'           \u2192 + \u2713', state: 'done' },
        { text: '  \u2514\u2500 read \'1\'          S0 \u2192 S2', state: 'active' },
        { text: '       end of input forces accept: S2 \u2192 _number', state: 'active' },
        { text: 'tokens = [ _vname("x"), :=, _number("5"), ;, _vname("y"), :=, _vname("x"), +, _number("1") ]', state: 'active' },
      ],
      detail: '<h4>End of input</h4>' +
              '<p><span class="step-call">S0 \u2192 S2</span> on <code>1</code>. There is no next character to check against &mdash; end of input forces the same accept behaviour as any non-matching character would.</p>' +
              '<p>Result: <span class="step-result">_number("1")</span>. Full token stream is now complete &mdash; this is exactly what Chapter 2\u2019s parser receives.</p>',
    },
  ];

  var current = 0;
  var treeEl    = document.getElementById('stepTree');
  var detailEl  = document.getElementById('stepDetail');
  var counterEl = document.getElementById('stepCounter');
  var prevBtn   = document.getElementById('prevStep');
  var nextBtn   = document.getElementById('nextStep');
  var dfaEl     = document.getElementById('dfaDiagram');

  if (!treeEl) return; // stepper not on this page — do nothing

//   if (dfaEl) { dfaEl.innerHTML = DFA_SVG; }

  function stateClass(s) {
    if (s === 'active') return 'tree-line--active';
    if (s === 'done')   return 'tree-line--done';
    return 'tree-line--pending';
  }

  function renderDfa(step) {
    if (!dfaEl) return;
    dfaEl.querySelectorAll('.dfa-state').forEach(function (el) {
      el.classList.remove('dfa-state--active');
    });
    dfaEl.querySelectorAll('.dfa-edge').forEach(function (el) {
      el.classList.remove('dfa-edge--active');
    });

    var dfa = step.dfa || { states: [], edges: [] };
    dfa.states.forEach(function (id) {
      var el = document.getElementById('state-' + id);
      if (el) el.classList.add('dfa-state--active');
    });
    dfa.edges.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.add('dfa-edge--active');
    });
  }

  function render() {
    var step = steps[current];

    treeEl.innerHTML = step.tree.map(function (line) {
      return '<span class="tree-line ' + stateClass(line.state) + '">' +
             line.text + '</span>';
    }).join('\n');

    detailEl.innerHTML = step.detail;
    renderDfa(step);
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