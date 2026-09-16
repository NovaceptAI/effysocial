// Campaign workspace payloads captured from the engine's test flow (launch plan 5.1;
// tests/test_effy_campaign_workspace.py) on 16 Sep 2026. Regenerate rather than hand-edit.
const campaign = {
  "assistantReply": {
    "actions": [],
    "agent": "Performance",
    "citations": [
      "campaigns (2)",
      "content pipeline (2 posts)"
    ],
    "reply": "Monsoon Drive has 3 leads and one won at ₹50,000 — put more behind the reel that reached 1,240 people.",
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
          "endsAt": "2026-09-30T04:32:50.395866+00:00",
          "expired": false
        },
        "usage": {
          "seats": 1,
          "workspaces": 1
        }
      },
      "timezone": "Asia/Kolkata",
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
  "campaigns": {
    "campaigns": [
      {
        "budget": 40000,
        "channels": [
          "instagram"
        ],
        "counts": {},
        "end": "2026-10-16",
        "id": 2,
        "kpis": {},
        "name": "Monsoon Drive",
        "objective": "Lead generation",
        "owner": "Asha Rao",
        "pillar": "Proof",
        "recommendations": 0,
        "spent": 12000,
        "start": "2026-09-16",
        "status": "draft",
        "workspaceId": "ws_1"
      },
      {
        "budget": 25000,
        "channels": [],
        "counts": {},
        "end": "",
        "id": 1,
        "kpis": {},
        "name": "Festive Offer",
        "objective": "Awareness",
        "owner": "",
        "pillar": "",
        "recommendations": 0,
        "spent": 0,
        "start": "",
        "status": "draft",
        "workspaceId": "ws_1"
      }
    ],
    "status": "ok"
  },
  "capturedAt": "2026-09-16T04:32:50.244750+00:00",
  "edited": {
    "campaign": {
      "budget": 65000,
      "channels": [
        "instagram"
      ],
      "counts": {},
      "end": "2026-10-16",
      "id": 2,
      "kpis": {},
      "name": "Monsoon Drive 2026",
      "objective": "Lead generation",
      "owner": "Asha Rao",
      "pillar": "Proof",
      "recommendations": 0,
      "spent": 12000,
      "start": "2026-09-16",
      "status": "live",
      "workspaceId": "ws_1"
    },
    "status": "ok"
  },
  "emptyWorkspace": {
    "activity": [
      {
        "at": "2026-09-16T04:32:50.442909+00:00",
        "kind": "campaign",
        "text": "Campaign “Festive Offer” created"
      }
    ],
    "analytics": {
      "budget": 25000,
      "byStage": {
        "appointment": 0,
        "contacted": 0,
        "lost": 0,
        "new": 0,
        "proposal": 0,
        "qualified": 0,
        "won": 0
      },
      "cpl": 0,
      "engagement": 0,
      "leads": 0,
      "published": 0,
      "qualified": 0,
      "reach": 0,
      "revenue": 0,
      "roas": 0,
      "scheduled": 0,
      "spend": 0,
      "submissions": 0,
      "views": 0,
      "won": 0
    },
    "campaign": {
      "budget": 25000,
      "channels": [],
      "counts": {},
      "end": "",
      "id": 1,
      "kpis": {},
      "name": "Festive Offer",
      "objective": "Awareness",
      "owner": "",
      "pillar": "",
      "recommendations": 0,
      "spent": 0,
      "start": "",
      "status": "draft",
      "workspaceId": "ws_1"
    },
    "content": [],
    "conversion": {
      "forms": [],
      "landing": []
    },
    "leads": [],
    "plan": {
      "channels": [],
      "hasPlan": false,
      "kpis": [],
      "pillar": null
    },
    "status": "ok"
  },
  "workspace": {
    "activity": [
      {
        "at": "2026-09-16T04:32:50.575452+00:00",
        "kind": "lead",
        "text": "Lead Ravi Kumar arrived from manual"
      },
      {
        "at": "2026-09-16T04:32:50.560398+00:00",
        "kind": "lead",
        "text": "Lead Vikram Shah arrived from whatsapp"
      },
      {
        "at": "2026-09-16T04:32:50.540939+00:00",
        "kind": "lead",
        "text": "Lead Asha Rao arrived from form — won, 50000"
      },
      {
        "at": "2026-09-16T04:32:50.531645+00:00",
        "kind": "form",
        "text": "Lead form “Monsoon enquiry” created"
      },
      {
        "at": "2026-09-16T04:32:50.521915+00:00",
        "kind": "landing",
        "text": "Landing page “Monsoon landing” created"
      },
      {
        "at": "2026-09-16T04:32:50.513788+00:00",
        "kind": "content",
        "text": "Content “Terrace before and after” added"
      },
      {
        "at": "2026-09-16T04:32:50.486250+00:00",
        "kind": "published",
        "text": "“Monsoon offer” published to instagram"
      },
      {
        "at": "2026-09-16T04:32:50.473788+00:00",
        "kind": "content",
        "text": "Content “Monsoon offer” added"
      },
      {
        "at": "2026-09-16T04:32:50.463908+00:00",
        "kind": "campaign",
        "text": "Campaign “Monsoon Drive” created"
      }
    ],
    "analytics": {
      "budget": 40000,
      "byStage": {
        "appointment": 0,
        "contacted": 0,
        "lost": 0,
        "new": 1,
        "proposal": 0,
        "qualified": 1,
        "won": 1
      },
      "cpl": 4000,
      "engagement": 10.9,
      "leads": 3,
      "published": 1,
      "qualified": 2,
      "reach": 1240,
      "revenue": 50000,
      "roas": 4.17,
      "scheduled": 0,
      "spend": 12000,
      "submissions": 0,
      "views": 0,
      "won": 1
    },
    "campaign": {
      "budget": 40000,
      "channels": [
        "instagram"
      ],
      "counts": {},
      "end": "2026-10-16",
      "id": 2,
      "kpis": {},
      "name": "Monsoon Drive",
      "objective": "Lead generation",
      "owner": "Asha Rao",
      "pillar": "Proof",
      "recommendations": 0,
      "spent": 12000,
      "start": "2026-09-16",
      "status": "draft",
      "workspaceId": "ws_1"
    },
    "content": [
      {
        "assignee": "",
        "attempts": 0,
        "campaignId": 2,
        "caption": "",
        "channel": "instagram",
        "comments": [],
        "date": "2026-09-19",
        "error": "",
        "externalId": "",
        "id": 2,
        "mediaKind": "",
        "mediaUrl": "",
        "metrics": null,
        "permalink": "",
        "publishedAt": null,
        "status": "draft",
        "time": "18:00",
        "title": "Terrace before and after",
        "type": "post",
        "workspaceId": "ws_1"
      },
      {
        "assignee": "",
        "attempts": 1,
        "campaignId": 2,
        "caption": "Free roof check",
        "channel": "instagram",
        "comments": [],
        "date": "2026-09-16",
        "error": "",
        "externalId": "M1",
        "id": 1,
        "mediaKind": "image",
        "mediaUrl": "https://cdn.example.in/monsoon-offer.jpg",
        "metrics": {
          "comments": 12,
          "engagement": 10.9,
          "follows": 0,
          "interactions": 135,
          "likes": 96,
          "profileVisits": 0,
          "reach": 1240,
          "saved": 18,
          "shares": 9,
          "syncedAt": "2026-09-16T04:32:50.503078+00:00",
          "views": 2890
        },
        "permalink": "https://www.instagram.com/p/M1/",
        "publishedAt": "2026-09-16T04:32:50.486250+00:00",
        "status": "published",
        "time": "10:02",
        "title": "Monsoon offer",
        "type": "post",
        "workspaceId": "ws_1"
      }
    ],
    "conversion": {
      "forms": [
        {
          "id": 1,
          "name": "Monsoon enquiry",
          "publicUrl": "/f/H6xH5zit9q4",
          "status": "draft",
          "submissions": 0
        }
      ],
      "landing": [
        {
          "id": 1,
          "name": "Monsoon landing",
          "publicUrl": "/p/fk7ClpK0p2o",
          "status": "draft",
          "views": 0
        }
      ]
    },
    "leads": [
      {
        "created": "2026-09-16",
        "id": 3,
        "name": "Ravi Kumar",
        "owner": "",
        "quality": "warm",
        "source": "manual",
        "stage": "new",
        "value": 0
      },
      {
        "created": "2026-09-16",
        "id": 2,
        "name": "Vikram Shah",
        "owner": "",
        "quality": "warm",
        "source": "whatsapp",
        "stage": "qualified",
        "value": 0
      },
      {
        "created": "2026-09-16",
        "id": 1,
        "name": "Asha Rao",
        "owner": "",
        "quality": "warm",
        "source": "form",
        "stage": "won",
        "value": 50000
      }
    ],
    "plan": {
      "channels": [
        {
          "channel": "instagram",
          "postsPerWeek": 4,
          "role": "Reels and carousels"
        }
      ],
      "hasPlan": true,
      "kpis": [
        {
          "metric": "Enquiries",
          "target": "Aim for 20 this month",
          "why": "First goal"
        }
      ],
      "pillar": {
        "name": "Proof",
        "share": 40,
        "why": "Show real work."
      }
    },
    "status": "ok"
  }
};

export default campaign;
