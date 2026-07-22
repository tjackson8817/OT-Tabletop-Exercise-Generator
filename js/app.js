/* =====================================================================
   OT Tabletop Exercise Generator — Application Logic
   Sale Fish Marketing and Consulting
   ===================================================================== */

const STORAGE_KEY = "otTabletopGenerator_v1";

const portfolio = { exercises: {}, activeId: null };

function newExercise() {
  const id = "ex_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
  const now = new Date().toISOString();
  return {
    id, title: "", scenarioId: null, industry: null,
    facilitator: "", participants: "", exerciseDate: new Date().toISOString().slice(0, 10),
    status: "in_progress",
    currentInjectIndex: 0,
    injectResponses: {},
    objectivesScorecard: {},
    lessonsLearned: "",
    followUps: [],
    createdAt: now, completedAt: null,
  };
}

function savePortfolio() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio)); } catch (e) {}
}
function loadPortfolio() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      portfolio.exercises = parsed.exercises || {};
      portfolio.activeId = parsed.activeId || null;
    }
  } catch (e) {}
}
function activeExercise() { return portfolio.exercises[portfolio.activeId]; }
function scenarioFor(ex) { return SCENARIOS.find(s => s.id === ex.scenarioId); }

/* ---------------- Screen navigation ---------------- */
function showScreen(name) {
  document.querySelectorAll(".screen").forEach(el => el.classList.remove("active"));
  document.getElementById("screen-" + name).classList.add("active");
}

