// Creative-performance payloads captured from the engine's test flow (launch plan 5.2;
// tests/test_effy_creative_analytics.py) on 16 Sep 2026. Regenerate rather than hand-edit.
// Each response also carries the mock ad-creative block (`creatives`/`attributes`), which
// the Creatives page renders and this one never reads — dropped here to stay readable.
const creative = {
  "bootstrap": {
    "org": {
      "id": 9,
      "name": "user-3ea59d70d8's workspace",
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
          "endsAt": "2026-09-30T05:40:11.149276+00:00",
          "expired": false
        },
        "usage": {
          "seats": 1,
          "workspaces": 3
        }
      },
      "timezone": "Asia/Kolkata",
      "type": "business"
    },
    "role": "Workspace admin",
    "status": "ok",
    "user": {
      "email": "user-3ea59d70d8@test.in",
      "email_verified": false,
      "id": 9,
      "is_admin": false,
      "name": "user-3ea59d70d8",
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
        "dbId": 9,
        "id": "ws_9",
        "industry": "",
        "location": "",
        "logo": "\u2726",
        "managerId": 9,
        "name": "user-3ea59d70d8's workspace"
      },
      {
        "accent": "#e84a33",
        "dbId": 10,
        "id": "ws_10",
        "industry": "",
        "location": "",
        "logo": "\u2726",
        "managerId": 9,
        "name": "Second site"
      },
      {
        "accent": "#e84a33",
        "dbId": 11,
        "id": "ws_11",
        "industry": "",
        "location": "",
        "logo": "\u2726",
        "managerId": 9,
        "name": "Third"
      }
    ]
  },
  "empty": {
    "mode": "mock",
    "organic": {
      "bestFormat": null,
      "bestHook": null,
      "byFormat": [],
      "byHook": [],
      "measured": 0,
      "posts": [],
      "published": 0
    },
    "provider": "mock",
    "status": "ok"
  },
  "measured": {
    "mode": "mock",
    "organic": {
      "bestFormat": {
        "engagement": 9.1,
        "key": "reel",
        "label": "Reel",
        "posts": 2,
        "reach": 15500
      },
      "bestHook": {
        "engagement": 10.8,
        "key": "story",
        "label": "Statement or story",
        "posts": 1,
        "reach": 9400
      },
      "byFormat": [
        {
          "engagement": 9.1,
          "key": "reel",
          "label": "Reel",
          "posts": 2,
          "reach": 15500
        },
        {
          "engagement": 6.0,
          "key": "post",
          "label": "Post",
          "posts": 2,
          "reach": 6300
        }
      ],
      "byHook": [
        {
          "engagement": 10.8,
          "key": "story",
          "label": "Statement or story",
          "posts": 1,
          "reach": 9400
        },
        {
          "engagement": 7.4,
          "key": "how-to",
          "label": "How-to",
          "posts": 1,
          "reach": 6100
        },
        {
          "engagement": 7.2,
          "key": "question",
          "label": "Question",
          "posts": 1,
          "reach": 4120
        },
        {
          "engagement": 4.8,
          "key": "list",
          "label": "List or number",
          "posts": 1,
          "reach": 2180
        }
      ],
      "measured": 4,
      "posts": [
        {
          "channel": "instagram",
          "hook": "Offer",
          "id": 10,
          "mediaKind": "image",
          "mediaUrl": "https://cdn.example.in/offer.jpg",
          "metrics": null,
          "opening": "Free roof check this week",
          "permalink": "https://www.instagram.com/p/M5/",
          "publishedAt": "2026-09-16T05:40:11.335122",
          "title": "Free check",
          "type": "post"
        },
        {
          "channel": "instagram",
          "hook": "How-to",
          "id": 9,
          "mediaKind": "video",
          "mediaUrl": "https://cdn.example.in/reel.mp4",
          "metrics": {
            "comments": 22,
            "engagement": 7.4,
            "interactions": 450,
            "likes": 300,
            "reach": 6100,
            "saved": 88,
            "shares": 40,
            "syncedAt": "2026-09-16T05:40:11.312062+00:00",
            "views": 8800
          },
          "opening": "How to spot a leak before the ceiling stains",
          "permalink": "https://www.instagram.com/p/M4/",
          "publishedAt": "2026-09-16T05:40:11.301992",
          "title": "Spot a leak",
          "type": "reel"
        },
        {
          "channel": "instagram",
          "hook": "Statement or story",
          "id": 8,
          "mediaKind": "video",
          "mediaUrl": "https://cdn.example.in/reel.mp4",
          "metrics": {
            "comments": 64,
            "engagement": 10.8,
            "interactions": 1012,
            "likes": 720,
            "reach": 9400,
            "saved": 132,
            "shares": 96,
            "syncedAt": "2026-09-16T05:40:11.276405+00:00",
            "views": 14200
          },
          "opening": "We sealed a terrace in Pune yesterday.",
          "permalink": "https://www.instagram.com/p/M3/",
          "publishedAt": "2026-09-16T05:40:11.265697",
          "title": "Pune terrace",
          "type": "reel"
        },
        {
          "channel": "instagram",
          "hook": "List or number",
          "id": 7,
          "mediaKind": "image",
          "mediaUrl": "https://cdn.example.in/offer.jpg",
          "metrics": {
            "comments": 6,
            "engagement": 4.8,
            "follows": 0,
            "interactions": 104,
            "likes": 74,
            "profileVisits": 0,
            "reach": 2180,
            "saved": 19,
            "shares": 5,
            "syncedAt": "2026-09-16T05:40:11.242496+00:00",
            "views": 2600
          },
          "opening": "3 signs your terrace needs work",
          "permalink": "https://www.instagram.com/p/M2/",
          "publishedAt": "2026-09-16T05:40:11.232172",
          "title": "Three signs",
          "type": "post"
        },
        {
          "channel": "instagram",
          "hook": "Question",
          "id": 6,
          "mediaKind": "image",
          "mediaUrl": "https://cdn.example.in/offer.jpg",
          "metrics": {
            "comments": 18,
            "engagement": 7.2,
            "follows": 0,
            "interactions": 296,
            "likes": 210,
            "profileVisits": 0,
            "reach": 4120,
            "saved": 46,
            "shares": 22,
            "syncedAt": "2026-09-16T05:40:11.207739+00:00",
            "views": 5200
          },
          "opening": "Is your roof ready for the rains?",
          "permalink": "https://www.instagram.com/p/M1/",
          "publishedAt": "2026-09-16T05:40:11.196678",
          "title": "Monsoon check",
          "type": "post"
        }
      ],
      "published": 5
    },
    "provider": "mock",
    "status": "ok"
  },
  "unmeasured": {
    "mode": "mock",
    "organic": {
      "bestFormat": null,
      "bestHook": null,
      "byFormat": [],
      "byHook": [],
      "measured": 0,
      "posts": [
        {
          "channel": "instagram",
          "hook": "How-to",
          "id": 11,
          "mediaKind": "image",
          "mediaUrl": "https://cdn.example.in/offer.jpg",
          "metrics": null,
          "opening": "How to keep gutters clear",
          "permalink": "https://www.instagram.com/p/M6/",
          "publishedAt": "2026-09-16T05:40:11.389784",
          "title": "Gutters",
          "type": "post"
        }
      ],
      "published": 1
    },
    "provider": "mock",
    "status": "ok"
  }
};

export default creative;
