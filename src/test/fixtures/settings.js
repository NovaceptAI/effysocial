// Settings and two-factor payloads captured from the engine's test flow (tests/test_effy_twofactor.py)
// on 15 Sep 2026. The secret and recovery codes belong to a throwaway test account.
// Regenerate rather than hand-edit.
const settings = {
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
          "endsAt": "2026-09-29T11:38:36.758456+00:00",
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
  "bootstrapCompact": {
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
          "endsAt": "2026-09-29T11:38:36.758456+00:00",
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
        "density": "compact",
        "notifications": {
          "approvals": true,
          "failures": true,
          "leads": false,
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
  "bootstrapTwoFactor": {
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
          "endsAt": "2026-09-29T11:38:36.758456+00:00",
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
      "name": "Asha R.",
      "preferences": {
        "density": "compact",
        "notifications": {
          "approvals": true,
          "failures": true,
          "leads": false,
          "reportsEmail": false
        }
      },
      "twoFactor": true
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
  "disabled": {
    "enabled": false,
    "status": "ok"
  },
  "enableWrongCode": {
    "body": {
      "message": "That code doesn't match. Check the time on your phone and try the newest code.",
      "status": "error"
    },
    "status": 400
  },
  "enabled": {
    "enabled": true,
    "recoveryCodes": [
      "e7la-o7t7",
      "otuw-tznt",
      "gpmr-2vx5",
      "btpb-jd3g",
      "kwqt-j52y",
      "y4en-jbto",
      "5udo-ypiv",
      "tptf-6how"
    ],
    "status": "ok"
  },
  "loginNeedsTwoFactor": {
    "needsTwoFactor": true,
    "status": "ok"
  },
  "newCodes": {
    "recoveryCodes": [
      "wpjp-qfzg",
      "ftfv-yfw5",
      "tsjf-v6lq",
      "h6lh-lzoc",
      "v27x-sgsu",
      "td54-j6o4",
      "f52k-qlv7",
      "3oho-bf4c"
    ],
    "status": "ok"
  },
  "onboarding": {
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
      "name": "Northwind",
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
      "name": "Northwind"
    }
  },
  "prefsSaved": {
    "preferences": {
      "density": "compact",
      "notifications": {
        "approvals": true,
        "failures": true,
        "leads": false,
        "reportsEmail": false
      }
    },
    "status": "ok"
  },
  "renamed": {
    "status": "ok",
    "user": {
      "email": "asha@northwind.in",
      "id": 1,
      "name": "Asha R."
    }
  },
  "resetLinkNotSent": {
    "email": "asha@northwind.in",
    "emailSent": false,
    "status": "ok"
  },
  "setup": {
    "otpauthUrl": "otpauth://totp/EffySocial%3Aasha%40northwind.in?secret=HQMUDBQB2E3SDHUXQUEPIONPNKSHSKJK&issuer=EffySocial&algorithm=SHA1&digits=6&period=30",
    "secret": "HQMUDBQB2E3SDHUXQUEPIONPNKSHSKJK",
    "status": "ok"
  },
  "setupWrongPassword": {
    "body": {
      "message": "That password isn't right.",
      "status": "error"
    },
    "status": 400
  },
  "statusOff": {
    "enabled": false,
    "enabledAt": null,
    "recoveryCodesLeft": 0,
    "status": "ok"
  },
  "statusOn": {
    "enabled": true,
    "enabledAt": "2026-09-15T11:38:37.076961",
    "recoveryCodesLeft": 8,
    "status": "ok"
  },
  "verified": {
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
          "endsAt": "2026-09-29T11:38:36.758456+00:00",
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
      "name": "Asha R.",
      "preferences": {
        "density": "compact",
        "notifications": {
          "approvals": true,
          "failures": true,
          "leads": false,
          "reportsEmail": false
        }
      },
      "twoFactor": true
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
  "verifyExpired": {
    "body": {
      "message": "Your sign-in expired. Enter your email and password again.",
      "restart": true,
      "status": "error"
    },
    "status": 401
  },
  "verifyWrong": {
    "body": {
      "message": "That code doesn't match. Try the newest code, or a recovery code.",
      "status": "error"
    },
    "status": 400
  }
};

export default settings;
