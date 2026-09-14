// Clients payloads captured from the engine's test flow (tests/test_effy_workspaces.py setup)
// on 14 Sep 2026: an agency with two clients holding different data, then a third client
// added and the second edited. Regenerate rather than hand-edit.
const clients = {
  "added": {
    "status": "ok",
    "workspace": {
      "accent": "#e84a33",
      "dbId": 3,
      "id": "ws_3",
      "industry": "Real estate",
      "location": "Pune",
      "logo": "✦",
      "managerId": 1,
      "name": "Lakeview Homes"
    }
  },
  "bootstrap": {
    "org": {
      "id": 1,
      "name": "Northwind",
      "plan": "Trial",
      "type": "agency"
    },
    "role": "Agency owner",
    "status": "ok",
    "user": {
      "email": "user-62e63d7389@test.in",
      "email_verified": false,
      "id": 1,
      "is_admin": false,
      "name": "Asha Rao"
    },
    "workspaces": [
      {
        "accent": "#e84a33",
        "dbId": 1,
        "id": "ws_1",
        "industry": "Marketing agency",
        "location": "Pune",
        "logo": "✦",
        "managerId": 1,
        "name": "Northwind"
      },
      {
        "accent": "#e84a33",
        "dbId": 2,
        "id": "ws_2",
        "industry": "Automotive",
        "location": "Nashik",
        "logo": "✦",
        "managerId": null,
        "name": "Sunrise Motors"
      }
    ]
  },
  "bootstrapAfterAdd": {
    "org": {
      "id": 1,
      "name": "Northwind",
      "plan": "Trial",
      "type": "agency"
    },
    "role": "Agency owner",
    "status": "ok",
    "user": {
      "email": "user-62e63d7389@test.in",
      "email_verified": false,
      "id": 1,
      "is_admin": false,
      "name": "Asha Rao"
    },
    "workspaces": [
      {
        "accent": "#e84a33",
        "dbId": 1,
        "id": "ws_1",
        "industry": "Marketing agency",
        "location": "Pune",
        "logo": "✦",
        "managerId": 1,
        "name": "Northwind"
      },
      {
        "accent": "#e84a33",
        "dbId": 2,
        "id": "ws_2",
        "industry": "Automotive",
        "location": "Nashik",
        "logo": "✦",
        "managerId": null,
        "name": "Sunrise Motors"
      },
      {
        "accent": "#e84a33",
        "dbId": 3,
        "id": "ws_3",
        "industry": "Real estate",
        "location": "Pune",
        "logo": "✦",
        "managerId": 1,
        "name": "Lakeview Homes"
      }
    ]
  },
  "duplicate": {
    "body": {
      "message": "A workspace called “sunrise motors” already exists.",
      "status": "error"
    },
    "status": 409
  },
  "edited": {
    "status": "ok",
    "workspace": {
      "accent": "#e84a33",
      "dbId": 2,
      "id": "ws_2",
      "industry": "Automotive",
      "location": "Nashik",
      "logo": "✦",
      "managerId": 1,
      "name": "Sunrise Motors"
    }
  },
  "summary": {
    "clients": [
      {
        "alerts": 0,
        "approvals": 1,
        "channels": [
          "instagram",
          "meta_ads"
        ],
        "id": "ws_1",
        "lastActivity": "2026-09-14T20:36:51.899427+00:00",
        "leads": 3,
        "leads30d": 3,
        "manager": {
          "id": 1,
          "name": "Asha Rao"
        },
        "organic": {
          "level": "good",
          "reason": "4 published in the last 30 days and 0 queued."
        },
        "paid": {
          "level": "good",
          "reason": "1 live campaign on track."
        },
        "spend": 4000
      },
      {
        "alerts": 2,
        "approvals": 0,
        "channels": [],
        "id": "ws_2",
        "lastActivity": "2026-09-14T20:36:51.912127+00:00",
        "leads": 1,
        "leads30d": 0,
        "manager": null,
        "organic": {
          "level": "poor",
          "reason": "1 post failed to publish."
        },
        "paid": {
          "level": "poor",
          "reason": "“Always on” is spending with no leads in 30 days."
        },
        "spend": 1500
      }
    ],
    "status": "ok"
  },
  "summaryAfterAdd": {
    "clients": [
      {
        "alerts": 0,
        "approvals": 1,
        "channels": [
          "instagram",
          "meta_ads"
        ],
        "id": "ws_1",
        "lastActivity": "2026-09-14T20:36:51.899427+00:00",
        "leads": 3,
        "leads30d": 3,
        "manager": {
          "id": 1,
          "name": "Asha Rao"
        },
        "organic": {
          "level": "good",
          "reason": "4 published in the last 30 days and 0 queued."
        },
        "paid": {
          "level": "good",
          "reason": "1 live campaign on track."
        },
        "spend": 4000
      },
      {
        "alerts": 2,
        "approvals": 0,
        "channels": [],
        "id": "ws_2",
        "lastActivity": "2026-09-14T20:36:51.912127+00:00",
        "leads": 1,
        "leads30d": 0,
        "manager": null,
        "organic": {
          "level": "poor",
          "reason": "1 post failed to publish."
        },
        "paid": {
          "level": "poor",
          "reason": "“Always on” is spending with no leads in 30 days."
        },
        "spend": 1500
      },
      {
        "alerts": 0,
        "approvals": 0,
        "channels": [],
        "id": "ws_3",
        "lastActivity": null,
        "leads": 0,
        "leads30d": 0,
        "manager": {
          "id": 1,
          "name": "Asha Rao"
        },
        "organic": {
          "level": "none",
          "reason": "No organic activity yet."
        },
        "paid": {
          "level": "none",
          "reason": "No live campaigns."
        },
        "spend": 0
      }
    ],
    "status": "ok"
  },
  "team": {
    "members": [
      {
        "email": "user-62e63d7389@test.in",
        "id": 1,
        "joined": "2026-09-14",
        "name": "Asha Rao",
        "role": "Agency owner",
        "status": "active",
        "userId": 1,
        "verified": false
      }
    ],
    "status": "ok"
  }
};

export default clients;
