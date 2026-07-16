// ── Grammar non-terminal highlight system ─────────────────────
(function () {

  // Metadata about each NT — role description for the aside panel
  var ntMeta = {
    PROGRAM:   'The start symbol. Defines the top-level structure of a complete program.',
    GLOBVARS:  'Global variable declarations passed into main.',
    VARS:      'A (possibly empty) comma-separated list of variable declarations.',
    VAR:       'A single variable declaration: a type followed by a name.',
    VTYPE:     'The type of a variable. Either number or text.',
    VNAME:     'A variable name token. Represents any valid identifier used as a variable.',
    FNAME:     'A function name token. Represents any valid identifier used as a function.',
    ALGORITHM: 'A block of statements enclosed in braces. Defines a scope boundary.',
    STAT:      'A statement. Can be sequenced, assigned, conditional, looping, or a return.',
    COND:      'A condition expression used in control flow. Always a relational comparison.',
    RELOP:     'A relational operator: <, >, =, <=, or >=.',
    EXPR:      'An expression that produces a value. Can be a literal, variable, operation, or call.',
    UNOP:      'A unary operator (extensible — add operators as needed for each chapter).',
    BINOP:     'A binary operator (extensible — add operators as needed for each chapter).',
    FUNCTIONS: 'The list of function declarations that follow the main body.',
    DECL:      'A single function declaration: a header and a body.',
    HEADER:    'The function signature: name and parameter list.',
    BODY:      'The function body: an ALGORITHM block.',
  };

  var rules      = document.querySelectorAll('.prod-rule');
  var clickables = document.querySelectorAll('.nt.clickable');
  var idxBtns    = document.querySelectorAll('.nt-idx-btn');

  // aside elements
  var placeholder = document.querySelector('.nt-placeholder');
  var detail      = document.querySelector('.nt-detail');
  var ntNameEl    = document.getElementById('ntName');
  var ntRoleEl    = document.getElementById('ntRole');
  var ntUsedInEl  = document.getElementById('ntUsedIn');

  var selected = null;

  function clearAll() {
    rules.forEach(function (r) {
      r.classList.remove('hl-define', 'hl-ref', 'dimmed');
    });
    clickables.forEach(function (n) { n.classList.remove('nt--selected'); });
    idxBtns.forEach(function (b)    { b.classList.remove('active'); });
    if (placeholder) placeholder.style.display = 'block';
    if (detail)      detail.style.display = 'none';
    selected = null;
  }

  function activate(nt) {
    if (selected === nt) { clearAll(); return; }
    selected = nt;

    var definedIn = 0;
    var referencedIn = 0;

    rules.forEach(function (rule) {
      var defines = (rule.dataset.defines || '').split(' ');
      var refs    = (rule.dataset.refs    || '').split(' ');
      var isDef   = defines.indexOf(nt) !== -1;
      var isRef   = refs.indexOf(nt) !== -1;

      rule.classList.remove('hl-define', 'hl-ref', 'dimmed');

      if (isDef) {
        rule.classList.add('hl-define');
        definedIn++;
      } else if (isRef) {
        rule.classList.add('hl-ref');
        referencedIn++;
      } else {
        rule.classList.add('dimmed');
      }
    });

    // highlight matching NT spans in code
    clickables.forEach(function (n) {
      n.classList.toggle('nt--selected', n.dataset.nt === nt);
    });

    // highlight index button
    idxBtns.forEach(function (b) {
      b.classList.toggle('active', b.dataset.nt === nt);
    });

    // update aside
    if (placeholder) placeholder.style.display = 'none';
    if (detail)      detail.style.display = 'block';
    if (ntNameEl) ntNameEl.textContent = nt;
    if (ntRoleEl) ntRoleEl.textContent = ntMeta[nt] || '';
    if (ntUsedInEl) {
      ntUsedInEl.innerHTML =
        '<div class="nt-usage-section">' +
          '<p class="nt-usage-label">Productions</p>' +
          '<p class="nt-usage-count">' +
            '<span class="count-badge count-badge--define">' + definedIn + '</span>' +
            'rule' + (definedIn !== 1 ? 's' : '') + ' define this NT' +
          '</p>' +
          '<p class="nt-usage-count">' +
            '<span class="count-badge count-badge--ref">' + referencedIn + '</span>' +
            'rule' + (referencedIn !== 1 ? 's' : '') + ' reference this NT' +
          '</p>' +
        '</div>';
    }
  }

  // click on NT spans in rules
  clickables.forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.stopPropagation();
      activate(el.dataset.nt);
    });
  });

  // click on index buttons
  idxBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activate(btn.dataset.nt);
      // scroll the first defining rule into view
      var first = document.querySelector('.prod-rule.hl-define');
      if (first) {
        first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  // click anywhere else to clear
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.prod-rule') &&
        !e.target.closest('.nt-idx-btn') &&
        !e.target.closest('#ntInfo')) {
      clearAll();
    }
  });

})();
