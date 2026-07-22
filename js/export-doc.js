/* =====================================================================
   Export the current tabletop exercise as a Word-compatible report.
   ===================================================================== */

const REPORT_CSS = `
  body { font-family: Calibri, Arial, sans-serif; color: #1a1a1a; font-size: 11pt; }
  h1 { color: #1F3864; font-size: 22pt; margin-bottom: 4pt; }
  h2 { color: #1F3864; font-size: 15pt; margin-top: 22pt; border-bottom: 2pt solid #1F3864; padding-bottom: 4pt; }
  h3 { color: #5B4B8A; font-size: 12pt; margin-top: 16pt; }
  .cover { text-align: center; margin-top: 90pt; }
  .cover .company { font-size: 16pt; font-weight: bold; color: #1F3864; letter-spacing: 1pt; }
  .cover .tagline { font-size: 11pt; color: #595959; font-style: italic; margin-bottom: 40pt; }
  .cover .title { font-size: 24pt; font-weight: bold; color: #5B4B8A; }
  .meta-table td { padding: 3pt 10pt 3pt 0; font-size: 10.5pt; }
  .meta-label { color: #595959; }
  table.report-table { border-collapse: collapse; width: 100%; margin: 8pt 0 14pt 0; }
  table.report-table th { background: #1F3864; color: white; padding: 6pt 8pt; font-size: 9pt; text-align: left; }
  table.report-table td { border: 1pt solid #cccccc; padding: 6pt 8pt; font-size: 9pt; }
  .inject-box { border: 1pt solid #cccccc; border-left: 4pt solid #5B4B8A; padding: 8pt 12pt; margin: 10pt 0; }
  .inject-time { font-weight: bold; color: #5B4B8A; font-size: 9.5pt; text-transform: uppercase; }
  .rating-met { color: #2E7D32; font-weight: bold; }
  .rating-partial { color: #B7950B; font-weight: bold; }
  .rating-gap { color: #C0392B; font-weight: bold; }
  .rating-none { color: #7F8C8D; }
  .page-break { page-break-before: always; }
  .note { font-size: 9.5pt; color: #595959; font-style: italic; }
  .approval-table { border-collapse: collapse; margin-top: 20pt; width: 100%; }
  .approval-table td { border-bottom: 1pt solid #999999; padding: 18pt 8pt 4pt 0; font-size: 10pt; }
  .approval-table .al { color: #595959; font-size: 8.5pt; }
`;

function ratingLabel(r) {
  if (r === "well") return '<span class="rating-met">Well Handled</span>';
  if (r === "partial") return '<span class="rating-partial">Partially Handled</span>';
  if (r === "gap") return '<span class="rating-gap">Gap Identified</span>';
  return '<span class="rating-none">Not rated</span>';
}