/* ================= DASHBOARD ================= */
function renderDashboard() {
  const tbody = document.getElementById("dashboard-table-body");
  tbody.innerHTML = "";
  const ids = Object.keys(portfolio.exercises).sort((a, b) =>
    new Date(portfolio.exercises[b].createdAt) - new Date(portfolio.exercises[a].createdAt));

  ids.forEach(id => {
    const ex = portfolio.exercises[id];
    const scenario = scenarioFor(ex);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${esc(ex.title || (scenario ? scenario.title : "(untitled)"))}</td>
      <td>${scenario ? esc(scenario.title) : "—"}</td>
      <td>${ex.industry ? esc(industryLabel(ex.industry)) : "—"}</td>
      <td>${esc(ex.facilitator) || "—"}</td>
      <td>${ex.exerciseDate}</td>
      <td>${ex.status === "complete" ? '<span class="risk-badge closed">COMPLETE</span>' : '<span class="risk-badge active">IN PROGRESS</span>'}</td>
      <td style="white-space:nowrap;">
        <button class="btn btn-ghost btn-sm" data-action="open" data-id="${id}">${ex.status === "complete" ? "View" : "Resume"}</button>
        <button class="btn btn-ghost btn-sm" data-action="delete" data-id="${id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  document.getElementById("dashboard-empty-note").style.display = ids.length ? "none" : "block";

  tbody.querySelectorAll('[data-action="open"]').forEach(btn => btn.addEventListener("click", () => openExercise(btn.dataset.id)));
  tbody.querySelectorAll('[data-action="delete"]').forEach(btn => btn.addEventListener("click", () => deleteExercise(btn.dataset.id)));

  renderProgramMetrics(Object.values(portfolio.exercises).filter(e => e.status === "complete"));
}

function industryLabel(ind) {
  const map = { "P&U": "Power & Utilities", "O&G": "Oil & Gas", "Chemical": "Chemical", "Manufacturing": "Manufacturing", "Healthcare": "Healthcare" };
  return map[ind] || ind;
}

function renderProgramMetrics(completed) {
  const el = document.getElementById("program-metrics");
  if (!completed.length) { el.innerHTML = ""; return; }

  const gapCounts = { detection: 0, containment: 0, communication: 0, regulatory: 0, recovery: 0 };
  completed.forEach(ex => {
    OBJECTIVE_CATEGORIES.forEach(cat => {
      if (ex.objectivesScorecard[cat.id] === "gap") gapCounts[cat.id]++;
    });
  });
  const topGap = Object.entries(gapCounts).sort((a, b) => b[1] - a[1])[0];
  const topGapLabel = topGap && topGap[1] > 0 ? OBJECTIVE_CATEGORIES.find(c => c.id === topGap[0]).label : "None identified";

  const scenarioCounts = {};
  completed.forEach(ex => {
    const s = scenarioFor(ex);
    if (s) scenarioCounts[s.title] = (scenarioCounts[s.title] || 0) + 1;
  });
  const topScenario = Object.entries(scenarioCounts).sort((a, b) => b[1] - a[1])[0];

  const totalFollowUps = completed.reduce((sum, ex) => sum + ex.followUps.length, 0);
  const openFollowUps = completed.reduce((sum, ex) => sum + ex.followUps.filter(f => f.status !== "Complete").length, 0);

  el.innerHTML = `
    <div class="panel">
      <div class="panel-header"><div><span class="panel-eyebrow">Program Metrics</span><h2>Across Completed Exercises (${completed.length})</h2></div></div>
      <div class="kpi-row">
        <div class="kpi-card"><div class="kpi-label">Most Common Gap</div><div class="kpi-value violet" style="font-size:16px;">${esc(topGapLabel)}</div></div>
        <div class="kpi-card"><div class="kpi-label">Most-Run Scenario</div><div class="kpi-value" style="font-size:15px;">${topScenario ? esc(topScenario[0]) + ` (${topScenario[1]})` : "—"}</div></div>
        <div class="kpi-card"><div class="kpi-label">Follow-Up Actions</div><div class="kpi-value violet">${openFollowUps}/${totalFollowUps}</div><div class="kpi-label">open / total</div></div>
      </div>
    </div>
  `;
}

function openExercise(id) {
  portfolio.activeId = id;
  savePortfolio();
  const ex = activeExercise();
  if (ex.status === "complete") {
    showScreen("wrapup");
    renderWrapup();
  } else if (ex.scenarioId) {
    showScreen("run");
    renderRun();
  } else {
    showScreen("setup");
    renderSetup();
  }
}

function deleteExercise(id) {
  if (!confirm("Delete this exercise record permanently?")) return;
  delete portfolio.exercises[id];
  if (portfolio.activeId === id) portfolio.activeId = null;
  savePortfolio();
  renderDashboard();
}

/* ================= SETUP ================= */
function openNewExerciseSetup() {
  const ex = newExercise();
  portfolio.exercises[ex.id] = ex;
  portfolio.activeId = ex.id;
  savePortfolio();
  renderSetup();
  showScreen("setup");
}

function renderSetup() {
  const ex = activeExercise();
  document.getElementById("input-exercise-title").value = ex.title;
  document.getElementById("input-facilitator").value = ex.facilitator;
  document.getElementById("input-participants").value = ex.participants;
  document.getElementById("input-exercise-date").value = ex.exerciseDate;

  const indGrid = document.getElementById("industry-grid");
  indGrid.innerHTML = "";
  INDUSTRIES.forEach(ind => {
    const card = document.createElement("div");
    card.className = "scenario-card" + (ex.industry === ind ? " selected" : "");
    card.innerHTML = `<div class="sc-title">${ind}</div><div class="sc-premise">${industryLabel(ind)}</div>`;
    card.onclick = () => { ex.industry = ind; savePortfolio(); renderSetup(); };
    indGrid.appendChild(card);
  });

  const scenarioGrid = document.getElementById("scenario-grid");
  scenarioGrid.innerHTML = "";
  const applicable = SCENARIOS.filter(s => s.industryFit === "all" || s.industryFit === ex.industry);
  if (!ex.industry) {
    scenarioGrid.innerHTML = `<p style="color:var(--text-secondary);">Select an industry above to see applicable scenarios.</p>`;
  } else {
    applicable.forEach(s => {
      const card = document.createElement("div");
      card.className = "scenario-card" + (ex.scenarioId === s.id ? " selected" : "");
      card.innerHTML = `
        <div class="sc-title">${esc(s.title)}</div>
        <div class="sc-premise">${esc(s.premise)}</div>
        <div><span class="sc-tag">${esc(s.linkedPlaybook)}</span></div>
      `;
      card.onclick = () => { ex.scenarioId = s.id; if (!ex.title) ex.title = s.title; savePortfolio(); renderSetup(); };
      scenarioGrid.appendChild(card);
    });
  }

  document.getElementById("btn-begin-exercise").disabled = !(ex.industry && ex.scenarioId);
}

function commitSetupFields() {
  const ex = activeExercise();
  if (!ex) return;
  ex.title = document.getElementById("input-exercise-title").value.trim();
  ex.facilitator = document.getElementById("input-facilitator").value.trim();
  ex.participants = document.getElementById("input-participants").value.trim();
  ex.exerciseDate = document.getElementById("input-exercise-date").value;
  savePortfolio();
}

function beginExercise() {
  commitSetupFields();
  const ex = activeExercise();
  if (!ex.industry || !ex.scenarioId) return;
  ex.currentInjectIndex = 0;
  savePortfolio();
  showScreen("run");
  renderRun();
}

/* ================= EXERCISE RUN ================= */
function renderRun() {
  const ex = activeExercise();
  const scenario = scenarioFor(ex);
  const idx = ex.currentInjectIndex;
  const inject = scenario.injects[idx];

  document.getElementById("run-title").textContent = ex.title || scenario.title;
  document.getElementById("run-subtitle").textContent = `${scenario.title} — linked playbook: ${scenario.linkedPlaybook}`;

  const progress = document.getElementById("inject-progress");
  progress.innerHTML = "";
  scenario.injects.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.className = "dot" + (i < idx ? " done" : i === idx ? " current" : "");
    progress.appendChild(dot);
  });

  const container = document.getElementById("inject-container");
  container.innerHTML = "";
  const card = document.createElement("div");
  card.className = "inject-card";
  card.innerHTML = `
    <div class="inject-time">Inject ${idx + 1} of ${scenario.injects.length} — ${esc(inject.timeMarker)}</div>
    <div class="inject-text">${esc(inject.text)}</div>
    <ul class="inject-prompts">${inject.prompts.map(p => `<li>${esc(p)}</li>`).join("")}</ul>
  `;
  container.appendChild(card);

  const existing = ex.injectResponses[idx] || { notes: "", rating: null };
  const notesBlock = document.createElement("div");
  notesBlock.innerHTML = `
    <label class="field">Facilitator Notes for This Inject
      <textarea id="input-inject-notes" rows="3" placeholder="What did participants discuss? Key decisions, disagreements, or gaps surfaced...">${esc(existing.notes)}</textarea>
    </label>
    <div class="rating-row">
      <button class="rating-btn well${existing.rating === "well" ? " selected" : ""}" data-rating="well">Well Handled</button>
      <button class="rating-btn partial${existing.rating === "partial" ? " selected" : ""}" data-rating="partial">Partially Handled</button>
      <button class="rating-btn gap${existing.rating === "gap" ? " selected" : ""}" data-rating="gap">Gap Identified</button>
    </div>
  `;
  container.appendChild(notesBlock);

  notesBlock.querySelector("#input-inject-notes").addEventListener("input", (e) => {
    if (!ex.injectResponses[idx]) ex.injectResponses[idx] = { notes: "", rating: null };
    ex.injectResponses[idx].notes = e.target.value;
    savePortfolio();
  });
  notesBlock.querySelectorAll(".rating-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!ex.injectResponses[idx]) ex.injectResponses[idx] = { notes: "", rating: null };
      ex.injectResponses[idx].rating = btn.dataset.rating;
      savePortfolio();
      renderRun();
    });
  });

  document.getElementById("btn-prev-inject").disabled = idx === 0;
  const isLast = idx === scenario.injects.length - 1;
  document.getElementById("btn-next-inject").textContent = isLast ? "Finish Exercise \u2192 Wrap-Up" : "Next Inject \u2192";
}

