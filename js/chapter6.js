// ── Annotated code hover ────────────────────────────────────────
(function () {
  var srcLines = document.querySelectorAll('.src-line');
  var ilLines  = document.querySelectorAll('.il-line');
  var hintEl   = document.getElementById('codeHint');

  function clearAll() {
    srcLines.forEach(function (l) { l.classList.remove('active'); });
    ilLines.forEach(function (l)  { l.classList.remove('active'); });
  }

  function activate(group) {
    clearAll();
    srcLines.forEach(function (l) {
      if (l.dataset.group === group) l.classList.add('active');
    });
    ilLines.forEach(function (l) {
      if (l.dataset.group === group) l.classList.add('active');
    });
    if (hintEl) hintEl.style.display = 'none';
  }

  function addHover(lines) {
    lines.forEach(function (l) {
      l.addEventListener('mouseenter', function () { activate(l.dataset.group); });
      l.addEventListener('mouseleave', function () {
        clearAll();
        if (hintEl) hintEl.style.display = 'block';
      });
    });
  }

  addHover(srcLines);
  addHover(ilLines);
})();


// ── Step-by-step stepper ────────────────────────────────────────
(function () {

  var steps = [
    {
      phase: 'Statement: temp := b',
      tree: [
        { text: 'TransStat(temp := b, vtable, ftable)', state: 'active' },
        { text: '  [assignment case]', state: 'active' },
        { text: '  place = newvar()  \u2192  t1', state: 'active' },
        { text: '  x = lookup(vtable, "temp")  \u2192  v2', state: 'active' },
        { text: '  TransExp(b, vtable, ftable, t1)', state: 'pending' },
        { text: '    [variable case]', state: 'pending' },
        { text: '    lookup(vtable, "b")  \u2192  v1', state: 'pending' },
        { text: '    emit: t1 := v1', state: 'pending' },
        { text: '  emit: v2 := t1', state: 'pending' },
      ],
      detail: '<h4>Assignment: <code>temp := b</code></h4>' +
              '<p>TransStat handles assignment in two steps:</p>' +
              '<ol style="font-size:0.88rem;padding-left:1.2rem">' +
              '<li>Generate a fresh temp <span class="step-call">newvar()</span> &rarr; <span class="step-result">t1</span> for the RHS result.</li>' +
              '<li>Look up the LHS variable: <span class="step-call">lookup(vtable,"temp")</span> &rarr; <span class="step-result">v2</span></li>' +
              '<li>Call TransExp for the RHS expression <code>b</code>: lookup "b" &rarr; v1, emit <code>t1 := v1</code></li>' +
              '<li>Copy temp into the LHS: emit <code>v2 := t1</code></li>' +
              '</ol>' +
              '<p class="explain-example">Generated: <code>t1 := v1</code> &nbsp; <code>v2 := t1</code></p>',
    },
    {
      phase: 'Expression: a / b  (innermost)',
      tree: [
        { text: 'TransExp(a / b, vtable, ftable, t5)', state: 'active' },
        { text: '  [binop / case]', state: 'active' },
        { text: '  place1 = newvar()  \u2192  t3', state: 'active' },
        { text: '  place2 = newvar()  \u2192  t4', state: 'active' },
        { text: '  TransExp(a, vtable, ftable, t3)', state: 'active' },
        { text: '    lookup("a") \u2192 v0  \u2192  emit: t3 := v0', state: 'done' },
        { text: '  TransExp(b, vtable, ftable, t4)', state: 'active' },
        { text: '    lookup("b") \u2192 v1  \u2192  emit: t4 := v1', state: 'done' },
        { text: '  op = transop("/") \u2192 /', state: 'active' },
        { text: '  emit: t5 := t3 / t4', state: 'active' },
      ],
      detail: '<h4>Expression: <code>a / b</code></h4>' +
              '<p>This is the innermost BINOP. TransExp creates two fresh variables for the operands:</p>' +
              '<ul style="font-size:0.88rem;padding-left:1.2rem">' +
              '<li><span class="step-call">newvar()</span> &rarr; <span class="step-result">t3</span> for left operand <code>a</code></li>' +
              '<li><span class="step-call">newvar()</span> &rarr; <span class="step-result">t4</span> for right operand <code>b</code></li>' +
              '</ul>' +
              '<p>Both are variable references — each just does a lookup and emits a copy.</p>' +
              '<p class="explain-example">Generated: <code>t3 := v0</code> &nbsp; <code>t4 := v1</code> &nbsp; <code>t5 := t3 / t4</code></p>',
    },
    {
      phase: 'Expression: (a / b) * b',
      tree: [
        { text: 'TransExp((a/b) * b, vtable, ftable, t6)', state: 'active' },
        { text: '  [binop * case]', state: 'active' },
        { text: '  place1 = newvar()  \u2192  (reuses t5 from sub-call)', state: 'done' },
        { text: '  place2 = newvar()  \u2192  (another fresh var for b)', state: 'active' },
        { text: '  TransExp(a/b, ..., t5)  \u2192  already done above', state: 'done' },
        { text: '  TransExp(b, vtable, ftable, _)', state: 'active' },
        { text: '    lookup("b") \u2192 v1  \u2192  b already in v1', state: 'done' },
        { text: '  emit: t6 := t5 * v1', state: 'active' },
      ],
      detail: '<h4>Expression: <code>(a / b) * b</code></h4>' +
              '<p>Middle BINOP — multiply the result of division by <code>b</code>.</p>' +
              '<p>Left operand is the sub-expression <code>a/b</code> whose result is in <code>t5</code>. Right operand is <code>b</code> which lives in <code>v1</code>.</p>' +
              '<p class="explain-example">Generated: <code>t6 := t5 * v1</code></p>' +
              '<p style="font-size:0.85rem;color:var(--col-muted)">Note: the right operand <code>b</code> uses <code>v1</code> directly here rather than copying to a new temp — a minor optimisation that TransExp can make when the operand is a simple variable.</p>',
    },
    {
      phase: 'Statement: b := a - (a / b * b)',
      tree: [
        { text: 'TransStat(b := a - (a/b*b), vtable, ftable)', state: 'active' },
        { text: '  place = newvar()  \u2192  t7', state: 'active' },
        { text: '  x = lookup(vtable,"b")  \u2192  v1', state: 'active' },
        { text: '  TransExp(a - (a/b*b), vtable, ftable, t7)', state: 'active' },
        { text: '    [binop - case]', state: 'active' },
        { text: '    place1 = t2  \u2192  TransExp(a,...,t2): t2 := v0', state: 'done' },
        { text: '    place2 = t6  \u2192  TransExp(a/b*b,...,t6): [3 instructions above]', state: 'done' },
        { text: '    emit: t7 := t2 - t6', state: 'active' },
        { text: '  emit: v1 := t7', state: 'active' },
      ],
      detail: '<h4>Statement: <code>b := a - (a / b * b)</code></h4>' +
              '<p>Full translation of the modulo-via-arithmetic statement:</p>' +
              '<ol style="font-size:0.88rem;padding-left:1.2rem">' +
              '<li>Fresh place <code>t7</code> for RHS result</li>' +
              '<li>Translate RHS <code>a - (a/b*b)</code> — top-level subtraction:<br>' +
              '&nbsp;&nbsp;Left: <code>a</code> &rarr; <code>t2 := v0</code><br>' +
              '&nbsp;&nbsp;Right: <code>(a/b*b)</code> &rarr; 3 instructions ending in t6<br>' +
              '&nbsp;&nbsp;Subtract: <code>t7 := t2 - t6</code></li>' +
              '<li>Copy result to LHS: <code>v1 := t7</code></li>' +
              '</ol>' +
              '<p class="explain-example">Total: 7 instructions for this one source statement.</p>',
    },
    {
      phase: 'Statement: a := temp',
      tree: [
        { text: 'TransStat(a := temp, vtable, ftable)', state: 'active' },
        { text: '  place = newvar()  \u2192  t8', state: 'active' },
        { text: '  x = lookup(vtable,"a")  \u2192  v0', state: 'active' },
        { text: '  TransExp(temp, vtable, ftable, t8)', state: 'active' },
        { text: '    [variable case]', state: 'active' },
        { text: '    lookup("temp") \u2192 v2', state: 'active' },
        { text: '    emit: t8 := v2', state: 'active' },
        { text: '  emit: v0 := t8', state: 'active' },
      ],
      detail: '<h4>Statement: <code>a := temp</code></h4>' +
              '<p>Simple variable-to-variable assignment through a temporary.</p>' +
              '<ul style="font-size:0.88rem;padding-left:1.2rem">' +
              '<li><span class="step-call">newvar()</span> &rarr; <span class="step-result">t8</span></li>' +
              '<li>lookup "a" &rarr; v0 (destination)</li>' +
              '<li>TransExp(temp) &rarr; lookup "temp" &rarr; v2, emit <code>t8 := v2</code></li>' +
              '<li>emit <code>v0 := t8</code></li>' +
              '</ul>' +
              '<p class="explain-example">Generated: <code>t8 := v2</code> &nbsp; <code>v0 := t8</code></p>',
    },
    {
      phase: 'While loop structure: labels',
      tree: [
        { text: 'TransStat(while (b>0) do {...}, vtable, ftable)', state: 'active' },
        { text: '  [while case]', state: 'active' },
        { text: '  L1 = newlabel()  \u2192  loop entry / re-test point', state: 'active' },
        { text: '  L2 = newlabel()  \u2192  loop body start', state: 'active' },
        { text: '  L3 = newlabel()  \u2192  loop exit', state: 'active' },
        { text: '  condCode = TransCond(b>0, L2, L3, ...)', state: 'pending' },
        { text: '  bodyCode = TransStat({...}, ...)', state: 'pending' },
        { text: '  emit: [LABEL L1] ++ condCode', state: 'pending' },
        { text: '      ++ [LABEL L2] ++ bodyCode', state: 'pending' },
        { text: '      ++ [GOTO L1, LABEL L3]', state: 'pending' },
      ],
      detail: '<h4>While loop — three labels needed</h4>' +
              '<p>Every while loop needs exactly three labels:</p>' +
              '<ul style="font-size:0.88rem;padding-left:1.2rem">' +
              '<li><strong>L1</strong> — the re-test point. After each body execution, GOTO L1 brings us back here to re-evaluate the condition.</li>' +
              '<li><strong>L2</strong> — the body entry. IF condition is true, jump here.</li>' +
              '<li><strong>L3</strong> — the exit. IF condition is false, jump here to skip the loop.</li>' +
              '</ul>' +
              '<p>This is the flowchart Gruner drew in lecture: entry label &rarr; condition diamond &rarr; body &rarr; GOTO back to entry.</p>',
    },
    {
      phase: 'While loop: condition translation',
      tree: [
        { text: 'TransCond(b > 0, L2, L3, vtable, ftable)', state: 'active' },
        { text: '  [Exp relop Exp case]', state: 'active' },
        { text: '  t1 = newvar(), t2 = newvar()', state: 'active' },
        { text: '  TransExp(b, vtable, ftable, t1)', state: 'active' },
        { text: '    lookup("b") \u2192 v1  \u2192  emit: t1 := v1', state: 'done' },
        { text: '  TransExp(0, vtable, ftable, t2)', state: 'active' },
        { text: '    literal 0  \u2192  emit: t2 := 0', state: 'done' },
        { text: '  op = transop(">")  \u2192  >', state: 'active' },
        { text: '  emit: IF t1 > t2 THEN L2 ELSE L3', state: 'active' },
        { text: '', state: 'pending' },
        { text: '  \u2192 simplified in practice to: IF v1 > 0 THEN L2 ELSE L3', state: 'active' },
      ],
      detail: '<h4>Condition: <code>b &gt; 0</code></h4>' +
              '<p>TransCond translates the condition into an IF-THEN-ELSE instruction.</p>' +
              '<p>Both operands are evaluated into fresh variables first, then compared:</p>' +
              '<p class="explain-example">t1 := v1 &nbsp; t2 := 0 &nbsp; IF t1 &gt; t2 THEN L2 ELSE L3</p>' +
              '<p>In the full code shown we simplify this slightly — since <code>b</code> and <code>0</code> are simple values, the copy steps are combined:</p>' +
              '<p class="explain-example">IF v1 &gt; 0 THEN L2 ELSE L3</p>' +
              '<p style="font-size:0.85rem;color:var(--col-muted)">This simplification is valid when the operands are a variable and a constant — no aliasing risk.</p>',
    },
    {
      phase: 'Return statement',
      tree: [
        { text: 'TransStat(return a, vtable, ftable)', state: 'active' },
        { text: '  [return case]', state: 'active' },
        { text: '  lookup(vtable, "a")  \u2192  v0', state: 'active' },
        { text: '  emit: RETURN v0', state: 'active' },
      ],
      detail: '<h4>Return: <code>return a</code></h4>' +
              '<p>The return statement looks up the source variable in vtable and emits a RETURN instruction with the corresponding internal variable.</p>' +
              '<p class="explain-example">Generated: <code>RETURN v0</code></p>' +
              '<p>The RETURN instruction must be the last instruction in the function body — the intermediate language requires this. Functions cannot "fall off the end".</p>',
    },
    {
      phase: 'Complete gcd function',
      tree: [
        { text: 'function _gcd(v0, v1)', state: 'done' },
        { text: '  v2 := 0', state: 'done' },
        { text: '  LABEL L1', state: 'done' },
        { text: '  IF v1 > 0 THEN L2 ELSE L3', state: 'done' },
        { text: '  LABEL L2', state: 'done' },
        { text: '  t1:=v1,  v2:=t1          \u2500 temp := b', state: 'done' },
        { text: '  t2:=v0, t3:=v0, t4:=v1', state: 'done' },
        { text: '  t5:=t3/t4, t6:=t5*v1    \u2500 a/b*b', state: 'done' },
        { text: '  t7:=t2-t6,  v1:=t7      \u2500 b := a-(a/b*b)', state: 'done' },
        { text: '  t8:=v2,  v0:=t8          \u2500 a := temp', state: 'done' },
        { text: '  GOTO L1', state: 'done' },
        { text: '  LABEL L3', state: 'done' },
        { text: '  RETURN v0', state: 'done' },
      ],
      detail: '<h4>Complete intermediate code for gcd</h4>' +
              '<p>All statements assembled in order. The structure mirrors the source exactly:</p>' +
              '<ol style="font-size:0.88rem;padding-left:1.2rem">' +
              '<li>Function header with internal parameter names</li>' +
              '<li>Local variable declaration</li>' +
              '<li>While loop structure (L1, condition check, L2 body, GOTO, L3 exit)</li>' +
              '<li>Inside body: three assignments in order</li>' +
              '<li>After loop: return statement</li>' +
              '</ol>' +
              '<p>The syntax tree structure is completely gone — replaced by a flat sequence of instructions connected only by labels and jumps. This is what the back-end will translate to machine code.</p>',
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