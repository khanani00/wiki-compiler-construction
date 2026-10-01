// ════════════════════════════════════════════════════════════════
//  Chapter 9 — Function Calls and the Call Stack
// ════════════════════════════════════════════════════════════════

// ── Data: the call sequence for  result := gcd(a, b) ─────────────
// Each line: { code, exp }.  exp === null means a non-clickable line.
var CALL_SEQ = {
  caller: [
    { code: 'M[SP] := R0',            exp: 'Start saving the caller’s live registers. main stores them in the space it already reserved, just above SP.' },
    { code: '...',                    exp: null },
    { code: 'M[SP + SOI * k] := Rk',  exp: 'All k live registers R0…Rk are now safely on the stack. gcd is free to overwrite any register it likes.' },
    { code: 'SP := SP - SOI * 3',     exp: 'Grow the stack by n + 1 = 3 slots: two for the arguments, one for the return address. (Subtracting moves SP down.)' },
    { code: 'M[SP + SOI] := v0',      exp: 'Write argument a (held in v0) into the first argument slot.' },
    { code: 'M[SP + SOI * 2] := v1',  exp: 'Write argument b (held in v1) into the second argument slot.' },
    { code: 'M[SP] := L0',            exp: 'Store the return address L0 at the top of the frame, so gcd knows where to jump back to.' },
    { code: 'GOTO gcd',               exp: 'Jump into gcd’s prologue. Its arguments are already waiting on the stack.' },
    { code: 'LABEL L0',               exp: 'Execution resumes here once gcd’s epilogue jumps back.' },
    { code: 'v2 := M[SP + SOI]',      exp: 'gcd left its return value in the first-argument slot. Copy it into result (v2).' },
    { code: 'SP := SP + SOI * 3',     exp: 'Pop the 3 slots — this call’s frame is finished. SP returns to where the saved registers sit.' },
    { code: 'R0 := M[SP]',            exp: 'Begin restoring the saved registers…' },
    { code: '...',                    exp: null },
    { code: 'Rk := M[SP + SOI * k]',  exp: '…R0…Rk are back to their exact pre-call values. main continues as if nothing had been disturbed.' }
  ],
  callee: [
    { code: 'SP := SP - SOI * 3',     exp: 'Grow the stack by n + 1 = 3 slots (two arguments + return address). Under callee-saves, main does NOT save registers — gcd will.' },
    { code: 'M[SP + SOI] := v0',      exp: 'Write argument a (v0) into the first argument slot.' },
    { code: 'M[SP + SOI * 2] := v1',  exp: 'Write argument b (v1) into the second argument slot.' },
    { code: 'M[SP] := L0',            exp: 'Store the return address L0 at the top of the frame.' },
    { code: 'GOTO gcd',               exp: 'Jump into gcd. Its prologue saves the registers before using them.' },
    { code: 'LABEL L0',               exp: 'Resume here after gcd returns — the registers have already been restored by gcd itself.' },
    { code: 'v2 := M[SP + SOI]',      exp: 'Read the return value from the first-argument slot into result (v2).' },
    { code: 'SP := SP + SOI * 3',     exp: 'Pop the 3 slots. The call is complete — no register restore needed here.' }
  ]
};

