// Campaign report payloads captured from the engine's test flow (launch plan 5.10;
// tests/test_effy_reports.py) on 17 Sep 2026: a campaign with spend, leads and a measured post,
// one with nothing yet, a share link made and one revoked, the public view and an ended link.
// Regenerate rather than hand-edit.
const reports = {
 "bootstrap": {
  "org": {
   "id": 1,
   "name": "user-1e8854e158's workspace",
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
     "endsAt": "2026-09-30T20:14:11.567440+00:00",
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
   "email": "user-1e8854e158@test.in",
   "email_verified": false,
   "id": 1,
   "is_admin": false,
   "name": "user-1e8854e158",
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
    "name": "user-1e8854e158's workspace"
   }
  ]
 },
 "campaigns": {
  "campaigns": [
   {
    "budget": 0,
    "channels": [],
    "counts": {},
    "end": "",
    "id": 2,
    "kpis": {},
    "name": "Diwali Push",
    "objective": "Lead generation",
    "owner": "",
    "pillar": "",
    "recommendations": 0,
    "spent": 0,
    "start": "",
    "status": "draft",
    "workspaceId": "ws_1"
   },
   {
    "budget": 40000,
    "channels": [
     "instagram"
    ],
    "counts": {},
    "end": "",
    "id": 1,
    "kpis": {},
    "name": "Monsoon Drive",
    "objective": "Lead generation",
    "owner": "",
    "pillar": "",
    "recommendations": 0,
    "spent": 12000,
    "start": "",
    "status": "draft",
    "workspaceId": "ws_1"
   }
  ],
  "status": "ok"
 },
 "emptyReport": {
  "report": {
   "actions": [
    {
     "key": "landing",
     "severity": "warn",
     "text": "No landing page attached — ad clicks have nowhere to convert."
    },
    {
     "key": "form",
     "severity": "warn",
     "text": "No lead form attached — enquiries can't reach the pipeline."
    },
    {
     "key": "content",
     "severity": "info",
     "text": "No content attached yet — create posts for this campaign."
    }
   ],
   "attachments": {
    "content": 0,
    "forms": 0,
    "landing": 0
   },
   "business": {
    "accent": "#e84a33",
    "logo": "✦",
    "name": "user-1e8854e158's workspace",
    "preparedBy": "user-1e8854e158's workspace"
   },
   "byStage": {
    "appointment": 0,
    "contacted": 0,
    "lost": 0,
    "new": 0,
    "proposal": 0,
    "qualified": 0,
    "won": 0
   },
   "campaign": {
    "channels": [],
    "end": null,
    "id": 2,
    "name": "Diwali Push",
    "objective": "Lead generation",
    "start": null,
    "status": "draft"
   },
   "funnel": [
    {
     "key": "views",
     "label": "Landing page views",
     "value": 0
    },
    {
     "key": "submissions",
     "label": "Form submissions",
     "value": 0
    },
    {
     "key": "leads",
     "label": "Leads",
     "value": 0
    },
    {
     "key": "qualified",
     "label": "Qualified",
     "value": 0
    },
    {
     "key": "won",
     "label": "Won",
     "value": 0
    }
   ],
   "generatedAt": "2026-09-16T20:14:11.706143+00:00",
   "numbers": {
    "budget": 0,
    "cpl": null,
    "engagement": null,
    "leads": 0,
    "pacing": null,
    "published": 0,
    "qualified": 0,
    "reach": null,
    "revenue": 0,
    "roas": null,
    "scheduled": 0,
    "spend": 0,
    "submissions": 0,
    "views": 0,
    "won": 0
   },
   "topContent": []
  },
  "status": "ok"
 },
 "ended": [
  410,
  {
   "message": "This report link has ended. Ask for a new one.",
   "status": "error"
  }
 ],
 "public": {
  "expiresAt": "2026-10-16T20:14:11.639704+00:00",
  "report": {
   "actions": [
    {
     "key": "landing",
     "severity": "warn",
     "text": "No landing page attached — ad clicks have nowhere to convert."
    },
    {
     "key": "form",
     "severity": "warn",
     "text": "No lead form attached — enquiries can't reach the pipeline."
    }
   ],
   "attachments": {
    "content": 2,
    "forms": 0,
    "landing": 0
   },
   "business": {
    "accent": "#e84a33",
    "logo": "✦",
    "name": "user-1e8854e158's workspace",
    "preparedBy": "user-1e8854e158's workspace"
   },
   "byStage": {
    "appointment": 0,
    "contacted": 0,
    "lost": 0,
    "new": 1,
    "proposal": 0,
    "qualified": 1,
    "won": 1
   },
   "campaign": {
    "channels": [
     "instagram"
    ],
    "end": null,
    "id": 1,
    "name": "Monsoon Drive",
    "objective": "Lead generation",
    "start": null,
    "status": "draft"
   },
   "funnel": [
    {
     "key": "views",
     "label": "Landing page views",
     "value": 0
    },
    {
     "key": "submissions",
     "label": "Form submissions",
     "value": 0
    },
    {
     "key": "leads",
     "label": "Leads",
     "value": 3
    },
    {
     "key": "qualified",
     "label": "Qualified",
     "value": 2
    },
    {
     "key": "won",
     "label": "Won",
     "value": 1
    }
   ],
   "generatedAt": "2026-09-16T20:14:11.647803+00:00",
   "numbers": {
    "budget": 40000,
    "cpl": 4000,
    "engagement": 10.9,
    "leads": 3,
    "pacing": 30,
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
   "topContent": [
    {
     "channel": "instagram",
     "engagement": 10.9,
     "permalink": "https://www.instagram.com/p/r1/",
     "reach": 1240,
     "title": "Terrace before and after",
     "type": "reel"
    }
   ]
  },
  "sharedAt": "2026-09-16T20:14:11.639704+00:00",
  "status": "ok"
 },
 "report": {
  "report": {
   "actions": [
    {
     "key": "landing",
     "severity": "warn",
     "text": "No landing page attached — ad clicks have nowhere to convert."
    },
    {
     "key": "form",
     "severity": "warn",
     "text": "No lead form attached — enquiries can't reach the pipeline."
    }
   ],
   "attachments": {
    "content": 2,
    "forms": 0,
    "landing": 0
   },
   "business": {
    "accent": "#e84a33",
    "logo": "✦",
    "name": "user-1e8854e158's workspace",
    "preparedBy": "user-1e8854e158's workspace"
   },
   "byStage": {
    "appointment": 0,
    "contacted": 0,
    "lost": 0,
    "new": 1,
    "proposal": 0,
    "qualified": 1,
    "won": 1
   },
   "campaign": {
    "channels": [
     "instagram"
    ],
    "end": null,
    "id": 1,
    "name": "Monsoon Drive",
    "objective": "Lead generation",
    "start": null,
    "status": "draft"
   },
   "funnel": [
    {
     "key": "views",
     "label": "Landing page views",
     "value": 0
    },
    {
     "key": "submissions",
     "label": "Form submissions",
     "value": 0
    },
    {
     "key": "leads",
     "label": "Leads",
     "value": 3
    },
    {
     "key": "qualified",
     "label": "Qualified",
     "value": 2
    },
    {
     "key": "won",
     "label": "Won",
     "value": 1
    }
   ],
   "generatedAt": "2026-09-16T20:14:11.702109+00:00",
   "numbers": {
    "budget": 40000,
    "cpl": 4000,
    "engagement": 10.9,
    "leads": 3,
    "pacing": 30,
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
   "topContent": [
    {
     "channel": "instagram",
     "engagement": 10.9,
     "permalink": "https://www.instagram.com/p/r1/",
     "reach": 1240,
     "title": "Terrace before and after",
     "type": "reel"
    }
   ]
  },
  "status": "ok"
 },
 "shareCreated": {
  "share": {
   "asOf": "2026-09-16T20:14:11.647803+00:00",
   "campaignId": 1,
   "createdAt": "2026-09-16T20:14:11.639704+00:00",
   "createdBy": "user-1e8854e158",
   "expiresAt": "2026-10-16T20:14:11.639704+00:00",
   "id": 1,
   "revokedAt": null,
   "state": "active",
   "views": 0
  },
  "status": "ok",
  "url": "/report/Gli62jhdKSxGHAjBcS3xyuAGGrvGCdAJ"
 },
 "shares": {
  "shares": [
   {
    "asOf": "2026-09-16T20:14:11.663180+00:00",
    "campaignId": 1,
    "createdAt": "2026-09-16T20:14:11.660378+00:00",
    "createdBy": "user-1e8854e158",
    "expiresAt": "2026-09-23T20:14:11.660378+00:00",
    "id": 2,
    "revokedAt": "2026-09-16T20:14:11.672827+00:00",
    "state": "revoked",
    "views": 0
   },
   {
    "asOf": "2026-09-16T20:14:11.647803+00:00",
    "campaignId": 1,
    "createdAt": "2026-09-16T20:14:11.639704+00:00",
    "createdBy": "user-1e8854e158",
    "expiresAt": "2026-10-16T20:14:11.639704+00:00",
    "id": 1,
    "revokedAt": null,
    "state": "active",
    "views": 1
   }
  ],
  "status": "ok"
 }
};

export default reports;
