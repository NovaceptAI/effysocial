// Meta connection payloads captured from the engine's test flow (launch plan 4.4;
// tests/test_effy_meta_connect.py) on 16 Sep 2026. Regenerate rather than hand-edit.
const metaConnect = {
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
          "endsAt": "2026-09-30T00:10:04.107414+00:00",
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
  "capturedAt": "2026-09-16T00:10:03.949082+00:00",
  "connectRedirect": {
    "redirect": "https://www.facebook.com/v25.0/dialog/oauth?response_type=code&client_id=app-123&redirect_uri=https%3A%2F%2Feffysocial.effybiz.in%2Fapi%2Feffy%2Fintegrations%2Finstagram%2Fcallback&scope=instagram_basic+instagram_content_publish+instagram_manage_insights+pages_show_list+pages_read_engagement&state=lfY3SuIEPjLhOmh57ezmfZ9ewUkSBdUk",
    "state": "redirect",
    "status": "ok"
  },
  "connected": {
    "integrations": [
      {
        "accessEndsAt": "2026-12-15T00:10:04+00:00",
        "account": "@novacept.ai",
        "category": "Social publishing",
        "credsConfigured": true,
        "daysLeft": 89,
        "label": "Instagram",
        "lastSync": "2026-09-16T00:10:04.168165",
        "provider": "instagram",
        "reconnectSoon": false,
        "state": "connected"
      },
      {
        "accessEndsAt": null,
        "account": "",
        "category": "Social publishing",
        "credsConfigured": true,
        "daysLeft": null,
        "label": "Facebook Page",
        "lastSync": null,
        "provider": "facebook_page",
        "reconnectSoon": false,
        "state": "available"
      },
      {
        "accessEndsAt": null,
        "account": "",
        "category": "Social publishing",
        "credsConfigured": false,
        "daysLeft": null,
        "label": "LinkedIn",
        "lastSync": null,
        "provider": "linkedin",
        "reconnectSoon": false,
        "state": "pending_credentials"
      },
      {
        "accessEndsAt": null,
        "account": "",
        "category": "Social publishing",
        "credsConfigured": false,
        "daysLeft": null,
        "label": "Google Business Profile",
        "lastSync": null,
        "provider": "google_business",
        "reconnectSoon": false,
        "state": "pending_credentials"
      },
      {
        "accessEndsAt": null,
        "account": "",
        "category": "Advertising",
        "credsConfigured": true,
        "daysLeft": null,
        "label": "Meta Ads",
        "lastSync": null,
        "provider": "meta_ads",
        "reconnectSoon": false,
        "state": "available"
      },
      {
        "accessEndsAt": null,
        "account": "",
        "category": "Advertising",
        "credsConfigured": false,
        "daysLeft": null,
        "label": "Google Ads",
        "lastSync": null,
        "provider": "google_ads",
        "reconnectSoon": false,
        "state": "pending_credentials"
      },
      {
        "accessEndsAt": null,
        "account": "",
        "category": "Analytics",
        "credsConfigured": false,
        "daysLeft": null,
        "label": "Google Analytics 4",
        "lastSync": null,
        "provider": "ga4",
        "reconnectSoon": false,
        "state": "pending_credentials"
      },
      {
        "accessEndsAt": null,
        "account": "",
        "category": "Messaging",
        "credsConfigured": false,
        "daysLeft": null,
        "label": "WhatsApp Cloud API",
        "lastSync": null,
        "provider": "whatsapp",
        "reconnectSoon": false,
        "state": "pending_credentials"
      }
    ],
    "status": "ok"
  },
  "endingSoon": {
    "integrations": [
      {
        "accessEndsAt": "2026-09-21T00:10:04.183196+00:00",
        "account": "@novacept.ai",
        "category": "Social publishing",
        "credsConfigured": true,
        "daysLeft": 4,
        "label": "Instagram",
        "lastSync": "2026-09-16T00:10:04.168165",
        "provider": "instagram",
        "reconnectSoon": true,
        "state": "connected"
      },
      {
        "accessEndsAt": null,
        "account": "",
        "category": "Social publishing",
        "credsConfigured": true,
        "daysLeft": null,
        "label": "Facebook Page",
        "lastSync": null,
        "provider": "facebook_page",
        "reconnectSoon": false,
        "state": "available"
      },
      {
        "accessEndsAt": null,
        "account": "",
        "category": "Social publishing",
        "credsConfigured": false,
        "daysLeft": null,
        "label": "LinkedIn",
        "lastSync": null,
        "provider": "linkedin",
        "reconnectSoon": false,
        "state": "pending_credentials"
      },
      {
        "accessEndsAt": null,
        "account": "",
        "category": "Social publishing",
        "credsConfigured": false,
        "daysLeft": null,
        "label": "Google Business Profile",
        "lastSync": null,
        "provider": "google_business",
        "reconnectSoon": false,
        "state": "pending_credentials"
      },
      {
        "accessEndsAt": null,
        "account": "",
        "category": "Advertising",
        "credsConfigured": true,
        "daysLeft": null,
        "label": "Meta Ads",
        "lastSync": null,
        "provider": "meta_ads",
        "reconnectSoon": false,
        "state": "available"
      },
      {
        "accessEndsAt": null,
        "account": "",
        "category": "Advertising",
        "credsConfigured": false,
        "daysLeft": null,
        "label": "Google Ads",
        "lastSync": null,
        "provider": "google_ads",
        "reconnectSoon": false,
        "state": "pending_credentials"
      },
      {
        "accessEndsAt": null,
        "account": "",
        "category": "Analytics",
        "credsConfigured": false,
        "daysLeft": null,
        "label": "Google Analytics 4",
        "lastSync": null,
        "provider": "ga4",
        "reconnectSoon": false,
        "state": "pending_credentials"
      },
      {
        "accessEndsAt": null,
        "account": "",
        "category": "Messaging",
        "credsConfigured": false,
        "daysLeft": null,
        "label": "WhatsApp Cloud API",
        "lastSync": null,
        "provider": "whatsapp",
        "reconnectSoon": false,
        "state": "pending_credentials"
      }
    ],
    "status": "ok"
  },
  "expired": {
    "integrations": [
      {
        "accessEndsAt": "2026-09-15T00:10:04.196375+00:00",
        "account": "@novacept.ai",
        "category": "Social publishing",
        "credsConfigured": true,
        "daysLeft": 0,
        "label": "Instagram",
        "lastSync": "2026-09-16T00:10:04.168165",
        "provider": "instagram",
        "reconnectSoon": false,
        "state": "expired"
      },
      {
        "accessEndsAt": null,
        "account": "",
        "category": "Social publishing",
        "credsConfigured": true,
        "daysLeft": null,
        "label": "Facebook Page",
        "lastSync": null,
        "provider": "facebook_page",
        "reconnectSoon": false,
        "state": "available"
      },
      {
        "accessEndsAt": null,
        "account": "",
        "category": "Social publishing",
        "credsConfigured": false,
        "daysLeft": null,
        "label": "LinkedIn",
        "lastSync": null,
        "provider": "linkedin",
        "reconnectSoon": false,
        "state": "pending_credentials"
      },
      {
        "accessEndsAt": null,
        "account": "",
        "category": "Social publishing",
        "credsConfigured": false,
        "daysLeft": null,
        "label": "Google Business Profile",
        "lastSync": null,
        "provider": "google_business",
        "reconnectSoon": false,
        "state": "pending_credentials"
      },
      {
        "accessEndsAt": null,
        "account": "",
        "category": "Advertising",
        "credsConfigured": true,
        "daysLeft": null,
        "label": "Meta Ads",
        "lastSync": null,
        "provider": "meta_ads",
        "reconnectSoon": false,
        "state": "available"
      },
      {
        "accessEndsAt": null,
        "account": "",
        "category": "Advertising",
        "credsConfigured": false,
        "daysLeft": null,
        "label": "Google Ads",
        "lastSync": null,
        "provider": "google_ads",
        "reconnectSoon": false,
        "state": "pending_credentials"
      },
      {
        "accessEndsAt": null,
        "account": "",
        "category": "Analytics",
        "credsConfigured": false,
        "daysLeft": null,
        "label": "Google Analytics 4",
        "lastSync": null,
        "provider": "ga4",
        "reconnectSoon": false,
        "state": "pending_credentials"
      },
      {
        "accessEndsAt": null,
        "account": "",
        "category": "Messaging",
        "credsConfigured": false,
        "daysLeft": null,
        "label": "WhatsApp Cloud API",
        "lastSync": null,
        "provider": "whatsapp",
        "reconnectSoon": false,
        "state": "pending_credentials"
      }
    ],
    "status": "ok"
  },
  "publishWhenExpired": {
    "body": {
      "message": "Your Instagram connection has expired. Reconnect Instagram in Integrations.",
      "status": "error"
    },
    "status": 400
  }
};

export default metaConnect;
