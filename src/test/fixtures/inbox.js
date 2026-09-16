// Inbox and review-request payloads captured from the engine's test flow (launch plan 5.8;
// tests/test_effy_inbox_actions.py) on 16 Sep 2026: three conversations (one tagged and escalated
// to a teammate, one tagged), the team, a review link before and after it was made, its public
// page, and private feedback left through it. Regenerate rather than hand-edit.
const inbox = {
 "bootstrap": {
  "org": {
   "id": 1,
   "name": "user-6e0ea653d5's workspace",
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
     "endsAt": "2026-09-30T18:31:38.713534+00:00",
     "expired": false
    },
    "usage": {
     "seats": 2,
     "workspaces": 1
    }
   },
   "timezone": "Asia/Kolkata",
   "type": "business"
  },
  "role": "Workspace admin",
  "status": "ok",
  "user": {
   "email": "user-6e0ea653d5@test.in",
   "email_verified": false,
   "id": 1,
   "is_admin": false,
   "name": "user-6e0ea653d5",
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
    "name": "user-6e0ea653d5's workspace"
   }
  ]
 },
 "conversations": {
  "conversations": [
   {
    "assignee": "Kiran Patil",
    "channel": "instagram",
    "escalation": {
     "at": "2026-09-16T18:31:38.924332+00:00",
     "by": {
      "id": 1,
      "name": "user-6e0ea653d5"
     },
     "note": "Third leak — needs a site visit today",
     "to": {
      "id": 2,
      "name": "Kiran Patil"
     }
    },
    "id": 1,
    "intent": "complaint",
    "kind": "dm",
    "messages": [
     {
      "from": "them",
      "text": "The seal leaked again after the rain",
      "time": "10:42"
     }
    ],
    "person": "Meera Iyer",
    "priority": "urgent",
    "sentiment": "neutral",
    "status": "open",
    "suggestedReply": "Thanks for writing to us.",
    "tags": [
     "site visit",
     "VIP"
    ],
    "unread": true,
    "workspaceId": "ws_1"
   },
   {
    "assignee": "",
    "channel": "instagram",
    "escalation": null,
    "id": 2,
    "intent": "sales",
    "kind": "dm",
    "messages": [
     {
      "from": "them",
      "text": "What does a terrace seal cost for 1,200 sq ft?",
      "time": "10:42"
     }
    ],
    "person": "Rahul Mehta",
    "priority": "normal",
    "sentiment": "neutral",
    "status": "open",
    "suggestedReply": "Thanks for writing to us.",
    "tags": [
     "pricing"
    ],
    "unread": true,
    "workspaceId": "ws_1"
   },
   {
    "assignee": "",
    "channel": "instagram",
    "escalation": null,
    "id": 3,
    "intent": "question",
    "kind": "dm",
    "messages": [
     {
      "from": "them",
      "text": "Do you work in Thane?",
      "time": "10:42"
     }
    ],
    "person": "Priya Nair",
    "priority": "normal",
    "sentiment": "neutral",
    "status": "open",
    "suggestedReply": "Thanks for writing to us.",
    "tags": [],
    "unread": true,
    "workspaceId": "ws_1"
   }
  ],
  "status": "ok"
 },
 "mateId": 2,
 "publicPage": {
  "business": {
   "logo": "✦",
   "name": "user-6e0ea653d5's workspace"
  },
  "sites": [
   {
    "id": "google",
    "label": "Google",
    "url": "https://g.page/r/roofseal/review"
   },
   {
    "id": "other",
    "label": "Our review page",
    "url": "https://www.justdial.com/roofseal"
   }
  ],
  "status": "ok"
 },
 "reviewLink": {
  "link": {
   "clicks": {
    "google": 1
   },
   "publicUrl": "/r/blYuwOvVhhVD",
   "sites": {
    "google": "https://g.page/r/roofseal/review",
    "other": "https://www.justdial.com/roofseal"
   },
   "slug": "blYuwOvVhhVD",
   "visits": 1
  },
  "sites": {
   "facebook": "Facebook",
   "google": "Google",
   "other": "Our review page"
  },
  "status": "ok"
 },
 "reviewLinkNone": {
  "link": null,
  "sites": {
   "facebook": "Facebook",
   "google": "Google",
   "other": "Our review page"
  },
  "status": "ok"
 },
 "reviews": {
  "reviews": [
   {
    "author": "Asha",
    "id": 1,
    "rating": 2,
    "reply": "",
    "responded": false,
    "sentiment": "negative",
    "source": "direct",
    "text": "Came two days late"
   }
  ],
  "status": "ok"
 },
 "team": {
  "invites": [],
  "members": [
   {
    "email": "user-6e0ea653d5@test.in",
    "id": 1,
    "isOwner": true,
    "isYou": true,
    "joined": "2026-09-16",
    "name": "user-6e0ea653d5",
    "role": "Workspace admin",
    "status": "active",
    "userId": 1,
    "verified": false
   },
   {
    "email": "user-aed41ec229@test.in",
    "id": 2,
    "isOwner": false,
    "isYou": false,
    "joined": "2026-09-16",
    "name": "Kiran Patil",
    "role": "Copywriter",
    "status": "active",
    "userId": 2,
    "verified": false
   }
  ],
  "roles": [
   "Agency admin",
   "Workspace admin",
   "Account manager",
   "Copywriter",
   "Client approver",
   "View-only"
  ],
  "status": "ok"
 }
};

export default inbox;
