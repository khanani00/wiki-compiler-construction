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

// ── Animated bottom-up type-checking trace ──────────────────────
// Traces CheckExp on  a - (a / b * b)  from the gcd body.
// Synthesised attributes flow bottom-up: leaves resolve first,
// types bubble to the root. vtable/ftable are assumed already built.
(function () {

  var allNodes = ["N0", "N1", "N2", "N3", "N4", "N5", "N6"];
  var allEdges = ["e-N0-N1", "e-N0-N2", "e-N2-N3", "e-N2-N4", "e-N3-N5", "e-N3-N6"];
  var allFlows = ["f-N1", "f-N2", "f-N3", "f-N4", "f-N5", "f-N6"];

  var steps = [
    {
      phase: "Step 1 — the leaves",
      active: ["N1", "N5", "N6", "N4"],
      resolved: [],
      edgesUp: [], flows: [],
      explain: '<span class="tag">leaves first</span> Type-checking a tree works <strong>bottom-up</strong>. ' +
               'The four leaf calls are variable lookups: each <code>CheckExp(a)</code> and <code>CheckExp(b)</code> ' +
               'looks its name up in the <code>vtable</code>. No children to wait for — they resolve immediately.'
    },
    {
      phase: "Step 2 — leaves return number",
      active: [],
      resolved: ["N1", "N5", "N6", "N4"],
      edgesUp: [], flows: [],
      explain: '<span class="tag">synthesised &#8593;</span> Every leaf returns <code>number</code> ' +
               '(from <code>lookup(vtable, "a")</code> and <code>lookup(vtable, "b")</code>). ' +
               'These are the first synthesised attributes — now they travel up to their parents.'
    },
    {
      phase: "Step 3 — a / b resolves",
      active: ["N3"],
      resolved: ["N1", "N5", "N6", "N4"],
      edgesUp: ["e-N3-N5", "e-N3-N6"], flows: ["f-N5", "f-N6"],
      explain: '<span class="tag">internal node</span> <code>CheckExp(a/b)</code> waited for its two children. ' +
               'Both returned <code>number</code>, so the BINOP <code>/</code> rule checks ' +
               '<code>number = number</code> &#10003; and the division itself synthesises <code>number</code>.'
    },
    {
      phase: "Step 4 — a / b * b resolves",
      active: ["N2"],
      resolved: ["N1", "N3", "N4", "N5", "N6"],
      edgesUp: ["e-N2-N3", "e-N2-N4"], flows: ["f-N3", "f-N4"],
      explain: '<span class="tag">internal node</span> <code>CheckExp(a/b*b)</code> now has both its children: ' +
               '<code>a/b &#8658; number</code> and <code>b &#8658; number</code>. The BINOP <code>*</code> rule passes, ' +
               'so the multiplication synthesises <code>number</code>.'
    },
    {
      phase: "Step 5 — the root resolves",
      active: ["N0"],
      resolved: ["N1", "N2", "N3", "N4", "N5", "N6"],
      edgesUp: ["e-N0-N1", "e-N0-N2"], flows: ["f-N1", "f-N2"],
      explain: '<span class="tag">root</span> The top call <code>CheckExp(a - (a/b*b))</code> finally has both operands: ' +
               '<code>a &#8658; number</code> (left) and <code>a/b*b &#8658; number</code> (right). ' +
               'The BINOP <code>-</code> rule passes &rarr; the whole expression synthesises <code>number</code>.'
    },
    {
      phase: "Step 6 — done",
      active: [],
      resolved: ["N0", "N1", "N2", "N3", "N4", "N5", "N6"],
      edgesUp: ["e-N0-N1", "e-N0-N2", "e-N2-N3", "e-N2-N4", "e-N3-N5", "e-N3-N6"],
      flows: ["f-N1", "f-N2", "f-N3", "f-N4", "f-N5", "f-N6"],
      explain: '<span class="tag">complete</span> Every node is typed, all from the bottom up. The root returns ' +
               '<code>number</code>, which matches the declared type of <code>b</code> in <code>b := a - (a/b*b)</code> — ' +
               'so the assignment is well-typed. The <code>vtable</code> was <em>inherited</em> (passed down) into every ' +
               'call; the types were <em>synthesised</em> (returned up).'
    }
  ];

  var cur = 0;
  var svg = document.getElementById("tcSvg");
  var counter = document.getElementById("tcCounter");
  var phase = document.getElementById("tcPhase");
  var explain = document.getElementById("tcExplain");
  var prevBtn = document.getElementById("tcPrev");
  var nextBtn = document.getElementById("tcNext");

  if (!svg || !prevBtn || !nextBtn) return;

  function g(id) { return document.getElementById(id); }

  function render() {
    var s = steps[cur];

    allNodes.forEach(function (id) {
      var el = g(id);
      if (!el) return;
      el.classList.remove("active", "resolved", "dim");
      var res = el.querySelector(".result");
      if (res) res.classList.remove("show");

      var isResolved = s.resolved.indexOf(id) !== -1;
      var isActive = s.active.indexOf(id) !== -1;

      if (isResolved) { el.classList.add("resolved"); if (res) res.classList.add("show"); }
      if (isActive) { el.classList.add("active"); if (res) res.classList.add("show"); }
      if (!isResolved && !isActive) { el.classList.add("dim"); }
    });

    allEdges.forEach(function (id) {
      var el = g(id); if (!el) return;
      el.classList.remove("up"); el.classList.add("dim");
    });
    s.edgesUp.forEach(function (id) {
      var el = g(id); if (!el) return;
      el.classList.add("up"); el.classList.remove("dim");
    });

    allFlows.forEach(function (id) { var el = g(id); if (el) el.classList.remove("show"); });
    s.flows.forEach(function (id) { var el = g(id); if (el) el.classList.add("show"); });

    phase.textContent = s.phase;
    explain.innerHTML = s.explain;
    counter.textContent = "Step " + (cur + 1) + " of " + steps.length;
    prevBtn.disabled = cur === 0;
    nextBtn.disabled = cur === steps.length - 1;
  }

  prevBtn.addEventListener("click", function () { if (cur > 0) { cur--; render(); } });
  nextBtn.addEventListener("click", function () { if (cur < steps.length - 1) { cur++; render(); } });
  render();
})();