/* Project / Experience detail page: project.html?p=<id> 또는 ?e=<id> */
(async function () {
  const { esc, inline, block, fmtYM, tags } = UI;
  const root = document.getElementById("detail");
  document.getElementById("header").innerHTML = UI.header();
  document.getElementById("footer").innerHTML = UI.footer();

  const params = new URLSearchParams(location.search);
  const pid = params.get("p");
  const eid = params.get("e");

  let item = null;
  let projects = [];
  if (pid) {
    projects = await Content.loadProjects(SITE.projects);
    item = projects.find((p) => p.id === pid) || (await Content.loadProject(pid));
  } else if (eid) {
    item = await Content.loadExperience(eid);
  }

  if (!item) {
    root.innerHTML = `
      <div class="wrap d-missing">
        <p class="mono">404</p>
        <h1>페이지를 찾을 수 없습니다.</h1>
        <a class="link-arrow" href="./">Home <span aria-hidden="true">→</span></a>
      </div>`;
    return;
  }

  document.title = `${item.name} — 박서은`;

  // ---------- header ----------
  const isProject = item.kind === "project";
  const facts = [];
  if (isProject) {
    const m = item.meta;
    const add = (label, v) => v && !/^tbd$/i.test(v) && facts.push([label, v]);
    add("Period", m.period);
    add("Type", m.type);
    add("Role", m.role);
    add("Course", m.course);
    add("Publication", m.publication);
    add("Award", m.award);
  } else {
    facts.push(["Company", item.company]);
    if (item.position) facts.push(["Position", item.position]);
    item.details.forEach((d, i) => facts.push([i === 0 ? "Team" : "Field", d]));
    facts.push(["Period", item.period.open ? `${fmtYM(item.period.start)} – Present` : item.period.text]);
  }

  const links = isProject ? item.links : [];
  const metrics = isProject ? (item.card.metrics || []).slice(0, 4) : [];

  // Tech Stack 섹션은 본문 대신 사이드에 표시
  const isStack = (t) => /^(\d+\.\s*)?(tech|keywords)/i.test(t);
  const stackSec = item.sections.find((s) => isStack(s.title));
  const sections = item.sections.filter((s) => !isStack(s.title));

  const headHtml = `
    <div class="wrap">
      <a class="back mono" href="${isProject ? "./#works" : "./#journey"}">← ${isProject ? "All Projects" : "Home"}</a>

      <header class="d-head">
        <p class="d-kicker mono">
          <span class="accent">${isProject ? "Project" : "Experience"}</span>
          ${isProject && item.category ? `<span>${esc(item.category)}</span>` : ""}
        </p>
        <h1 class="d-title">${esc(item.name)}</h1>
        ${item.subtitle ? `<p class="d-subtitle">${esc(item.subtitle)}</p>` : ""}
        ${
          isProject && item.question
            ? `<blockquote class="d-question"><span class="mono">${item.questionLabel}</span><p>${esc(item.question)}</p></blockquote>`
            : ""
        }
      </header>

      <div class="d-intro">
        <div class="d-summary">${isProject ? block(item.summary) : block(item.lead)}</div>
        <aside class="d-facts">
          <dl>${facts.map(([k, v]) => `<div><dt class="mono">${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
          ${
            links.length
              ? `<ul class="d-links">${links
                  .map((l) => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} <span aria-hidden="true">↗</span></a></li>`)
                  .join("")}</ul>`
              : ""
          }
        </aside>
      </div>

      ${
        metrics.length
          ? `<ul class="d-metrics" style="--n:${metrics.length}">${metrics.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>`
          : ""
      }

      ${stackHtml(stackSec)}

    </div>`;

  // ---------- body ----------
  // 섹션 안의 소제목이 항상 h3부터 시작하도록 단계를 맞춘다
  const shift = (md) => (item.sectionLevel === 1 ? md.replace(/^(#{1,5})\s/gm, "#$1 ") : md);
  // 섹션 번호는 MD에 적힌 번호("1. Problem")를 그대로 사용하고, 없으면 표시하지 않는다
  const splitNum = (t) => {
    const m = t.match(/^(\d+)\.\s*(.*)$/);
    return m ? { num: m[1].padStart(2, "0"), title: m[2] } : { num: "", title: t };
  };

  const bodyHtml = sections
    .map((s, i) => {
      const { num, title } = splitNum(s.title);
      let md = s.md;
      // 경험 페이지: What I Worked On 첫 문단은 상단 요약에 이미 표시됨
      if (!isProject && /worked on/i.test(title)) md = md.replace(item.lead, "");
      return `
      <section class="d-sec ${secClass(title)}" id="s${i + 1}" data-title="${esc(title)}">
        <div class="d-sec-head">
          ${num ? `<span class="mono accent">${num}</span>` : ""}
          <h2>${esc(title)}</h2>
        </div>
        <div class="prose">${block(shift(md))}</div>
      </section>`;
    })
    .join("");

  const tocHtml = sections
    .map((s, i) => {
      const { num, title } = splitNum(s.title);
      return `<li><a href="#s${i + 1}"><span class="mono">${num}</span>${esc(title)}</a></li>`;
    })
    .join("");

  // prev / next
  let pagerHtml = "";
  if (isProject && projects.length) {
    const idx = projects.findIndex((p) => p.id === item.id);
    const prev = projects[(idx - 1 + projects.length) % projects.length];
    const next = projects[(idx + 1) % projects.length];
    if (idx >= 0 && projects.length > 1)
      pagerHtml = `
      <nav class="wrap pager" aria-label="Projects">
        <a href="project.html?p=${encodeURIComponent(prev.id)}"><span class="mono">← Previous</span><strong>${esc(prev.name)}</strong></a>
        <a href="project.html?p=${encodeURIComponent(next.id)}"><span class="mono">Next →</span><strong>${esc(next.name)}</strong></a>
      </nav>`;
  }

  root.innerHTML = `
    ${headHtml}
    <div class="wrap d-layout">
      <nav class="d-toc" aria-label="Contents">
        <p class="mono">Contents</p>
        <ol>${tocHtml}</ol>
      </nav>
      <article class="d-body">${bodyHtml}</article>
    </div>
    ${pagerHtml}`;


  // ---------- helpers ----------
  // "### Group" + `tag` `tag` 형식 → 그룹별 태그
  function stackHtml(sec) {
    if (!sec) return "";
    const groups = [];
    let cur = { title: "", tags: [] };
    for (const line of sec.md.split("\n")) {
      const h = line.match(/^#{2,5}\s+(.+)$/);
      if (h) {
        if (cur.tags.length) groups.push(cur);
        cur = { title: h[1].trim(), tags: [] };
      } else for (const m of line.matchAll(/`([^`]+)`/g)) cur.tags.push(m[1]);
    }
    if (cur.tags.length) groups.push(cur);
    if (!groups.length) return "";
    return `
      <div class="d-stack">
        <p class="mono d-stack-title">Tech Stack</p>
        <div class="d-stack-groups">
        ${groups
          .map(
            (g) => `<div class="d-stack-group">
              ${g.title ? `<span class="mono">${esc(g.title)}</span>` : ""}
              ${tags(g.tags)}
            </div>`
          )
          .join("")}
        </div>
      </div>`;
  }

  function secClass(title) {
    if (/^tech|keywords/i.test(title)) return "d-sec--stack";
    if (/architecture/i.test(title)) return "d-sec--arch";
    return "";
  }

  const ARROW = /^(→|↓)\s*/;
  const OP = /^(→|↓|├|└|\+)/;
  const isBoldOnly = (el) =>
    el.children.length === 1 &&
    el.firstElementChild.tagName === "STRONG" &&
    el.textContent.trim() === el.firstElementChild.textContent.trim();

  // 문단을 줄 단위로 (<br> 또는 줄바꿈)
  function lineParts(p) {
    const html = isBoldOnly(p) ? p.firstElementChild.innerHTML : p.innerHTML;
    const lines = html
      .split(/<br\s*\/?>|\n/i)
      .map((s) => s.trim())
      .filter(Boolean);
    // 화살표만 있는 줄("↓")은 다음 줄과 합친다
    const out = [];
    for (let i = 0; i < lines.length; i++) {
      if (/^(↓|→)$/.test(lines[i]) && lines[i + 1]) out.push(lines[i] + " " + lines[++i]);
      else out.push(lines[i]);
    }
    return out;
  }

  function stepsFrom(parts) {
    const steps = [];
    for (const part of parts) {
      if (/^(↓|→)$/.test(part)) continue;
      const last = steps[steps.length - 1];
      const branch = part.match(/^[├└]─*\s*(.*)$/);
      const plus = part.match(/^\+\s*(.*)$/);
      if (branch) {
        if (last && last.fork) last.fork.push(branch[1]);
        else steps.push({ fork: [branch[1]] });
      } else if (plus && last) {
        if (last.join) last.join.push(plus[1]);
        else steps[steps.length - 1] = { join: [last.text, plus[1]] };
      } else steps.push({ text: part.replace(ARROW, "") });
    }
    return steps;
  }

  const node = (html) => `<span class="node${/<strong>/.test(html) ? " is-key" : ""}">${html}</span>`;

  function flowEl(steps, vertical) {
    const ol = document.createElement("ol");
    ol.className = "flow" + (vertical ? " flow--v" : "");
    ol.innerHTML = steps
      .map((s) => {
        if (s.fork) return `<li class="flow-group flow-group--or">${s.fork.map(node).join("")}</li>`;
        if (s.join) return `<li class="flow-group flow-group--and">${s.join.map(node).join('<i aria-hidden="true">+</i>')}</li>`;
        return `<li>${node(s.text)}</li>`;
      })
      .join("");
    return ol;
  }

  // 연속된 같은 종류의 문단을 하나의 다이어그램으로 묶는다
  function groupRuns(body, cls, build) {
    const seen = new Set();
    body.querySelectorAll("p." + cls).forEach((p) => {
      if (seen.has(p)) return;
      const run = [p];
      let n = p.nextElementSibling;
      while (n && n.classList.contains(cls)) {
        run.push(n);
        n = n.nextElementSibling;
      }
      run.forEach((r) => seen.add(r));
      const el = build(run.map((r) => r._data));
      p.replaceWith(el);
      run.slice(1).forEach((r) => r.remove());
    });
  }

  // Market Analytics 형식: ### 그룹 + **서비스** + 설명 리스트 → 구성도
  function archFromHeadings(sec) {
    const prose = sec.querySelector(".prose");
    let hs = [...prose.querySelectorAll(":scope > h3")];
    if (hs.length < 2) hs = [...prose.querySelectorAll(":scope > h4")];
    if (hs.length < 2) return;
    const groups = [];
    for (const h of hs) {
      const els = [];
      let n = h.nextElementSibling;
      while (n && !/^H[2-4]$/.test(n.tagName)) {
        els.push(n);
        n = n.nextElementSibling;
      }
      const items = [];
      for (let i = 0; i < els.length; i++) {
        const e = els[i];
        if (e.tagName !== "P" || !isBoldOnly(e)) return;
        const ul = els[i + 1] && els[i + 1].tagName === "UL" ? els[++i] : null;
        items.push({ name: e.textContent.trim(), notes: ul ? [...ul.children].map((li) => li.innerHTML) : [] });
      }
      if (!items.length) return;
      groups.push({ h, els, title: h.textContent.trim(), items });
    }
    const col = (g) => `
      <div class="arch-col">
        <span class="mono arch-title">${esc(g.title)}</span>
        ${g.items
          .map(
            (it) => `<div class="arch-node"><strong>${esc(it.name)}</strong>${
              it.notes.length ? `<ul>${it.notes.map((x) => `<li>${x}</li>`).join("")}</ul>` : ""
            }</div>`
          )
          .join("")}
      </div>`;
    const main = groups.filter((g) => !/monitor/i.test(g.title));
    const rail = groups.filter((g) => /monitor/i.test(g.title));
    const fig = document.createElement("figure");
    fig.className = "arch";
    fig.innerHTML = `
      <div class="arch-lane">${main.map(col).join('<span class="arch-arrow" aria-hidden="true">→</span>')}</div>
      ${rail.map((g) => `<div class="arch-rail">${col(g)}</div>`).join("")}`;
    groups[0].h.before(fig);
    groups.forEach((g) => [g.h, ...g.els].forEach((e) => e.remove()));
  }

  function numVal(cell) {
    const t = cell.textContent.replace(/[,%\s]/g, "");
    return /^-?\d*\.?\d+$/.test(t) ? parseFloat(t) : null;
  }

  function tableToDiagram(t) {
    const head = t.tHead && t.tHead.rows[0];
    const rows = t.tBodies[0] ? [...t.tBodies[0].rows] : [];
    const heads = head ? [...head.cells].map((c) => c.textContent.trim()) : [];
    if (heads.length < 2 || rows.length < 2) return null;

    // 수치 비교 → 막대
    const vals = rows.map((r) => numVal(r.cells[1]));
    if (vals.every((v) => v !== null && v >= 0)) {
      const max = Math.max(...vals) || 1;
      const fig = document.createElement("figure");
      fig.className = "bars";
      fig.innerHTML = `
        <figcaption class="mono">${esc(heads[1])}</figcaption>
        ${rows
          .map((r, i) => {
            const key = r.querySelector("strong") ? " is-key" : "";
            const note = r.cells[2] ? `<span class="bar-note">${r.cells[2].innerHTML}</span>` : "";
            return `
            <div class="bar-row${key}">
              <span class="bar-label">${r.cells[0].innerHTML}</span>
              <span class="bar-track"><span class="bar-fill" style="width:${((vals[i] / max) * 100).toFixed(2)}%"></span></span>
              <span class="bar-val">${esc(r.cells[1].textContent.trim())}</span>
              ${note}
            </div>`;
          })
          .join("")}`;
      return fig;
    }

    // 반복되는 조건 → 매트릭스
    if (heads.length === 2) {
      const firsts = rows.map((r) => r.cells[0].textContent.trim());
      if (new Set(firsts).size < firsts.length) {
        const order = [...new Set(firsts)];
        const fig = document.createElement("figure");
        fig.className = "matrix";
        fig.innerHTML = `
          <figcaption class="mono">${esc(heads[0])} × ${esc(heads[1])} <span>${rows.length}</span></figcaption>
          ${order
            .map(
              (k) => `
              <div class="mx-row">
                <span class="mx-label">${esc(k)}</span>
                <span class="mx-cells">${rows
                  .filter((r) => r.cells[0].textContent.trim() === k)
                  .map((r) => `<span>${r.cells[1].innerHTML}</span>`)
                  .join("")}</span>
              </div>`
            )
            .join("")}`;
        return fig;
      }
    }
    return null;
  }

  function enhance(body) {
    body.querySelectorAll("hr").forEach((el) => el.remove());

    // Architecture 섹션의 그룹 구조 → 구성도
    body.querySelectorAll(".d-sec--arch").forEach(archFromHeadings);

    // tables → diagram 또는 responsive wrapper
    body.querySelectorAll("table").forEach((t) => {
      const fig = tableToDiagram(t);
      if (fig) return t.replaceWith(fig);
      const w = document.createElement("div");
      w.className = "table-wrap";
      t.replaceWith(w);
      w.appendChild(t);
    });

    // "A / + B / → C"에서 "+ B"가 Markdown 리스트로 해석된 경우 문단으로 되돌린다
    body.querySelectorAll(".prose > ul").forEach((ul) => {
      const p = ul.previousElementSibling;
      const lis = [...ul.children];
      if (!p || p.tagName !== "P" || /<br/i.test(p.innerHTML)) return;
      if (!lis.length || !lis.every((li) => /(<br\s*\/?>|\n)\s*→/.test(li.innerHTML))) return;
      p.innerHTML += lis.map((li) => "<br>+ " + li.innerHTML).join("");
      ul.remove();
    });

    // 화살표로 적힌 문단 → flow / layer / mapping
    body.querySelectorAll(".prose > p").forEach((p) => {
      const parts = lineParts(p);

      // 한 줄짜리 굵은 흐름: **A → B → C**
      if (parts.length === 1) {
        const segs = p.textContent.split(/\s+→\s+/);
        if (isBoldOnly(p) && segs.length >= 2) p.replaceWith(flowEl(segs.map((s) => ({ text: esc(s.trim()) })), false));
        return;
      }

      const lead = ARROW.test(parts[0]);
      const rest = parts.slice(1);
      if (!rest.every((s) => OP.test(s)) || !parts.some((s) => ARROW.test(s))) return;

      // Architecture 섹션: "Layer / → a / → b" → 계층도
      if (p.closest(".d-sec--arch") && !lead && rest.every((s) => /^→/.test(s))) {
        p.classList.add("x-layer");
        p._data = { label: parts[0], items: rest.map((s) => s.replace(ARROW, "")) };
        return;
      }
      // "A / → B" → 대응
      if (parts.length === 2 && !lead && /^→/.test(parts[1])) {
        p.classList.add("x-map");
        p._data = { from: parts[0], to: parts[1].replace(ARROW, "") };
        return;
      }
      const steps = stepsFrom(parts);
      const vertical = parts.some((s) => /^↓/.test(s)) || steps.length > 6;
      const flow = flowEl(steps, vertical);
      if (lead) flow.classList.add("flow--cont");
      p.replaceWith(flow);
    });

    groupRuns(body, "x-layer", (layers) => {
      const fig = document.createElement("figure");
      fig.className = "layers";
      fig.innerHTML = layers
        .map(
          (l) => `
          <div class="layer">
            <span class="mono layer-label">${l.label}</span>
            <span class="layer-items">${l.items.map(node).join("")}</span>
          </div>`
        )
        .join("");
      return fig;
    });

    groupRuns(body, "x-map", (maps) => {
      const fig = document.createElement("figure");
      fig.className = "mapping";
      fig.innerHTML = maps
        .map((m) => `<div class="map-row">${node(m.from)}<i aria-hidden="true">→</i>${node(m.to)}</div>`)
        .join("");
      return fig;
    });

    // ```text 코드 블록으로 적힌 ↓ 흐름 → 세로 flow
    body.querySelectorAll(".prose pre").forEach((pre) => {
      const lines = pre.textContent.split("\n").map((s) => s.trim()).filter(Boolean);
      if (lines.filter((s) => /^(↓|→)$/.test(s)).length < 2) return;
      pre.replaceWith(flowEl(lines.filter((s) => !/^(↓|→)$/.test(s)).map((s) => ({ text: esc(s) })), true));
    });

    // tech stack: inline code → tags
    body.querySelectorAll(".d-sec--stack p").forEach((p) => {
      const codes = [...p.querySelectorAll("code")];
      if (!codes.length) return;
      const ul = document.createElement("ul");
      ul.className = "tags";
      ul.innerHTML = codes.map((c) => `<li>${c.innerHTML}</li>`).join("");
      p.replaceWith(ul);
    });

    // external links in body open in new tab
    body.querySelectorAll('a[href^="http"]').forEach((a) => {
      a.target = "_blank";
      a.rel = "noopener";
    });
  }

  function setupToc() {
    const links = [...document.querySelectorAll(".d-toc a")];
    if (!links.length || !("IntersectionObserver" in window)) return;
    const byId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          links.forEach((a) => a.classList.remove("is-active"));
          const a = byId.get(e.target.id);
          if (a) a.classList.add("is-active");
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    document.querySelectorAll(".d-sec").forEach((s) => io.observe(s));
  }

  // 지정한 섹션(/소제목) 내용이 끝나는 위치에 요소를 삽입
  function placeAt(body, section, heading, el) {
    const sec = [...body.querySelectorAll(".d-sec")].find((s) => s.dataset.title === section);
    if (!sec) return;
    const prose = sec.querySelector(".prose");
    if (!heading) return prose.appendChild(el);
    const h = [...prose.querySelectorAll("h3, h4, h5")].find((x) => x.textContent.trim() === heading);
    if (!h) return;
    const level = +h.tagName[1];
    let n = h.nextElementSibling;
    while (n && !(/^H[1-6]$/.test(n.tagName) && +n.tagName[1] <= level)) n = n.nextElementSibling;
    n ? n.before(el) : prose.appendChild(el);
  }

  // 본문 이미지
  function placeFigures(body) {
    const figs = (isProject && SITE.figures && SITE.figures[item.id]) || [];
    for (const f of figs) {
      const fig = document.createElement("figure");
      fig.className = "d-figure";
      fig.innerHTML = `<img src="${esc(f.src)}" alt="${esc(f.caption || "")}" loading="lazy">${
        f.caption ? `<figcaption>${esc(f.caption)}</figcaption>` : ""
      }`;
      placeAt(body, f.section, f.heading, fig);
    }
  }

  // 이어지는 프로젝트 링크
  function placeRelated(body) {
    const rels = (isProject && SITE.related && SITE.related[item.id]) || [];
    for (const r of rels) {
      const p = projects.find((x) => x.id === r.project);
      if (!p) continue;
      const a = document.createElement("a");
      a.className = "related";
      a.href = `project.html?p=${encodeURIComponent(p.id)}`;
      a.innerHTML = `
        <span class="mono related-label">${esc(r.label || "Related Project")}</span>
        <strong>${esc(p.name)}</strong>
        <span class="related-q">${esc(p.card.question || p.question)}</span>
        <span class="link-arrow">View Project <span aria-hidden="true">→</span></span>`;
      placeAt(body, r.section, r.heading, a);
    }
  }

  const bodyEl = root.querySelector(".d-body");
  enhance(bodyEl);
  placeFigures(bodyEl);
  placeRelated(bodyEl);
  setupToc();
})();
