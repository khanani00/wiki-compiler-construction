// ── CheckExp case click handler ─────────────────────────────────
(function () {
  var cases      = document.querySelectorAll('.ce-case');
  var panels     = document.querySelectorAll('.explain-panel');
  var placeholder= document.querySelector('.explain-placeholder');

  cases.forEach(function (el) {
    el.addEventListener('click', function () {
      var key = el.dataset.case;
      cases.forEach(function (c) { c.classList.remove('active'); });
      el.classList.add('active');
      if (placeholder) placeholder.style.display = 'none';
      panels.forEach(function (p) {
        p.style.display = p.dataset.panel === key ? 'block' : 'none';
      });
    });
  });
})();

// ── Step-by-step trace ──────────────────────────────────────────
// Assumption: vtable and ftable are already built.
// vtable (main)  = { a→number, b→number, result→number }
// vtable (gcd)   = { a→number, b→number, temp→number }
// ftable (global)= { gcd→(number,number)→number, isZero→(number)→number }
// We trace CheckFun on main then gcd — only the checking decisions.
(function () {

  var steps = [

    // ── CHECKING MAIN ───────────────────────────────────────────
    {
      phase: 'CheckFun(main)',
      title: 'Check statement: result := gcd(a, b)',
      tree: [
        { text: 'Given:', state: 'done' },
        { text: '  vtable = { a\u2192number, b\u2192number, result\u2192number }', state: 'done' },
        { text: '  ftable = { gcd\u2192(number,number)\u2192number, ... }', state: 'done' },
        { text: '', state: 'pending' },
        { text: 'CheckExp(gcd(a, b), vtable, ftable)', state: 'active' },
        { text: '  [function call case]', state: 'active' },
        { text: '  t = lookup(ftable, "gcd")', state: 'pending' },
        { text: '  \u2192 (number, number) \u2192 number  \u2713', state: 'pending' },
      ],
      detail: '<h4>Assignment RHS: <code>gcd(a, b)</code></h4>' +
              '<p>This is a function call. CheckExp uses the <strong>function call case</strong>.</p>' +
              '<p>First step: look up <code>gcd</code> in ftable.</p>' +
              '<p><span class="step-call">lookup(ftable, "gcd")</span> &rarr; <span class="step-result">(number, number) &rarr; number &nbsp; ✓</span></p>' +
              '<p>Function found. Now check the arguments.</p>',
    },
    {
      phase: 'CheckFun(main)',
      title: 'Check arguments of gcd(a, b)',
      tree: [
        { text: 'CheckExp(gcd(a, b), vtable, ftable)', state: 'done' },
        { text: '  t = (number,number)\u2192number  \u2713', state: 'done' },
        { text: '  CheckExps([a, b], vtable, ftable)', state: 'active' },
        { text: '    CheckExp(a) \u2192 lookup(vtable,"a") \u2192 number  \u2713', state: 'active' },
        { text: '    CheckExp(b) \u2192 lookup(vtable,"b") \u2192 number  \u2713', state: 'active' },
        { text: '  [t\u2081,...,t\u2099] = [number, number]', state: 'active' },
        { text: '  m=2, n=2, types match \u2192 return number  \u2713', state: 'pending' },
      ],
      detail: '<h4>Checking arguments</h4>' +
              '<p><code>CheckExps</code> checks each argument in turn:</p>' +
              '<ul style="font-size:0.88rem;padding-left:1.2rem">' +
              '<li><code>CheckExp(a)</code> &rarr; <code>lookup(vtable, "a")</code> &rarr; <span class="step-result">number ✓</span></li>' +
              '<li><code>CheckExp(b)</code> &rarr; <code>lookup(vtable, "b")</code> &rarr; <span class="step-result">number ✓</span></li>' +
              '</ul>' +
              '<p>Declared parameter types: <code>(number, number)</code>.<br>' +
              'Actual argument types: <code>(number, number)</code>.<br>' +
              'Count matches (2 = 2), types match &rarr; call returns <span class="step-result">number ✓</span></p>',
    },
    {
      phase: 'CheckFun(main)',
      title: 'Check return: return result',
      tree: [
        { text: 'gcd(a,b) \u2192 number  \u2713  (assigned to result:number)', state: 'done' },
        { text: '', state: 'pending' },
        { text: 'CheckExp(result, vtable, ftable)', state: 'active' },
        { text: '  [variable reference case]', state: 'active' },
        { text: '  lookup(vtable, "result") \u2192 number  \u2713', state: 'active' },
        { text: '', state: 'pending' },
        { text: 'CheckFun return check:', state: 'active' },
        { text: '  declared t\u2080 = number', state: 'active' },
        { text: '  body     t\u2081 = number', state: 'active' },
        { text: '  t\u2080 \u2260 t\u2081 ?  NO \u2192 no error  \u2713', state: 'active' },
      ],
      detail: '<h4>Return expression and return type check</h4>' +
              '<p><code>CheckExp(result)</code> looks up <code>result</code> in vtable &rarr; <span class="step-result">number ✓</span></p>' +
              '<p>Then <code>CheckFun</code> compares the declared return type against the body type:</p>' +
              '<ul style="font-size:0.88rem;padding-left:1.2rem">' +
              '<li>Declared return type <code>t\u2080 = number</code></li>' +
              '<li>Body return type <code>t\u2081 = number</code></li>' +
              '</ul>' +
              '<p><code>t\u2080 &ne; t\u2081</code> is <strong>false</strong> &rarr; no error. <span class="step-result">main is well-typed ✓</span></p>' +
              '<div class="explain-watch" style="margin-top:0.6rem"><strong>Textbook bug (Fig. 5.3):</strong> As printed, <code>if t0 = t1 then error()</code> would fire here on a correct function. The correct condition is <code>if t0 &ne; t1 then error()</code>.</div>',
    },

    // ── CHECKING GCD ────────────────────────────────────────────
    {
      phase: 'CheckFun(gcd)',
      title: 'Check while condition: b > 0',
      tree: [
        { text: 'Given:', state: 'done' },
        { text: '  vtable = { a\u2192number, b\u2192number, temp\u2192number }', state: 'done' },
        { text: '  ftable = { gcd\u2192(number,number)\u2192number, ... }', state: 'done' },
        { text: '', state: 'pending' },
        { text: 'CheckExp(b > 0, vtable, ftable)', state: 'active' },
        { text: '  [RELOP case: Exp\u2081 > Exp\u2082]', state: 'active' },
        { text: '  t\u2081 = CheckExp(b) \u2192 lookup("b") \u2192 number  \u2713', state: 'active' },
        { text: '  t\u2082 = CheckExp(0) \u2192 literal    \u2192 number  \u2713', state: 'active' },
        { text: '  t\u2081 = t\u2082 (both number) \u2192 return bool  \u2713', state: 'active' },
      ],
      detail: '<h4>While condition: <code>b > 0</code></h4>' +
              '<p>This uses the RELOP case. Both operands must have the <strong>same type</strong>.</p>' +
              '<ul style="font-size:0.88rem;padding-left:1.2rem">' +
              '<li><code>t\u2081 = lookup(vtable, "b")</code> &rarr; <span class="step-result">number ✓</span></li>' +
              '<li><code>t\u2082 = 0</code> is a literal &rarr; <span class="step-result">number ✓</span></li>' +
              '</ul>' +
              '<p><code>t\u2081 = t\u2082</code> &rarr; comparison returns <span class="step-result">bool ✓</span></p>' +
              '<p>The while loop condition is well-typed. The type checker now checks each statement inside the loop body.</p>',
    },
    {
      phase: 'CheckFun(gcd)',
      title: 'Check body statement: temp := b',
      tree: [
        { text: 'CheckExp(b, vtable, ftable)', state: 'active' },
        { text: '  [variable reference case]', state: 'active' },
        { text: '  lookup(vtable, "b") \u2192 number  \u2713', state: 'active' },
        { text: '', state: 'pending' },
        { text: 'Assignment check:', state: 'active' },
        { text: '  LHS: lookup(vtable, "temp") \u2192 number', state: 'active' },
        { text: '  RHS: number', state: 'active' },
        { text: '  types match \u2192 assignment valid  \u2713', state: 'active' },
      ],
      detail: '<h4>Statement: <code>temp := b</code></h4>' +
              '<p>Simple assignment. RHS is variable <code>b</code>.</p>' +
              '<p><code>CheckExp(b)</code> &rarr; <code>lookup(vtable, "b")</code> &rarr; <span class="step-result">number ✓</span></p>' +
              '<p>LHS declared type of <code>temp</code> is <code>number</code>. RHS type is <code>number</code>. Match &rarr; <span class="step-result">valid ✓</span></p>',
    },
    {
      phase: 'CheckFun(gcd)',
      title: 'Check body: a / b  (inner division)',
      tree: [
        { text: 'CheckExp(a - (a / b * b), vtable, ftable)', state: 'active' },
        { text: '  [BINOP - case]', state: 'active' },
        { text: '  t\u2081 = CheckExp(a) \u2192 lookup("a") \u2192 number  \u2713', state: 'done' },
        { text: '  t\u2082 = CheckExp(a / b * b, ...)', state: 'active' },
        { text: '    [BINOP * case]', state: 'active' },
        { text: '    t\u2081 = CheckExp(a / b, ...)', state: 'active' },
        { text: '      [BINOP / case]', state: 'active' },
        { text: '      t\u2081 = CheckExp(a) \u2192 number  \u2713', state: 'active' },
        { text: '      t\u2082 = CheckExp(b) \u2192 number  \u2713', state: 'active' },
        { text: '      both number \u2192 / returns number  \u2713', state: 'active' },
      ],
      detail: '<h4>Innermost expression: <code>a / b</code></h4>' +
              '<p>The expression <code>a - (a / b * b)</code> has three nested BINOP levels. We start at the innermost: <code>a / b</code>.</p>' +
              '<p>BINOP case: both operands must be <code>number</code>.</p>' +
              '<ul style="font-size:0.88rem;padding-left:1.2rem">' +
              '<li><code>CheckExp(a)</code> &rarr; <span class="step-result">number ✓</span></li>' +
              '<li><code>CheckExp(b)</code> &rarr; <span class="step-result">number ✓</span></li>' +
              '</ul>' +
              '<p>Both <code>number</code> &rarr; division returns <span class="step-result">number ✓</span></p>',
    },
    {
      phase: 'CheckFun(gcd)',
      title: 'Check body: (a / b) * b  then full subtraction',
      tree: [
        { text: '  t\u2082 = CheckExp(a / b * b, ...)', state: 'active' },
        { text: '    [BINOP * case]', state: 'active' },
        { text: '    t\u2081 = CheckExp(a / b) \u2192 number  \u2713', state: 'done' },
        { text: '    t\u2082 = CheckExp(b)     \u2192 number  \u2713', state: 'active' },
        { text: '    both number \u2192 * returns number  \u2713', state: 'active' },
        { text: '', state: 'pending' },
        { text: '  back to outer subtraction:', state: 'active' },
        { text: '  t\u2081 = number  (a)', state: 'done' },
        { text: '  t\u2082 = number  (a/b*b)', state: 'active' },
        { text: '  both number \u2192 - returns number  \u2713', state: 'active' },
      ],
      detail: '<h4>Middle and outer: <code>(a/b) * b</code> then <code>a - (...)</code></h4>' +
              '<p>Middle BINOP <code>*</code>:</p>' +
              '<ul style="font-size:0.88rem;padding-left:1.2rem">' +
              '<li><code>t\u2081 = number</code> (from <code>a/b</code>)</li>' +
              '<li><code>t\u2082 = CheckExp(b)</code> &rarr; <span class="step-result">number ✓</span></li>' +
              '</ul>' +
              '<p>Multiplication returns <span class="step-result">number ✓</span></p>' +
              '<p>Outer BINOP <code>-</code>:</p>' +
              '<ul style="font-size:0.88rem;padding-left:1.2rem">' +
              '<li><code>t\u2081 = number</code> (from <code>a</code>)</li>' +
              '<li><code>t\u2082 = number</code> (from <code>a/b*b</code>)</li>' +
              '</ul>' +
              '<p>Subtraction returns <span class="step-result">number ✓</span>. Assignment to <code>b : number</code> is valid.</p>',
    },
    {
      phase: 'CheckFun(gcd)',
      title: 'Check return: return a',
      tree: [
        { text: 'All while body statements checked  \u2713', state: 'done' },
        { text: '', state: 'pending' },
        { text: 'CheckExp(a, vtable, ftable)', state: 'active' },
        { text: '  lookup(vtable, "a") \u2192 number  \u2713', state: 'active' },
        { text: '', state: 'pending' },
        { text: 'CheckFun return check:', state: 'active' },
        { text: '  declared t\u2080 = number', state: 'active' },
        { text: '  body     t\u2081 = number', state: 'active' },
        { text: '  t\u2080 \u2260 t\u2081 ?  NO \u2192 no error  \u2713', state: 'active' },
        { text: '', state: 'pending' },
        { text: 'GCD program is fully type-correct  \u2713', state: 'active' },
      ],
      detail: '<h4>Return expression and final check</h4>' +
              '<p><code>CheckExp(a)</code> &rarr; <code>lookup(vtable, "a")</code> &rarr; <span class="step-result">number ✓</span></p>' +
              '<p>Return type check:</p>' +
              '<ul style="font-size:0.88rem;padding-left:1.2rem">' +
              '<li>Declared <code>t\u2080 = number</code></li>' +
              '<li>Body <code>t\u2081 = number</code></li>' +
              '<li><code>t\u2080 &ne; t\u2081</code> is false &rarr; <span class="step-result">no error ✓</span></li>' +
              '</ul>' +
              '<p><strong>The GCD program passes type checking.</strong> All three functions (<code>main</code>, <code>gcd</code>, <code>isZero</code>) are well-typed. No type errors were found.</p>',
    },
  ];

  var current  = 0;
  var treeEl   = document.getElementById('stepTree');
  var detailEl = document.getElementById('stepDetail');
  var counterEl= document.getElementById('stepCounter');
  var prevBtn  = document.getElementById('prevStep');
  var nextBtn  = document.getElementById('nextStep');
  var phaseEl  = document.getElementById('stepPhase');

  function stateClass(s) {
    if (s === 'active')  return 'tree-line--active';
    if (s === 'done')    return 'tree-line--done';
    return 'tree-line--pending';
  }

  function render() {
    var step = steps[current];
    treeEl.innerHTML = step.tree.map(function (line) {
      return '<span class="tree-line ' + stateClass(line.state) + '">' + line.text + '</span>';
    }).join('\n');
    detailEl.innerHTML = step.detail;
    counterEl.textContent = 'Step ' + (current + 1) + ' of ' + steps.length;
    if (phaseEl) phaseEl.textContent = step.phase;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === steps.length - 1;
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', function () { if (current > 0) { current--; render(); } });
    nextBtn.addEventListener('click', function () { if (current < steps.length - 1) { current++; render(); } });
    render();
  }
})();