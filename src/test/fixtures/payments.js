// Payment payloads captured from the engine's test flow (tests/test_effy_payments.py shapes) on
// 4 Oct 2026, with Razorpay stubbed and test keys: a platform admin's Billing (checkout
// offered), another owner's (test mode, not offered), a Pro order, Razorpay's handler response,
// a refused signature, the verified payment, Billing once paid, and the plan after it ran out.
// Regenerate rather than hand-edit.
const payments = {
  "bootstrap": {
    "newProfileTrial": false,
    "org": {
      "id": 1,
      "name": "Roofseal Pune",
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
        "paid": null,
        "plan": "Trial",
        "storedPlan": "Trial",
        "trial": {
          "daysLeft": 14,
          "endsAt": "2026-10-18T07:22:24.852447+00:00",
          "expired": false
        },
        "usage": {
          "seats": 1,
          "workspaces": 1
        }
      },
      "profile": {
        "clientFeatures": true,
        "desc": "We market our own company or shop.",
        "label": "Business",
        "settings": {
          "clientApprover": false,
          "clientReview": false,
          "clientsPage": false,
          "requireApproval": false
        },
        "type": "business",
        "workEmail": {
          "email": null,
          "pending": null,
          "verified": false,
          "verifiedAt": null
        }
      },
      "timezone": "Asia/Kolkata",
      "type": "business"
    },
    "profiles": [
      {
        "current": true,
        "id": 1,
        "isOwner": true,
        "label": "Business",
        "name": "Roofseal Pune",
        "plan": "Trial",
        "role": "Workspace admin",
        "type": "business"
      }
    ],
    "role": "Workspace admin",
    "status": "ok",
    "user": {
      "email": "user-c029151d33@test.in",
      "email_verified": false,
      "id": 1,
      "is_admin": true,
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
        "brandKind": "business",
        "dbId": 1,
        "id": "ws_1",
        "industry": "",
        "location": "",
        "logo": "✦",
        "managerId": 1,
        "name": "Roofseal Pune",
        "sample": false
      }
    ]
  },
  "checkoutTest": {
    "available": true,
    "currency": "INR",
    "gstPercent": 0,
    "keyId": "rzp_test_Capture1234",
    "mode": "test",
    "payments": [],
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
      "paid": null,
      "plan": "Trial",
      "storedPlan": "Trial",
      "trial": {
        "daysLeft": 14,
        "endsAt": "2026-10-18T07:22:24.852447+00:00",
        "expired": false
      },
      "usage": {
        "seats": 1,
        "workspaces": 1
      }
    },
    "prices": [
      {
        "amount": 199900,
        "base": 199900,
        "label": "1 month",
        "period": "month",
        "plan": "Growth",
        "refusal": null
      },
      {
        "amount": 1999000,
        "base": 1999000,
        "label": "1 year",
        "period": "year",
        "plan": "Growth",
        "refusal": null
      },
      {
        "amount": 499900,
        "base": 499900,
        "label": "1 month",
        "period": "month",
        "plan": "Pro",
        "refusal": null
      },
      {
        "amount": 4999000,
        "base": 4999000,
        "label": "1 year",
        "period": "year",
        "plan": "Pro",
        "refusal": null
      },
      {
        "amount": 1299900,
        "base": 1299900,
        "label": "1 month",
        "period": "month",
        "plan": "Agency",
        "refusal": null
      },
      {
        "amount": 12999000,
        "base": 12999000,
        "label": "1 year",
        "period": "year",
        "plan": "Agency",
        "refusal": null
      }
    ],
    "reason": null,
    "status": "ok"
  },
  "checkoutTestOwner": {
    "available": false,
    "currency": "INR",
    "gstPercent": 0,
    "keyId": null,
    "mode": "test",
    "payments": [],
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
      "paid": null,
      "plan": "Trial",
      "storedPlan": "Trial",
      "trial": {
        "daysLeft": 14,
        "endsAt": "2026-10-18T07:22:25.018054+00:00",
        "expired": false
      },
      "usage": {
        "seats": 1,
        "workspaces": 1
      }
    },
    "prices": [
      {
        "amount": 199900,
        "base": 199900,
        "label": "1 month",
        "period": "month",
        "plan": "Growth",
        "refusal": null
      },
      {
        "amount": 1999000,
        "base": 1999000,
        "label": "1 year",
        "period": "year",
        "plan": "Growth",
        "refusal": null
      },
      {
        "amount": 499900,
        "base": 499900,
        "label": "1 month",
        "period": "month",
        "plan": "Pro",
        "refusal": null
      },
      {
        "amount": 4999000,
        "base": 4999000,
        "label": "1 year",
        "period": "year",
        "plan": "Pro",
        "refusal": null
      },
      {
        "amount": 1299900,
        "base": 1299900,
        "label": "1 month",
        "period": "month",
        "plan": "Agency",
        "refusal": null
      },
      {
        "amount": 12999000,
        "base": 12999000,
        "label": "1 year",
        "period": "year",
        "plan": "Agency",
        "refusal": null
      }
    ],
    "reason": "Online payment is coming soon. To change your plan now, contact the EffySocial team.",
    "status": "ok"
  },
  "order": {
    "amount": 499900,
    "currency": "INR",
    "description": "Pro plan, 1 month",
    "keyId": "rzp_test_Capture1234",
    "mode": "test",
    "name": "EffySocial",
    "orderId": "order_Rz9QcA1b2C3d4E",
    "prefill": {
      "email": "user-c029151d33@test.in",
      "name": "Asha Rao"
    },
    "status": "ok"
  },
  "razorpayResponse": {
    "razorpay_order_id": "order_Rz9QcA1b2C3d4E",
    "razorpay_payment_id": "pay_Rz9QhX7y8Z9a0B",
    "razorpay_signature": "a8a7f5105989986ece14b950977c5345e21f974222ce9d486eaec95d3f47991c"
  },
  "badSignature": {
    "message": "We couldn't confirm this payment, so your plan hasn't changed. If money left your account, contact us with payment id pay_X.",
    "status": "error"
  },
  "verified": {
    "payment": {
      "amount": 499900,
      "createdAt": "2026-10-04T07:22:25.043396+00:00",
      "currency": "INR",
      "gstPercent": 0,
      "id": 1,
      "mode": "test",
      "orderId": "order_Rz9QcA1b2C3d4E",
      "paidAt": "2026-10-04T07:22:25.057342+00:00",
      "paymentId": "pay_Rz9QhX7y8Z9a0B",
      "period": "month",
      "periodEnd": "2026-11-04T07:22:25.057342+00:00",
      "periodStart": "2026-10-04T07:22:25.057342+00:00",
      "plan": "Pro",
      "status": "paid"
    },
    "plan": "Pro",
    "planInfo": {
      "features": [
        "marketing",
        "conversion"
      ],
      "limits": {
        "credits": 1500,
        "seats": 5,
        "workspaces": 3
      },
      "paid": {
        "daysLeft": 31,
        "expired": false,
        "plan": "Pro",
        "until": "2026-11-04T07:22:25.057342+00:00"
      },
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
  "bootstrapPaid": {
    "newProfileTrial": false,
    "org": {
      "id": 1,
      "name": "Roofseal Pune",
      "onboarding": {
        "completed": false,
        "offer": null
      },
      "plan": "Pro",
      "planInfo": {
        "features": [
          "marketing",
          "conversion"
        ],
        "limits": {
          "credits": 1500,
          "seats": 5,
          "workspaces": 3
        },
        "paid": {
          "daysLeft": 31,
          "expired": false,
          "plan": "Pro",
          "until": "2026-11-04T07:22:25.057342+00:00"
        },
        "plan": "Pro",
        "storedPlan": "Pro",
        "trial": null,
        "usage": {
          "seats": 1,
          "workspaces": 1
        }
      },
      "profile": {
        "clientFeatures": true,
        "desc": "We market our own company or shop.",
        "label": "Business",
        "settings": {
          "clientApprover": false,
          "clientReview": false,
          "clientsPage": false,
          "requireApproval": false
        },
        "type": "business",
        "workEmail": {
          "email": null,
          "pending": null,
          "verified": false,
          "verifiedAt": null
        }
      },
      "timezone": "Asia/Kolkata",
      "type": "business"
    },
    "profiles": [
      {
        "current": true,
        "id": 1,
        "isOwner": true,
        "label": "Business",
        "name": "Roofseal Pune",
        "plan": "Pro",
        "role": "Workspace admin",
        "type": "business"
      }
    ],
    "role": "Workspace admin",
    "status": "ok",
    "user": {
      "email": "user-c029151d33@test.in",
      "email_verified": false,
      "id": 1,
      "is_admin": true,
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
        "brandKind": "business",
        "dbId": 1,
        "id": "ws_1",
        "industry": "",
        "location": "",
        "logo": "✦",
        "managerId": 1,
        "name": "Roofseal Pune",
        "sample": false
      }
    ]
  },
  "checkoutPaid": {
    "available": true,
    "currency": "INR",
    "gstPercent": 0,
    "keyId": "rzp_test_Capture1234",
    "mode": "test",
    "payments": [
      {
        "amount": 499900,
        "createdAt": "2026-10-04T07:22:25.043396+00:00",
        "currency": "INR",
        "gstPercent": 0,
        "id": 1,
        "mode": "test",
        "orderId": "order_Rz9QcA1b2C3d4E",
        "paidAt": "2026-10-04T07:22:25.057342+00:00",
        "paymentId": "pay_Rz9QhX7y8Z9a0B",
        "period": "month",
        "periodEnd": "2026-11-04T07:22:25.057342+00:00",
        "periodStart": "2026-10-04T07:22:25.057342+00:00",
        "plan": "Pro",
        "status": "paid"
      }
    ],
    "planInfo": {
      "features": [
        "marketing",
        "conversion"
      ],
      "limits": {
        "credits": 1500,
        "seats": 5,
        "workspaces": 3
      },
      "paid": {
        "daysLeft": 31,
        "expired": false,
        "plan": "Pro",
        "until": "2026-11-04T07:22:25.057342+00:00"
      },
      "plan": "Pro",
      "storedPlan": "Pro",
      "trial": null,
      "usage": {
        "seats": 1,
        "workspaces": 1
      }
    },
    "prices": [
      {
        "amount": 199900,
        "base": 199900,
        "label": "1 month",
        "period": "month",
        "plan": "Growth",
        "refusal": "You're on Pro until 4 Nov 2026. A smaller plan can be bought after that."
      },
      {
        "amount": 1999000,
        "base": 1999000,
        "label": "1 year",
        "period": "year",
        "plan": "Growth",
        "refusal": "You're on Pro until 4 Nov 2026. A smaller plan can be bought after that."
      },
      {
        "amount": 499900,
        "base": 499900,
        "label": "1 month",
        "period": "month",
        "plan": "Pro",
        "refusal": null
      },
      {
        "amount": 4999000,
        "base": 4999000,
        "label": "1 year",
        "period": "year",
        "plan": "Pro",
        "refusal": null
      },
      {
        "amount": 1299900,
        "base": 1299900,
        "label": "1 month",
        "period": "month",
        "plan": "Agency",
        "refusal": null
      },
      {
        "amount": 12999000,
        "base": 12999000,
        "label": "1 year",
        "period": "year",
        "plan": "Agency",
        "refusal": null
      }
    ],
    "reason": null,
    "status": "ok"
  },
  "bootstrapLapsed": {
    "newProfileTrial": false,
    "org": {
      "id": 1,
      "name": "Roofseal Pune",
      "onboarding": {
        "completed": false,
        "offer": null
      },
      "plan": "Pro",
      "planInfo": {
        "features": [],
        "limits": {
          "credits": 150,
          "seats": 1,
          "workspaces": 1
        },
        "paid": {
          "daysLeft": 0,
          "expired": true,
          "plan": "Pro",
          "until": "2026-10-03T07:22:25.076902+00:00"
        },
        "plan": "Creative",
        "storedPlan": "Pro",
        "trial": null,
        "usage": {
          "seats": 1,
          "workspaces": 1
        }
      },
      "profile": {
        "clientFeatures": true,
        "desc": "We market our own company or shop.",
        "label": "Business",
        "settings": {
          "clientApprover": false,
          "clientReview": false,
          "clientsPage": false,
          "requireApproval": false
        },
        "type": "business",
        "workEmail": {
          "email": null,
          "pending": null,
          "verified": false,
          "verifiedAt": null
        }
      },
      "timezone": "Asia/Kolkata",
      "type": "business"
    },
    "profiles": [
      {
        "current": true,
        "id": 1,
        "isOwner": true,
        "label": "Business",
        "name": "Roofseal Pune",
        "plan": "Creative",
        "role": "Workspace admin",
        "type": "business"
      }
    ],
    "role": "Workspace admin",
    "status": "ok",
    "user": {
      "email": "user-c029151d33@test.in",
      "email_verified": false,
      "id": 1,
      "is_admin": true,
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
        "brandKind": "business",
        "dbId": 1,
        "id": "ws_1",
        "industry": "",
        "location": "",
        "logo": "✦",
        "managerId": 1,
        "name": "Roofseal Pune",
        "sample": false
      }
    ]
  }
};

export default payments;
