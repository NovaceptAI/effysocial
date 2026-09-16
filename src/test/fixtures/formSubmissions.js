// Form and submission payloads captured from the engine's test flow (launch plan 5.7;
// tests/test_effy_form_submissions.py) on 16 Sep 2026: a published form with three
// submissions — one whose lead was won, one whose lead was deleted, one from a Meta ad that
// answered a field no longer on the form — and an empty draft form. Regenerate rather than hand-edit.
const formSubmissions = {
 "emptySubmissions": {
  "shown": 0,
  "status": "ok",
  "submissions": [],
  "total": 0
 },
 "forms": {
  "forms": [
   {
    "campaignId": null,
    "consentText": "",
    "created": "2026-09-16",
    "fields": [
     {
      "id": "name",
      "label": "Your name",
      "required": true,
      "type": "text"
     },
     {
      "id": "phone",
      "label": "Phone",
      "required": true,
      "type": "phone"
     },
     {
      "id": "email",
      "label": "Email",
      "required": false,
      "type": "email"
     }
    ],
    "id": 2,
    "name": "Quote request",
    "publicUrl": "/f/xcKRmVHI3zo",
    "slug": "xcKRmVHI3zo",
    "status": "draft",
    "submissions": 0,
    "thankyou": "Thanks! We'll get back to you shortly.",
    "type": "lead",
    "workspaceId": "ws_1"
   },
   {
    "campaignId": null,
    "consentText": "",
    "created": "2026-09-16",
    "fields": [
     {
      "id": "name",
      "label": "Your name",
      "required": true,
      "type": "text"
     },
     {
      "id": "phone",
      "label": "Phone",
      "required": true,
      "type": "phone"
     },
     {
      "id": "roof",
      "label": "Roof type",
      "options": [
       "Terrace",
       "Sloped"
      ],
      "required": false,
      "type": "select"
     }
    ],
    "id": 1,
    "name": "Monsoon enquiry",
    "publicUrl": "/f/rp_87tFXK4U",
    "slug": "rp_87tFXK4U",
    "status": "published",
    "submissions": 3,
    "thankyou": "Thanks! We'll get back to you shortly.",
    "type": "lead",
    "workspaceId": "ws_1"
   }
  ],
  "status": "ok"
 },
 "submissions": {
  "shown": 3,
  "status": "ok",
  "submissions": [
   {
    "created": "2026-09-16T16:12:41.713877+00:00",
    "data": {
     "budget": "₹50,000",
     "name": "Vikram Shah",
     "phone": "98765 22222",
     "roof": "Terrace"
    },
    "id": 3,
    "lead": {
     "id": 3,
     "name": "Vikram Shah",
     "outcome": "",
     "stage": "new"
    },
    "leadId": 3,
    "utm": {
     "campaign": "monsoon",
     "fbclid": "IwAR2abc",
     "source": "facebook"
    }
   },
   {
    "created": "2026-09-16T16:12:41.703041+00:00",
    "data": {
     "name": "Gone Later",
     "phone": "98765 11111",
     "roof": "Sloped"
    },
    "id": 2,
    "lead": null,
    "leadId": 2,
    "utm": {}
   },
   {
    "created": "2026-09-16T16:12:41.693491+00:00",
    "data": {
     "name": "Asha Rao",
     "phone": "98765 43210",
     "roof": "Terrace"
    },
    "id": 1,
    "lead": {
     "id": 1,
     "name": "Asha Rao",
     "outcome": "purchase_completed",
     "stage": "won"
    },
    "leadId": 1,
    "utm": {
     "campaign": "monsoon",
     "source": "instagram"
    }
   }
  ],
  "total": 3
 }
};

export default formSubmissions;
