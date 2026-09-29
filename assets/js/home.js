/* Home page */
(async function () {
  const { esc, inline, block, fmtYM, tags } = UI;
  const $ = (id) => document.getElementById(id);

  $("header").innerHTML = UI.header();
  $("footer").innerHTML = UI.footer();

  // ---------- Hero photo ----------
  const photo = $("hero-photo");
  if (SITE.photo) {
    photo.innerHTML = `<img src="${esc(SITE.photo)}" alt="박서은">`;
  } else {
    photo.classList.add("is-empty");
    photo.innerHTML = `<span>Photo</span>`;
  }

  const [projects, profile, awards, papers, skills, experiences] = await Promise.all([
    Content.loadProjects(SITE.projects),
    Content.loadProfile(),
    Content.loadEntries("data/awards.md"),
    Content.loadEntries("data/paper.md"),
    Content.loadSkills(),
    Promise.all(SITE.experience.map(Content.loadExperience)).then((l) => l.filter(Boolean)),
  ]);
  const projectHref = (id) => `project.html?p=${encodeURIComponent(id)}`;

  // ---------- Education ----------
  const edu = (profile.education || [])[0];
  if (edu) {
    const gpa = [
      edu.meta.gpa && `GPA ${edu.meta.gpa}`,
      edu.meta["major gpa"] && `Major ${edu.meta["major gpa"]}`,
    ].filter(Boolean);
    $("education").innerHTML = `
      <div class="edu-row">
        <span class="label">Education</span>
        <strong class="edu-school">${esc(edu.title)}</strong>
        <span class="edu-major">${esc(edu.bold)}</span>
        <span class="edu-gpa">${gpa.map(esc).join('<span class="sep">/</span>')}</span>
        <span class="mono edu-period">${esc(edu.period ? edu.period.text : "")}</span>
      </div>`;
  }

  // ---------- Timeline ----------
  const exp = experiences[0];
  const bars = [];
  if (edu && edu.period) bars.push({ label: edu.title, sub: edu.period.text, range: edu.period, tone: "ink" });
  if (exp && exp.period)
    bars.push({
      label: exp.position ? `${exp.company} · ${exp.position}` : exp.company,
      sub: exp.period.open ? `${fmtYM(exp.period.start)} – Present` : exp.period.text,
      range: exp.period,
      tone: "accent",
      href: `project.html?e=${encodeURIComponent(exp.id)}`,
    });

  const events = [];
  for (const a of awards) {
    const id = Content.resolveProject(a.meta["related project"], projects);
    events.push({
      date: Content.parseDate(a.meta.date),
      label: a.bold,
      tip: a.title,
      sub: a.meta.organizer || "",
      href: id ? projectHref(id) : null,
    });
  }
  for (const p of papers) {
    const id = Content.resolveProject(p.meta["related project"], projects);
    events.push({
      date: Content.parseDate(p.meta.date),
      label: p.meta.venue || p.title,
      tip: p.bold,
      sub: [p.meta.track, p.meta.venue].filter(Boolean).join(" · "),
      href: id ? projectHref(id) : p.meta.paper || null,
    });
  }
  events.sort((a, b) => a.date - b.date);

  const dates = [...bars.flatMap((b) => [b.range.start, b.range.end]), ...events.map((e) => e.date)].filter(Boolean);
  if (dates.length) {
    const y0 = Math.min(...dates.map((d) => d.getFullYear()));
    const y1 = Math.max(...dates.map((d) => d.getFullYear()));
    const start = new Date(y0, 0, 1);
    const end = new Date(y1, 6, 1);
    const pct = (d) => (((d - start) / (end - start)) * 100).toFixed(3);
    const now = new Date();

    const ticks = [];
    for (let y = y0; y <= y1; y++) ticks.push(`<span class="tl-tick" style="left:${pct(new Date(y, 0, 1))}%">${y}</span>`);

    const barHtml = bars
      .map((b) => {
        const left = pct(b.range.start);
        const width = Math.max(pct(b.range.end) - left, 0.8);
        const tag = b.href ? "a" : "div";
        return `
        <div class="tl-lane">
          <${tag} class="tl-bar tl-bar--${b.tone}${b.range.open ? " is-open" : ""}${left > 55 ? " is-right" : ""}" style="left:${left}%;width:${width}%"${b.href ? ` href="${b.href}"` : ""}>
            <span class="tl-bar-text"><strong>${esc(b.label)}</strong><span class="mono">${esc(b.sub)}</span></span>
          </${tag}>
        </div>`;
      })
      .join("");

    let lastLeft = -100;
    let low = false;
    const evHtml = events
      .map((e) => {
        const left = +pct(e.date);
        low = left - lastLeft < 14 ? !low : false;
        lastLeft = left;
        const tag = e.href ? "a" : "div";
        return `
        <${tag} class="tl-event${low ? " is-low" : ""}" style="left:${left}%"${e.href ? ` href="${esc(e.href)}"` : ""} tabindex="0">
          <span class="tl-dot"></span>
          <span class="tl-ev-text"><strong>${esc(e.label)}</strong><span class="mono">${fmtYM(e.date)}</span></span>
          <span class="tl-tip" role="tooltip"><strong>${esc(e.tip)}</strong>${e.sub ? `<span>${esc(e.sub)}</span>` : ""}${e.href ? `<em>${e.href.startsWith("project") ? "관련 프로젝트 보기 →" : "Paper ↗"}</em>` : ""}</span>
        </${tag}>`;
      })
      .join("");

    // mobile list
    const listItems = [
      ...bars.map((b) => ({ date: b.range.start, when: b.sub, title: b.label, href: b.href })),
      ...events.map((e) => ({ date: e.date, when: fmtYM(e.date), title: `${e.label} — ${e.tip}`, href: e.href })),
    ].sort((a, b) => a.date - b.date);

    $("timeline").innerHTML = `
      <div class="tl" aria-hidden="false">
        <div class="tl-bars">${barHtml}</div>
        <div class="tl-axis">${ticks.join("")}</div>
        <div class="tl-events">${evHtml}</div>
        ${now > start && now < end ? `<div class="tl-now" style="left:${pct(now)}%"><span>Now</span></div>` : ""}
      </div>
      <ol class="tl-list">
        ${listItems
          .map(
            (i) =>
              `<li><span class="mono">${esc(i.when)}</span>${
                i.href ? `<a href="${esc(i.href)}">${esc(i.title)}</a>` : `<span>${esc(i.title)}</span>`
              }</li>`
          )
          .join("")}
      </ol>`;
  }

  // ---------- Experience summary + Extracurricular ----------
  const acts = profile.activities || [];
  $("journey-detail").innerHTML = `
    ${
      exp
        ? `<a class="exp-card" href="project.html?e=${encodeURIComponent(exp.id)}">
            <span class="label">Experience</span>
            <div class="exp-head">
              <h3>${esc(exp.company)}${exp.position ? ` <span class="exp-badge mono">${esc(exp.position)}</span>` : ""}</h3>
              <span class="mono">${esc(exp.period.open ? fmtYM(exp.period.start) + " – Present" : exp.period.text)}</span>
            </div>
            <p class="exp-role">${exp.details.map(esc).join(" · ")}</p>
            <p class="exp-lead">${inline(exp.lead)}</p>
            <span class="link-arrow">자세히 보기 <span aria-hidden="true">→</span></span>
          </a>`
        : ""
    }
    <div class="extra">
      <span class="label">Extracurricular</span>
      <ul>
        ${acts
          .map(
            (a) => `<li>
              <strong>${esc(a.title)}</strong>
              <span>${esc(a.bold)}</span>
              <span class="mono">${esc(a.period ? a.period.text : "")}</span>
            </li>`
          )
          .join("")}
      </ul>
    </div>`;

  // ---------- Skills ----------
  const iconUrl = (i) => i.url || `https://cdn.jsdelivr.net/npm/simple-icons@16.33.0/icons/${i.si}.svg`;
  $("skills-grid").innerHTML = skills
    .map((g, gi) => {
      const withIcon = g.items.filter((s) => SITE.skillIcons[s]);
      const plain = g.items.filter((s) => !SITE.skillIcons[s]);
      return `
      <div class="skill-cell">
        <div class="skill-cell-head">
          <span class="mono accent">${String(gi + 1).padStart(2, "0")}</span>
          <h3>${esc(g.title)}</h3>
        </div>
        <ul class="skill-icons">
          ${withIcon
            .map((s) => {
              const i = SITE.skillIcons[s];
              return `<li style="--brand:${i.color}">
                <span class="skill-icon" style="--icon:url('${iconUrl(i)}')" aria-hidden="true"></span>
                <span class="skill-name">${esc(i.label || s)}</span>
              </li>`;
            })
            .join("")}
        </ul>
        ${plain.length ? `<p class="skill-plain">${plain.map(esc).join('<span class="dot">·</span>')}</p>` : ""}
      </div>`;
    })
    .join("");

  // ---------- Paper & Awards ----------
  $("papers").innerHTML = papers
    .map((p) => {
      const id = Content.resolveProject(p.meta["related project"], projects);
      return `
      <article class="rec-item">
        <span class="mono rec-date">${esc(p.meta.date || "")}</span>
        <div class="rec-body">
          <h3>${esc(p.bold)}</h3>
          <p>${esc([p.meta.venue, p.meta.track].filter(Boolean).join(" · "))}</p>
          <div class="rec-links">
            ${p.meta.paper ? `<a href="${esc(p.meta.paper)}" target="_blank" rel="noopener">Paper ↗</a>` : ""}
            ${id ? `<a href="${projectHref(id)}">Project →</a>` : ""}
          </div>
        </div>
      </article>`;
    })
    .join("");

  $("awards").innerHTML = awards
    .slice()
    .sort((a, b) => Content.parseDate(b.meta.date) - Content.parseDate(a.meta.date))
    .map((a) => {
      const id = Content.resolveProject(a.meta["related project"], projects);
      return `
      <article class="rec-item">
        <span class="mono rec-date">${esc(a.meta.date || "")}</span>
        <div class="rec-body">
          <h3>${esc(a.bold)}</h3>
          <p>${esc(a.title)}</p>
          ${id ? `<div class="rec-links"><a href="${projectHref(id)}">Project →</a></div>` : ""}
        </div>
      </article>`;
    })
    .join("");

  // ---------- Selected Works ----------
  const featured = SITE.featured.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
  $("works-count").textContent = `${featured.length} of ${projects.length} projects`;

  $("featured").innerHTML = featured
    .map((p, i) => {
      const img = SITE.images[p.id];
      const q = p.card.question || p.question;
      const qLabel = p.questionLabel;
      const media = img
        ? `<div class="work-media"><img src="${esc(img.src)}" alt="${esc(img.alt || p.name)}" loading="lazy" style="object-position:${img.position || "center"}"></div>`
        : `<div class="work-media work-media--type">
             <span class="mono">${qLabel}</span>
             <p>${esc(q)}</p>
           </div>`;
      return `
      <a class="work" href="${projectHref(p.id)}">
        ${media}
        <div class="work-text">
          <div class="work-meta mono">
            <span class="accent">${String(i + 1).padStart(2, "0")}</span>
            <span>${esc(p.category)}</span>
          </div>
          <h3 class="work-title">${esc(p.name)}</h3>
          ${img ? `<p class="work-question"><span class="mono">${qLabel}</span>${esc(q)}</p>` : ""}
          <div class="work-desc">${block(p.card.description || p.summary.split(/\n\s*\n/)[0])}</div>
          ${
            p.card.metrics && p.card.metrics.length
              ? `<ul class="work-metrics">${p.card.metrics.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>`
              : ""
          }
          <div class="work-foot">
            ${tags(p.card.tags || [], 5)}
            <span class="link-arrow">View Project <span aria-hidden="true">→</span></span>
          </div>
        </div>
      </a>`;
    })
    .join("");

  // ---------- More Projects ----------
  const others = projects.filter((p) => !SITE.featured.includes(p.id));
  $("more").hidden = !others.length;
  $("more-list").innerHTML = others
    .map(
      (p, i) => `
      <li>
        <a class="more-row" href="${projectHref(p.id)}">
          <span class="mono accent">${String(featured.length + i + 1).padStart(2, "0")}</span>
          <span class="more-main">
            <strong>${esc(p.name)}</strong>
            <span>${esc(p.card.question || p.question)}</span>
          </span>
          <span class="more-tags">${tags(p.card.tags || [], 3)}</span>
          <span class="mono more-period">${esc(p.period ? p.period.text : "")}</span>
          <span class="more-arrow" aria-hidden="true">→</span>
        </a>
      </li>`
    )
    .join("");
})();
