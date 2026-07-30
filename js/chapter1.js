(function () {
  var steps = [
    {
      title: 'Step 1: The regex for _vname',
      tree: [
        { text: 'construct("[a-zA-Z][a-zA-Z0-9]*")', state: 'active' },
        { text: '  1. regex                    \u2192 [a-zA-Z][a-zA-Z0-9]*', state: 'active' },
        { text: '  2. build the NFA            ...', state: 'pending' },
        { text: '  3. subset construction      ...', state: 'pending' },
        { text: '  4. minimize                 ...', state: 'pending' },
        { text: '  5. the other four patterns  ...', state: 'pending' },
        { text: '  6. combine into one DFA     ...', state: 'pending' },
      ],
      detail: '<h4>Starting point</h4>' +
              '<p>Everything below is derived from this one regex &mdash; nothing in the final DFA is asserted without a reason.</p>' +
              '<p><code>[a-zA-Z][a-zA-Z0-9]*</code>: one letter, followed by zero or more letters/digits.</p>',
    },
    {
      title: 'Step 2: Build the NFA',
      tree: [
        { text: 'construct("[a-zA-Z][a-zA-Z0-9]*")', state: 'done' },
        { text: '  1. regex                    \u2192 [a-zA-Z][a-zA-Z0-9]* \u2713', state: 'done' },
        { text: '  2. build the NFA', state: 'active' },
        { text: '  |    n0 --[a-zA-Z]--> n1 --\u03b5--> n2 --\u03b5--> n3 --[a-zA-Z0-9]--> n4', state: 'active' },
        { text: '  |    n2 --\u03b5--> n5   (skip the loop entirely)', state: 'active' },
        { text: '  |    n4 --\u03b5--> n2   (repeat)      n4 --\u03b5--> n5   (exit)', state: 'active' },
        { text: '  3. subset construction      ...', state: 'pending' },
        { text: '  4. minimize                 ...', state: 'pending' },
        { text: '  5. the other four patterns  ...', state: 'pending' },
        { text: '  6. combine into one DFA     ...', state: 'pending' },
      ],
      detail: '<h4>One rule per regex piece</h4>' +
              '<p>A char-class atom (<code>[a-zA-Z]</code>) becomes two states joined by one edge. The <code>*</code> wraps its inner fragment (<code>[a-zA-Z0-9]</code>, built the same way) with a fresh start/accept pair and two extra \u03b5-edges: one to skip the loop, one to repeat it. Concatenation chains fragments with an \u03b5-edge.</p>' +
              '<p><code>n0</code> = start, <code>n5</code> = accept.</p>',
    },
    {
      title: 'Step 3: Subset construction \u2014 NFA to DFA',
      tree: [
        { text: 'construct("[a-zA-Z][a-zA-Z0-9]*")', state: 'done' },
        { text: '  1. regex                    \u2192 [a-zA-Z][a-zA-Z0-9]* \u2713', state: 'done' },
        { text: '  2. build the NFA            \u2192 6 states, 3 \u03b5-edges \u2713', state: 'done' },
        { text: '  3. subset construction', state: 'active' },
        { text: '  |    A = closure({n0}) = {n0}                          (start)', state: 'active' },
        { text: '  |    on [a-zA-Z] from A \u2192 B = closure({n1}) = {n1,n2,n3,n5}   accepting', state: 'active' },
        { text: '  |    on [a-zA-Z0-9] from B \u2192 C = closure({n4}) = {n4,n2,n3,n5}   accepting', state: 'active' },
        { text: '  4. minimize                 ...', state: 'pending' },
        { text: '  5. the other four patterns  ...', state: 'pending' },
        { text: '  6. combine into one DFA     ...', state: 'pending' },
      ],
      detail: '<h4>Sets of NFA states become single DFA states</h4>' +
              '<p>Each \u03b5-closure is one DFA state. <span class="step-call">A --[a-zA-Z]--> B</span>, then <span class="step-call">B --[a-zA-Z0-9]--> C</span>. Both B and C contain <code>n5</code>, so both are accepting.</p>',
    },
    {
      title: 'Step 4: Minimize',
      tree: [
        { text: 'construct("[a-zA-Z][a-zA-Z0-9]*")', state: 'done' },
        { text: '  1. regex                    \u2192 [a-zA-Z][a-zA-Z0-9]* \u2713', state: 'done' },
        { text: '  2. build the NFA            \u2192 6 states, 3 \u03b5-edges \u2713', state: 'done' },
        { text: '  3. subset construction      \u2192 A, B, C \u2713', state: 'done' },
        { text: '  4. minimize', state: 'active' },
        { text: '  |    B and C: both accepting, both loop to C on [a-zA-Z0-9], no other edges', state: 'active' },
        { text: '  |    no input string can tell them apart  \u2192  merge  B \u2261 C', state: 'active' },
        { text: '  result: S0 --[a-zA-Z]--> S1  (accepting, loops on [a-zA-Z0-9])', state: 'active' },
        { text: '  5. the other four patterns  ...', state: 'pending' },
        { text: '  6. combine into one DFA     ...', state: 'pending' },
      ],
      detail: '<h4>Same shape as the trace</h4>' +
              '<p><span class="step-result">S0 \u2192 S1</span> with a self-loop &mdash; this is the exact transition used in every <code>_vname</code> step of the worked-example trace below. It wasn\'t asserted there; this is where it comes from.</p>',
    },
    {
      title: 'Step 5: The other four patterns',
      tree: [
        { text: 'construct("[a-zA-Z][a-zA-Z0-9]*")', state: 'done' },
        { text: '  1\u20134. (as above)                              \u2192 S0 \u2192 S1 \u2713', state: 'done' },
        { text: '  5. the other four patterns', state: 'active' },
        { text: '  |    _number  [0-9][0-9]*   \u2192 same shape \u2192 S0 --[0-9]--> S2  (loops)', state: 'active' },
        { text: '  |    :=       ":="          \u2192 concatenation only \u2192 S0 --:--> S3 --=--> S4', state: 'active' },
        { text: '  |    +        "+"           \u2192 single literal \u2192 S0 --+--> S5  (accept)', state: 'active' },
        { text: '  |    ;        ";"           \u2192 single literal \u2192 S0 --;--> S6  (accept)', state: 'active' },
        { text: '  6. combine into one DFA     ...', state: 'pending' },
      ],
      detail: '<h4>Same rules, smaller patterns</h4>' +
              '<p><code>_number</code> repeats the same argument as <code>_vname</code>. The three literal patterns have no <code>*</code>, so nothing to minimize &mdash; every state is already distinguishable.</p>',
    },
    {
      title: 'Step 6: Combine into one DFA',
      tree: [
        { text: 'construct("[a-zA-Z][a-zA-Z0-9]*")', state: 'done' },
        { text: '  1\u20135. (as above)                               \u2713', state: 'done' },
        { text: '  6. combine into one DFA', state: 'active' },
        { text: '  |    all five NFAs joined under one shared start state', state: 'active' },
        { text: '  |    subset construction run across all five together, not one at a time', state: 'active' },
        { text: '  final states: S0, S1, S2, S3, S4, S5, S6    (7 states)', state: 'active' },
      ],
      detail: '<h4>Ready to scan</h4>' +
              '<p>This 7-state DFA is exactly what the worked example below scans against. Note <code>+</code> and <code>;</code> land on their own accept states (S5, S6) rather than looping back onto S0 &mdash; the "reset to S0" behaviour belongs to the scan loop between tokens, not to the automaton itself.</p>',
    },
  ];

  var current = 0;
  var treeEl    = document.getElementById('constructTree');
  var detailEl  = document.getElementById('constructDetail');
  var counterEl = document.getElementById('constructCounter');
  var prevBtn   = document.getElementById('constructPrev');
  var nextBtn   = document.getElementById('constructNext');

  if (!treeEl) return; // stepper not on this page — do nothing

  function stateClass(s) {
    if (s === 'active') return 'tree-line--active';
    if (s === 'done')   return 'tree-line--done';
    return 'tree-line--pending';
  }

  function render() {
    var step = steps[current];

    treeEl.innerHTML = step.tree.map(function (line) {
      return '<span class="tree-line ' + stateClass(line.state) + '">' +
             line.text + '</span>';
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


// ── Widget 2: DFA diagram (static SVG, states/edges highlighted per step) ──
// Add this container somewhere inside your second .stepper-body, above
// or beside stepTree — it does not need to be inside stepTree itself:
//
//   <div class="dfa-diagram" id="dfaDiagram"></div>
//
var DFA_SVG = '' +
  '<svg viewBox="0 0 480 320" class="dfa-svg" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
      '<marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">' +
        '<path d="M0,0 L0,6 L9,3 z" class="dfa-arrowhead" />' +
      '</marker>' +
    '</defs>' +

    '<line x1="15" y1="160" x2="42" y2="160" class="dfa-edge" marker-end="url(#arrow)" />' +

    '<line id="edge-S0-S1" x1="95" y1="140" x2="205" y2="85" class="dfa-edge" marker-end="url(#arrow)" />' +
    '<text x="130" y="100" class="dfa-label">[a-zA-Z]</text>' +

    '<path id="edge-S1-S1" d="M215,45 C205,15 255,15 245,45" class="dfa-edge" marker-end="url(#arrow)" fill="none" />' +
    '<text x="200" y="15" class="dfa-label">[a-zA-Z0-9]</text>' +

    '<line id="edge-S0-S2" x1="95" y1="180" x2="205" y2="235" class="dfa-edge" marker-end="url(#arrow)" />' +
    '<text x="130" y="230" class="dfa-label">[0-9]</text>' +

    '<path id="edge-S2-S2" d="M215,285 C205,315 255,315 245,285" class="dfa-edge" marker-end="url(#arrow)" fill="none" />' +
    '<text x="205" y="318" class="dfa-label">[0-9]</text>' +

    '<line id="edge-S0-S3" x1="98" y1="160" x2="202" y2="160" class="dfa-edge" marker-end="url(#arrow)" />' +
    '<text x="140" y="150" class="dfa-label">:</text>' +

    '<line id="edge-S3-S4" x1="258" y1="160" x2="352" y2="160" class="dfa-edge" marker-end="url(#arrow)" />' +
    '<text x="295" y="150" class="dfa-label">=</text>' +

    '<path id="edge-S0-S0" d="M55,135 C35,95 105,95 85,135" class="dfa-edge" marker-end="url(#arrow)" fill="none" />' +
    '<text x="40" y="85" class="dfa-label">+  ;  (accept)</text>' +

    '<g id="state-S0" class="dfa-state dfa-state--accept">' +
      '<circle cx="70" cy="160" r="28" />' +
      '<circle cx="70" cy="160" r="22" class="dfa-state-inner" />' +
      '<text x="70" y="165">S0</text>' +
    '</g>' +

    '<g id="state-S1" class="dfa-state dfa-state--accept">' +
      '<circle cx="230" cy="70" r="28" />' +
      '<circle cx="230" cy="70" r="22" class="dfa-state-inner" />' +
      '<text x="230" y="75">S1</text>' +
    '</g>' +

    '<g id="state-S2" class="dfa-state dfa-state--accept">' +
      '<circle cx="230" cy="250" r="28" />' +
      '<circle cx="230" cy="250" r="22" class="dfa-state-inner" />' +
      '<text x="230" y="255">S2</text>' +
    '</g>' +

    '<g id="state-S3" class="dfa-state">' +
      '<circle cx="230" cy="160" r="28" />' +
      '<text x="230" y="165">S3</text>' +
    '</g>' +

    '<g id="state-S4" class="dfa-state dfa-state--accept">' +
      '<circle cx="380" cy="160" r="28" />' +
      '<circle cx="380" cy="160" r="22" class="dfa-state-inner" />' +
      '<text x="380" y="165">S4</text>' +
    '</g>' +
  '</svg>';


// ── Widget 3: Scanning the input (token-by-token trace) ──────────
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

  if (dfaEl) { dfaEl.innerHTML = DFA_SVG; }

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