document.addEventListener("DOMContentLoaded", function () {

  /* ── FIXED-POINT DATA (pre-computed, matches Python output exactly) ── */
  // iter → array of 18 rows, each: { i, code, inSet, outSet, changed }

  var instructions = [
    { i:1,  code:"v2 := 0"                   },
    { i:2,  code:"LABEL L1"                  },
    { i:3,  code:"IF v1 > 0 THEN L2 ELSE L3" },
    { i:4,  code:"LABEL L2"                  },
    { i:5,  code:"t1 := v1"                  },
    { i:6,  code:"v2 := t1"                  },
    { i:7,  code:"t2 := v0"                  },
    { i:8,  code:"t3 := v0"                  },
    { i:9,  code:"t4 := v1"                  },
    { i:10, code:"t5 := t3 / t4"             },
    { i:11, code:"t6 := t5 * v1"             },
    { i:12, code:"t7 := t2 - t6"             },
    { i:13, code:"v1 := t7"                  },
    { i:14, code:"t8 := v2"                  },
    { i:15, code:"v0 := t8"                  },
    { i:16, code:"GOTO L1"                   },
    { i:17, code:"LABEL L3"                  },
    { i:18, code:"RETURN v0"                 },
  ];

  // Each iteration: for every instruction, the in/out after that pass.
  // Values from the Python fixed-point computation.
  var iterations = [
    // ── Iteration 1 ────────────────────────────────────────────
    {
      label: "Iteration 1 — first backward pass",
      detail: "First pass: liveness propagates backward from RETURN v0 (i=18) toward the top. The back-edge from GOTO L1 (i=16) has not yet propagated through — v0 and v1 are not yet seen as live at instructions 1–15.",
      rows: [
        { i:1,  inSet:"v0, v1",           outSet:"v0, v1",               changed:false },
        { i:2,  inSet:"v0, v1",           outSet:"v0, v1",               changed:false },
        { i:3,  inSet:"v0, v1",           outSet:"v0, v1",               changed:false },
        { i:4,  inSet:"v0, v1",           outSet:"v0, v1",               changed:false },
        { i:5,  inSet:"v0, v1",           outSet:"t1, v0, v1",           changed:true  },
        { i:6,  inSet:"t1, v0, v1",       outSet:"v0, v1, v2",           changed:true  },
        { i:7,  inSet:"v0, v1, v2",       outSet:"t2, v0, v1, v2",       changed:true  },
        { i:8,  inSet:"t2, v0, v1, v2",   outSet:"t2, t3, v1, v2",       changed:true  },
        { i:9,  inSet:"t2, t3, v1, v2",   outSet:"t2, t3, t4, v1, v2",  changed:true  },
        { i:10, inSet:"t2, t3, t4, v1, v2", outSet:"t2, t5, v1, v2",    changed:true  },
        { i:11, inSet:"t2, t5, v1, v2",   outSet:"t2, t6, v2",           changed:true  },
        { i:12, inSet:"t2, t6, v2",       outSet:"t7, v2",               changed:true  },
        { i:13, inSet:"t7, v2",           outSet:"v2",                   changed:true  },
        { i:14, inSet:"v2",               outSet:"t8",                   changed:true  },
        { i:15, inSet:"t8",               outSet:"∅",                    changed:true  },
        { i:16, inSet:"∅",               outSet:"∅",                    changed:false },
        { i:17, inSet:"v0",               outSet:"v0",                   changed:true  },
        { i:18, inSet:"v0",               outSet:"∅",                    changed:true  },
      ]
    },
    // ── Iteration 2 ────────────────────────────────────────────
    {
      label: "Iteration 2 — back-edge propagation",
      detail: "The back-edge 16→2 (GOTO L1) now kicks in. out[16] = in[2]. In iteration 1, out[15] = ∅ so in[16] = ∅ and out[16] = in[2] = {v0,v1}. This ripples: out[15] → {v0,v1}, in[15] = {t8,v1}, out[14] = {t8,v1}, in[14] = {v1,v2}, in[13] = {t7,v2} (unchanged), out[13] = {v1,v2} — now v1 is live after instruction 13.",
      rows: [
        { i:1,  inSet:"v0, v1",           outSet:"v0, v1",               changed:false },
        { i:2,  inSet:"v0, v1",           outSet:"v0, v1",               changed:false },
        { i:3,  inSet:"v0, v1",           outSet:"v0, v1",               changed:false },
        { i:4,  inSet:"v0, v1",           outSet:"v0, v1",               changed:false },
        { i:5,  inSet:"v0, v1",           outSet:"t1, v0, v1",           changed:false },
        { i:6,  inSet:"t1, v0, v1",       outSet:"v0, v1, v2",           changed:false },
        { i:7,  inSet:"v0, v1, v2",       outSet:"t2, v0, v1, v2",       changed:false },
        { i:8,  inSet:"t2, v0, v1, v2",   outSet:"t2, t3, v1, v2",       changed:false },
        { i:9,  inSet:"t2, t3, v1, v2",   outSet:"t2, t3, t4, v1, v2",  changed:false },
        { i:10, inSet:"t2, t3, t4, v1, v2", outSet:"t2, t5, v1, v2",    changed:false },
        { i:11, inSet:"t2, t5, v1, v2",   outSet:"t2, t6, v2",           changed:false },
        { i:12, inSet:"t2, t6, v2",       outSet:"t7, v2",               changed:false },
        { i:13, inSet:"t7, v2",           outSet:"v1, v2",               changed:true  },
        { i:14, inSet:"v1, v2",           outSet:"t8, v1",               changed:true  },
        { i:15, inSet:"t8, v1",           outSet:"v0, v1",               changed:true  },
        { i:16, inSet:"v0, v1",           outSet:"v0, v1",               changed:true  },
        { i:17, inSet:"v0",               outSet:"v0",                   changed:false },
        { i:18, inSet:"v0",               outSet:"∅",                    changed:false },
      ]
    },
    // ── Iteration 3 ────────────────────────────────────────────
    {
      label: "Iteration 3 — fixed point confirmed",
      detail: "No sets change this pass. Every in[i] and out[i] matches the values from iteration 2. Fixed point reached — the algorithm stops.",
      rows: [
        { i:1,  inSet:"v0, v1",           outSet:"v0, v1",               changed:false },
        { i:2,  inSet:"v0, v1",           outSet:"v0, v1",               changed:false },
        { i:3,  inSet:"v0, v1",           outSet:"v0, v1",               changed:false },
        { i:4,  inSet:"v0, v1",           outSet:"v0, v1",               changed:false },
        { i:5,  inSet:"v0, v1",           outSet:"t1, v0, v1",           changed:false },
        { i:6,  inSet:"t1, v0, v1",       outSet:"v0, v1, v2",           changed:false },
        { i:7,  inSet:"v0, v1, v2",       outSet:"t2, v0, v1, v2",       changed:false },
        { i:8,  inSet:"t2, v0, v1, v2",   outSet:"t2, t3, v1, v2",       changed:false },
        { i:9,  inSet:"t2, t3, v1, v2",   outSet:"t2, t3, t4, v1, v2",  changed:false },
        { i:10, inSet:"t2, t3, t4, v1, v2", outSet:"t2, t5, v1, v2",    changed:false },
        { i:11, inSet:"t2, t5, v1, v2",   outSet:"t2, t6, v2",           changed:false },
        { i:12, inSet:"t2, t6, v2",       outSet:"t7, v2",               changed:false },
        { i:13, inSet:"t7, v2",           outSet:"v1, v2",               changed:false },
        { i:14, inSet:"v1, v2",           outSet:"t8, v1",               changed:false },
        { i:15, inSet:"t8, v1",           outSet:"v0, v1",               changed:false },
        { i:16, inSet:"v0, v1",           outSet:"v0, v1",               changed:false },
        { i:17, inSet:"v0",               outSet:"v0",                   changed:false },
        { i:18, inSet:"v0",               outSet:"∅",                    changed:false },
      ]
    },
  ];

  /* ── STEPPER ─────────────────────────────────────────────────── */

  var current   = 0;
  var treeEl    = document.getElementById('stepTree');
  var detailEl  = document.getElementById('stepDetail');
  var counterEl = document.getElementById('stepCounter');
  var phaseEl   = document.getElementById('stepPhase');
  var prevBtn   = document.getElementById('prevStep');
  var nextBtn   = document.getElementById('nextStep');

  function fmt(s) { return s || '∅'; }

  function render() {
    var iter = iterations[current];

    counterEl.textContent = 'Iteration ' + (current + 1) + ' of ' + iterations.length;
    if (phaseEl) phaseEl.textContent = iter.label;

    var html = '<div class="iter-row iter-row--header">' +
               '<div class="ir-i">i</div>' +
               '<div class="ir-code">Instruction</div>' +
               '<div class="ir-in">in[i]</div>' +
               '<div class="ir-out">out[i]</div>' +
               '</div>';

    iter.rows.forEach(function (row) {
      var cls = row.changed ? 'iter-row--changed' : 'iter-row--same';
      var badge = row.changed
        ? '<span class="iter-changed-badge">UPDATED</span>'
        : '';
      html += '<div class="iter-row ' + cls + '">' +
              '<div class="ir-i">' + row.i + '</div>' +
              '<div class="ir-code" title="' + instructions[row.i - 1].code + '">' + instructions[row.i - 1].code + '</div>' +
              '<div class="ir-in">' + fmt(row.inSet) + '</div>' +
              '<div class="ir-out">' + fmt(row.outSet) + badge + '</div>' +
              '</div>';
    });

    treeEl.innerHTML = html;

    var changedCount = iter.rows.filter(function (r) { return r.changed; }).length;
    if (detailEl) {
      detailEl.innerHTML = '<p style="font-size:0.85rem;color:var(--col-muted);margin-top:0.6rem">' +
        iter.detail + '</p>';
    }

    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === iterations.length - 1;
  }

  prevBtn.addEventListener('click', function () { if (current > 0) { current--; render(); } });
  nextBtn.addEventListener('click', function () { if (current < iterations.length - 1) { current++; render(); } });

  render();
});