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


(function () {
  
function L(t) { return { text: t, state: 'active' }; }
function P(t) { return { text: t, state: 'pending' }; }

var steps = [
  {
    title: 'Start: scanning begins',
    tree: [
      L('input: main(number a, number b) {'),
      L('         number result := 0;'),
      L('         result := gcd(a, b);'),
      L('         return result }'),
      P('pos = 0, state = S0, last accepting = none'),
      P('tokens = []'),
    ],
    detail: '<h4>Ready to scan</h4>' +
            '<p><code>scan()</code> starts at <strong>S0</strong>, the start state of the combined, minimised DFA.</p>' +
            '<p>The method has 26 tokens. Repeated patterns are only explained the first time they appear. Whitespace takes S0 back to S0 and emits nothing.</p>' +
            '<p>One extra step happens after the DFA accepts an identifier: the scanner looks at the next character to label it <code>_fname</code> (next character is <code>(</code>) or <code>_vname</code> (anything else).</p>',
  },
  {
    title: 'main(number a, number b) {',
    tree: [
      L("m,a,i,n    keyword path; next '(' has no edge"),
      L('  last accepting {KEYWORD(main), IDENT}'),
      L('  priority \u2192 KEYWORD(main)'),
      L('(          \u2192 SYMBOL(()'),
      L('number     \u2192 KEYWORD(number)'),
      L('a          IDENT accepted; next is "," \u2192 _vname(a)'),
      L(',          \u2192 SYMBOL(,)'),
      L('number     \u2192 KEYWORD(number)'),
      L('b          IDENT accepted; next is ")" \u2192 _vname(b)'),
      L(')  {       \u2192 SYMBOL()), SYMBOL({)'),
      P('running total: 9 tokens'),
    ],
    detail: '<h4>Keyword, then name</h4>' +
            '<p><code>main</code> reaches a state that accepts both KEYWORD and IDENT. Priority picks <span class="step-result">KEYWORD(main)</span>, so it is never labelled <code>_fname</code>, even though a <code>(</code> follows. The same priority applies to <code>number</code>.</p>' +
            '<p><code>a</code> and <code>b</code> are accepted by the identifier machine and then labelled <span class="step-result">_vname</span>, because they are not followed by <code>(</code>.</p>' +
            '<p>Each single-character symbol is accepted in one step.</p>',
  },
  {
    title: 'number result := 0;',
    tree: [
      L('number     \u2192 KEYWORD(number)   (repeat)'),
      L('r,e        still on the "return" keyword path'),
      L("s          path expects 't' \u2192 leave to IDENT loop"),
      L('u,l,t      IDENT loop; next is ":" \u2192 _vname(result)'),
      L('read :     S0 \u2192 q1 (non-accepting)'),
      L('read =     q1 \u2192 q2 (accepting) \u2192 ASSIGN'),
      L('0          S0 \u2192 NUMBER-zero \u2192 _number(0)'),
      L(';          \u2192 SYMBOL(;)'),
      P('running total: 14 tokens'),
    ],
    detail: '<h4>Three new patterns</h4>' +
            '<p><code>result</code> starts like <code>return</code>, but the <code>s</code> breaks the match. Every keyword-prefix state also accepts IDENT, so nothing is lost.</p>' +
            '<p><code>:=</code> needs two real transitions. A lone <code>:</code> never reaches an accepting state.</p>' +
            '<p><code>0</code> leads to a state with no exits, so a leading zero cannot be followed by more digits.</p>',
  },
  {
    title: 'result := gcd(a, b);',
    tree: [
      L('result     IDENT accepted; next is ":" \u2192 _vname(result)'),
      L(':=         \u2192 ASSIGN   (repeat)'),
      L('g,c,d      IDENT loop; next is "("'),
      L('  \u2192 _fname(gcd)'),
      L('(          \u2192 SYMBOL(()'),
      L('a          next is "," \u2192 _vname(a)'),
      L(',          \u2192 SYMBOL(,)'),
      L('b          next is ")" \u2192 _vname(b)'),
      L(')  ;       \u2192 SYMBOL()), SYMBOL(;)'),
      P('running total: 23 tokens'),
    ],
    detail: '<h4>_fname vs _vname</h4>' +
            '<p><code>gcd</code> and <code>a</code> end in the same accepting state of the DFA. The scanner then peeks at the next character: <code>(</code> gives <span class="step-result">_fname(gcd)</span>, anything else gives <span class="step-result">_vname</span>.</p>' +
            '<p>So the split between <code>_vname</code> and <code>_fname</code> is not done by the automaton itself. It is a small rule applied to the lexeme after acceptance.</p>',
  },
  {
    title: 'return result }',
    tree: [
      L('r,e,t,u,r,n  return path \u2192 KEYWORD(return)'),
      L('result       next is "}" \u2192 _vname(result)'),
      L('}            \u2192 SYMBOL(})'),
      P('running total: 26 tokens'),
    ],
    detail: '<h4>End of main</h4>' +
            '<p>There is no <code>;</code> after <code>return result</code>, because <code>;</code> only separates statements. The scanner emits just what it sees.</p>',
  },
  {
    title: 'End of input',
    tree: [
      L('tokens = [ KEYWORD(main), (, KEYWORD(number), _vname(a), ,,'),
      L('           KEYWORD(number), _vname(b), ), {,'),
      L('           KEYWORD(number), _vname(result), :=, _number(0), ;,'),
      L('           _vname(result), :=, _fname(gcd), (, _vname(a), ,, _vname(b), ), ;,'),
      L('           KEYWORD(return), _vname(result), } ]'),
      L('total: 26 tokens, no lexical errors'),
    ],
    detail: '<h4>Token stream complete</h4>' +
            '<p>One left-to-right pass, no backtracking. This is exactly the stream Chapter 2&rsquo;s parser receives, and each token matches a terminal in the grammar: <code>_vname</code>, <code>_fname</code> and <code>_number</code>.</p>',
  },

  /* ───────────── extra cases ───────────── */
  {
    title: 'Extra: longest match (whilex)',
    tree: [
      L('read w,h,i,l,e   last accepting = {KEYWORD(while), IDENT}'),
      L('read x           a transition exists (to IDENT): keep going'),
      L("next ' ': no transition; last accepting = IDENT"),
      L('  \u2192 _vname(whilex), not KEYWORD(while) + _vname(x)'),
    ],
    detail: '<h4>Longest match</h4>' +
            '<p><code>main</code> never needs this, but it is why the scanner waits. We stop only when no transition exists, and the token is decided by the <em>last</em> accepting state passed, not the first.</p>',
  },
  {
    title: 'Extra: lexical errors',
    tree: [
      L('input: result : = 0'),
      L('read :   S0 \u2192 q1 (non-accepting)'),
      L("next ' ': no transition, no accepting state passed"),
      L('  \u2192 LEXICAL ERROR at this position'),
      P(''),
      L('input: @'),
      L('  S0 has no transition on @ \u2192 LEXICAL ERROR'),
    ],
    detail: '<h4>Error rule</h4>' +
            '<p>If no transition exists and no accepting state was passed since the token began, the lexer reports <span class="step-error">lexical error</span>. It never skips or guesses.</p>' +
            '<p><code>: =</code> with a space fails because <code>:</code> alone is not a token.</p>',
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