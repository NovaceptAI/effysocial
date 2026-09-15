// Plan payloads captured from the engine's test flow (tests/test_effy_plans.py) on 15 Sep 2026: one
// agency on a fresh trial, a trial ending in two days, an ended trial, Creative, Growth near and over its
// credits, and the platform admin's organisation list. Regenerate rather than hand-edit.
const plans = {
  "adminOrgs": {
    "orgs": [
      {
        "createdAt": "2026-09-15T10:35:43.662355",
        "creditsUsed": 0,
        "features": [
          "marketing",
          "conversion"
        ],
        "id": 2,
        "limits": {
          "credits": 150,
          "seats": 5,
          "workspaces": 3
        },
        "name": "Platform Admin's workspace",
        "owner": "admin@effysocial.example",
        "plan": "Trial",
        "storedPlan": "Trial",
        "trial": {
          "daysLeft": 14,
          "endsAt": "2026-09-29T10:35:43.662174+00:00",
          "expired": false
        },
        "type": "business",
        "usage": {
          "seats": 1,
          "workspaces": 1
        }
      },
      {
        "createdAt": "2026-09-15T10:35:43.230739",
        "creditsUsed": 510,
        "features": [
          "marketing"
        ],
        "id": 1,
        "limits": {
          "credits": 500,
          "seats": 2,
          "workspaces": 1
        },
        "name": "Northwind",
        "owner": "asha@northwind.in",
        "plan": "Growth",
        "storedPlan": "Growth",
        "trial": null,
        "type": "agency",
        "usage": {
          "seats": 1,
          "workspaces": 1
        }
      }
    ],
    "plans": [
      "Trial",
      "Creative",
      "Growth",
      "Pro",
      "Agency"
    ],
    "status": "ok"
  },
  "adminSetPro": {
    "org": {
      "features": [
        "marketing",
        "conversion"
      ],
      "id": 1,
      "limits": {
        "credits": 1500,
        "seats": 5,
        "workspaces": 3
      },
      "name": "Northwind",
      "plan": "Pro",
      "storedPlan": "Pro",
      "trial": null,
      "usage": {
        "seats": 1,
        "workspaces": 1
      }
    },
    "status": "ok"
  },
  "creativeAds": {
    "body": {
      "code": "plan_required",
      "feature": "conversion",
      "message": "Ads, landing pages, forms and leads are on the Pro plan and above. Your organisation is on Creative. Upgrade to use them.",
      "plan": "Creative",
      "requiredPlan": "Pro",
      "status": "error"
    },
    "status": 403
  },
  "creativeBootstrap": {
    "org": {
      "id": 1,
      "name": "Northwind",
      "onboarding": {
        "completed": false,
        "offer": null
      },
      "plan": "Creative",
      "planInfo": {
        "features": [],
        "limits": {
          "credits": 150,
          "seats": 1,
          "workspaces": 1
        },
        "plan": "Creative",
        "storedPlan": "Creative",
        "trial": null,
        "usage": {
          "seats": 1,
          "workspaces": 1
        }
      },
      "type": "agency"
    },
    "role": "Agency owner",
    "status": "ok",
    "user": {
      "email": "asha@northwind.in",
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
        "name": "Northwind"
      }
    ]
  },
  "creativeSeatLimit": {
    "body": {
      "code": "plan_limit",
      "limit": "seats",
      "message": "Your Creative plan includes 1 seat, and members and pending invites use 1. Upgrade to Growth for 2.",
      "plan": "Creative",
      "status": "error",
      "upgradeTo": "Growth"
    },
    "status": 403
  },
  "creativeTeam": {
    "invites": [],
    "members": [
      {
        "email": "asha@northwind.in",
        "id": 1,
        "isOwner": true,
        "isYou": true,
        "joined": "2026-09-15",
        "name": "Asha Rao",
        "role": "Agency owner",
        "status": "active",
        "userId": 1,
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
  },
  "creativeWorkspaceLimit": {
    "body": {
      "code": "plan_limit",
      "limit": "workspaces",
      "message": "Your Creative plan includes 1 workspace, and you're using 1. Upgrade to Pro for 3.",
      "plan": "Creative",
      "status": "error",
      "upgradeTo": "Pro"
    },
    "status": 403
  },
  "growthBootstrap": {
    "org": {
      "id": 1,
      "name": "Northwind",
      "onboarding": {
        "completed": false,
        "offer": null
      },
      "plan": "Growth",
      "planInfo": {
        "features": [
          "marketing"
        ],
        "limits": {
          "credits": 500,
          "seats": 2,
          "workspaces": 1
        },
        "plan": "Growth",
        "storedPlan": "Growth",
        "trial": null,
        "usage": {
          "seats": 1,
          "workspaces": 1
        }
      },
      "type": "agency"
    },
    "role": "Agency owner",
    "status": "ok",
    "user": {
      "email": "asha@northwind.in",
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
        "name": "Northwind"
      }
    ]
  },
  "growthCreditsNear": {
    "allowance": 500,
    "hasPerformanceMarketing": true,
    "plan": "Growth",
    "planInfo": {
      "features": [
        "marketing"
      ],
      "limits": {
        "credits": 500,
        "seats": 2,
        "workspaces": 1
      },
      "plan": "Growth",
      "storedPlan": "Growth",
      "trial": null,
      "usage": {
        "seats": 1,
        "workspaces": 1
      }
    },
    "remaining": 80,
    "status": "ok",
    "used": 420,
    "warning": "near"
  },
  "growthCreditsOver": {
    "allowance": 500,
    "hasPerformanceMarketing": true,
    "plan": "Growth",
    "planInfo": {
      "features": [
        "marketing"
      ],
      "limits": {
        "credits": 500,
        "seats": 2,
        "workspaces": 1
      },
      "plan": "Growth",
      "storedPlan": "Growth",
      "trial": null,
      "usage": {
        "seats": 1,
        "workspaces": 1
      }
    },
    "remaining": 0.0,
    "status": "ok",
    "used": 510,
    "warning": "over"
  },
  "trialBootstrap": {
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
          "endsAt": "2026-09-29T10:35:43.230020+00:00",
          "expired": false
        },
        "usage": {
          "seats": 1,
          "workspaces": 1
        }
      },
      "type": "agency"
    },
    "role": "Agency owner",
    "status": "ok",
    "user": {
      "email": "asha@northwind.in",
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
        "name": "Northwind"
      }
    ]
  },
  "trialEndedBootstrap": {
    "org": {
      "id": 1,
      "name": "Northwind",
      "onboarding": {
        "completed": false,
        "offer": null
      },
      "plan": "Trial",
      "planInfo": {
        "features": [],
        "limits": {
          "credits": 150,
          "seats": 1,
          "workspaces": 1
        },
        "plan": "Creative",
        "storedPlan": "Trial",
        "trial": {
          "daysLeft": 0,
          "endsAt": "2026-09-15T09:35:43.274886+00:00",
          "expired": true
        },
        "usage": {
          "seats": 1,
          "workspaces": 1
        }
      },
      "type": "agency"
    },
    "role": "Agency owner",
    "status": "ok",
    "user": {
      "email": "asha@northwind.in",
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
        "name": "Northwind"
      }
    ]
  },
  "trialEndedCampaigns": {
    "body": {
      "code": "plan_required",
      "feature": "marketing",
      "message": "Performance Marketing is on the Growth plan and above. Your free trial has ended, so your organisation is on Creative. Upgrade to use it.",
      "plan": "Creative",
      "requiredPlan": "Growth",
      "status": "error"
    },
    "status": 403
  },
  "trialEndedCredits": {
    "allowance": 150,
    "hasPerformanceMarketing": false,
    "plan": "Creative",
    "planInfo": {
      "features": [],
      "limits": {
        "credits": 150,
        "seats": 1,
        "workspaces": 1
      },
      "plan": "Creative",
      "storedPlan": "Trial",
      "trial": {
        "daysLeft": 0,
        "endsAt": "2026-09-15T09:35:43.274886+00:00",
        "expired": true
      },
      "usage": {
        "seats": 1,
        "workspaces": 1
      }
    },
    "remaining": 150,
    "status": "ok",
    "used": 0,
    "warning": null
  },
  "trialEndingBootstrap": {
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
          "daysLeft": 3,
          "endsAt": "2026-09-17T11:35:43.263663+00:00",
          "expired": false
        },
        "usage": {
          "seats": 1,
          "workspaces": 1
        }
      },
      "type": "agency"
    },
    "role": "Agency owner",
    "status": "ok",
    "user": {
      "email": "asha@northwind.in",
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
        "name": "Northwind"
      }
    ]
  }
};

export default plans;
