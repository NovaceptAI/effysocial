// Onboarding payloads captured from the engine's test flow (tests/test_effy_onboarding.py)
// on 15 Sep 2026: a business choosing both offers through to a plan, and a creation-only
// freelancer. Provider credentials were unset, so connections show their honest states.
// Regenerate rather than hand-edit.
const onboarding = {
  "bootstrapCompleted": {
    "org": {
      "id": 1,
      "name": "Roofseal Pune",
      "onboarding": {
        "completed": true,
        "offer": "both"
      },
      "plan": "Trial",
      "type": "business"
    },
    "role": "Workspace admin",
    "status": "ok",
    "user": {
      "email": "asha@roofseal.in",
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
        "industry": "Waterproofing",
        "location": "Pune",
        "logo": "✦",
        "managerId": 1,
        "name": "Roofseal Pune"
      }
    ]
  },
  "bootstrapFresh": {
    "org": {
      "id": 1,
      "name": "Asha Rao's workspace",
      "onboarding": {
        "completed": false,
        "offer": null
      },
      "plan": "Trial",
      "type": "business"
    },
    "role": "Workspace admin",
    "status": "ok",
    "user": {
      "email": "asha@roofseal.in",
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
        "industry": "",
        "location": "",
        "logo": "✦",
        "managerId": 1,
        "name": "Asha Rao's workspace"
      }
    ]
  },
  "brand": {
    "brain": {
      "approved": {
        "data": [],
        "sources": [],
        "status": "empty"
      },
      "competitors": {
        "data": [],
        "sources": [],
        "status": "empty"
      },
      "completeness": 0,
      "faqs": {
        "data": [],
        "sources": [],
        "status": "empty"
      },
      "lastUpdated": "—",
      "legal": {
        "data": [],
        "sources": [],
        "status": "empty"
      },
      "needsReview": 0,
      "objections": {
        "data": [],
        "sources": [],
        "status": "empty"
      },
      "offers": {
        "data": [],
        "sources": [],
        "status": "empty"
      },
      "personas": {
        "data": [],
        "sources": [],
        "status": "empty"
      },
      "products": {
        "data": [],
        "sources": [],
        "status": "empty"
      },
      "prohibited": {
        "data": [],
        "sources": [],
        "status": "empty"
      },
      "sources": {
        "data": [],
        "sources": [],
        "status": "empty"
      },
      "summary": {
        "data": "",
        "sources": [],
        "status": "empty"
      },
      "tone": {
        "data": [],
        "sources": [],
        "status": "empty"
      },
      "visual": {
        "data": {
          "colors": [],
          "fonts": []
        },
        "sources": [],
        "status": "empty"
      }
    },
    "status": "ok"
  },
  "brandAfterLink": {
    "brain": {
      "approved": {
        "data": [],
        "sources": [],
        "status": "empty"
      },
      "competitors": {
        "data": [],
        "sources": [],
        "status": "empty"
      },
      "completeness": 0,
      "faqs": {
        "data": [],
        "sources": [],
        "status": "empty"
      },
      "lastUpdated": "—",
      "legal": {
        "data": [],
        "sources": [],
        "status": "empty"
      },
      "needsReview": 0,
      "objections": {
        "data": [],
        "sources": [],
        "status": "empty"
      },
      "offers": {
        "data": [],
        "sources": [],
        "status": "empty"
      },
      "personas": {
        "data": [],
        "sources": [],
        "status": "empty"
      },
      "products": {
        "data": [],
        "sources": [],
        "status": "empty"
      },
      "prohibited": {
        "data": [],
        "sources": [],
        "status": "empty"
      },
      "sources": {
        "data": [
          {
            "chars": 0,
            "confidence": 90,
            "date": "2026-09-15",
            "freshness": "fresh",
            "id": 1,
            "name": "https://roofseal.in",
            "ref": "https://roofseal.in",
            "type": "website"
          }
        ],
        "sources": [],
        "status": "good"
      },
      "summary": {
        "data": "",
        "sources": [],
        "status": "empty"
      },
      "tone": {
        "data": [],
        "sources": [],
        "status": "empty"
      },
      "visual": {
        "data": {
          "colors": [],
          "fonts": []
        },
        "sources": [],
        "status": "empty"
      }
    },
    "status": "ok"
  },
  "brandLink": {
    "source": {
      "chars": 0,
      "confidence": 90,
      "date": "2026-09-15",
      "freshness": "fresh",
      "id": 1,
      "name": "https://roofseal.in",
      "ref": "https://roofseal.in",
      "type": "website"
    },
    "status": "ok"
  },
  "complete": {
    "onboarding": {
      "completedAt": "2026-09-15T00:51:51.358848+00:00",
      "details": {
        "currency": "INR",
        "industry": "Waterproofing",
        "location": "Pune",
        "name": "Roofseal Pune",
        "teamSize": "1-5",
        "timezone": "Asia/Kolkata",
        "website": "https://roofseal.in"
      },
      "goals": [
        "Generate leads",
        "Get phone calls"
      ],
      "offer": "both",
      "orgType": "business",
      "step": "connect"
    },
    "status": "ok"
  },
  "completeTooEarly": {
    "body": {
      "message": "Generate your first plan before finishing.",
      "status": "error"
    },
    "status": 400
  },
  "connectPending": {
    "setup": [
      "Create a Meta app at developers.facebook.com (Business type), complete business verification, then set META_APP_ID / META_APP_SECRET in the engine .env."
    ],
    "state": "pending_credentials",
    "status": "ok"
  },
  "connectRedirect": {
    "redirect": "https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=fixture-client&redirect_uri=https%3A%2F%2Feffysocial.effybiz.in%2Fapi%2Feffy%2Fintegrations%2Flinkedin%2Fcallback&scope=openid+profile+email+w_member_social&state=qK1gyo7w5A1FOMguflp_RIYbFvnAB9ZT",
    "state": "redirect",
    "status": "ok"
  },
  "creation": {
    "onboarding": {
      "details": {
        "name": "Meera Studio"
      },
      "offer": "creation",
      "orgType": "freelancer",
      "step": "brand"
    },
    "options": {
      "currencies": [
        "INR",
        "USD",
        "AED",
        "SGD",
        "GBP",
        "EUR"
      ],
      "goals": [
        "Increase awareness",
        "Grow engagement",
        "Generate leads",
        "WhatsApp conversations",
        "Get phone calls",
        "Book appointments",
        "Ecommerce sales",
        "Customer care"
      ],
      "offers": [
        "creation",
        "marketing",
        "both"
      ],
      "orgTypes": [
        "business",
        "agency",
        "freelancer"
      ],
      "teamSizes": [
        "1-5",
        "6-20",
        "21-50",
        "50+"
      ],
      "timezones": [
        "Asia/Kolkata",
        "Asia/Dubai",
        "Asia/Singapore",
        "Europe/London",
        "America/New_York",
        "UTC"
      ]
    },
    "org": {
      "id": 2,
      "name": "Meera Studio",
      "type": "freelancer"
    },
    "plan": null,
    "status": "ok",
    "workspace": {
      "accent": "#e84a33",
      "dbId": 2,
      "id": "ws_2",
      "industry": "",
      "location": "",
      "logo": "✦",
      "managerId": 2,
      "name": "Meera Studio"
    }
  },
  "creationComplete": {
    "onboarding": {
      "completedAt": "2026-09-15T00:51:51.515548+00:00",
      "details": {
        "name": "Meera Studio"
      },
      "offer": "creation",
      "orgType": "freelancer",
      "step": "brand"
    },
    "status": "ok"
  },
  "fresh": {
    "onboarding": {},
    "options": {
      "currencies": [
        "INR",
        "USD",
        "AED",
        "SGD",
        "GBP",
        "EUR"
      ],
      "goals": [
        "Increase awareness",
        "Grow engagement",
        "Generate leads",
        "WhatsApp conversations",
        "Get phone calls",
        "Book appointments",
        "Ecommerce sales",
        "Customer care"
      ],
      "offers": [
        "creation",
        "marketing",
        "both"
      ],
      "orgTypes": [
        "business",
        "agency",
        "freelancer"
      ],
      "teamSizes": [
        "1-5",
        "6-20",
        "21-50",
        "50+"
      ],
      "timezones": [
        "Asia/Kolkata",
        "Asia/Dubai",
        "Asia/Singapore",
        "Europe/London",
        "America/New_York",
        "UTC"
      ]
    },
    "org": {
      "id": 1,
      "name": "Asha Rao's workspace",
      "type": "business"
    },
    "plan": null,
    "status": "ok",
    "workspace": {
      "accent": "#e84a33",
      "dbId": 1,
      "id": "ws_1",
      "industry": "",
      "location": "",
      "logo": "✦",
      "managerId": 1,
      "name": "Asha Rao's workspace"
    }
  },
  "integrations": {
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
  "plan": {
    "plan": {
      "createdAt": "2026-09-15T00:51:51.348795",
      "id": 1,
      "inputs": {
        "brandBrain": false,
        "connected": [],
        "currency": "INR",
        "documents": false,
        "goals": [
          "Generate leads",
          "Get phone calls"
        ],
        "industry": "Waterproofing",
        "location": "Pune",
        "name": "Roofseal Pune",
        "offer": "both",
        "orgType": "business",
        "teamSize": "1-5",
        "website": "https://roofseal.in"
      },
      "month": "2026-09",
      "plan": {
        "channels": [
          {
            "channel": "instagram",
            "postsPerWeek": 4,
            "role": "Reels showing repairs"
          },
          {
            "channel": "whatsapp",
            "postsPerWeek": 2,
            "role": "Follow up enquiries"
          }
        ],
        "firstWeek": [
          "Post the leak-check reel",
          "Set up the WhatsApp greeting"
        ],
        "funnel": [
          "Reel",
          "WhatsApp chat",
          "Inspection booked"
        ],
        "ideas": [
          {
            "channel": "instagram",
            "format": "Reel",
            "pillar": "Educational",
            "title": "Idea 0"
          },
          {
            "channel": "instagram",
            "format": "Reel",
            "pillar": "Proof",
            "title": "Idea 1"
          },
          {
            "channel": "instagram",
            "format": "Reel",
            "pillar": "Educational",
            "title": "Idea 2"
          },
          {
            "channel": "instagram",
            "format": "Reel",
            "pillar": "Proof",
            "title": "Idea 3"
          },
          {
            "channel": "instagram",
            "format": "Reel",
            "pillar": "Educational",
            "title": "Idea 4"
          },
          {
            "channel": "instagram",
            "format": "Reel",
            "pillar": "Proof",
            "title": "Idea 5"
          },
          {
            "channel": "instagram",
            "format": "Reel",
            "pillar": "Educational",
            "title": "Idea 6"
          },
          {
            "channel": "instagram",
            "format": "Reel",
            "pillar": "Proof",
            "title": "Idea 7"
          },
          {
            "channel": "instagram",
            "format": "Reel",
            "pillar": "Educational",
            "title": "Idea 8"
          },
          {
            "channel": "instagram",
            "format": "Reel",
            "pillar": "Proof",
            "title": "Idea 9"
          },
          {
            "channel": "instagram",
            "format": "Reel",
            "pillar": "Educational",
            "title": "Idea 10"
          },
          {
            "channel": "instagram",
            "format": "Reel",
            "pillar": "Proof",
            "title": "Idea 11"
          }
        ],
        "kpis": [
          {
            "metric": "Inspections booked",
            "target": "Aim for 20 in the month",
            "why": "Main goal"
          }
        ],
        "pillars": [
          {
            "name": "Educational",
            "share": 40,
            "why": "Homeowners don't know leaks start small."
          },
          {
            "name": "Proof",
            "share": 30,
            "why": "Before and after work builds trust."
          },
          {
            "name": "Offer",
            "share": 30,
            "why": "A monsoon inspection gives a reason to call."
          }
        ],
        "summary": "Win monsoon roof-repair enquiries in Pune from homeowners who put off leaks."
      },
      "source": "onboarding",
      "workspace": "ws_1"
    },
    "status": "ok"
  },
  "planFailed": {
    "body": {
      "message": "Couldn't write the plan just now — please try again.",
      "status": "error"
    },
    "status": 503
  },
  "saved": {
    "onboarding": {
      "details": {
        "currency": "INR",
        "industry": "Waterproofing",
        "location": "Pune",
        "name": "Roofseal Pune",
        "teamSize": "1-5",
        "timezone": "Asia/Kolkata",
        "website": "https://roofseal.in"
      },
      "goals": [
        "Generate leads",
        "Get phone calls"
      ],
      "offer": "both",
      "orgType": "business",
      "step": "connect"
    },
    "options": {
      "currencies": [
        "INR",
        "USD",
        "AED",
        "SGD",
        "GBP",
        "EUR"
      ],
      "goals": [
        "Increase awareness",
        "Grow engagement",
        "Generate leads",
        "WhatsApp conversations",
        "Get phone calls",
        "Book appointments",
        "Ecommerce sales",
        "Customer care"
      ],
      "offers": [
        "creation",
        "marketing",
        "both"
      ],
      "orgTypes": [
        "business",
        "agency",
        "freelancer"
      ],
      "teamSizes": [
        "1-5",
        "6-20",
        "21-50",
        "50+"
      ],
      "timezones": [
        "Asia/Kolkata",
        "Asia/Dubai",
        "Asia/Singapore",
        "Europe/London",
        "America/New_York",
        "UTC"
      ]
    },
    "org": {
      "id": 1,
      "name": "Roofseal Pune",
      "type": "business"
    },
    "plan": null,
    "status": "ok",
    "workspace": {
      "accent": "#e84a33",
      "dbId": 1,
      "id": "ws_1",
      "industry": "Waterproofing",
      "location": "Pune",
      "logo": "✦",
      "managerId": 1,
      "name": "Roofseal Pune"
    }
  },
  "savedPatch": {
    "onboarding": {
      "details": {
        "currency": "INR",
        "industry": "Waterproofing",
        "location": "Pune",
        "name": "Roofseal Pune",
        "teamSize": "1-5",
        "timezone": "Asia/Kolkata",
        "website": "https://roofseal.in"
      },
      "goals": [
        "Generate leads",
        "Get phone calls"
      ],
      "offer": "both",
      "orgType": "business",
      "step": "connect"
    },
    "org": {
      "id": 1,
      "name": "Roofseal Pune",
      "type": "business"
    },
    "status": "ok"
  }
};

export default onboarding;
