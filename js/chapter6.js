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
// Each step's `tree` is now an array of typed row objects:
//   { type: 'call',   text, state }   — function call header
//   { type: 'step',   text, state }   — a computation step inside the call
//   { type: 'result', text, state }   — a result/emit line
//   { type: 'nested', text, state }   — indented sub-call
//   { type: 'sep'                  }  — visual separator between groups
//
// state: 'active' | 'done' | 'pending'
(function () {

  var steps = [

    // ── Step 1: temp := b ────────────────────────────────────────
    {
      phase: 'Statement: temp := b',
      tree: [
        { type: 'call',   text: 'TransStat(temp := b, vtable, ftable)', state: 'active' },
        { type: 'step',   text: 'Case: assignment (VNAME := EXPR)',      state: 'active' },
        { type: 'step',   text: 'place = newvar()',  result: 't1',        state: 'active' },
        { type: 'step',   text: 'x = lookup(vtable, "temp")', result: 'v2', state: 'active' },
        { type: 'sep' },
        { type: 'nested', text: 'TransExp(b, vtable, ftable, t1)',        state: 'pending' },
        { type: 'step',   text: 'Case: variable reference', indent: 1,    state: 'pending' },
        { type: 'step',   text: 'lookup(vtable, "b")', result: 'v1', indent: 1, state: 'pending' },
        { type: 'result', text: 'emit:  t1 := v1', indent: 1,             state: 'pending' },
        { type: 'sep' },
        { type: 'result', text: 'emit:  v2 := t1',                        state: 'pending' },
      ],
      detail: '<h4>Assignment: <code>temp := b</code></h4>' +
              '<p>TransStat handles assignment in two steps:</p>' +
              '<ol style="font-size:0.88rem;padding-left:1.2rem">' +
              '<li>Generate a fresh temp <span class="step-call">newvar()</span> &rarr; <span class="step-result">t1</span> for the RHS result.</li>' +
              '<li>Look up the LHS: <span class="step-call">lookup(vtable, "temp")</span> &rarr; <span class="step-result">v2</span></li>' +
              '<li>TransExp on RHS <code>b</code>: lookup "b" &rarr; v1, emit <code>t1 := v1</code></li>' +
              '<li>Copy result to LHS: emit <code>v2 := t1</code></li>' +
              '</ol>' +
              '<p class="explain-example">Generated: &nbsp; <code>t1 := v1</code> &nbsp; <code>v2 := t1</code></p>',
    },

    // ── Step 2: a / b ────────────────────────────────────────────
    {
      phase: 'Expression: a / b  (innermost)',
      tree: [
        { type: 'call',   text: 'TransExp(a / b, vtable, ftable, t5)',    state: 'active' },
        { type: 'step',   text: 'Case: BINOP division',                   state: 'active' },
        { type: 'step',   text: 'place1 = newvar()', result: 't3',        state: 'active' },
        { type: 'step',   text: 'place2 = newvar()', result: 't4',        state: 'active' },
        { type: 'sep' },
        { type: 'nested', text: 'TransExp(a, vtable, ftable, t3)',        state: 'active' },
        { type: 'step',   text: 'lookup(vtable, "a")', result: 'v0', indent: 1, state: 'active' },
        { type: 'result', text: 'emit:  t3 := v0', indent: 1,             state: 'done' },
        { type: 'sep' },
        { type: 'nested', text: 'TransExp(b, vtable, ftable, t4)',        state: 'active' },
        { type: 'step',   text: 'lookup(vtable, "b")', result: 'v1', indent: 1, state: 'active' },
        { type: 'result', text: 'emit:  t4 := v1', indent: 1,             state: 'done' },
        { type: 'sep' },
        { type: 'step',   text: 'op = transop("/")', result: '/',         state: 'active' },
        { type: 'result', text: 'emit:  t5 := t3 / t4',                   state: 'active' },
      ],
      detail: '<h4>Expression: <code>a / b</code></h4>' +
              '<p>Innermost BINOP. Two fresh variables for the operands:</p>' +
              '<ul style="font-size:0.88rem;padding-left:1.2rem">' +
              '<li><span class="step-call">newvar()</span> &rarr; <span class="step-result">t3</span> for <code>a</code></li>' +
              '<li><span class="step-call">newvar()</span> &rarr; <span class="step-result">t4</span> for <code>b</code></li>' +
              '</ul>' +
              '<p class="explain-example">Generated: &nbsp; <code>t3 := v0</code> &nbsp; <code>t4 := v1</code> &nbsp; <code>t5 := t3 / t4</code></p>',
    },

    // ── Step 3: (a/b) * b ────────────────────────────────────────
    {
      phase: 'Expression: (a / b) * b',
      tree: [
        { type: 'call',   text: 'TransExp(a/b * b, vtable, ftable, t6)', state: 'active' },
        { type: 'step',   text: 'Case: BINOP multiplication',             state: 'active' },
        { type: 'step',   text: 'place1 = newvar()', result: 't5 (from a/b sub-call)', state: 'done' },
        { type: 'sep' },
        { type: 'nested', text: 'TransExp(a/b, ..., t5)',                 state: 'done' },
        { type: 'result', text: 'already computed above', indent: 1,      state: 'done' },
        { type: 'sep' },
        { type: 'nested', text: 'TransExp(b, vtable, ftable, _)',         state: 'active' },
        { type: 'step',   text: 'lookup(vtable, "b")', result: 'v1', indent: 1, state: 'active' },
        { type: 'sep' },
        { type: 'result', text: 'emit:  t6 := t5 * v1',                   state: 'active' },
      ],
      detail: '<h4>Expression: <code>(a / b) * b</code></h4>' +
              '<p>Middle BINOP — multiply the division result by <code>b</code>.</p>' +
              '<p>Left operand result is in <code>t5</code>. Right operand <code>b</code> lives in <code>v1</code>.</p>' +
              '<p class="explain-example">Generated: &nbsp; <code>t6 := t5 * v1</code></p>',
    },

    // ── Step 4: b := a - (a/b*b) ─────────────────────────────────
    {
      phase: 'Statement: b := a - (a / b * b)',
      tree: [
        { type: 'call',   text: 'TransStat(b := a - (a/b*b), vtable, ftable)', state: 'active' },
        { type: 'step',   text: 'place = newvar()', result: 't7',          state: 'active' },
        { type: 'step',   text: 'x = lookup(vtable, "b")', result: 'v1',  state: 'active' },
        { type: 'sep' },
        { type: 'nested', text: 'TransExp(a - (a/b*b), vtable, ftable, t7)', state: 'active' },
        { type: 'step',   text: 'Case: BINOP subtraction', indent: 1,      state: 'active' },
        { type: 'nested', text: 'TransExp(a, ..., t2)', indent: 1,         state: 'done' },
        { type: 'result', text: 'emit:  t2 := v0', indent: 2,              state: 'done' },
        { type: 'nested', text: 'TransExp(a/b*b, ..., t6)', indent: 1,     state: 'done' },
        { type: 'result', text: '3 instructions — see steps 2 & 3', indent: 2, state: 'done' },
        { type: 'result', text: 'emit:  t7 := t2 - t6', indent: 1,         state: 'active' },
        { type: 'sep' },
        { type: 'result', text: 'emit:  v1 := t7',                         state: 'active' },
      ],
      detail: '<h4>Statement: <code>b := a - (a / b * b)</code></h4>' +
              '<p>Full modulo-via-arithmetic translation. Total: <strong>7 instructions</strong> for one source statement.</p>' +
              '<p class="explain-example">t2:=v0 &nbsp; t3:=v0 &nbsp; t4:=v1 &nbsp; t5:=t3/t4 &nbsp; t6:=t5*v1 &nbsp; t7:=t2-t6 &nbsp; v1:=t7</p>',
    },

    // ── Step 5: a := temp ────────────────────────────────────────
    {
      phase: 'Statement: a := temp',
      tree: [
        { type: 'call',   text: 'TransStat(a := temp, vtable, ftable)',   state: 'active' },
        { type: 'step',   text: 'place = newvar()', result: 't8',          state: 'active' },
        { type: 'step',   text: 'x = lookup(vtable, "a")', result: 'v0', state: 'active' },
        { type: 'sep' },
        { type: 'nested', text: 'TransExp(temp, vtable, ftable, t8)',      state: 'active' },
        { type: 'step',   text: 'lookup(vtable, "temp")', result: 'v2', indent: 1, state: 'active' },
        { type: 'result', text: 'emit:  t8 := v2', indent: 1,             state: 'active' },
        { type: 'sep' },
        { type: 'result', text: 'emit:  v0 := t8',                        state: 'active' },
      ],
      detail: '<h4>Statement: <code>a := temp</code></h4>' +
              '<p>Simple variable-to-variable copy through a temporary.</p>' +
              '<p class="explain-example">Generated: &nbsp; <code>t8 := v2</code> &nbsp; <code>v0 := t8</code></p>',
    },

    // ── Step 6: while labels ─────────────────────────────────────
    {
      phase: 'While loop: three labels',
      tree: [
        { type: 'call',   text: 'TransStat(while (b>0) do {...}, vtable, ftable)', state: 'active' },
        { type: 'step',   text: 'Case: while loop',                        state: 'active' },
        { type: 'step',   text: 'L1 = newlabel()', result: 'loop entry — re-test point', state: 'active' },
        { type: 'step',   text: 'L2 = newlabel()', result: 'loop body start',            state: 'active' },
        { type: 'step',   text: 'L3 = newlabel()', result: 'loop exit',                  state: 'active' },
        { type: 'sep' },
        { type: 'nested', text: 'TransCond(b > 0, L2, L3, ...)',           state: 'pending' },
        { type: 'nested', text: 'TransStat({...}, ...)',                   state: 'pending' },
        { type: 'sep' },
        { type: 'result', text: 'emit:  LABEL L1',                        state: 'pending' },
        { type: 'result', text: 'emit:  [condCode]',                      state: 'pending' },
        { type: 'result', text: 'emit:  LABEL L2',                        state: 'pending' },
        { type: 'result', text: 'emit:  [bodyCode]',                      state: 'pending' },
        { type: 'result', text: 'emit:  GOTO L1',                         state: 'pending' },
        { type: 'result', text: 'emit:  LABEL L3',                        state: 'pending' },
      ],
      detail: '<h4>While loop — three labels needed</h4>' +
              '<ul style="font-size:0.88rem;padding-left:1.2rem">' +
              '<li><strong>L1</strong> — re-test point. After body executes, GOTO L1 re-evaluates the condition.</li>' +
              '<li><strong>L2</strong> — body entry. Jumped to when condition is true.</li>' +
              '<li><strong>L3</strong> — exit. Jumped to when condition is false.</li>' +
              '</ul>',
    },

    // ── Step 7: condition ────────────────────────────────────────
    {
      phase: 'While loop: condition b > 0',
      tree: [
        { type: 'call',   text: 'TransCond(b > 0, L2, L3, vtable, ftable)', state: 'active' },
        { type: 'step',   text: 'Case: EXPR relop EXPR',                    state: 'active' },
        { type: 'sep' },
        { type: 'nested', text: 'TransExp(b, vtable, ftable, t1)',          state: 'active' },
        { type: 'step',   text: 'lookup(vtable, "b")', result: 'v1', indent: 1, state: 'active' },
        { type: 'result', text: 'emit:  t1 := v1', indent: 1,               state: 'done' },
        { type: 'sep' },
        { type: 'nested', text: 'TransExp(0, vtable, ftable, t2)',           state: 'active' },
        { type: 'step',   text: 'literal 0', indent: 1,                     state: 'active' },
        { type: 'result', text: 'emit:  t2 := 0', indent: 1,                state: 'done' },
        { type: 'sep' },
        { type: 'result', text: 'emit:  IF t1 > t2 THEN L2 ELSE L3',        state: 'active' },
        { type: 'step',   text: 'simplified to: IF v1 > 0 THEN L2 ELSE L3', state: 'active' },
      ],
      detail: '<h4>Condition: <code>b &gt; 0</code></h4>' +
              '<p>TransCond evaluates both operands then emits an IF instruction.</p>' +
              '<p class="explain-example">Generated: &nbsp; <code>IF v1 &gt; 0 THEN L2 ELSE L3</code></p>',
    },

    // ── Step 8: return ───────────────────────────────────────────
    {
      phase: 'Return statement',
      tree: [
        { type: 'call',   text: 'TransStat(return a, vtable, ftable)',    state: 'active' },
        { type: 'step',   text: 'Case: return expression',                state: 'active' },
        { type: 'step',   text: 'lookup(vtable, "a")', result: 'v0',     state: 'active' },
        { type: 'result', text: 'emit:  RETURN v0',                       state: 'active' },
      ],
      detail: '<h4>Return: <code>return a</code></h4>' +
              '<p>Look up <code>a</code> in vtable &rarr; <span class="step-result">v0</span>. Emit RETURN.</p>' +
              '<p class="explain-example">Generated: &nbsp; <code>RETURN v0</code></p>',
    },

    // ── Step 9: complete ─────────────────────────────────────────
    {
      phase: 'Complete gcd function',
      tree: [
        { type: 'call',   text: 'function _gcd(v0, v1)',                  state: 'done' },
        { type: 'result', text: 'v2 := 0',                                state: 'done' },
        { type: 'result', text: 'LABEL L1',                               state: 'done' },
        { type: 'result', text: 'IF v1 > 0 THEN L2 ELSE L3',             state: 'done' },
        { type: 'result', text: 'LABEL L2',                               state: 'done' },
        { type: 'step',   text: '── temp := b',                           state: 'done' },
        { type: 'result', text: 't1:=v1  ·  v2:=t1', indent: 1,          state: 'done' },
        { type: 'step',   text: '── b := a - (a/b*b)',                    state: 'done' },
        { type: 'result', text: 't2:=v0  ·  t3:=v0  ·  t4:=v1', indent: 1, state: 'done' },
        { type: 'result', text: 't5:=t3/t4  ·  t6:=t5*v1  ·  t7:=t2-t6  ·  v1:=t7', indent: 1, state: 'done' },
        { type: 'step',   text: '── a := temp',                           state: 'done' },
        { type: 'result', text: 't8:=v2  ·  v0:=t8', indent: 1,          state: 'done' },
        { type: 'result', text: 'GOTO L1',                                state: 'done' },
        { type: 'result', text: 'LABEL L3',                               state: 'done' },
        { type: 'result', text: 'RETURN v0',                              state: 'done' },
      ],
      detail: '<h4>Complete intermediate code for gcd</h4>' +
              '<p>All statements assembled in order. The syntax tree structure is completely gone — replaced by a flat sequence of instructions connected only by labels and jumps.</p>',
    },
  ];

  // ── Renderer ─────────────────────────────────────────────────
  var current  = 0;
  var treeEl   = document.getElementById('stepTree');
  var detailEl = document.getElementById('stepDetail');
  var counterEl= document.getElementById('stepCounter');
  var prevBtn  = document.getElementById('prevStep');
  var nextBtn  = document.getElementById('nextStep');
  var phaseEl  = document.getElementById('stepPhase');

  function renderRow(row) {
    if (row.type === 'sep') {
      return '<div class="tr-sep"></div>';
    }

    var indent = row.indent || 0;
    var sc = row.state === 'active' ? 'tr--active'
           : row.state === 'done'   ? 'tr--done'
           : 'tr--pending';

    if (row.type === 'call') {
      return '<div class="tr tr--call ' + sc + '">' +
             '<span class="tr-text">' + row.text + '</span>' +
             '</div>';
    }

    if (row.type === 'nested') {
      return '<div class="tr tr--nested ' + sc + '" style="margin-left:' + (indent * 1.2 + 1.2) + 'rem">' +
             '<span class="tr-text">' + row.text + '</span>' +
             '</div>';
    }

    if (row.type === 'result') {
      return '<div class="tr tr--result ' + sc + '" style="margin-left:' + (indent * 1.2 + (indent > 0 ? 2.4 : 0)) + 'rem">' +
             '<span class="tr-emit">emit</span>' +
             '<span class="tr-text">' + row.text.replace(/^emit:\s*/, '') + '</span>' +
             '</div>';
    }

    // type === 'step'
    var resultHtml = row.result
      ? ' <span class="tr-result">' + row.result + '</span>'
      : '';
    return '<div class="tr tr--step ' + sc + '" style="margin-left:' + (indent * 1.2 + 1.2) + 'rem">' +
           '<span class="tr-text">' + row.text + resultHtml + '</span>' +
           '</div>';
  }

  function render() {
    var step = steps[current];
    treeEl.innerHTML = step.tree.map(renderRow).join('');
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