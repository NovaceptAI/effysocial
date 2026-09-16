// Conversion-event payloads captured from the engine's test flow (launch plan 5.6;
// tests/test_effy_conversions.py) on 16 Sep 2026: a lead from a Meta ad marked qualified then
// purchased, one recorded before events were built, and the Tracking Centre. Regenerate rather than hand-edit.
const conversions = {
 "lead": {
  "lead": {
   "attribution": {
    "campaign": null,
    "channel": "facebook",
    "conversation": null,
    "form": {
     "data": {
      "email": "vikram@example.in",
      "name": "Vikram Shah",
      "phone": "98765 43210"
     },
     "id": 1,
     "name": "Enquiry",
     "submitted": "2026-09-16T13:02:52.845350"
    },
    "source": "form",
    "utm": {
     "campaign": "monsoon",
     "fbclid": "IwAR2abc",
     "medium": "paid",
     "source": "facebook"
    }
   },
   "campaignId": null,
   "channel": "facebook",
   "conversationId": null,
   "created": "2026-09-16",
   "duplicates": [],
   "email": "vikram@example.in",
   "followupRuns": [],
   "id": 1,
   "interest": "Enquiry",
   "lostReason": "",
   "name": "Vikram Shah",
   "notes": [
    {
     "text": "Form submission: Enquiry",
     "when": "now"
    },
    {
     "text": "Outcome marked: qualified. Conversion event ready for Meta and Google (matched by email, phone, Meta click id) \u2014 not sent: Meta and Google are not connected yet.",
     "when": "now"
    },
    {
     "text": "Outcome marked: purchase completed. Conversion event ready for Meta and Google (matched by email, phone, Meta click id) \u2014 not sent: Meta and Google are not connected yet.",
     "when": "now"
    }
   ],
   "offlineSignals": [
    {
     "eventId": "effy-lead-1-purchase_completed",
     "matchedBy": [
      "email",
      "phone",
      "Meta click id"
     ],
     "outcome": "purchase_completed",
     "platforms": {
      "google": {
       "reason": "Google Ads isn't connected for conversions yet",
       "status": "not_connected"
      },
      "meta": {
       "reason": "Meta isn't connected for conversions yet",
       "status": "not_connected"
      }
     },
     "signal": "positive",
     "status": "ready",
     "when": "2026-09-16T13:02:52.888628"
    },
    {
     "eventId": "effy-lead-1-qualified",
     "matchedBy": [
      "email",
      "phone",
      "Meta click id"
     ],
     "outcome": "qualified",
     "platforms": {
      "google": {
       "reason": "Google Ads isn't connected for conversions yet",
       "status": "not_connected"
      },
      "meta": {
       "reason": "Meta isn't connected for conversions yet",
       "status": "not_connected"
      }
     },
     "signal": "positive",
     "status": "ready",
     "when": "2026-09-16T13:02:52.876856"
    }
   ],
   "outcome": "purchase_completed",
   "outcomes": [
    "appointment_completed",
    "duplicate",
    "invalid",
    "purchase_completed",
    "qualified",
    "unreachable"
   ],
   "owner": "",
   "phone": "98765 43210",
   "quality": "warm",
   "source": "form",
   "stage": "new",
   "value": 50000,
   "workspaceId": "ws_1"
  },
  "status": "ok"
 },
 "legacyLead": {
  "lead": {
   "attribution": {
    "campaign": null,
    "channel": "",
    "conversation": null,
    "form": null,
    "source": "manual",
    "utm": {}
   },
   "campaignId": null,
   "channel": "",
   "conversationId": null,
   "created": "2026-09-16",
   "duplicates": [],
   "email": "",
   "followupRuns": [],
   "id": 3,
   "interest": "",
   "lostReason": "",
   "name": "Old lead",
   "notes": [],
   "offlineSignals": [
    {
     "eventId": null,
     "matchedBy": [],
     "note": "Recorded before conversion events were built \u2014 nothing was sent.",
     "outcome": "qualified",
     "platforms": {},
     "signal": "positive",
     "status": "not_sent",
     "when": "2026-09-16T13:02:52.935386"
    }
   ],
   "outcome": "",
   "outcomes": [
    "appointment_completed",
    "duplicate",
    "invalid",
    "purchase_completed",
    "qualified",
    "unreachable"
   ],
   "owner": "",
   "phone": "",
   "quality": "warm",
   "source": "manual",
   "stage": "new",
   "value": 0,
   "workspaceId": "ws_1"
  },
  "status": "ok"
 },
 "tracking": {
  "conversions": {
   "lastAt": "2026-09-16T13:02:52.919276",
   "ready": 3,
   "sent": 0,
   "withClickId": 2
  },
  "domain": {
   "detail": "Domain verification unlocks first-party pixel events once Meta is connected.",
   "host": null,
   "status": "unverified"
  },
  "guide": [
   "Publish a lead form (Convert \u2192 Forms) \u2014 every submission becomes a pipeline lead.",
   "Embed the form in a landing page and share /p/:slug links tagged with utm_source/medium/campaign.",
   "Add WhatsApp and call CTAs so high-intent visitors can reach you in one tap.",
   "Use the test-event tool below to confirm each source records events.",
   "Mark each lead's outcome in the pipeline \u2014 it builds the conversion event Meta and Google will receive once connected."
  ],
  "provider": "mock",
  "recommendations": [
   {
    "id": "consent",
    "severity": "warn",
    "text": "1 published form(s) have no consent text \u2014 add one to stay compliant.",
    "to": "/app/forms"
   },
   {
    "id": "pixel",
    "severity": "info",
    "text": "Meta Pixel and Google Tag aren't connected, so nothing is sent back to the ad platforms yet \u2014 3 conversion events are ready to go when they are.",
    "to": "/app/integrations"
   }
  ],
  "sources": [
   {
    "consent": "missing on 1",
    "detail": "1 published form(s) \u00b7 submissions become pipeline leads",
    "duplicates": 0,
    "events": 1,
    "id": "forms",
    "kind": "native",
    "lastEvent": "2026-09-16T13:02:52.845350",
    "lastTest": null,
    "matchQuality": 100,
    "name": "Lead forms",
    "status": "healthy"
   },
   {
    "consent": "n/a",
    "detail": "0 published page(s) \u00b7 events are page views",
    "duplicates": 0,
    "events": 0,
    "id": "landing",
    "kind": "native",
    "lastEvent": null,
    "lastTest": null,
    "matchQuality": null,
    "name": "Landing pages",
    "status": "not_connected"
   },
   {
    "consent": "n/a",
    "detail": "0 page(s) with WhatsApp CTA \u00b7 events are WhatsApp-sourced leads",
    "duplicates": 0,
    "events": 0,
    "id": "whatsapp",
    "kind": "native",
    "lastEvent": null,
    "lastTest": null,
    "matchQuality": null,
    "name": "WhatsApp CTA",
    "status": "not_connected"
   },
   {
    "consent": "n/a",
    "detail": "Connect Meta in Integrations to receive lead/purchase events.",
    "duplicates": 0,
    "events": 0,
    "id": "meta_pixel",
    "kind": "pixel",
    "lastEvent": null,
    "lastTest": null,
    "matchQuality": null,
    "name": "Meta Pixel",
    "status": "not_connected"
   },
   {
    "consent": "n/a",
    "detail": "Connect Google in Integrations to receive conversion events.",
    "duplicates": 0,
    "events": 0,
    "id": "google_tag",
    "kind": "pixel",
    "lastEvent": null,
    "lastTest": null,
    "matchQuality": null,
    "name": "Google Tag",
    "status": "not_connected"
   }
  ],
  "status": "ok",
  "utm": {
   "coverage": 100,
   "submissions": 1,
   "tagged": 1,
   "topSources": [
    {
     "count": 1,
     "source": "facebook"
    }
   ]
  }
 }
};

export default conversions;
