// Tab switching for the "Creating the DFA" section (Step 1 and Step 2).
// Works for any number of .tabs groups on the page — each group's buttons
// and panels are matched by data-tab / id, scoped to that group only.
(function () {
  var tabGroups = document.querySelectorAll('.tabs');

  tabGroups.forEach(function (group) {
    var buttons = group.querySelectorAll('.tab-button');
    var panels = group.querySelectorAll('.tab-panel');

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var target = button.getAttribute('data-tab');

        buttons.forEach(function (b) { b.classList.remove('active'); });
        panels.forEach(function (p) { p.classList.remove('active'); });

        button.classList.add('active');
        var targetPanel = group.querySelector('#' + target);
        if (targetPanel) targetPanel.classList.add('active');
      });
    });
  });
})();


//Scanning the input (token-by-token trace) ──────────
// Traces the actual Program used throughout the site:
//   main() { number x := 5; text y := "hello"; number z := x + y; }
(function () {
  var steps = [
    {
      title: 'Start: scanning begins',
      tree: [
        { text: 'scan(the Program)', state: 'active' },
        { text: '  pos = 0,  state = S0', state: 'pending' },
        { text: '  tokens = []', state: 'pending' },
      ],
      detail: '<h4>Ready to scan</h4>' +
              '<p><code>scan()</code> starts at position 0, in state <strong>S0</strong> &mdash; the start state of the combined DFA.</p>' +
              '<p>This trace runs the whole Program, not just a fragment &mdash; 22 tokens, reusing the same handful of automata over and over. From here, repeated patterns get grouped so the trace stays readable; each genuinely new pattern gets its own step.</p>',
    },
    {
      title: 'Token 1: main',
      tree: [
        { text: 'read \'main\'   S0 \u2192 S1 (identifier path)', state: 'active' },
        { text: '  \'(\' forces accept: S1 \u2192 identifier "main"', state: 'active' },
        { text: 'reserved-word lookup: "main" \u2208 {main, number, text, if, ...}', state: 'active' },
        { text: '  \u2192 reclassified as KEYWORD(main), not _vname', state: 'active' },
        { text: 'tokens = [ main ]', state: 'active' },
      ],
      detail: '<h4>First keyword</h4>' +
              '<p>The identifier automaton accepts <code>main</code> exactly the way it would accept any identifier &mdash; the DFA itself has no idea "main" is special.</p>' +
              '<p>The reserved-word check happens <em>after</em> acceptance, on the matched lexeme, not as part of the automaton: since <code>"main"</code> is in the keyword table, it\'s emitted as <span class="step-result">KEYWORD(main)</span>.</p>',
    },
    {
      title: 'Tokens 2\u20134: ( ) {',
      tree: [
        { text: 'read \'(\'   S0 \u2192 accept \u2192 (', state: 'active' },
        { text: 'read \')\'   S0 \u2192 accept \u2192 )', state: 'active' },
        { text: 'read \'{\'   S0 \u2192 accept \u2192 {', state: 'active' },
        { text: 'tokens = [ main, (, ), { ]', state: 'active' },
      ],
      detail: '<h4>First symbols</h4>' +
              '<p>Every single-character symbol (<code>( ) { } , ; - + * /</code>) follows this same one-step pattern: no lookahead needed, accept immediately on the one character. Three different symbols, same mechanism &mdash; grouped here since none of them individually add anything new.</p>',
    },
    {
      title: 'Tokens 5\u20136: number, x',
      tree: [
        { text: 'read \'number\'   S0 \u2192 S1 \u2192 accept \u2192 identifier "number"', state: 'active' },
        { text: '  lookup: "number" \u2208 keywords \u2192 KEYWORD(number)', state: 'active' },
        { text: 'read \'x\'        S0 \u2192 S1 \u2192 accept \u2192 identifier "x"', state: 'active' },
        { text: '  lookup: "x" \u2209 keywords \u2192 stays _vname("x")', state: 'active' },
        { text: 'tokens = [ ..., number, _vname(x) ]', state: 'active' },
      ],
      detail: '<h4>The other half of the lookup</h4>' +
              '<p><code>number</code> repeats the keyword pattern from Token 1. <code>x</code> runs through the exact same automaton and lands on the exact same kind of accepting state &mdash; the only difference is the table lookup this time comes back empty, so it stays a plain <span class="step-result">_vname("x")</span>. Same DFA path, different outcome after acceptance.</p>',
    },
    {
      title: 'Token 7: :=',
      tree: [
        { text: 'read \':=\'   S0 \u2192 S3 \u2192 S4 \u2192 accept \u2192 :=', state: 'active' },
        { text: 'tokens = [ ..., := ]', state: 'active' },
      ],
      detail: '<h4>First assignment</h4>' +
              '<p>Two-character literal, two real transitions: <code>:</code> then <code>=</code>. S3 alone (after just <code>:</code>) is non-accepting &mdash; a lone <code>:</code> would be a lexical error.</p>',
    },
    {
      title: 'Token 8: 5',
      tree: [
        { text: 'read \'5\'   S0 \u2192 S2 \u2192 accept \u2192 _number("5")', state: 'active' },
        { text: '  \';\' forces the accept (no [0-9] transition on \';\')', state: 'active' },
        { text: 'tokens = [ ..., _number(5) ]', state: 'active' },
      ],
      detail: '<h4>First number literal</h4>' +
              '<p>Same shape as the identifier automaton, different character class: <code>[0-9][0-9]*</code>.</p>',
    },
    {
      title: 'Tokens 9\u201312: ; text y :=',
      tree: [
        { text: 'read \';\'     \u2192 ; (repeat: symbol)', state: 'active' },
        { text: 'read \'text\'  \u2192 KEYWORD(text) (repeat: keyword hit)', state: 'active' },
        { text: 'read \'y\'     \u2192 _vname(y) (repeat: identifier miss)', state: 'active' },
        { text: 'read \':=\'    \u2192 := (repeat: assign)', state: 'active' },
        { text: 'tokens = [ ..., ;, text, _vname(y), := ]', state: 'active' },
      ],
      detail: '<h4>No new cases</h4>' +
              '<p>Every one of these four repeats a pattern already shown &mdash; grouped together since nothing new happens.</p>',
    },
    {
      title: 'Token 13: "hello"',
      tree: [
        { text: 'read \'"\'        S0 \u2192 S5 (non-accepting: string opened)', state: 'active' },
        { text: 'read h,e,l,l,o  S5 \u2192 S5 (self-loop, still non-accepting)', state: 'active' },
        { text: 'read \'"\'        S5 \u2192 accept \u2192 _text("hello")', state: 'active' },
        { text: 'tokens = [ ..., _text("hello") ]', state: 'active' },
      ],
      detail: '<h4>The one text literal in this program</h4>' +
              '<p>Different shape from every other automaton so far: opening the quote does <em>not</em> accept, the loop in the middle stays non-accepting the whole way through, and only the closing quote flips it to accepting. This is the only point in the whole trace where this automaton fires &mdash; every other token in the Program is a keyword, identifier, number, assign, or symbol.</p>',
    },
    {
      title: 'Tokens 14\u201321: ; number z := x + y ;',
      tree: [
        { text: 'read \';\'      \u2192 ; (repeat)', state: 'active' },
        { text: 'read \'number\' \u2192 KEYWORD(number) (repeat)', state: 'active' },
        { text: 'read \'z\'      \u2192 _vname(z) (repeat)', state: 'active' },
        { text: 'read \':=\'     \u2192 := (repeat)', state: 'active' },
        { text: 'read \'x\'      \u2192 _vname(x) (repeat)', state: 'active' },
        { text: 'read \'+\'      S0 \u2192 accept \u2192 + (NEW: first operator)', state: 'active' },
        { text: 'read \'y\'      \u2192 _vname(y) (repeat)', state: 'active' },
        { text: 'read \';\'      \u2192 ; (repeat)', state: 'active' },
        { text: 'tokens = [ ..., ;, number, _vname(z), :=, _vname(x), +, _vname(y), ; ]', state: 'active' },
      ],
      detail: '<h4>One new case, buried in repeats</h4>' +
              '<p>Everything here repeats a pattern already established, except <code>+</code> &mdash; the first arithmetic operator in the trace. It follows the exact same immediate-accept mechanism as the symbols group from Tokens 2&ndash;4, just a different literal character.</p>',
    },
    {
      title: 'Token 22: } (end of input)',
      tree: [
        { text: 'read \'}\'   S0 \u2192 accept \u2192 }', state: 'active' },
        { text: 'end of input reached', state: 'active' },
        { text: 'tokens = [ main, (, ), {, number, _vname(x), :=, _number(5), ;,', state: 'active' },
        { text: '           text, _vname(y), :=, _text("hello"), ;, number,', state: 'active' },
        { text: '           _vname(z), :=, _vname(x), +, _vname(y), ;, } ]', state: 'active' },
      ],
      detail: '<h4>Full token stream complete</h4>' +
              '<p>22 tokens from 6 automata &mdash; identifier/keyword, number, text, assign, operator, symbols &mdash; every one reused multiple times except the text literal, which fired exactly once. This is exactly what Chapter 2&rsquo;s parser receives.</p>',
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