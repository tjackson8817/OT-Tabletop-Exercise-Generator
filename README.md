# OT Tabletop Exercise Generator

A free, web-based tool for running structured OT/ICS cybersecurity tabletop exercises. No build step, no backend.

**Built by Sale Fish Marketing and Consulting.**

---

## What it does

- **A scenario library of 7 exercises**, each modeled loosely on a real, documented ICS incident and each tied directly to one of the six playbooks in the companion OT Incident Response Companion tool — so a gap surfaced in a tabletop points straight at the same playbook your team would actually use in a real event.
- **Progressive injects** — each scenario unfolds across 3-4 timed injects (e.g., T+0, T+30 min, T+2 hr), each with 2-3 facilitator discussion prompts designed to test a specific capability (detection, containment decision-making, communication, regulatory awareness, recovery).
- **Live facilitator notes and per-inject assessment** — record what was discussed and rate each inject as Well Handled / Partially Handled / Gap Identified as you go.
- **An objectives scorecard** at wrap-up, covering five categories independent of the individual injects, plus a Lessons Learned field and a follow-up action tracker (action/owner/due date/status).
- **Program Metrics on the Dashboard** — once you've completed more than one exercise, an aggregate panel shows your most common gap category, most-run scenario, and open/total follow-up actions across your whole exercise history.
- **A full exportable Word report** — exercise summary, the complete inject-by-inject record (text, prompts, facilitator notes, assessment), the objectives scorecard, lessons learned, follow-up actions, and a sign-off block.
- **Works fully offline.** No external JS dependencies.
- **All data stays in your browser.** No server, no account, no analytics.

## Quick start

Open `index.html` directly, or host on GitHub Pages — same process as the other Sale Fish OT tools (see any of their READMEs for the step-by-step walkthrough).

## Running an exercise

1. From the Dashboard, click **+ New Exercise**.
2. Fill in facilitator, participants, and exercise date.
3. Select an industry — this filters the scenario list (one scenario, "Grid Down," is Power & Utilities-specific; the other six apply to any industry).
4. Select a scenario and click **Begin Exercise**.
5. Read each inject aloud to participants, lead discussion using the prompts, and record facilitator notes plus a Well/Partial/Gap assessment as you go. Click **Next Inject** to advance.
6. After the final inject, you land on **Wrap-Up**: rate the five objective categories, document lessons learned, and add any follow-up actions.
7. Click **Export Report (.doc)** for a complete record, then **Mark Exercise Complete**.

## Project structure

```
index.html              Main app shell (dashboard, setup, exercise run, wrap-up)
css/style.css            Design system (same control-room theme as the other Sale Fish tools, violet accent)
data/scenarios.js        The 7-scenario library: premise, industry fit, linked playbook, ATT&CK tactics, injects, prompts
js/app.js                State management, navigation, exercise flow, scorecard, program metrics
js/export-doc.js         Generates the Word-compatible exercise report
```

## Scenario library

| Scenario | Linked Playbook | Modeled On |
|---|---|---|
| Unrecognized Remote Session | Unauthorized Remote Access | Oldsmar, FL water treatment incident (2021) |
| The Phantom Setpoint | Unauthorized Control Command | Stuxnet's falsified-readings pattern |
| Silent Alarm | Inhibit Response Function Activity | TRITON/TRISIS (2017) |
| Quiet Footsteps | Suspected Discovery Activity | Havex / Dragonfly campaign |
| Spillover | IT-Originated Ransomware | Colonial Pipeline (2021) |
| Grid Down (Power & Utilities only) | SIS-Adjacent Event | 2016 Kyiv substation attack (Industroyer/CrashOverride) |
| Supply Chain Surprise | Generic First Response (No Clean Match) | PIPEDREAM/INCONTROLLER disclosure (2022) |

All scenarios are fictionalized/generalized for exercise purposes — no scenario reproduces the real incident's specific technical details, just the general shape of what happened, adapted into a discussion exercise.

## Extending the scenario library

Edit `data/scenarios.js` to add scenarios, adjust industry fit, or write new injects. Each scenario follows a simple shape (id, title, premise, industryFit, linkedPlaybook, primaryTactics, modeledOn, injects[]), and each inject has a time marker, inject text, and a prompts array.

## License / attribution

Prepared by Sale Fish Marketing and Consulting. Adapt freely for your own use.