function exportExerciseReport() {
  const ex = activeExercise();
  const scenario = scenarioFor(ex);
  const dateStr = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  const injectRows = scenario.injects.map((inject, i) => {
    const resp = ex.injectResponses[i] || { notes: "", rating: null };
    return `
    <div class="inject-box">
      <div class="inject-time">Inject ${i + 1} — ${esc(inject.timeMarker)}</div>
      <p>${esc(inject.text)}</p>
      <p><strong>Discussion prompts:</strong></p>
      <ul>${inject.prompts.map(p => `<li>${esc(p)}</li>`).join("")}</ul>
      <p><strong>Facilitator notes:</strong> ${esc(resp.notes) || "<span class='note'>None recorded.</span>"}</p>
      <p><strong>Assessment:</strong> ${ratingLabel(resp.rating)}</p>
    </div>`;
  }).join("");

  const scorecardRows = OBJECTIVE_CATEGORIES.map(cat => `
    <tr><td>${esc(cat.label)}</td><td>${ratingLabel(ex.objectivesScorecard[cat.id])}</td></tr>
  `).join("");

  const followUpRows = ex.followUps.map(fu => `
    <tr><td>${esc(fu.action)}</td><td>${esc(fu.owner)}</td><td>${esc(fu.dueDate)}</td><td>${esc(fu.status)}</td></tr>
  `).join("");

  const gapCount = Object.values(ex.objectivesScorecard).filter(r => r === "gap").length;
  const injectGapCount = Object.values(ex.injectResponses).filter(r => r.rating === "gap").length;

  const html = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
  <head><meta charset="utf-8"><title>Tabletop Exercise Report</title>
  <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
  <style>${REPORT_CSS}</style></head>
  <body>
    <div class="cover">
      <div class="company">SALE FISH MARKETING AND CONSULTING</div>
      <div class="tagline">OT Cybersecurity Practice</div>
      <div class="title">Tabletop Exercise Report</div>
      <p style="margin-top:30pt; font-size:13pt; font-weight:bold;">${esc(ex.title || scenario.title)}</p>
      <p style="font-size:11pt;">Scenario: ${esc(scenario.title)}</p>
      <p style="font-size:11pt; color:#595959;">${esc(dateStr)}</p>
    </div>

    <div class="page-break"></div>
    <h1>Exercise Summary</h1>
    <table class="meta-table">
      <tr><td class="meta-label">Scenario:</td><td>${esc(scenario.title)}</td><td class="meta-label">Linked Playbook:</td><td>${esc(scenario.linkedPlaybook)}</td></tr>
      <tr><td class="meta-label">Industry:</td><td>${esc(ex.industry || "—")}</td><td class="meta-label">Primary ATT&amp;CK Tactics:</td><td>${esc(scenario.primaryTactics.join(", "))}</td></tr>
      <tr><td class="meta-label">Facilitator:</td><td>${esc(ex.facilitator) || "—"}</td><td class="meta-label">Exercise Date:</td><td>${esc(ex.exerciseDate)}</td></tr>
      <tr><td class="meta-label">Participants:</td><td colspan="3">${esc(ex.participants) || "—"}</td></tr>
    </table>
    <p><strong>Premise:</strong> ${esc(scenario.premise)}</p>
    <p class="note">${esc(scenario.modeledOn)}</p>
    <p>This exercise surfaced <strong>${gapCount} gap(s)</strong> in the objectives scorecard and <strong>${injectGapCount} gap(s)</strong> flagged during individual inject discussions.</p>

    <div class="page-break"></div>
    <h1>Inject-by-Inject Record</h1>
    ${injectRows}

    <div class="page-break"></div>
    <h1>Objectives Scorecard</h1>
    <table class="report-table"><tr><th>Objective Category</th><th>Assessment</th></tr>${scorecardRows}</table>

    <h2>Lessons Learned</h2>
    <p>${esc(ex.lessonsLearned) || "<span class='note'>Not documented.</span>"}</p>

    <h2>Follow-Up Actions</h2>
    ${followUpRows ? `<table class="report-table"><tr><th>Action</th><th>Owner</th><th>Due Date</th><th>Status</th></tr>${followUpRows}</table>` : "<p class='note'>No follow-up actions recorded.</p>"}

    <h2>Sign-Off</h2>
    <table class="approval-table">
      <tr><td style="width:33%;">${esc(ex.facilitator)}</td><td style="width:33%;"></td><td style="width:33%;">${esc(dateStr)}</td></tr>
      <tr><td class="al">Facilitator</td><td class="al">Reviewed By</td><td class="al">Date</td></tr>
    </table>

    <div class="page-break"></div>
    <h1>Methodology Note</h1>
    <p>This exercise was generated by the Sale Fish Marketing and Consulting OT Tabletop Exercise Generator, using a scenario library modeled loosely on documented ICS incidents and cross-referenced to the same playbook library used by the companion OT Incident Response Companion tool. Findings from this exercise — particularly any gaps identified in the objectives scorecard — should feed back into your organization's incident response plan, training program, and Risk Register.</p>
    <p class="note">Scenario library v${SCENARIO_VERSION} (${SCENARIO_DATE})</p>
  </body></html>`;

  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `Tabletop_Report_${safeName(ex.title || scenario.title)}_${new Date().toISOString().slice(0,10)}.doc`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