// ── Render the call sequence for a given mode + wire clicks ──────
(function () {
  var container = document.getElementById('callseqLines');
  var explain   = document.getElementById('callseqExplain');
  if (!container || !explain) return;

  function showPlaceholder() {
    explain.innerHTML = '<p class="explain-placeholder">Click a line above to see what it does.</p>';
  }

  function render(mode) {
    var seq = CALL_SEQ[mode] || CALL_SEQ.caller;
    container.innerHTML = '';
    seq.forEach(function (line, i) {
      var span = document.createElement('span');
      if (line.exp === null) {
        span.className = 'seq-line seq-line--plain';
        span.textContent = line.code;
      } else {
        span.className = 'seq-line';
        span.textContent = line.code;
        span.setAttribute('data-exp', i);
        span.addEventListener('click', function () {
          container.querySelectorAll('.seq-line').forEach(function (s) { s.classList.remove('active'); });
          span.classList.add('active');
          explain.innerHTML = '<h4>' + escapeHtml(line.code) + '</h4><p>' + line.exp + '</p>';
        });
      }
      container.appendChild(span);
      container.appendChild(document.createTextNode('\n'));
    });
    showPlaceholder();
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // expose so the toggle can re-render
  window.__renderCallSeq = render;
  render('caller');
})();

// ── Save-strategy toggles (generic) ─────────────────────────────
(function () {
  var toggles = document.querySelectorAll('.save-toggle');

  toggles.forEach(function (toggle) {
    var group = toggle.getAttribute('data-group');
    var btns  = toggle.querySelectorAll('.save-toggle__btn');

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.getAttribute('data-mode');
        btns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');

        // show/hide any mode-blocks for this group
        document.querySelectorAll('.mode-block[data-group="' + group + '"]').forEach(function (block) {
          block.hidden = block.getAttribute('data-mode') !== mode;
        });

        // re-render the call sequence if this is that group
        if (group === 'callseq' && typeof window.__renderCallSeq === 'function') {
          window.__renderCallSeq(mode);
        }
      });
    });
  });
})();

// ── Annotated source ↔ IR hover highlight ───────────────────────
(function () {
  var root = document.getElementById('fullXlat');
  var hint = document.getElementById('fullHint');
  if (!root) return;

  var srcLines = root.querySelectorAll('.src-line');
  var irLines  = root.querySelectorAll('.ir-line');

  function clearAll() {
    srcLines.forEach(function (l) { l.classList.remove('active'); });
    irLines.forEach(function (l)  { l.classList.remove('active'); });
  }

  function activate(group) {
    clearAll();
    srcLines.forEach(function (l) { if (l.dataset.group === group) l.classList.add('active'); });
    irLines.forEach(function (l)  { if (l.dataset.group === group) l.classList.add('active'); });
    if (hint) hint.style.visibility = 'hidden';
  }

  function addHover(lines) {
    lines.forEach(function (l) {
      l.addEventListener('mouseenter', function () { activate(l.dataset.group); });
      l.addEventListener('mouseleave', function () {
        clearAll();
        if (hint) hint.style.visibility = 'visible';
      });
    });
  }

  addHover(srcLines);
  addHover(irLines);
})();