function goPrevInject() {
  const ex = activeExercise();
  if (ex.currentInjectIndex > 0) { ex.currentInjectIndex--; savePortfolio(); renderRun(); }
}
function goNextInject() {
  const ex = activeExercise();
  const scenario = scenarioFor(ex);
  if (ex.currentInjectIndex < scenario.injects.length - 1) {
    ex.currentInjectIndex++;
    savePortfolio();
    renderRun();
  } else {
    showScreen("wrapup");
    renderWrapup();
  }
}

/* ================= WRAP-UP ================= */
function renderWrapup() {
  const ex = activeExercise();
  const scenario = scenarioFor(ex);
  document.getElementById("wrapup-title").textContent = ex.title || scenario.title;
  document.getElementById("wrapup-status-badge").innerHTML = ex.status === "complete"
    ? '<span class="risk-badge closed">COMPLETE</span>' : '<span class="risk-badge active">IN PROGRESS</span>';

  const scorecardDiv = document.getElementById("objectives-scorecard");
  scorecardDiv.innerHTML = "";
  OBJECTIVE_CATEGORIES.forEach(cat => {
    const current = ex.objectivesScorecard[cat.id] || null;
    const row = document.createElement("div");
    row.style.marginBottom = "14px";
    row.innerHTML = `
      <div style="font-weight:600; margin-bottom:6px;">${esc(cat.label)}</div>
      <div class="rating-row">
        <button class="rating-btn well${current === "well" ? " selected" : ""}" data-cat="${cat.id}" data-rating="well">Well Handled</button>
        <button class="rating-btn partial${current === "partial" ? " selected" : ""}" data-cat="${cat.id}" data-rating="partial">Partially Handled</button>
        <button class="rating-btn gap${current === "gap" ? " selected" : ""}" data-cat="${cat.id}" data-rating="gap">Gap Identified</button>
      </div>
    `;
    scorecardDiv.appendChild(row);
    row.querySelectorAll(".rating-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        ex.objectivesScorecard[btn.dataset.cat] = btn.dataset.rating;
        savePortfolio();
        renderWrapup();
      });
    });
  });

  document.getElementById("input-lessons-learned").value = ex.lessonsLearned;

  const followUpDiv = document.getElementById("followup-body");
  followUpDiv.innerHTML = "";
  ex.followUps.forEach((fu, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="text" data-field="action" data-i="${i}" value="${escAttr(fu.action)}" style="width:100%; background:var(--bg-panel-raised); border:1px solid var(--border-subtle); color:var(--text-primary); border-radius:4px; padding:5px 7px;"></td>
      <td><input type="text" data-field="owner" data-i="${i}" value="${escAttr(fu.owner)}" style="width:100%; background:var(--bg-panel-raised); border:1px solid var(--border-subtle); color:var(--text-primary); border-radius:4px; padding:5px 7px;"></td>
      <td><input type="text" data-field="dueDate" data-i="${i}" value="${escAttr(fu.dueDate)}" placeholder="YYYY-MM-DD" style="width:100%; background:var(--bg-panel-raised); border:1px solid var(--border-subtle); color:var(--text-primary); border-radius:4px; padding:5px 7px;"></td>
      <td>
        <select data-field="status" data-i="${i}" style="background:var(--bg-panel-raised); border:1px solid var(--border-subtle); color:var(--text-primary); border-radius:4px; padding:5px 7px;">
          <option value="Open" ${fu.status === "Open" ? "selected" : ""}>Open</option>
          <option value="In Progress" ${fu.status === "In Progress" ? "selected" : ""}>In Progress</option>
          <option value="Complete" ${fu.status === "Complete" ? "selected" : ""}>Complete</option>
        </select>
      </td>
      <td><button class="btn btn-ghost btn-sm" data-remove="${i}">Remove</button></td>
    `;
    followUpDiv.appendChild(tr);
  });
  followUpDiv.querySelectorAll("input, select").forEach(el => {
    el.addEventListener("change", (e) => {
      const i = parseInt(e.target.dataset.i, 10);
      ex.followUps[i][e.target.dataset.field] = e.target.value;
      savePortfolio();
    });
  });
  followUpDiv.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      ex.followUps.splice(parseInt(btn.dataset.remove, 10), 1);
      savePortfolio();
      renderWrapup();
    });
  });
}

function addFollowUp() {
  const ex = activeExercise();
  ex.followUps.push({ action: "", owner: "", dueDate: "", status: "Open" });
  savePortfolio();
  renderWrapup();
}

function commitLessonsLearned() {
  const ex = activeExercise();
  ex.lessonsLearned = document.getElementById("input-lessons-learned").value;
  savePortfolio();
}

function completeExercise() {
  const ex = activeExercise();
  commitLessonsLearned();
  ex.status = "complete";
  ex.completedAt = new Date().toISOString();
  savePortfolio();
  showScreen("dashboard");
  renderDashboard();
}

/* ================= EXPORT / IMPORT ================= */
function exportSingleJSON() {
  const ex = activeExercise();
  downloadBlob(JSON.stringify(ex, null, 2), "application/json", `Tabletop_Exercise_${safeName(ex.title || ex.id)}.json`);
}
function exportAllJSON() {
  downloadBlob(JSON.stringify(portfolio, null, 2), "application/json", `Tabletop_Generator_AllExercises_${new Date().toISOString().slice(0,10)}.json`);
}
function importJSONFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.exercises) { Object.assign(portfolio.exercises, data.exercises); }
      else if (data.id) { portfolio.exercises[data.id] = data; }
      else { alert("This file doesn't look like a valid exercise export."); return; }
      savePortfolio();
      renderDashboard();
      alert("Import complete.");
    } catch (e) { alert("Could not read this file as valid JSON: " + e.message); }
  };
  reader.readAsText(file);
}
function downloadBlob(content, mime, filename) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function safeName(s) { return String(s).replace(/[^A-Za-z0-9]+/g, "_").slice(0, 60); }
function esc(str) {
  if (str === null || str === undefined) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escAttr(str) { return esc(str).replace(/"/g, "&quot;"); }

/* ================= APP INIT ================= */
function initApp() {
  loadPortfolio();
  document.getElementById("version-tag").textContent = `Scenario library v${SCENARIO_VERSION} (${SCENARIO_DATE})`;
  renderDashboard();
  showScreen("dashboard");

  document.getElementById("btn-new-exercise").addEventListener("click", openNewExerciseSetup);
  document.getElementById("btn-setup-cancel").addEventListener("click", () => { showScreen("dashboard"); renderDashboard(); });
  document.getElementById("btn-begin-exercise").addEventListener("click", beginExercise);
  ["input-exercise-title", "input-facilitator", "input-participants", "input-exercise-date"].forEach(id => {
    document.getElementById(id).addEventListener("input", commitSetupFields);
  });

  document.getElementById("btn-prev-inject").addEventListener("click", goPrevInject);
  document.getElementById("btn-next-inject").addEventListener("click", goNextInject);
  document.getElementById("btn-run-back-to-dashboard").addEventListener("click", () => { showScreen("dashboard"); renderDashboard(); });

  document.getElementById("btn-add-followup").addEventListener("click", addFollowUp);
  document.getElementById("input-lessons-learned").addEventListener("input", commitLessonsLearned);
  document.getElementById("btn-complete-exercise").addEventListener("click", completeExercise);
  document.getElementById("btn-wrapup-back-to-dashboard").addEventListener("click", () => { showScreen("dashboard"); renderDashboard(); });
  document.getElementById("btn-export-json").addEventListener("click", exportSingleJSON);
  document.getElementById("btn-export-report").addEventListener("click", exportExerciseReport);

  document.getElementById("btn-export-all-json").addEventListener("click", exportAllJSON);
  document.getElementById("btn-import-json").addEventListener("click", () => document.getElementById("file-import").click());
  document.getElementById("file-import").addEventListener("change", (e) => {
    if (e.target.files[0]) importJSONFile(e.target.files[0]);
    e.target.value = "";
  });
}

document.addEventListener("DOMContentLoaded", initApp);
