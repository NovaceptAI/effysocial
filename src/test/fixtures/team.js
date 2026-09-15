// Team and invite payloads captured from the engine's test flow (tests/test_effy_team.py) on
// 15 Sep 2026: an agency owner invites a copywriter who joins, a client approver (resent), an
// expired invite, a role change, and the copywriter removed then invited back. Email sending
// was off, as in production until the domain is verified. Regenerate rather than hand-edit.
const team = {
  "accepted": {
    "org": {
      "id": 1,
      "name": "Northwind",
      "onboarding": {
        "completed": false,
        "offer": null
      },
      "plan": "Trial",
      "type": "agency"
    },
    "role": "Copywriter",
    "status": "ok",
    "user": {
      "email": "kiran@northwind.in",
      "email_verified": false,
      "id": 2,
      "is_admin": false,
      "name": "Kiran Patil"
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
  "alreadyInTeam": {
    "body": {
      "message": "kiran@northwind.in is already in your team.",
      "status": "error"
    },
    "status": 409
  },
  "changed": {
    "member": {
      "id": 2,
      "role": "Account manager"
    },
    "status": "ok"
  },
  "invite": {
    "emailSent": false,
    "invite": {
      "createdAt": "2026-09-15T10:04:24.485126+00:00",
      "email": "kiran@northwind.in",
      "expiresAt": "2026-09-22T10:04:24.486542+00:00",
      "id": 1,
      "invitedBy": "Asha Rao",
      "role": "Copywriter",
      "status": "pending"
    },
    "link": "https://effysocial.effybiz.in/join?token=CcL2mznTyyuV7OSKzjrW7UwM_tcn7rlwhqAx_amZxko",
    "status": "ok"
  },
  "needsSignIn": {
    "body": {
      "message": "You already have an account. Sign in as kiran@northwind.in to join.",
      "needsSignIn": true,
      "status": "error"
    },
    "status": 401
  },
  "ownerBootstrap": {
    "org": {
      "id": 1,
      "name": "Northwind",
      "onboarding": {
        "completed": false,
        "offer": null
      },
      "plan": "Trial",
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
  "removedBootstrap": {
    "org": null,
    "role": null,
    "status": "ok",
    "user": {
      "email": "kiran@northwind.in",
      "email_verified": false,
      "id": 2,
      "is_admin": false,
      "name": "Kiran Patil"
    },
    "workspaces": []
  },
  "resent": {
    "emailSent": false,
    "invite": {
      "createdAt": "2026-09-15T10:04:24.628709+00:00",
      "email": "meera@client.in",
      "expiresAt": "2026-09-22T10:04:24.640694+00:00",
      "id": 2,
      "invitedBy": "Asha Rao",
      "role": "Client approver",
      "status": "pending"
    },
    "link": "https://effysocial.effybiz.in/join?token=CPovSjqVGpVCKBTLtznDBPDxeSvK9OmdbdWzRC3kDhg",
    "status": "ok"
  },
  "teamMember": {
    "invites": [],
    "members": [
      {
        "email": "asha@northwind.in",
        "id": 1,
        "isOwner": true,
        "isYou": false,
        "joined": "2026-09-15",
        "name": "Asha Rao",
        "role": "Agency owner",
        "status": "active",
        "userId": 1,
        "verified": false
      },
      {
        "email": "kiran@northwind.in",
        "id": 2,
        "isOwner": false,
        "isYou": true,
        "joined": "2026-09-15",
        "name": "Kiran Patil",
        "role": "Account manager",
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
  },
  "teamOwner": {
    "invites": [
      {
        "createdAt": "2026-09-15T10:04:24.628709+00:00",
        "email": "meera@client.in",
        "expiresAt": "2026-09-22T10:04:24.640694+00:00",
        "id": 2,
        "invitedBy": "Asha Rao",
        "role": "Client approver",
        "status": "pending"
      },
      {
        "createdAt": "2026-09-15T10:04:24.650604+00:00",
        "email": "dev@northwind.in",
        "expiresAt": "2026-09-14T10:04:24.658678+00:00",
        "id": 3,
        "invitedBy": "Asha Rao",
        "role": "View-only",
        "status": "expired"
      }
    ],
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
      },
      {
        "email": "kiran@northwind.in",
        "id": 2,
        "isOwner": false,
        "isYou": false,
        "joined": "2026-09-15",
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
  },
  "usedInvite": {
    "body": {
      "inviteStatus": "accepted",
      "message": "This invite has already been used.",
      "status": "error"
    },
    "status": 410
  },
  "viewExisting": {
    "invite": {
      "email": "kiran@northwind.in",
      "expiresAt": "2026-09-22T10:04:24.701172+00:00",
      "hasAccount": true,
      "invitedBy": "Asha Rao",
      "org": "Northwind",
      "role": "View-only"
    },
    "status": "ok"
  },
  "viewNew": {
    "invite": {
      "email": "kiran@northwind.in",
      "expiresAt": "2026-09-22T10:04:24.486542+00:00",
      "hasAccount": false,
      "invitedBy": "Asha Rao",
      "org": "Northwind",
      "role": "Copywriter"
    },
    "status": "ok"
  }
};

export default team;