// ── Stack stepper ───────────────────────────────────────────────
(function () {
  // slot.state: '' | 'changed' | 'empty'.  The SP marker is a label string.
  var STEPS = [
    {
      phase: 'Before the call',
      sp: 'SP → top of main’s frame',
      slots: [
        { addr: 'M[SP]', val: '(main’s locals)', state: '' }
      ],
      detail: '<h4>main is running</h4>' +
              '<p>main holds <code>a</code> in <code>v0</code>, <code>b</code> in <code>v1</code>, and ' +
              '<code>result</code> in <code>v2</code>. It is about to translate ' +
              '<span class="stack-detail-call">result := gcd(a, b)</span>.</p>'
    },
    {
      phase: 'Save registers (caller-saves)',
      sp: 'SP → unchanged (regs saved above it)',
      slots: [
        { addr: 'M[SP + SOI*k]', val: 'Rk', state: 'changed' },
        { addr: '...',           val: '...', state: 'empty' },
        { addr: 'M[SP]',         val: 'R0', state: 'changed' }
      ],
      detail: '<h4>Protect the live registers</h4>' +
              '<p>main copies <code>R0 … Rk</code> onto the stack with ' +
              '<span class="stack-detail-call">M[SP] := R0 … M[SP + SOI*k] := Rk</span>. ' +
              'Now gcd can use any register freely without destroying main’s values.</p>'
    },
    {
      phase: 'Make room for the frame',
      sp: 'SP → new 3-slot frame',
      slots: [
        { addr: 'M[SP + SOI*2]', val: '—', state: 'empty' },
        { addr: 'M[SP + SOI]',   val: '—', state: 'empty' },
        { addr: 'M[SP]',         val: '—', state: 'empty' }
      ],
      detail: '<h4>Grow the stack: <code>SP := SP - SOI * 3</code></h4>' +
              '<p>Three fresh slots appear below the saved registers: two for arguments, one for the ' +
              'return address (<code>n + 1 = 3</code>). The stack grows downward, so SP is ' +
              '<em>subtracted</em>.</p>'
    },
    {
      phase: 'Push arguments & return address',
      sp: 'SP → frame filled, ready to jump',
      slots: [
        { addr: 'M[SP + SOI*2]', val: 'b  (v1)', state: 'changed' },
        { addr: 'M[SP + SOI]',   val: 'a  (v0)', state: 'changed' },
        { addr: 'M[SP]',         val: 'L0', state: 'changed' }
      ],
      detail: '<h4>Hand over the arguments</h4>' +
              '<p><span class="stack-detail-call">M[SP + SOI] := v0</span>, ' +
              '<span class="stack-detail-call">M[SP + SOI*2] := v1</span>, ' +
              '<span class="stack-detail-call">M[SP] := L0</span>, then ' +
              '<span class="stack-detail-call">GOTO gcd</span>. Everything gcd needs is on the stack.</p>'
    },
    {
      phase: 'Inside gcd',
      sp: 'SP → gcd’s own locals',
      slots: [
        { addr: '(args above)',   val: 'a, b, L0', state: '' },
        { addr: 'M[SP] …',   val: 'temp, …', state: 'changed' }
      ],
      detail: '<h4>gcd takes over</h4>' +
              '<p>gcd’s prologue unpacks the arguments (<code>v0 := M[SP + SOI]</code>, ' +
              '<code>v1 := M[SP + SOI*2]</code>) and runs <span class="stack-detail-call">SP := SP - framesize</span> ' +
              'to make room for <code>temp</code>. It then runs the Chapter 6 loop and prepares to return <code>a</code>.</p>'
    },
    {
      phase: 'Return to main',
      sp: 'SP → back at the 3-slot frame',
      slots: [
        { addr: 'M[SP + SOI*2]', val: 'b  (v1)', state: '' },
        { addr: 'M[SP + SOI]',   val: 'return value', state: 'changed' },
        { addr: 'M[SP]',         val: 'L0', state: '' }
      ],
      detail: '<h4>Deliver the answer and unwind</h4>' +
              '<p>gcd’s epilogue writes <span class="stack-detail-call">M[SP + SOI] := v0</span> ' +
              '(the result, in the first-argument slot), then <code>GOTO returnaddress</code> lands back at ' +
              '<code>L0</code>. main reads <span class="stack-detail-call">t0 := M[SP + SOI]</span> into ' +
              '<code>result</code>, pops the frame with <code>SP := SP + SOI*3</code>, and restores ' +
              '<code>R0 … Rk</code>. The stack is exactly as it was before the call.</p>'
    }
  ];

  var cur = 0;
  var view     = document.getElementById('stackView');
  var detail   = document.getElementById('stackDetail');
  var counter  = document.getElementById('stackCounter');
  var phase    = document.getElementById('stackPhase');
  var prevBtn  = document.getElementById('stackPrev');
  var nextBtn  = document.getElementById('stackNext');

  if (!view || !prevBtn || !nextBtn) return;

  function render() {
    var s = STEPS[cur];
    var html = '<div class="stack-sp">' + s.sp + '</div>';
    s.slots.forEach(function (slot) {
      var cls = 'stack-slot';
      if (slot.state === 'changed') cls += ' stack-slot--changed';
      if (slot.state === 'empty')   cls += ' stack-slot--empty';
      html += '<div class="' + cls + '">' +
              '<span class="stack-slot__addr">' + slot.addr + '</span>' +
              '<span class="stack-slot__val">' + slot.val + '</span>' +
              '</div>';
    });
    view.innerHTML = html;
    detail.innerHTML = s.detail;
    phase.textContent = s.phase;
    counter.textContent = 'Step ' + (cur + 1) + ' of ' + STEPS.length;
    prevBtn.disabled = cur === 0;
    nextBtn.disabled = cur === STEPS.length - 1;
  }

  prevBtn.addEventListener('click', function () { if (cur > 0) { cur--; render(); } });
  nextBtn.addEventListener('click', function () { if (cur < STEPS.length - 1) { cur++; render(); } });
  render();
})();