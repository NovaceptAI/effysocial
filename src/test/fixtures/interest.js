// “Notify me when ready” payloads captured from the engine's test flow (tests/test_effy_interest.py)
// on 15 Sep 2026. Regenerate rather than hand-edit.
const interest = {
  "admin": {
    "features": [
      {
        "count": 1,
        "feature": "blog",
        "label": "Blog",
        "people": [
          {
            "at": "2026-09-15T12:37:24.265493",
            "email": "asha@northwind.in",
            "name": "Asha Rao",
            "org": "Northwind"
          }
        ]
      },
      {
        "count": 1,
        "feature": "whatsapp-alerts",
        "label": "WhatsApp alerts",
        "people": [
          {
            "at": "2026-09-15T12:37:24.276735",
            "email": "asha@northwind.in",
            "name": "Asha Rao",
            "org": "Northwind"
          }
        ]
      },
      {
        "count": 0,
        "feature": "voice-cloning",
        "label": "Dealer voice cloning",
        "people": []
      },
      {
        "count": 0,
        "feature": "playbook-post-to-ad",
        "label": "Winning post → Ad playbook",
        "people": []
      },
      {
        "count": 0,
        "feature": "playbook-competitor-response",
        "label": "Competitor Response playbook",
        "people": []
      }
    ],
    "status": "ok"
  },
  "afterAsk": {
    "features": [
      "blog"
    ],
    "status": "ok"
  },
  "asked": {
    "alreadyAsked": false,
    "email": "asha@northwind.in",
    "feature": "blog",
    "label": "Blog",
    "status": "ok"
  },
  "bootstrap": {
    "org": {
      "id": 1,
      "name": "Northwind",
      "onboarding": {
        "completed": false,
        "offer": null
      },
      "plan": "Trial",
      "planInfo": {
        "features": [
          "marketing",
          "conversion"
        ],
        "limits": {
          "credits": 150,
          "seats": 5,
          "workspaces": 3
        },
        "plan": "Trial",
        "storedPlan": "Trial",
        "trial": {
          "daysLeft": 14,
          "endsAt": "2026-09-29T12:37:24.227412+00:00",
          "expired": false
        },
        "usage": {
          "seats": 1,
          "workspaces": 1
        }
      },
      "type": "business"
    },
    "role": "Workspace admin",
    "status": "ok",
    "user": {
      "email": "asha@northwind.in",
      "email_verified": false,
      "id": 1,
      "is_admin": false,
      "name": "Asha Rao",
      "preferences": {
        "density": "comfortable",
        "notifications": {
          "approvals": true,
          "failures": true,
          "leads": true,
          "reportsEmail": false
        }
      },
      "twoFactor": false
    },
    "workspaces": [
      {
        "accent": "#e84a33",
        "dbId": 1,
        "id": "ws_1",
        "industry": "",
        "location": "",
        "logo": "✦",
        "managerId": 1,
        "name": "Northwind"
      }
    ]
  },
  "none": {
    "features": [],
    "status": "ok"
  },
  "unknown": {
    "body": {
      "message": "That isn't a feature we're taking names for.",
      "status": "error"
    },
    "status": 400
  }
};

export default interest;
