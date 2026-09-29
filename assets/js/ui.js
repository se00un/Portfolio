/* Shared UI helpers: header, footer, markdown rendering. */
(function () {
  const EMAIL = "seoeunpark08@gmail.com";
  const GITHUB = "https://github.com/se00un/se00un";

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const inline = (md) => (md ? marked.parseInline(md) : "");
  const block = (md) => (md ? marked.parse(md) : "");

  function fmtYM(d) {
    if (!d) return "";
    return d.getFullYear() + "." + String(d.getMonth() + 1).padStart(2, "0");
  }

  function header() {
    return `
      <header class="topbar">
        <div class="wrap topbar-inner">
          <a class="brand" href="./">PARK SEOEUN</a>
          <nav class="topbar-links" aria-label="Contact">
            <a href="${GITHUB}" target="_blank" rel="noopener">GitHub</a>
            <a href="mailto:${EMAIL}" title="${EMAIL}">Email</a>
          </nav>
        </div>
      </header>`;
  }

  function footer() {
    return `
      <footer class="footer" id="contact">
        <div class="wrap">
          <div class="footer-top">
            <a class="footer-name" href="mailto:${EMAIL}">PARK<br>SEOEUN</a>
            <dl class="footer-links">
              <dt>Email</dt><dd><a href="mailto:${EMAIL}">${EMAIL}</a></dd>
              <dt>GitHub</dt><dd><a href="${GITHUB}" target="_blank" rel="noopener">github.com/se00un</a></dd>
            </dl>
          </div>
          <div class="footer-bottom">
            <span>© ${new Date().getFullYear()} Park Seoeun</span>
            <span>Data Science &amp; Computer Science</span>
          </div>
        </div>
      </footer>`;
  }

  function tags(list, max) {
    const items = max ? list.slice(0, max) : list;
    return items.length
      ? `<ul class="tags">${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`
      : "";
  }

  window.UI = { esc, inline, block, fmtYM, header, footer, tags, EMAIL, GITHUB };
})();
