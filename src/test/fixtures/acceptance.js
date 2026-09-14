// Acceptance payloads captured from the engine's own test flow (tests/test_effy_acceptance.py)
// on 14 Sep 2026: GET /acceptance and a delivered film. Regenerate rather than hand-edit.
const acceptance = {
  "list": {
    "rows": [
      {
        "createdAt": "2026-09-14T13:38:42.936051+00:00",
        "kind": "studio",
        "ref": "st_fixturejob01",
        "status": "submitted",
        "summary": {
          "approvalRate": 0.0,
          "attempts": {
            "copy": 2,
            "image": 1,
            "refine": 0,
            "video_start": 0
          },
          "costUsd": 0.0,
          "deliveredAt": "2026-09-14T13:38:42.973813+00:00",
          "failures": 0,
          "history": [
            {
              "at": "2026-09-14T13:38:42.984895+00:00",
              "defects": "",
              "deliveryHours": null,
              "id": 2,
              "notes": "",
              "quality": 5,
              "recordedBy": {
                "email": "user-17b565ab90@test.in",
                "name": "Asha Rao",
                "role": "Workspace admin"
              },
              "result": "accepted"
            }
          ],
          "partial": false,
          "posts": [
            {
              "id": 1,
              "status": "internal_review"
            }
          ],
          "renderSeconds": 0,
          "retries": 1,
          "startedAt": "2026-09-14T13:38:42.936051+00:00",
          "trackedSince": "2026-09-14T13:38:42.936051+00:00",
          "turnaroundHours": 0.0,
          "verdict": {
            "at": "2026-09-14T13:38:42.984895+00:00",
            "defects": "",
            "deliveryHours": null,
            "id": 2,
            "notes": "",
            "quality": 5,
            "recordedBy": {
              "email": "user-17b565ab90@test.in",
              "name": "Asha Rao",
              "role": "Workspace admin"
            },
            "result": "accepted"
          }
        },
        "title": "Instagram post — monsoon offer"
      },
      {
        "createdAt": "2026-09-14T13:38:42.833724+00:00",
        "kind": "product_shot",
        "ref": "1",
        "status": "delivered",
        "summary": {
          "attempts": {
            "build": 1,
            "clip_start": 1,
            "still": 1
          },
          "costUsd": 0.07,
          "deliveredAt": "2026-09-14T13:38:42.922782+00:00",
          "failures": 0,
          "history": [],
          "partial": false,
          "renderSeconds": 0.0,
          "retries": 0,
          "startedAt": "2026-09-14T13:38:42.833724+00:00",
          "trackedSince": "2026-09-14T13:38:42.884198+00:00",
          "turnaroundHours": 0.0,
          "verdict": null
        },
        "title": "Glow serum"
      },
      {
        "createdAt": "2026-09-14T13:38:42.456733+00:00",
        "kind": "film",
        "ref": "1",
        "status": "delivered",
        "summary": {
          "approvalRate": 1.0,
          "attempts": {
            "assemble": 1,
            "clip_start": 3,
            "still": 3,
            "voiceover": 2
          },
          "costUsd": 2.0,
          "deliveredAt": "2026-09-14T13:38:42.803855+00:00",
          "failures": 0,
          "history": [
            {
              "at": "2026-09-14T13:38:42.816724+00:00",
              "defects": "End card logo slightly soft",
              "deliveryHours": 3.0,
              "id": 1,
              "notes": "Fixed in the client's edit",
              "quality": 4,
              "recordedBy": {
                "email": "user-828bddde48@test.in",
                "name": "Meera Iyer",
                "role": "Client approver"
              },
              "result": "accepted_with_fixes"
            }
          ],
          "masterApprovedAt": "2026-09-14T13:38:42.776279",
          "partial": false,
          "renderSeconds": 0.1,
          "retries": 2,
          "revisionRounds": 2,
          "startedAt": "2026-09-14T13:38:42.456733+00:00",
          "trackedSince": "2026-09-14T13:38:42.514837+00:00",
          "turnaroundHours": 0.0,
          "verdict": {
            "at": "2026-09-14T13:38:42.816724+00:00",
            "defects": "End card logo slightly soft",
            "deliveryHours": 3.0,
            "id": 1,
            "notes": "Fixed in the client's edit",
            "quality": 4,
            "recordedBy": {
              "email": "user-828bddde48@test.in",
              "name": "Meera Iyer",
              "role": "Client approver"
            },
            "result": "accepted_with_fixes"
          }
        },
        "title": "Roof Ka Rakshak"
      }
    ],
    "status": "ok",
    "totals": {
      "acceptanceRate": 1.0,
      "costUsd": 2.07,
      "deliveryHours": 3.0,
      "failures": 0,
      "firstTimeRight": 1,
      "medianTurnaroundHours": 0.0,
      "projects": 3,
      "retries": 3,
      "withVerdict": 2
    }
  },
  "film": {
    "acceptance": {
      "approvalRate": 1.0,
      "attempts": {
        "assemble": 1,
        "clip_start": 3,
        "still": 3,
        "voiceover": 2
      },
      "costUsd": 2.0,
      "deliveredAt": "2026-09-14T13:38:42.803855+00:00",
      "failures": 0,
      "history": [
        {
          "at": "2026-09-14T13:38:42.816724+00:00",
          "defects": "End card logo slightly soft",
          "deliveryHours": 3.0,
          "id": 1,
          "notes": "Fixed in the client's edit",
          "quality": 4,
          "recordedBy": {
            "email": "user-828bddde48@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "result": "accepted_with_fixes"
        }
      ],
      "masterApprovedAt": "2026-09-14T13:38:42.776279",
      "partial": false,
      "renderSeconds": 0.1,
      "retries": 2,
      "revisionRounds": 2,
      "startedAt": "2026-09-14T13:38:42.456733+00:00",
      "trackedSince": "2026-09-14T13:38:42.514837+00:00",
      "turnaroundHours": 0.0,
      "verdict": {
        "at": "2026-09-14T13:38:42.816724+00:00",
        "defects": "End card logo slightly soft",
        "deliveryHours": 3.0,
        "id": 1,
        "notes": "Fixed in the client's edit",
        "quality": 4,
        "recordedBy": {
          "email": "user-828bddde48@test.in",
          "name": "Meera Iyer",
          "role": "Client approver"
        },
        "result": "accepted_with_fixes"
      }
    },
    "allStillsApproved": true,
    "aspect": "16:9",
    "assets": [],
    "brief": "",
    "budgetUsd": 10.0,
    "client": "",
    "costs": {
      "scene": 0.6,
      "still": 0.067,
      "veoPerSec": 0.15
    },
    "createdAt": "2026-09-14T13:38:42.456733",
    "cut": {
      "blockers": [],
      "canAssemble": true,
      "dealersStale": false,
      "exportsStale": false,
      "masterStale": false
    },
    "direction": {},
    "durationS": 12,
    "endCard": {},
    "id": 1,
    "language": "Hinglish",
    "posterUrl": "/api/effy/media/img_c1e03b379d06ca4eba.png",
    "product": "Roofseal",
    "renders": {
      "master": "/api/effy/media/vid_a33e2910566c3e1a2d.mp4",
      "qa": {
        "durationS": 12.0,
        "note": "No stray voices.",
        "status": "audio_clean"
      },
      "reel": "/api/effy/media/vid_69e02d76057b304bed.mp4",
      "whatsapp": "/api/effy/media/vid_9f289616d1c3a4f3ad.mp4"
    },
    "revisionAllowance": null,
    "sceneCount": 2,
    "scenes": [
      {
        "audioNote": "No stray voices.",
        "clip": "vid_1dc5c42654eb50a69b.mp4",
        "clipStale": false,
        "clipStatus": "audio_clean",
        "clipUrl": "/api/effy/media/vid_1dc5c42654eb50a69b.mp4",
        "id": 1,
        "idx": 0,
        "line": "Har chhat jhelti hai dhoop.",
        "motion": "slow push-in",
        "op": "",
        "seconds": 4,
        "signoff": {
          "approver": {
            "email": "user-17b565ab90@test.in",
            "name": "Asha Rao",
            "role": "Workspace admin"
          },
          "at": "2026-09-14T13:38:42.703603",
          "decision": "approved",
          "extraScope": false,
          "id": 3,
          "note": "",
          "round": 2,
          "stage": "stills",
          "target": "1"
        },
        "still": "img_c1e03b379d06ca4eba.png",
        "stillStatus": "approved",
        "stillUrl": "/api/effy/media/img_c1e03b379d06ca4eba.png",
        "takes": 2,
        "visual": "cracked rooftop",
        "vo": "aud_e3d06caf447019c547.mp3",
        "voSeconds": 3.6,
        "voStale": false,
        "voUrl": "/api/effy/media/aud_e3d06caf447019c547.mp3"
      },
      {
        "audioNote": "No stray voices.",
        "clip": "vid_0436dbb544dcd711fc.mp4",
        "clipStale": false,
        "clipStatus": "audio_clean",
        "clipUrl": "/api/effy/media/vid_0436dbb544dcd711fc.mp4",
        "id": 2,
        "idx": 1,
        "line": "Tab aata hai Roofseal.",
        "motion": "track the roller",
        "op": "",
        "seconds": 4,
        "signoff": {
          "approver": {
            "email": "user-17b565ab90@test.in",
            "name": "Asha Rao",
            "role": "Workspace admin"
          },
          "at": "2026-09-14T13:38:42.567385",
          "decision": "approved",
          "extraScope": false,
          "id": 2,
          "note": "",
          "round": 1,
          "stage": "stills",
          "target": "2"
        },
        "still": "img_8f03d7cfdcdbb99791.png",
        "stillStatus": "approved",
        "stillUrl": "/api/effy/media/img_8f03d7cfdcdbb99791.png",
        "takes": 1,
        "visual": "roller spreads coating",
        "vo": "aud_8304bffaf961edc829.mp3",
        "voSeconds": 3.6,
        "voStale": false,
        "voUrl": "/api/effy/media/aud_8304bffaf961edc829.mp3"
      }
    ],
    "signoffs": {
      "cutdowns": {
        "reel": null,
        "whatsapp": null
      },
      "history": [
        {
          "approver": {
            "email": "user-828bddde48@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T13:38:42.776279",
          "decision": "approved",
          "extraScope": false,
          "id": 4,
          "note": "",
          "round": 1,
          "stage": "master",
          "target": ""
        },
        {
          "approver": {
            "email": "user-17b565ab90@test.in",
            "name": "Asha Rao",
            "role": "Workspace admin"
          },
          "at": "2026-09-14T13:38:42.703603",
          "decision": "approved",
          "extraScope": false,
          "id": 3,
          "note": "",
          "round": 2,
          "stage": "stills",
          "target": "1"
        },
        {
          "approver": {
            "email": "user-17b565ab90@test.in",
            "name": "Asha Rao",
            "role": "Workspace admin"
          },
          "at": "2026-09-14T13:38:42.567385",
          "decision": "approved",
          "extraScope": false,
          "id": 2,
          "note": "",
          "round": 1,
          "stage": "stills",
          "target": "2"
        },
        {
          "approver": {
            "email": "user-17b565ab90@test.in",
            "name": "Asha Rao",
            "role": "Workspace admin"
          },
          "at": "2026-09-14T13:38:42.527748",
          "decision": "approved",
          "extraScope": false,
          "id": 1,
          "note": "",
          "round": 1,
          "stage": "stills",
          "target": "1"
        }
      ],
      "master": {
        "approver": {
          "email": "user-828bddde48@test.in",
          "name": "Meera Iyer",
          "role": "Client approver"
        },
        "at": "2026-09-14T13:38:42.776279",
        "decision": "approved",
        "extraScope": false,
        "id": 4,
        "note": "",
        "round": 1,
        "stage": "master",
        "target": ""
      },
      "masterApproved": true
    },
    "spendUsd": 2.001,
    "stage": 7,
    "stages": [
      "direction",
      "script",
      "stills",
      "animate",
      "voice",
      "assemble",
      "deliver"
    ],
    "status": "delivered",
    "styleBlock": "Photorealistic Indian advertising film still, 16:9 landscape composition, shot on 35mm, natural daylight, warm sun-baked tones with deep blue sky, crisp detail, cinematic contrast, clean composition. NO text, NO logos, NO watermarks.",
    "title": "Roof Ka Rakshak",
    "totalS": 12,
    "updatedAt": "2026-09-14T13:38:42.803567",
    "voice": ""
  }
};

export default acceptance;
