/*
 * Markdown loader & parser.
 * projects/*.md, experience/*.md, data/*.md 를 읽어
 * 화면에 필요한 구조(meta, question, card, body…)로 변환한다.
 */
(function () {
  const cache = new Map();

  async function loadText(path) {
    if (cache.has(path)) return cache.get(path);
    const p = fetch(encodeURI(path))
      .then((r) => (r.ok ? r.text() : null))
      .then((t) => (t && t.trim() ? t.replace(/\r\n/g, "\n") : null))
      .catch(() => null);
    cache.set(path, p);
    return p;
  }

  // ---------- generic helpers ----------

  // Split lines into sections at headings of exactly `level` (#, ##, ...).
  function splitSections(lines, level) {
    const re = new RegExp("^#{" + level + "}\\s+(.+?)\\s*$");
    const out = { pre: [], sections: [] };
    let cur = null;
    let fence = false;
    for (const line of lines) {
      if (/^```/.test(line)) fence = !fence;
      const m = !fence && line.match(re);
      if (m) {
        cur = { title: m[1].trim(), lines: [] };
        out.sections.push(cur);
      } else if (cur) cur.lines.push(line);
      else out.pre.push(line);
    }
    return out;
  }

  const stripBold = (s) => s.replace(/\*\*/g, "").trim();
  const clean = (lines) =>
    lines
      .filter((l) => !/^\s*---\s*$/.test(l))
      .join("\n")
      .trim();

  // "- Key: value" 형태의 리스트를 {key: value}로. 콜론이 없는 항목은 items로.
  function parseMeta(lines) {
    const meta = {};
    const items = [];
    for (const raw of lines) {
      const m = raw.match(/^\s*-\s+(.*)$/);
      if (!m) continue;
      const line = stripBold(m[1]);
      if (!line) continue;
      const kv = line.match(/^([A-Za-z][A-Za-z /]*?)\s*:\s*:?\s*(.*)$/);
      if (kv && !/^https?$/i.test(kv[1])) meta[kv[1].trim().toLowerCase()] = kv[2].trim();
      else items.push(line);
    }
    return { meta, items };
  }

  function quoteText(lines) {
    const q = lines
      .filter((l) => /^\s*>/.test(l))
      .map((l) => l.replace(/^\s*>\s?/, ""))
      .join(" ");
    return stripBold(q);
  }

  const listItems = (lines) =>
    lines
      .map((l) => l.match(/^\s*[-*]\s+(.*)$/))
      .filter(Boolean)
      .map((m) => m[1].trim());

  const codeTags = (text) => [...text.matchAll(/`([^`]+)`/g)].map((m) => m[1]);

  // "2024.11" / "2026.06.29" / "Present" → Date
  function parseDate(s) {
    if (!s) return null;
    if (/present|현재/i.test(s)) return new Date();
    const m = s.match(/(\d{4})\.(\d{1,2})(?:\.(\d{1,2}))?/);
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, m[3] ? +m[3] : 1);
  }

  function parseRange(s) {
    if (!s) return null;
    const parts = s.split(/\s*[–—-]\s*/);
    return { text: s, start: parseDate(parts[0]), end: parseDate(parts[1] || parts[0]), open: /present|현재/i.test(s) };
  }

  function findSection(sections, re) {
    return sections.find((s) => re.test(s.title));
  }

  function splitTitle(h1) {
    const [name, ...rest] = h1.split(/\s+—\s+/);
    return { name: name.trim(), subtitle: rest.join(" — ").trim() };
  }

  // GitHub / Paper / Demo 링크 추출
  function extractLinks(meta) {
    const defs = [
      ["github", "GitHub"],
      ["backend", "GitHub · Backend"],
      ["frontend", "GitHub · Frontend"],
      ["paper", "Paper"],
      ["demo", "Demo"],
    ];
    const links = [];
    for (const [key, label] of defs) {
      const v = meta[key];
      if (!v) continue;
      for (const m of v.matchAll(/(?:\(([^)]+)\)\s*)?(https?:\/\/[^\s)]+)/g)) {
        const sub = m[1] ? " · " + m[1][0].toUpperCase() + m[1].slice(1) : "";
        links.push({ label: label + sub, url: m[2] });
      }
    }
    return links;
  }

  // ---------- projects ----------

  function parseProject(id, md) {
    const lines = md.split("\n");
    const top = splitSections(lines, 1).sections;
    if (!top.length) return null;
    const head = top[0];
    const rest = top.slice(1);
    const { name, subtitle } = splitTitle(head.title);

    const headSplit = splitSections(head.lines, 2);
    const headSubs = headSplit.sections;
    const metaSec = findSection(headSubs, /^(meta|overview)$/i);
    const { meta } = parseMeta(metaSec ? metaSec.lines : []);
    const qSec = findSection(headSubs, /question|challenge/i);
    const summarySec = findSection(headSubs, /^summary$/i);

    // 제목 바로 아래(첫 ## 이전)의 인용문/문단을 Question/Summary로 사용하는 형식도 지원
    const pre = headSplit.pre;
    const question = qSec ? quoteText(qSec.lines) : quoteText(pre);
    const summary = summarySec
      ? clean(summarySec.lines)
      : clean(pre.filter((l) => !/^\s*>/.test(l)));

    // "# N. Title" 섹션이 없으면 "## Title" 섹션을 본문으로 사용
    const sectionLevel = rest.length ? 1 : 2;
    const bodySecs = rest.length
      ? rest
      : headSubs.filter((s) => s !== metaSec && s !== qSec && s !== summarySec);

    // Portfolio Card
    const cardSec = findSection(rest, /portfolio card/i);
    const card = {};
    if (cardSec) {
      const subs = splitSections(cardSec.lines, 2).sections;
      const cq = findSection(subs, /^(question|challenge)$/i);
      card.question = cq ? quoteText(cq.lines) : "";
      const d = findSection(subs, /^description$/i);
      card.description = d ? clean(d.lines) : "";
      const mt = findSection(subs, /^metrics$/i);
      card.metrics = mt ? listItems(mt.lines).map(stripBold) : [];
      const hl = findSection(subs, /^highlights$/i);
      card.highlights = hl ? listItems(hl.lines) : [];
      const tg = findSection(subs, /^tags$/i);
      card.tags = tg ? codeTags(tg.lines.join(" ")) : [];
      const rs = findSection(subs, /^result$/i);
      card.result = rs ? clean(rs.lines) : "";
    }

    const body = bodySecs.filter((s) => !/portfolio card|assets for portfolio/i.test(s.title));

    // Portfolio Card에 Tags가 없으면 Tech 섹션의 태그를 사용
    if (!card.tags || !card.tags.length) {
      const tech = findSection(body, /^(\d+\.\s*)?tech/i);
      card.tags = tech ? codeTags(tech.lines.join(" ")) : [];
    }

    return {
      id,
      kind: "project",
      name,
      subtitle,
      meta,
      period: parseRange(meta.period),
      category: meta.category || "",
      links: extractLinks(meta),
      questionLabel: qSec && /challenge/i.test(qSec.title) ? "Challenge" : "Question",
      question: question || card.question || "",
      summary,
      card,
      sectionLevel,
      sections: body.map((s) => ({ title: s.title, md: s.lines.join("\n") })),
    };
  }

  async function loadProject(id) {
    const md = await loadText("projects/" + id + ".md");
    return md ? parseProject(id, md) : null;
  }

  async function loadProjects(ids) {
    const all = await Promise.all(ids.map(loadProject));
    return all.filter(Boolean);
  }

  // ---------- experience ----------

  function parseExperience(id, md) {
    const lines = md.split("\n");
    const top = splitSections(lines, 1).sections[0];
    if (!top) return null;
    const { name, subtitle } = splitTitle(top.title);
    const subs = splitSections(top.lines, 2).sections;
    const overview = findSection(subs, /^overview$/i);
    const { items } = parseMeta(overview ? overview.lines : []);
    const periodText = items.find((s) => /\d{4}\.\d{1,2}/.test(s)) || "";
    const worked = findSection(subs, /worked on/i);
    const firstPara = worked ? clean(worked.lines).split(/\n\s*\n/)[0] : "";
    const techSec = findSection(subs, /tech|keywords/i);
    return {
      id,
      kind: "experience",
      name,
      subtitle,
      company: items[0] || name,
      position: /intern/i.test(subtitle) ? "Intern" : "",
      details: items.slice(1).filter((s) => s !== periodText),
      period: parseRange(periodText),
      lead: firstPara,
      tags: techSec ? codeTags(techSec.lines.join(" ")) : [],
      sections: subs
        .filter((s) => !/^overview$/i.test(s.title))
        .map((s) => ({ title: s.title, md: s.lines.join("\n") })),
    };
  }

  async function loadExperience(id) {
    const md = await loadText("experience/" + id + ".md");
    return md ? parseExperience(id, md) : null;
  }

  // ---------- data/*.md ----------

  // "## Title" (또는 ###) 단위 항목: 제목, 굵은 글씨 한 줄, 기간, key/value 리스트
  function parseEntries(lines, level) {
    return splitSections(lines, level).sections.map((s) => {
      const bold = s.lines.find((l) => /^\s*\*\*.+\*\*\s*$/.test(l));
      const periodLine = s.lines.find((l) => /^\s*\d{4}\.\d{1,2}/.test(l));
      const { meta, items } = parseMeta(s.lines);
      return {
        title: s.title,
        bold: bold ? stripBold(bold) : "",
        period: periodLine ? parseRange(periodLine.trim()) : null,
        meta,
        items,
      };
    });
  }

  async function loadProfile() {
    const md = await loadText("data/profile.md");
    if (!md) return {};
    const groups = splitSections(md.split("\n"), 2).sections;
    const out = {};
    for (const g of groups) out[g.title.toLowerCase()] = parseEntries(g.lines, 3);
    return out;
  }

  async function loadEntries(path) {
    const md = await loadText(path);
    return md ? parseEntries(md.split("\n"), 2) : [];
  }

  async function loadSkills() {
    const md = await loadText("data/skills.md");
    if (!md) return [];
    return splitSections(md.split("\n"), 2).sections.map((s) => ({
      title: s.title,
      items: listItems(s.lines),
    }));
  }

  // Related Project 값(경로 또는 프로젝트 이름) → project id
  function resolveProject(value, projects) {
    if (!value) return null;
    const path = value.match(/projects\/([^\s/]+?)\.md/);
    if (path) return projects.find((p) => p.id === path[1]) ? path[1] : null;
    const v = value.toLowerCase();
    const hit = projects.find(
      (p) => p.name.toLowerCase() === v || (p.meta.title || "").toLowerCase() === v
    );
    return hit ? hit.id : null;
  }

  window.Content = {
    loadText,
    loadProject,
    loadProjects,
    loadExperience,
    loadProfile,
    loadEntries,
    loadSkills,
    resolveProject,
    parseDate,
    parseRange,
  };
})();
