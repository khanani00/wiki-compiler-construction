(() => {
  console.log("header.js loaded");

  const cssUrl = new URL("../css/header.css", document.currentScript.src).href;
  if (!document.querySelector(`link[href="${cssUrl}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl;
    document.head.appendChild(link);
  }

  const CHAPTERS = [
    { title: "Chapter 1", href: "../pages/chapter1.html" },
    { title: "Chapter 2", href: "../pages/chapter2.html" },
    { title: "Chapter 3", href: "../pages/chapter3.html" },
    { title: "Chapter 5", href: "../pages/chapter5.html" },
    { title: "Chapter 6", href: "../pages/chapter6.html" },
    { title: "Chapter 8", href: "../pages/chapter8.html" },
    { title: "Chapter 9", href: "../pages/chapter9.html" },
  ];

  class SiteHeader extends HTMLElement {
    connectedCallback() {
      const here = location.pathname.split("/").pop() || "index.html";
      const items = CHAPTERS.map(c =>
        `<li><a href="${c.href}"${c.href.endsWith("/" + here) ? ' aria-current="page"' : ""}>${c.title}</a></li>`
      ).join("");

      this.innerHTML = `
        <header class="site-header">
          <div class="site-header__inner">
            <span class="site-header__course">COS341 Supplementary Material</span>
            <nav class="site-header__nav">
              <a href="../pages/index.html">Home</a>
              <div class="dropdown">
                <a class="dropdown__toggle" aria-expanded="false" aria-haspopup="true">
                  Chapters <span aria-hidden="true">▾</span>
                </a>
                <ul class="dropdown__menu" hidden>${items}</ul>
              </div>
              <a href="../pages/grammar.html">Grammar</a>
            </nav>
          </div>
        </header>`;

      const toggle = this.querySelector(".dropdown__toggle");
      const menu = this.querySelector(".dropdown__menu");
      const setOpen = open => {
        toggle.setAttribute("aria-expanded", open);
        menu.hidden = !open;
      };
      toggle.addEventListener("click", e => { e.stopPropagation(); setOpen(menu.hidden); });
      document.addEventListener("click", e => { if (!this.contains(e.target)) setOpen(false); });
      document.addEventListener("keydown", e => { if (e.key === "Escape") setOpen(false); });
    }
  }

  if (!customElements.get("site-header")) customElements.define("site-header", SiteHeader);
})();