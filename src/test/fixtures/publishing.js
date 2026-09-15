// Publishing payloads captured from the engine's test flow (tests/test_effy_publishing.py, with the
// fake Graph API from conftest) on 15 Sep 2026. Regenerate rather than hand-edit.
const publishing = {
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
          "endsAt": "2026-09-29T14:43:15.531619+00:00",
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
  "checkPublished": {
    "post": {
      "assignee": "",
      "attempts": 1,
      "campaignId": null,
      "caption": "Still going",
      "channel": "instagram",
      "comments": [],
      "date": "2026-09-15",
      "error": "",
      "externalId": "M4",
      "id": 4,
      "mediaKind": "video",
      "mediaUrl": "https://cdn.example.in/monsoon-reel.mp4",
      "metrics": null,
      "permalink": "https://www.instagram.com/p/M4/",
      "publishedAt": "2026-09-15T14:43:15.745486+00:00",
      "status": "published",
      "time": "20:13",
      "title": "Still going",
      "type": "reel",
      "workspaceId": "ws_1"
    },
    "status": "ok"
  },
  "httpRefused": {
    "body": {
      "message": "A public image URL (https) is required by Instagram.",
      "status": "error"
    },
    "status": 400
  },
  "imageFailed": {
    "body": {
      "message": "The aspect ratio is not supported.",
      "post": {
        "assignee": "",
        "attempts": 1,
        "campaignId": null,
        "caption": "Wide banner",
        "channel": "instagram",
        "comments": [],
        "date": "2026-09-15",
        "error": "The aspect ratio is not supported.",
        "externalId": "",
        "id": 3,
        "mediaKind": "image",
        "mediaUrl": "https://cdn.example.in/monsoon-offer.jpg",
        "metrics": null,
        "permalink": "",
        "publishedAt": null,
        "status": "failed",
        "time": "20:13",
        "title": "Wide banner",
        "type": "post",
        "workspaceId": "ws_1"
      },
      "postId": 3,
      "status": "error"
    },
    "status": 502
  },
  "imagePublished": {
    "mediaId": "M1",
    "permalink": "https://www.instagram.com/p/M1/",
    "post": {
      "assignee": "",
      "attempts": 1,
      "campaignId": null,
      "caption": "Monsoon offer: free roof check this week.\n\n#monsoon #roofing",
      "channel": "instagram",
      "comments": [],
      "date": "2026-09-15",
      "error": "",
      "externalId": "M1",
      "id": 1,
      "mediaKind": "image",
      "mediaUrl": "https://cdn.example.in/monsoon-offer.jpg",
      "metrics": null,
      "permalink": "https://www.instagram.com/p/M1/",
      "publishedAt": "2026-09-15T14:43:15.608656+00:00",
      "status": "published",
      "time": "20:13",
      "title": "Monsoon offer",
      "type": "post",
      "workspaceId": "ws_1"
    },
    "postId": 1,
    "status": "ok"
  },
  "integrationsConnected": {
    "integrations": [
      {
        "account": "@northwind.in",
        "category": "Social publishing",
        "credsConfigured": false,
        "label": "Instagram",
        "lastSync": "2026-09-15T14:43:15.575376",
        "provider": "instagram",
        "state": "connected"
      },
      {
        "account": "",
        "category": "Social publishing",
        "credsConfigured": false,
        "label": "Facebook Page",
        "lastSync": null,
        "provider": "facebook_page",
        "state": "pending_credentials"
      },
      {
        "account": "",
        "category": "Social publishing",
        "credsConfigured": false,
        "label": "LinkedIn",
        "lastSync": null,
        "provider": "linkedin",
        "state": "pending_credentials"
      },
      {
        "account": "",
        "category": "Social publishing",
        "credsConfigured": false,
        "label": "Google Business Profile",
        "lastSync": null,
        "provider": "google_business",
        "state": "pending_credentials"
      },
      {
        "account": "",
        "category": "Advertising",
        "credsConfigured": false,
        "label": "Meta Ads",
        "lastSync": null,
        "provider": "meta_ads",
        "state": "pending_credentials"
      },
      {
        "account": "",
        "category": "Advertising",
        "credsConfigured": false,
        "label": "Google Ads",
        "lastSync": null,
        "provider": "google_ads",
        "state": "pending_credentials"
      },
      {
        "account": "",
        "category": "Analytics",
        "credsConfigured": false,
        "label": "Google Analytics 4",
        "lastSync": null,
        "provider": "ga4",
        "state": "pending_credentials"
      },
      {
        "account": "",
        "category": "Messaging",
        "credsConfigured": false,
        "label": "WhatsApp Cloud API",
        "lastSync": null,
        "provider": "whatsapp",
        "state": "pending_credentials"
      }
    ],
    "status": "ok"
  },
  "integrationsExpired": {
    "integrations": [
      {
        "account": "@northwind.in",
        "category": "Social publishing",
        "credsConfigured": false,
        "label": "Instagram",
        "lastSync": "2026-09-15T14:43:15.778728",
        "provider": "instagram",
        "state": "expired"
      },
      {
        "account": "",
        "category": "Social publishing",
        "credsConfigured": false,
        "label": "Facebook Page",
        "lastSync": null,
        "provider": "facebook_page",
        "state": "pending_credentials"
      },
      {
        "account": "",
        "category": "Social publishing",
        "credsConfigured": false,
        "label": "LinkedIn",
        "lastSync": null,
        "provider": "linkedin",
        "state": "pending_credentials"
      },
      {
        "account": "",
        "category": "Social publishing",
        "credsConfigured": false,
        "label": "Google Business Profile",
        "lastSync": null,
        "provider": "google_business",
        "state": "pending_credentials"
      },
      {
        "account": "",
        "category": "Advertising",
        "credsConfigured": false,
        "label": "Meta Ads",
        "lastSync": null,
        "provider": "meta_ads",
        "state": "pending_credentials"
      },
      {
        "account": "",
        "category": "Advertising",
        "credsConfigured": false,
        "label": "Google Ads",
        "lastSync": null,
        "provider": "google_ads",
        "state": "pending_credentials"
      },
      {
        "account": "",
        "category": "Analytics",
        "credsConfigured": false,
        "label": "Google Analytics 4",
        "lastSync": null,
        "provider": "ga4",
        "state": "pending_credentials"
      },
      {
        "account": "",
        "category": "Messaging",
        "credsConfigured": false,
        "label": "WhatsApp Cloud API",
        "lastSync": null,
        "provider": "whatsapp",
        "state": "pending_credentials"
      }
    ],
    "status": "ok"
  },
  "integrationsNone": {
    "integrations": [
      {
        "account": "",
        "category": "Social publishing",
        "credsConfigured": false,
        "label": "Instagram",
        "lastSync": null,
        "provider": "instagram",
        "state": "pending_credentials"
      },
      {
        "account": "",
        "category": "Social publishing",
        "credsConfigured": false,
        "label": "Facebook Page",
        "lastSync": null,
        "provider": "facebook_page",
        "state": "pending_credentials"
      },
      {
        "account": "",
        "category": "Social publishing",
        "credsConfigured": false,
        "label": "LinkedIn",
        "lastSync": null,
        "provider": "linkedin",
        "state": "pending_credentials"
      },
      {
        "account": "",
        "category": "Social publishing",
        "credsConfigured": false,
        "label": "Google Business Profile",
        "lastSync": null,
        "provider": "google_business",
        "state": "pending_credentials"
      },
      {
        "account": "",
        "category": "Advertising",
        "credsConfigured": false,
        "label": "Meta Ads",
        "lastSync": null,
        "provider": "meta_ads",
        "state": "pending_credentials"
      },
      {
        "account": "",
        "category": "Advertising",
        "credsConfigured": false,
        "label": "Google Ads",
        "lastSync": null,
        "provider": "google_ads",
        "state": "pending_credentials"
      },
      {
        "account": "",
        "category": "Analytics",
        "credsConfigured": false,
        "label": "Google Analytics 4",
        "lastSync": null,
        "provider": "ga4",
        "state": "pending_credentials"
      },
      {
        "account": "",
        "category": "Messaging",
        "credsConfigured": false,
        "label": "WhatsApp Cloud API",
        "lastSync": null,
        "provider": "whatsapp",
        "state": "pending_credentials"
      }
    ],
    "status": "ok"
  },
  "notConnected": {
    "body": {
      "message": "Connect an Instagram account first (Integrations).",
      "status": "error"
    },
    "status": 400
  },
  "posts": {
    "posts": [
      {
        "assignee": "",
        "attempts": 0,
        "campaignId": null,
        "caption": "",
        "channel": "instagram",
        "comments": [],
        "date": "",
        "error": "",
        "externalId": "",
        "id": 5,
        "mediaKind": "",
        "mediaUrl": "",
        "metrics": null,
        "permalink": "",
        "publishedAt": null,
        "status": "draft",
        "time": "",
        "title": "Draft idea",
        "type": "post",
        "workspaceId": "ws_1"
      },
      {
        "assignee": "",
        "attempts": 1,
        "campaignId": null,
        "caption": "Monsoon offer: free roof check this week.\n\n#monsoon #roofing",
        "channel": "instagram",
        "comments": [],
        "date": "2026-09-15",
        "error": "",
        "externalId": "M1",
        "id": 1,
        "mediaKind": "image",
        "mediaUrl": "https://cdn.example.in/monsoon-offer.jpg",
        "metrics": null,
        "permalink": "https://www.instagram.com/p/M1/",
        "publishedAt": "2026-09-15T14:43:15.608656+00:00",
        "status": "published",
        "time": "20:13",
        "title": "Monsoon offer",
        "type": "post",
        "workspaceId": "ws_1"
      },
      {
        "assignee": "",
        "attempts": 1,
        "campaignId": null,
        "caption": "Before the rains",
        "channel": "instagram",
        "comments": [],
        "date": "2026-09-15",
        "error": "",
        "externalId": "M2",
        "id": 2,
        "mediaKind": "video",
        "mediaUrl": "https://cdn.example.in/monsoon-reel.mp4",
        "metrics": null,
        "permalink": "https://www.instagram.com/p/M2/",
        "publishedAt": "2026-09-15T14:43:15.652080+00:00",
        "status": "published",
        "time": "20:13",
        "title": "Before the rains",
        "type": "reel",
        "workspaceId": "ws_1"
      },
      {
        "assignee": "",
        "attempts": 1,
        "campaignId": null,
        "caption": "Wide banner",
        "channel": "instagram",
        "comments": [],
        "date": "2026-09-15",
        "error": "The aspect ratio is not supported.",
        "externalId": "",
        "id": 3,
        "mediaKind": "image",
        "mediaUrl": "https://cdn.example.in/monsoon-offer.jpg",
        "metrics": null,
        "permalink": "",
        "publishedAt": null,
        "status": "failed",
        "time": "20:13",
        "title": "Wide banner",
        "type": "post",
        "workspaceId": "ws_1"
      },
      {
        "assignee": "",
        "attempts": 1,
        "campaignId": null,
        "caption": "Still going",
        "channel": "instagram",
        "comments": [],
        "date": "2026-09-15",
        "error": "",
        "externalId": "",
        "id": 4,
        "mediaKind": "video",
        "mediaUrl": "https://cdn.example.in/monsoon-reel.mp4",
        "metrics": null,
        "permalink": "",
        "publishedAt": null,
        "status": "publishing",
        "time": "20:13",
        "title": "Still going",
        "type": "reel",
        "workspaceId": "ws_1"
      }
    ],
    "status": "ok"
  },
  "postsAfterRetry": {
    "posts": [
      {
        "assignee": "",
        "attempts": 0,
        "campaignId": null,
        "caption": "",
        "channel": "instagram",
        "comments": [],
        "date": "",
        "error": "",
        "externalId": "",
        "id": 5,
        "mediaKind": "",
        "mediaUrl": "",
        "metrics": null,
        "permalink": "",
        "publishedAt": null,
        "status": "draft",
        "time": "",
        "title": "Draft idea",
        "type": "post",
        "workspaceId": "ws_1"
      },
      {
        "assignee": "",
        "attempts": 1,
        "campaignId": null,
        "caption": "Monsoon offer: free roof check this week.\n\n#monsoon #roofing",
        "channel": "instagram",
        "comments": [],
        "date": "2026-09-15",
        "error": "",
        "externalId": "M1",
        "id": 1,
        "mediaKind": "image",
        "mediaUrl": "https://cdn.example.in/monsoon-offer.jpg",
        "metrics": null,
        "permalink": "https://www.instagram.com/p/M1/",
        "publishedAt": "2026-09-15T14:43:15.608656+00:00",
        "status": "published",
        "time": "20:13",
        "title": "Monsoon offer",
        "type": "post",
        "workspaceId": "ws_1"
      },
      {
        "assignee": "",
        "attempts": 1,
        "campaignId": null,
        "caption": "Before the rains",
        "channel": "instagram",
        "comments": [],
        "date": "2026-09-15",
        "error": "",
        "externalId": "M2",
        "id": 2,
        "mediaKind": "video",
        "mediaUrl": "https://cdn.example.in/monsoon-reel.mp4",
        "metrics": null,
        "permalink": "https://www.instagram.com/p/M2/",
        "publishedAt": "2026-09-15T14:43:15.652080+00:00",
        "status": "published",
        "time": "20:13",
        "title": "Before the rains",
        "type": "reel",
        "workspaceId": "ws_1"
      },
      {
        "assignee": "",
        "attempts": 2,
        "campaignId": null,
        "caption": "Wide banner",
        "channel": "instagram",
        "comments": [],
        "date": "2026-09-15",
        "error": "",
        "externalId": "M3",
        "id": 3,
        "mediaKind": "image",
        "mediaUrl": "https://cdn.example.in/monsoon-offer.jpg",
        "metrics": null,
        "permalink": "https://www.instagram.com/p/M3/",
        "publishedAt": "2026-09-15T14:43:15.731176+00:00",
        "status": "published",
        "time": "20:13",
        "title": "Wide banner",
        "type": "post",
        "workspaceId": "ws_1"
      },
      {
        "assignee": "",
        "attempts": 1,
        "campaignId": null,
        "caption": "Still going",
        "channel": "instagram",
        "comments": [],
        "date": "2026-09-15",
        "error": "",
        "externalId": "",
        "id": 4,
        "mediaKind": "video",
        "mediaUrl": "https://cdn.example.in/monsoon-reel.mp4",
        "metrics": null,
        "permalink": "",
        "publishedAt": null,
        "status": "publishing",
        "time": "20:13",
        "title": "Still going",
        "type": "reel",
        "workspaceId": "ws_1"
      }
    ],
    "status": "ok"
  },
  "reelChecking": {
    "post": {
      "assignee": "",
      "attempts": 1,
      "campaignId": null,
      "caption": "Before the rains",
      "channel": "instagram",
      "comments": [],
      "date": "2026-09-15",
      "error": "",
      "externalId": "",
      "id": 2,
      "mediaKind": "video",
      "mediaUrl": "https://cdn.example.in/monsoon-reel.mp4",
      "metrics": null,
      "permalink": "",
      "publishedAt": null,
      "status": "publishing",
      "time": "20:13",
      "title": "Before the rains",
      "type": "reel",
      "workspaceId": "ws_1"
    },
    "status": "ok"
  },
  "reelPending": {
    "creationId": "C2",
    "post": {
      "assignee": "",
      "attempts": 1,
      "campaignId": null,
      "caption": "Before the rains",
      "channel": "instagram",
      "comments": [],
      "date": "2026-09-15",
      "error": "",
      "externalId": "",
      "id": 2,
      "mediaKind": "video",
      "mediaUrl": "https://cdn.example.in/monsoon-reel.mp4",
      "metrics": null,
      "permalink": "",
      "publishedAt": null,
      "status": "publishing",
      "time": "20:13",
      "title": "Before the rains",
      "type": "reel",
      "workspaceId": "ws_1"
    },
    "postId": 2,
    "status": "pending"
  },
  "reelPublished": {
    "post": {
      "assignee": "",
      "attempts": 1,
      "campaignId": null,
      "caption": "Before the rains",
      "channel": "instagram",
      "comments": [],
      "date": "2026-09-15",
      "error": "",
      "externalId": "M2",
      "id": 2,
      "mediaKind": "video",
      "mediaUrl": "https://cdn.example.in/monsoon-reel.mp4",
      "metrics": null,
      "permalink": "https://www.instagram.com/p/M2/",
      "publishedAt": "2026-09-15T14:43:15.652080+00:00",
      "status": "published",
      "time": "20:13",
      "title": "Before the rains",
      "type": "reel",
      "workspaceId": "ws_1"
    },
    "status": "ok"
  },
  "retryPublished": {
    "mediaId": "M3",
    "permalink": "https://www.instagram.com/p/M3/",
    "post": {
      "assignee": "",
      "attempts": 2,
      "campaignId": null,
      "caption": "Wide banner",
      "channel": "instagram",
      "comments": [],
      "date": "2026-09-15",
      "error": "",
      "externalId": "M3",
      "id": 3,
      "mediaKind": "image",
      "mediaUrl": "https://cdn.example.in/monsoon-offer.jpg",
      "metrics": null,
      "permalink": "https://www.instagram.com/p/M3/",
      "publishedAt": "2026-09-15T14:43:15.731176+00:00",
      "status": "published",
      "time": "20:13",
      "title": "Wide banner",
      "type": "post",
      "workspaceId": "ws_1"
    },
    "postId": 3,
    "status": "ok"
  },
  "retryRefused": {
    "body": {
      "message": "Connect an Instagram account first (Integrations).",
      "status": "error"
    },
    "status": 400
  },
  "tokenRevoked": {
    "body": {
      "message": "Error validating access token: The session has been invalidated because the user changed their password. Reconnect Instagram in Integrations.",
      "post": {
        "assignee": "",
        "attempts": 1,
        "campaignId": null,
        "caption": "x",
        "channel": "instagram",
        "comments": [],
        "date": "2026-09-15",
        "error": "Error validating access token: The session has been invalidated because the user changed their password. Reconnect Instagram in Integrations.",
        "externalId": "",
        "id": 7,
        "mediaKind": "image",
        "mediaUrl": "https://cdn.example.in/monsoon-offer.jpg",
        "metrics": null,
        "permalink": "",
        "publishedAt": null,
        "status": "failed",
        "time": "20:13",
        "title": "x",
        "type": "post",
        "workspaceId": "ws_1"
      },
      "postId": 7,
      "status": "error"
    },
    "status": 502
  }
};

export default publishing;
