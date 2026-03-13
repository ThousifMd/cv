(function () {
  function getParam(name, fallback) {
    return new URLSearchParams(location.search).get(name) ?? fallback;
  }

  const jsonFile = getParam("resume", "detailed.json");

  async function loadResume() {
    try {
      // Handle data URLs (data:application/json;charset=utf-8,...)
      if (jsonFile.startsWith("data:")) {
        const base64Match = jsonFile.match(/data:application\/json[^,]*,(.+)/);
        if (base64Match) {
          const jsonString = decodeURIComponent(base64Match[1]);
          return JSON.parse(jsonString);
        }
      }
      
      // Handle regular file URLs
      const res = await fetch(jsonFile, { cache: "no-store" });
      if (!res.ok) throw new Error("JSON not found");
      return await res.json();
    } catch (err) {
      console.error(err);
      document.getElementById("resumeContainer").innerHTML =
        "<p style='color:red;'>Failed to load resume JSON.</p>";
    }
  }

  function esc(v) {
    return (v || "").toString();
  }

  function renderSection(title, content) {
    if (!content || !content.trim()) return "";
    return `
      <section class="section">
        <h2 class="section-title">${title}</h2>
        ${content}
      </section>
    `;
  }

  function renderResume(data) {
    const b = data.basics || {};
    const work = data.work || [];
    const edu = data.education || [];
    const skills = data.skills || [];
    const projects = data.projects || [];
    const certs = data.certifications || [];
    const langs = data.languages || [];
    const profiles = data.profiles || [];

    const c = document.getElementById("resumeContainer");

    const contactLines = [];
    if (b.email) contactLines.push(b.email);
    if (b.url) contactLines.push(b.url);
    profiles.forEach(p => {
      if (p.url) contactLines.push(p.network + ": " + p.url);
    });

    c.innerHTML = `
      <div class="header">
        <div>
          <h1 class="name">${esc(b.name)}</h1>
          ${b.label ? `<div class="label">${esc(b.label)}</div>` : ""}
        </div>
        <div class="contact">
          ${contactLines.map(esc).join("<br>")}
        </div>
      </div>

      <div class="layout">
        <div class="col-main">
          ${renderSection("Summary", b.summary ? `<div class="summary-text">${esc(b.summary)}</div>` : "")}

          ${renderSection("Experience", work.map(w => {
      const org = esc(w.organization || w.company);
      const dates = w.startDate ? ` · ${esc(w.startDate)} – ${esc(w.endDate || 'Present')}` : '';
      const highlights = (w.highlights || []).length
        ? `<ul style="margin:4px 0 0 16px;padding:0;font-size:13px;color:var(--text-main);">${w.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul>`
        : '';
      return `
              <div class="item">
                <div class="item-title">${esc(w.position)}</div>
                <div class="item-sub">${org}${dates}</div>
                <div class="item-summary">${esc(w.summary)}</div>
                ${highlights}
              </div>
            `}).join(""))}

          ${renderSection("Projects", projects.map(p => `
              <div class="item pill-section">
                <div class="item-title">${esc(p.name)}</div>
                <div class="item-summary">${esc(p.summary)}</div>
                ${p.keywords && p.keywords.length ? `
                  <div class="chips">
                    ${p.keywords.map(k => `<span class="chip">${esc(k)}</span>`).join("")}
                  </div>` : ""}
              </div>
            `).join(""))}
        </div>

        <div class="col-side">
          ${renderSection("Skills", skills.map(s => `
              <div class="item">
                <div class="item-title">${esc(s.name)}</div>
                <div class="chips">
                  ${(s.keywords || []).map(k => `<span class="chip">${esc(k)}</span>`).join("")}
                </div>
              </div>
            `).join(""))}

          ${renderSection("Education", edu.map(e => `
              <div class="item">
                <div class="item-title">${esc(e.studyType)} — ${esc(e.area)}</div>
                <div class="item-sub">${esc(e.institution)}${e.location ? " · " + esc(e.location) : ""}</div>
              </div>
            `).join(""))}

          ${renderSection("Certifications", certs.map(cer => `
            <div class="item-sub">• ${esc(cer.name)}</div>
          `).join(""))}

          ${renderSection("Languages", langs.map(l => `
            <div class="item-sub">• ${esc(l.language)}${l.fluency ? " — " + esc(l.fluency) : ""}</div>
          `).join(""))}
        </div>
      </div>
    `;
  }

  (async function init() {
    const data = await loadResume();
    if (data) renderResume(data);
  })();
})();
