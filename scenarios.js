/* =====================================================================
   OT Tabletop Exercise Generator — Scenario Library
   Sale Fish Marketing and Consulting

   Seven scenarios, each modeled loosely on real documented ICS incidents
   (fictionalized/generalized for exercise purposes) and each tied to one
   of the six IR Companion playbooks plus a generic/no-clean-match case —
   so a tabletop finding can point straight at the same playbook your
   team would actually use in a real event.
   ===================================================================== */

const SCENARIO_VERSION = "1.1.0";
const SCENARIO_DATE = "2026-11-21";

const OBJECTIVE_CATEGORIES = [
  { id: "detection", label: "Detection & Triage" },
  { id: "containment", label: "Containment Decision-Making" },
  { id: "communication", label: "Communication & Escalation" },
  { id: "regulatory", label: "Regulatory Awareness" },
  { id: "recovery", label: "Recovery & Continuity" },
];

const INDUSTRIES = ["P&U", "O&G", "Chemical", "Manufacturing", "Healthcare"];

const SCENARIOS = [
  {
    id: "unrecognized-remote-session",
    title: "Unrecognized Remote Session",
    premise: "An operator notices the cursor moving on an HMI workstation without anyone at the keyboard, shortly after a known remote-access tool was left installed following a vendor support call weeks earlier.",
    industryFit: "all",
    linkedPlaybook: "Unauthorized Remote Access",
    primaryTactics: ["Initial Access", "Lateral Movement"],
    modeledOn: "Loosely modeled on the Oldsmar, Florida water treatment incident as reported in 2021. (In 2023 the city's former manager said the event was most likely employee error rather than an intrusion; the scenario uses the incident as originally reported.)",
    injects: [
      {
        timeMarker: "T+0 min",
        text: "An operator reports the mouse cursor on the water treatment HMI moved on its own for about 15 seconds, opening a chemical dosing screen, before returning to normal. No one was logged in at the console at the time.",
        prompts: [
          "What is your very first action right now, before you know anything else?",
          "Who gets notified at this stage, and by what method?",
          "Is this treated as a possible safety event yet, or purely an IT anomaly?",
        ],
      },
      {
        timeMarker: "T+10 min",
        text: "IT confirms a remote-access tool (installed for a vendor support session roughly three weeks ago) was active on that workstation at the time of the incident, using a shared account with no MFA.",
        prompts: [
          "Does this change your containment decision? Walk through the containment decision tree out loud.",
          "Is this workstation reachable by, or does it directly control, any Tier 1/SIS-adjacent process?",
          "What's your plan for the shared account right now — disable, monitor, or something else?",
        ],
      },
      {
        timeMarker: "T+25 min",
        text: "A field operator independently confirms via manual gauge reading that the chemical dosing setpoint was in fact changed — a significant increase to the caustic soda dosing level — and has already been manually reverted.",
        prompts: [
          "The physical consequence has already been reverted manually — does that change your severity classification?",
          "What regulatory or reporting obligations, if any, does your organization have at this point?",
          "What's your public communication posture, if any — do you say anything externally, and if so, when?",
        ],
      },
      {
        timeMarker: "T+2 hr",
        text: "The remote-access tool's logs show the session originated from an external residential IP address, not the vendor's known office network.",
        prompts: [
          "Who leads the post-incident review, and what's the very first thing you'd want to know?",
          "What compensating control would you put in place today, before a full remote-access architecture overhaul is possible?",
        ],
      },
    ],
  },
  {
    id: "phantom-setpoint",
    title: "The Phantom Setpoint",
    premise: "A control engineer reviewing historian trends notices a control loop is behaving as though a setpoint changed, but the HMI and engineering workstation both show the original, unchanged value.",
    industryFit: "all",
    linkedPlaybook: "Unauthorized Control Command",
    primaryTactics: ["Execution", "Impair Process Control", "Evasion"],
    modeledOn: "Loosely modeled on Stuxnet's pattern of falsifying operator-visible readings while manipulating the underlying process.",
    injects: [
      {
        timeMarker: "T+0 min",
        text: "A control engineer notices a centrifugal pump's actual speed, visible in historian trend data, has been running roughly 8% faster than its displayed and commanded setpoint for the last six hours — but the HMI shows everything as normal.",
        prompts: [
          "Is this an OT security incident, an instrumentation fault, or unknown at this point? How do you decide?",
          "What's your first action — and does it risk tipping off an active adversary if this turns out to be intentional?",
        ],
      },
      {
        timeMarker: "T+30 min",
        text: "Engineering confirms the PLC's actual running logic differs from the last known-good backup on file — an extra rung of logic exists that isn't present in the golden image.",
        prompts: [
          "You now have strong evidence of unauthorized logic modification. Walk through the containment decision tree for this asset.",
          "Do you isolate this controller immediately, or is there an argument for controlled monitoring first? What tips the decision either way?",
        ],
      },
      {
        timeMarker: "T+1 hr",
        text: "Safety engineering is consulted and confirms this pump feeds a process with no direct SIS relationship, but sustained overspeed operation could cause equipment damage and an unplanned shutdown within approximately 4 hours if uncorrected.",
        prompts: [
          "Given this is not Tier 1/SIS-adjacent, does your urgency change? Should it?",
          "Who has the authority to approve reverting to the golden image on a live production asset, and how fast can that approval happen?",
        ],
      },
      {
        timeMarker: "T+3 hr",
        text: "Forensic review of engineering workstation logs shows the unauthorized logic was pushed from a legitimate engineer's account, but at a time that engineer says they were not at their desk or logged in.",
        prompts: [
          "This now looks like a compromised legitimate credential rather than an external-only intrusion. Does this change who you notify or how?",
          "What does your post-incident review need to establish before this is considered closed?",
        ],
      },
    ],
  },
  {
    id: "silent-alarm",
    title: "Silent Alarm",
    premise: "A high-pressure alarm on a reactor fails to sound during a process upset that field operators can see is clearly occurring.",
    industryFit: "all",
    linkedPlaybook: "Inhibit Response Function Activity",
    primaryTactics: ["Inhibit Response Function", "Impact"],
    modeledOn: "Loosely modeled on the TRITON/TRISIS incident targeting Safety Instrumented Systems (2017).",
    injects: [
      {
        timeMarker: "T+0 min",
        text: "A field operator radios in that Reactor 2's pressure gauge is clearly climbing well past its normal operating range, but no high-pressure alarm has sounded in the control room, and the HMI shows the alarm as acknowledged by an operator ID that is not currently logged in anywhere.",
        prompts: [
          "This directly implicates a safety-function-adjacent system. What is your immediate first move, before any investigation?",
          "Per the containment decision tree, who is required to be involved in this decision right now?",
        ],
      },
      {
        timeMarker: "T+5 min",
        text: "The control room team manually initiates a safe shutdown of Reactor 2 based on the field operator's direct observation, independent of the automated safety system.",
        prompts: [
          "Was manual intervention the right call here, given the automated alarm couldn't be trusted? What does this tell you about your defense-in-depth?",
          "How do you now verify the actual state of the Safety Instrumented System itself, independent of anything it's reporting?",
        ],
      },
      {
        timeMarker: "T+30 min",
        text: "SIS engineering confirms the alarm acknowledgment was issued via the SIS engineering interface, using valid credentials, from a workstation that should not have had network access to the SIS network at all.",
        prompts: [
          "This reveals a segmentation gap between the engineering network and the SIS. What's your immediate compensating control?",
          "What is your organization's regulatory or internal reporting obligation for an event that reaches the safety system layer, even without physical harm occurring?",
        ],
      },
      {
        timeMarker: "T+4 hr",
        text: "Executive leadership asks for a same-day summary of what happened and whether it's safe to restart Reactor 2.",
        prompts: [
          "Who owns the go/no-go decision to restart, and what has to be true before that decision can be made?",
          "What would you tell leadership in one paragraph, right now, knowing the investigation is not yet complete?",
        ],
      },
    ],
  },
  {
    id: "quiet-footsteps",
    title: "Quiet Footsteps",
    premise: "Passive network monitoring flags an unusual pattern of read requests sweeping across multiple controllers from a single host over several days.",
    industryFit: "all",
    linkedPlaybook: "Suspected Discovery Activity",
    primaryTactics: ["Discovery", "Collection"],
    modeledOn: "Loosely modeled on Havex's OPC-scanning reconnaissance behavior in the Dragonfly campaign.",
    injects: [
      {
        timeMarker: "T+0 min",
        text: "Your OT network monitoring tool flags a single engineering workstation that has, over the past four days, sequentially queried the identity and configuration of nearly every PLC and OPC server in the plant — far beyond what any single engineering task would require.",
        prompts: [
          "Is this an emergency, or something you can triage on a normal schedule? What determines that?",
          "What's your first, lowest-risk step to figure out if this is legitimate activity or reconnaissance?",
        ],
      },
      {
        timeMarker: "T+2 hr",
        text: "The workstation's assigned engineer says they did not perform this activity and were out of the office (confirmed by badge records) for two of the four days in question.",
        prompts: [
          "You now have a credible indicator of compromise, but no confirmed impact yet. What's your escalation path?",
          "Should any part of the plant be treated differently right now, given an adversary appears to now have a full asset map?",
        ],
      },
      {
        timeMarker: "T+1 day",
        text: "Deeper log review shows the same host briefly attempted (and failed) to authenticate to the historian server using several different credential sets shortly after the scanning activity concluded.",
        prompts: [
          "This looks like reconnaissance followed by an attempted next step. Does your response change now versus when it was 'only' scanning?",
          "At what point in this scenario, if any, would you have escalated to a full incident versus ongoing monitoring?",
        ],
      },
      {
        timeMarker: "T+3 days",
        text: "The compromised workstation is isolated and imaged. No further unusual activity is observed elsewhere on the network in the following 72 hours.",
        prompts: [
          "What would you want to know before concluding this was contained to a single host?",
          "What detection gap allowed four days of reconnaissance before anyone noticed — and what's the one change that would catch it faster next time?",
        ],
      },
    ],
  },
  {
    id: "spillover",
    title: "Spillover",
    premise: "The enterprise IT SOC confirms active ransomware on the corporate network. OT has had no confirmed impact — yet.",
    industryFit: "all",
    linkedPlaybook: "IT-Originated Ransomware — OT Spillover Precaution",
    primaryTactics: ["Initial Access", "Impact"],
    modeledOn: "Loosely modeled on the Colonial Pipeline ransomware incident (2021).",
    injects: [
      {
        timeMarker: "T+0 min",
        text: "IT Security notifies you that ransomware has been confirmed encrypting files on the corporate network, including systems in the same domain as some business-side reporting tools. OT systems report no anomalies at this time.",
        prompts: [
          "OT has no confirmed impact — do you take any OT-side action anyway? What's the argument for and against acting preemptively?",
          "Who makes the call on whether to precautionarily isolate the Industrial DMZ, and how fast can that decision be made?",
        ],
      },
      {
        timeMarker: "T+45 min",
        text: "IT cannot yet confirm whether the ransomware has reached any system with a network path into the Industrial DMZ. They recommend erring toward isolation given the uncertainty.",
        prompts: [
          "Precautionary DMZ isolation likely disrupts historian data flow to the business and possibly remote engineering support. Who absorbs that operational cost, and are they in the room for this decision?",
          "How do you communicate this decision to plant operations staff who are not experiencing any OT-side problem themselves?",
        ],
      },
      {
        timeMarker: "T+6 hr",
        text: "IT confirms the ransomware did reach a file server that had a scheduled data pull from the OT historian mirror, though the mirror itself shows no signs of compromise.",
        prompts: [
          "Does this change your assessment of how close this came to actually reaching OT?",
          "What's your organization's stance on operating without corporate IT services (email, ERP, business reporting) for an extended period, if that's what full containment requires?",
        ],
      },
      {
        timeMarker: "T+2 days",
        text: "IT's enterprise recovery is expected to take another 3-5 days. Plant leadership asks whether it's safe to restore full DMZ connectivity now.",
        prompts: [
          "What conditions need to be met on the IT side before you'd recommend restoring OT-side connectivity?",
          "What would you do differently next time to make this decision faster and less disruptive to make?",
        ],
      },
    ],
  },
  {
    id: "grid-down",
    title: "Grid Down",
    premise: "Multiple substations report simultaneous, unexpected breaker operations, with no corresponding operator commands in the SCADA log.",
    industryFit: "P&U",
    linkedPlaybook: "SIS-Adjacent Event",
    primaryTactics: ["Execution", "Impair Process Control", "Impact"],
    modeledOn: "Loosely modeled on the 2016 Kyiv substation attack (Industroyer/CrashOverride).",
    injects: [
      {
        timeMarker: "T+0 min",
        text: "Within a two-minute window, three substations report breaker operations that opened multiple circuits, causing an outage affecting a portion of the service territory. No operator issued these commands from the SCADA control center.",
        prompts: [
          "This is a multi-site event with immediate customer impact. Who is in your first call, and within how many minutes?",
          "Do you attempt to close the breakers and restore service immediately, or hold off until you understand what's happening? What's the safety argument either way?",
        ],
      },
      {
        timeMarker: "T+15 min",
        text: "SCADA engineering confirms the breaker-open commands used a legitimate protocol and a valid, previously-authorized source address — but that source is a jump host that should only be used for maintenance windows, and no maintenance window was scheduled.",
        prompts: [
          "The commands were 'legitimate' at the protocol level. What does this tell you about the limits of protocol-level trust alone?",
          "What is your immediate containment action for that specific jump host, and does it affect other substations beyond the three already hit?",
        ],
      },
      {
        timeMarker: "T+1 hr",
        text: "Two additional substations report attempted (but unsuccessful, due to a manually-disconnected control path) breaker commands from the same source in the past 20 minutes.",
        prompts: [
          "This looks like an ongoing, active, multi-site attack rather than a single event. Does this trigger any different level of organizational response?",
          "What are your mandatory regulatory reporting obligations at this point, and has that clock already started whether or not you've formally acknowledged it?",
        ],
      },
      {
        timeMarker: "T+6 hr",
        text: "Service has been restored to all affected customers through manual switching. Media and regulators are both requesting updates.",
        prompts: [
          "Who is your single point of contact for external communications, and what can you say without compromising the ongoing investigation?",
          "What is the single biggest architectural change this event argues for, and who owns making the business case for it?",
        ],
      },
    ],
  },
  {
    id: "supply-chain-surprise",
    title: "Supply Chain Surprise",
    premise: "A CISA advisory names a specific PLC firmware version, in wide use at your facility, as containing a pre-positioned capability discovered before any known deployment against a real target.",
    industryFit: "all",
    linkedPlaybook: "Generic First Response (No Clean Match)",
    primaryTactics: ["Discovery", "Execution", "Impair Process Control"],
    modeledOn: "Loosely modeled on the PIPEDREAM/INCONTROLLER toolkit disclosure (2022).",
    injects: [
      {
        timeMarker: "T+0 min",
        text: "A joint CISA/FBI/NSA advisory describes a modular attack toolkit capable of targeting a specific PLC family and OPC-UA servers across multiple industries — and your asset inventory shows this exact PLC model deployed in twelve locations across two facilities. There is no indication your environment has actually been targeted; the advisory describes a discovered capability, not an active attack.",
        prompts: [
          "This doesn't fit neatly into any of your six standard playbooks — how do you decide what 'incident' status this even gets?",
          "Is this a security incident at all yet, or a vulnerability/risk management action? Where's the line?",
        ],
      },
      {
        timeMarker: "T+2 hr",
        text: "OT Engineering confirms all twelve affected PLCs are running the exact firmware version named in the advisory, and none have been updated in over 18 months.",
        prompts: [
          "You have no evidence of compromise, only exposure. What compensating controls would you apply today while a patch path is evaluated?",
          "Who decides whether any of these twelve assets need to be taken offline for inspection, given the advisory alone doesn't confirm active compromise?",
        ],
      },
      {
        timeMarker: "T+1 day",
        text: "The vendor confirms a firmware update is available but recommends a full revalidation of control logic on each affected controller before deployment, given the scope of the underlying vulnerability.",
        prompts: [
          "Patching all twelve properly could take weeks. What's your position on operating in the interim, and what evidence would you want before feeling comfortable with that?",
          "How do you prioritize which of the twelve gets attention first?",
        ],
      },
      {
        timeMarker: "T+2 weeks",
        text: "No evidence of compromise has been found on any of the twelve controllers after inspection. Firmware updates are roughly half complete.",
        prompts: [
          "What does 'closed' mean for an event like this, where there was never a confirmed compromise — just exposure to a known capability?",
          "What would you want your supply chain / procurement process to look like differently, given this specific PLC family is now a known target?",
        ],
      },
    ],
  },
];

if (typeof module !== "undefined") {
  module.exports = { SCENARIO_VERSION, SCENARIO_DATE, OBJECTIVE_CATEGORIES, INDUSTRIES, SCENARIOS };
}
