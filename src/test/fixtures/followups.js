// Follow-up payloads captured from the engine's test flow (launch plan 5.5;
// tests/test_effy_followup_delays.py) on 16 Sep 2026: one run waiting out its delay,
// one finished, one stopped by a condition after the wait. Regenerate rather than hand-edit.
const followups = {
 "dryRun": {
  "log": [
   {
    "step": "trigger",
    "text": "Triggered by lead_created for lead 'Sample Lead'"
   },
   {
    "step": "action",
    "text": "Would send Email to sample@example.com"
   },
   {
    "step": "action",
    "text": "Would not send WhatsApp \u2014 WhatsApp isn't connected yet"
   },
   {
    "step": "delay",
    "text": "Would wait 2 hours, then carry on"
   },
   {
    "step": "condition",
    "text": "Passed: stage = 'new'"
   },
   {
    "step": "action",
    "text": "Assigned to Priya"
   }
  ],
  "status": "ok"
 },
 "runs": {
  "runs": [
   {
    "at": "2026-09-16T12:38:50.573819",
    "id": 3,
    "lead": "Meera Iyer",
    "log": [
     {
      "step": "trigger",
      "text": "Triggered by lead_created for lead 'Meera Iyer'"
     },
     {
      "step": "action",
      "text": "Email not sent \u2014 the lead has no email address"
     },
     {
      "step": "action",
      "text": "WhatsApp not sent \u2014 WhatsApp isn't connected yet"
     },
     {
      "step": "delay",
      "text": "Waiting 2 hours",
      "until": "2026-09-16T14:38:50.573243+00:00"
     }
    ],
    "resumeAt": "2026-09-16T14:38:50.573243+00:00",
    "status": "waiting"
   },
   {
    "at": "2026-09-16T12:38:50.496742",
    "id": 2,
    "lead": "Vikram Shah",
    "log": [
     {
      "step": "trigger",
      "text": "Triggered by lead_created for lead 'Vikram Shah'"
     },
     {
      "step": "action",
      "text": "Email sent to vikram@example.in"
     },
     {
      "step": "action",
      "text": "WhatsApp not sent \u2014 WhatsApp isn't connected yet"
     },
     {
      "step": "delay",
      "text": "Waiting 2 hours",
      "until": "2026-09-16T14:38:50.494610+00:00"
     },
     {
      "step": "condition",
      "text": "Stopped: stage is 'contacted', needs 'new'"
     }
    ],
    "resumeAt": null,
    "status": "stopped"
   },
   {
    "at": "2026-09-16T12:38:50.480920",
    "id": 1,
    "lead": "Asha Rao",
    "log": [
     {
      "step": "trigger",
      "text": "Triggered by lead_created for lead 'Asha Rao'"
     },
     {
      "step": "action",
      "text": "Email sent to asha@example.in"
     },
     {
      "step": "action",
      "text": "WhatsApp not sent \u2014 WhatsApp isn't connected yet"
     },
     {
      "step": "delay",
      "text": "Waiting 2 hours",
      "until": "2026-09-16T14:38:50.477419+00:00"
     },
     {
      "step": "condition",
      "text": "Passed: stage = 'new'"
     },
     {
      "step": "action",
      "text": "Assigned to Priya"
     }
    ],
    "resumeAt": null,
    "status": "done"
   }
  ],
  "status": "ok"
 },
 "workflows": {
  "status": "ok",
  "workflows": [
   {
    "created": "2026-09-16",
    "id": 1,
    "name": "Enquiry follow-up",
    "runs": 3,
    "status": "active",
    "steps": [
     {
      "kind": "action",
      "message": "Hi {name}, we got your enquiry.",
      "subject": "Thanks, {name}",
      "type": "email"
     },
     {
      "kind": "action",
      "message": "Hi {name}!",
      "type": "whatsapp"
     },
     {
      "amount": 2,
      "kind": "delay",
      "unit": "hours"
     },
     {
      "field": "stage",
      "kind": "condition",
      "value": "new"
     },
     {
      "kind": "action",
      "message": "",
      "owner": "Priya",
      "type": "assign_salesperson"
     }
    ],
    "trigger": {
     "type": "lead_created"
    },
    "workspaceId": "ws_1"
   }
  ]
 }
};

export default followups;
