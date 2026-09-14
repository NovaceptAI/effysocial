// Ad Films payloads captured from the engine's own test flow (tests/test_effy_film_staleness.py and
// test_effy_film_signoff.py) on 14 Sep 2026, so the shapes match what /films/:id really returns.
// Regenerate rather than hand-edit.
const films = {
  "awaitingMasterSignoff": {
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
    "createdAt": "2026-09-14T12:52:25.792513",
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
    "posterUrl": "/api/effy/media/img_17523c9b1822894ea0.png",
    "product": "Roofseal",
    "renders": {
      "master": "/api/effy/media/vid_a0e278dbaaf4f9defa.mp4",
      "qa": {
        "durationS": 12.0,
        "note": "No stray voices.",
        "status": "audio_clean"
      }
    },
    "revisionAllowance": 1,
    "sceneCount": 2,
    "scenes": [
      {
        "audioNote": "No stray voices.",
        "clip": "vid_2c34c5657124f77106.mp4",
        "clipStale": false,
        "clipStatus": "audio_clean",
        "clipUrl": "/api/effy/media/vid_2c34c5657124f77106.mp4",
        "id": 1,
        "idx": 0,
        "line": "Har chhat jhelti hai dhoop.",
        "motion": "slow push-in",
        "op": "",
        "seconds": 4,
        "signoff": {
          "approver": {
            "email": "user-30079a1a0d@test.in",
            "name": "Asha Rao",
            "role": "Workspace admin"
          },
          "at": "2026-09-14T12:52:25.866619",
          "decision": "approved",
          "extraScope": false,
          "id": 1,
          "note": "",
          "round": 1,
          "stage": "stills",
          "target": "1"
        },
        "still": "img_17523c9b1822894ea0.png",
        "stillStatus": "approved",
        "stillUrl": "/api/effy/media/img_17523c9b1822894ea0.png",
        "takes": 1,
        "visual": "cracked rooftop",
        "vo": "aud_b398bb56dc9df9b5d4.mp3",
        "voSeconds": 3.6,
        "voStale": false,
        "voUrl": "/api/effy/media/aud_b398bb56dc9df9b5d4.mp3"
      },
      {
        "audioNote": "No stray voices.",
        "clip": "vid_cb21e4d3085552ea2d.mp4",
        "clipStale": false,
        "clipStatus": "audio_clean",
        "clipUrl": "/api/effy/media/vid_cb21e4d3085552ea2d.mp4",
        "id": 2,
        "idx": 1,
        "line": "Tab aata hai Roofseal.",
        "motion": "track the roller",
        "op": "",
        "seconds": 4,
        "signoff": {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.240725",
          "decision": "approved",
          "extraScope": true,
          "id": 6,
          "note": "",
          "round": 3,
          "stage": "stills",
          "target": "2"
        },
        "still": "img_5d32d8ba34a5d2a984.png",
        "stillStatus": "approved",
        "stillUrl": "/api/effy/media/img_5d32d8ba34a5d2a984.png",
        "takes": 2,
        "visual": "roller spreads coating",
        "vo": "aud_0fcbed46b1749554a8.mp3",
        "voSeconds": 3.6,
        "voStale": false,
        "voUrl": "/api/effy/media/aud_0fcbed46b1749554a8.mp3"
      }
    ],
    "signoffs": {
      "cutdowns": {},
      "history": [
        {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.240725",
          "decision": "approved",
          "extraScope": true,
          "id": 6,
          "note": "",
          "round": 3,
          "stage": "stills",
          "target": "2"
        },
        {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.202106",
          "decision": "changes_requested",
          "extraScope": false,
          "id": 5,
          "note": "Roller should be blue",
          "round": 2,
          "stage": "stills",
          "target": "2"
        },
        {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.189139",
          "decision": "approved",
          "extraScope": false,
          "id": 4,
          "note": "",
          "round": 2,
          "stage": "stills",
          "target": "2"
        },
        {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.150957",
          "decision": "changes_requested",
          "extraScope": false,
          "id": 3,
          "note": "Roller should be blue",
          "round": 1,
          "stage": "stills",
          "target": "2"
        },
        {
          "approver": {
            "email": "user-30079a1a0d@test.in",
            "name": "Asha Rao",
            "role": "Workspace admin"
          },
          "at": "2026-09-14T12:52:25.904249",
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
            "email": "user-30079a1a0d@test.in",
            "name": "Asha Rao",
            "role": "Workspace admin"
          },
          "at": "2026-09-14T12:52:25.866619",
          "decision": "approved",
          "extraScope": false,
          "id": 1,
          "note": "",
          "round": 1,
          "stage": "stills",
          "target": "1"
        }
      ],
      "master": null,
      "masterApproved": false
    },
    "spendUsd": 2.068,
    "stage": 6,
    "stages": [
      "direction",
      "script",
      "stills",
      "animate",
      "voice",
      "assemble",
      "deliver"
    ],
    "status": "production",
    "styleBlock": "Photorealistic Indian advertising film still, 16:9 landscape composition, shot on 35mm, natural daylight, warm sun-baked tones with deep blue sky, crisp detail, cinematic contrast, clean composition. NO text, NO logos, NO watermarks.",
    "title": "Roof Ka Rakshak",
    "totalS": 12,
    "updatedAt": "2026-09-14T12:52:26.306413",
    "voice": ""
  },
  "fresh": {
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
    "createdAt": "2026-09-14T12:52:25.792513",
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
    "posterUrl": "/api/effy/media/img_17523c9b1822894ea0.png",
    "product": "Roofseal",
    "renders": {
      "master": "/api/effy/media/vid_a0e278dbaaf4f9defa.mp4",
      "personalized": [
        {
          "media": "vid_2dc0cc33b69e8d372d.mp4",
          "name": "Sharma",
          "url": "/api/effy/media/vid_2dc0cc33b69e8d372d.mp4"
        }
      ],
      "qa": {
        "durationS": 12.0,
        "note": "No stray voices.",
        "status": "audio_clean"
      },
      "reel": "/api/effy/media/vid_13f42e22f8c13a9e77.mp4",
      "whatsapp": "/api/effy/media/vid_6732f684890ac990f8.mp4"
    },
    "revisionAllowance": 1,
    "sceneCount": 2,
    "scenes": [
      {
        "audioNote": "No stray voices.",
        "clip": "vid_2c34c5657124f77106.mp4",
        "clipStale": false,
        "clipStatus": "audio_clean",
        "clipUrl": "/api/effy/media/vid_2c34c5657124f77106.mp4",
        "id": 1,
        "idx": 0,
        "line": "Har chhat jhelti hai dhoop.",
        "motion": "slow push-in",
        "op": "",
        "seconds": 4,
        "signoff": {
          "approver": {
            "email": "user-30079a1a0d@test.in",
            "name": "Asha Rao",
            "role": "Workspace admin"
          },
          "at": "2026-09-14T12:52:25.866619",
          "decision": "approved",
          "extraScope": false,
          "id": 1,
          "note": "",
          "round": 1,
          "stage": "stills",
          "target": "1"
        },
        "still": "img_17523c9b1822894ea0.png",
        "stillStatus": "approved",
        "stillUrl": "/api/effy/media/img_17523c9b1822894ea0.png",
        "takes": 1,
        "visual": "cracked rooftop",
        "vo": "aud_b398bb56dc9df9b5d4.mp3",
        "voSeconds": 3.6,
        "voStale": false,
        "voUrl": "/api/effy/media/aud_b398bb56dc9df9b5d4.mp3"
      },
      {
        "audioNote": "No stray voices.",
        "clip": "vid_cb21e4d3085552ea2d.mp4",
        "clipStale": false,
        "clipStatus": "audio_clean",
        "clipUrl": "/api/effy/media/vid_cb21e4d3085552ea2d.mp4",
        "id": 2,
        "idx": 1,
        "line": "Tab aata hai Roofseal.",
        "motion": "track the roller",
        "op": "",
        "seconds": 4,
        "signoff": {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.240725",
          "decision": "approved",
          "extraScope": true,
          "id": 6,
          "note": "",
          "round": 3,
          "stage": "stills",
          "target": "2"
        },
        "still": "img_5d32d8ba34a5d2a984.png",
        "stillStatus": "approved",
        "stillUrl": "/api/effy/media/img_5d32d8ba34a5d2a984.png",
        "takes": 2,
        "visual": "roller spreads coating",
        "vo": "aud_0fcbed46b1749554a8.mp3",
        "voSeconds": 3.6,
        "voStale": false,
        "voUrl": "/api/effy/media/aud_0fcbed46b1749554a8.mp3"
      }
    ],
    "signoffs": {
      "cutdowns": {
        "dealer:Sharma": null,
        "reel": null,
        "whatsapp": {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.394199",
          "decision": "approved",
          "extraScope": false,
          "id": 9,
          "note": "",
          "round": 1,
          "stage": "cutdown",
          "target": "whatsapp"
        }
      },
      "history": [
        {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.394199",
          "decision": "approved",
          "extraScope": false,
          "id": 9,
          "note": "",
          "round": 1,
          "stage": "cutdown",
          "target": "whatsapp"
        },
        {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.332921",
          "decision": "approved",
          "extraScope": false,
          "id": 8,
          "note": "",
          "round": 1,
          "stage": "master",
          "target": ""
        },
        {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.320385",
          "decision": "changes_requested",
          "extraScope": false,
          "id": 7,
          "note": "Logo bigger on the end card",
          "round": 1,
          "stage": "master",
          "target": ""
        },
        {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.240725",
          "decision": "approved",
          "extraScope": true,
          "id": 6,
          "note": "",
          "round": 3,
          "stage": "stills",
          "target": "2"
        },
        {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.202106",
          "decision": "changes_requested",
          "extraScope": false,
          "id": 5,
          "note": "Roller should be blue",
          "round": 2,
          "stage": "stills",
          "target": "2"
        },
        {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.189139",
          "decision": "approved",
          "extraScope": false,
          "id": 4,
          "note": "",
          "round": 2,
          "stage": "stills",
          "target": "2"
        },
        {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.150957",
          "decision": "changes_requested",
          "extraScope": false,
          "id": 3,
          "note": "Roller should be blue",
          "round": 1,
          "stage": "stills",
          "target": "2"
        },
        {
          "approver": {
            "email": "user-30079a1a0d@test.in",
            "name": "Asha Rao",
            "role": "Workspace admin"
          },
          "at": "2026-09-14T12:52:25.904249",
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
            "email": "user-30079a1a0d@test.in",
            "name": "Asha Rao",
            "role": "Workspace admin"
          },
          "at": "2026-09-14T12:52:25.866619",
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
          "email": "user-b48b69cad1@test.in",
          "name": "Meera Iyer",
          "role": "Client approver"
        },
        "at": "2026-09-14T12:52:26.332921",
        "decision": "approved",
        "extraScope": false,
        "id": 8,
        "note": "",
        "round": 1,
        "stage": "master",
        "target": ""
      },
      "masterApproved": true
    },
    "spendUsd": 2.068,
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
    "updatedAt": "2026-09-14T12:52:26.380295",
    "voice": ""
  },
  "lineEdited": {
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
    "createdAt": "2026-09-14T12:52:25.792513",
    "cut": {
      "blockers": [
        "Scene 1: the line or voice changed after the voiceover was made — regenerate it."
      ],
      "canAssemble": false,
      "dealersStale": true,
      "exportsStale": true,
      "masterStale": true
    },
    "direction": {},
    "durationS": 12,
    "endCard": {},
    "id": 1,
    "language": "Hinglish",
    "posterUrl": "/api/effy/media/img_17523c9b1822894ea0.png",
    "product": "Roofseal",
    "renders": {
      "master": "/api/effy/media/vid_a0e278dbaaf4f9defa.mp4",
      "personalized": [
        {
          "media": "vid_2dc0cc33b69e8d372d.mp4",
          "name": "Sharma",
          "url": "/api/effy/media/vid_2dc0cc33b69e8d372d.mp4"
        }
      ],
      "qa": {
        "durationS": 12.0,
        "note": "No stray voices.",
        "status": "audio_clean"
      },
      "reel": "/api/effy/media/vid_13f42e22f8c13a9e77.mp4",
      "whatsapp": "/api/effy/media/vid_6732f684890ac990f8.mp4"
    },
    "revisionAllowance": 1,
    "sceneCount": 2,
    "scenes": [
      {
        "audioNote": "No stray voices.",
        "clip": "vid_2c34c5657124f77106.mp4",
        "clipStale": false,
        "clipStatus": "audio_clean",
        "clipUrl": "/api/effy/media/vid_2c34c5657124f77106.mp4",
        "id": 1,
        "idx": 0,
        "line": "Ab chhat rahegi thandi.",
        "motion": "slow push-in",
        "op": "",
        "seconds": 4,
        "signoff": {
          "approver": {
            "email": "user-30079a1a0d@test.in",
            "name": "Asha Rao",
            "role": "Workspace admin"
          },
          "at": "2026-09-14T12:52:25.866619",
          "decision": "approved",
          "extraScope": false,
          "id": 1,
          "note": "",
          "round": 1,
          "stage": "stills",
          "target": "1"
        },
        "still": "img_17523c9b1822894ea0.png",
        "stillStatus": "approved",
        "stillUrl": "/api/effy/media/img_17523c9b1822894ea0.png",
        "takes": 1,
        "visual": "cracked rooftop",
        "vo": "aud_b398bb56dc9df9b5d4.mp3",
        "voSeconds": 3.6,
        "voStale": true,
        "voUrl": "/api/effy/media/aud_b398bb56dc9df9b5d4.mp3"
      },
      {
        "audioNote": "No stray voices.",
        "clip": "vid_cb21e4d3085552ea2d.mp4",
        "clipStale": false,
        "clipStatus": "audio_clean",
        "clipUrl": "/api/effy/media/vid_cb21e4d3085552ea2d.mp4",
        "id": 2,
        "idx": 1,
        "line": "Tab aata hai Roofseal.",
        "motion": "track the roller",
        "op": "",
        "seconds": 4,
        "signoff": {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.240725",
          "decision": "approved",
          "extraScope": true,
          "id": 6,
          "note": "",
          "round": 3,
          "stage": "stills",
          "target": "2"
        },
        "still": "img_5d32d8ba34a5d2a984.png",
        "stillStatus": "approved",
        "stillUrl": "/api/effy/media/img_5d32d8ba34a5d2a984.png",
        "takes": 2,
        "visual": "roller spreads coating",
        "vo": "aud_0fcbed46b1749554a8.mp3",
        "voSeconds": 3.6,
        "voStale": false,
        "voUrl": "/api/effy/media/aud_0fcbed46b1749554a8.mp3"
      }
    ],
    "signoffs": {
      "cutdowns": {},
      "history": [
        {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.394199",
          "decision": "approved",
          "extraScope": false,
          "id": 9,
          "note": "",
          "round": 1,
          "stage": "cutdown",
          "target": "whatsapp"
        },
        {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.332921",
          "decision": "approved",
          "extraScope": false,
          "id": 8,
          "note": "",
          "round": 1,
          "stage": "master",
          "target": ""
        },
        {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.320385",
          "decision": "changes_requested",
          "extraScope": false,
          "id": 7,
          "note": "Logo bigger on the end card",
          "round": 1,
          "stage": "master",
          "target": ""
        },
        {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.240725",
          "decision": "approved",
          "extraScope": true,
          "id": 6,
          "note": "",
          "round": 3,
          "stage": "stills",
          "target": "2"
        },
        {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.202106",
          "decision": "changes_requested",
          "extraScope": false,
          "id": 5,
          "note": "Roller should be blue",
          "round": 2,
          "stage": "stills",
          "target": "2"
        },
        {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.189139",
          "decision": "approved",
          "extraScope": false,
          "id": 4,
          "note": "",
          "round": 2,
          "stage": "stills",
          "target": "2"
        },
        {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.150957",
          "decision": "changes_requested",
          "extraScope": false,
          "id": 3,
          "note": "Roller should be blue",
          "round": 1,
          "stage": "stills",
          "target": "2"
        },
        {
          "approver": {
            "email": "user-30079a1a0d@test.in",
            "name": "Asha Rao",
            "role": "Workspace admin"
          },
          "at": "2026-09-14T12:52:25.904249",
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
            "email": "user-30079a1a0d@test.in",
            "name": "Asha Rao",
            "role": "Workspace admin"
          },
          "at": "2026-09-14T12:52:25.866619",
          "decision": "approved",
          "extraScope": false,
          "id": 1,
          "note": "",
          "round": 1,
          "stage": "stills",
          "target": "1"
        }
      ],
      "master": null,
      "masterApproved": false
    },
    "spendUsd": 2.068,
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
    "updatedAt": "2026-09-14T12:52:26.380295",
    "voice": ""
  },
  "stillRegenerated": {
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
    "createdAt": "2026-09-14T12:52:25.792513",
    "cut": {
      "blockers": [
        "Scene 1 changed after it was animated — retake it."
      ],
      "canAssemble": false,
      "dealersStale": true,
      "exportsStale": true,
      "masterStale": true
    },
    "direction": {},
    "durationS": 12,
    "endCard": {},
    "id": 1,
    "language": "Hinglish",
    "posterUrl": "/api/effy/media/img_fd634c59f7f10db75e.png",
    "product": "Roofseal",
    "renders": {
      "master": "/api/effy/media/vid_a0e278dbaaf4f9defa.mp4",
      "personalized": [
        {
          "media": "vid_2dc0cc33b69e8d372d.mp4",
          "name": "Sharma",
          "url": "/api/effy/media/vid_2dc0cc33b69e8d372d.mp4"
        }
      ],
      "qa": {
        "durationS": 12.0,
        "note": "No stray voices.",
        "status": "audio_clean"
      },
      "reel": "/api/effy/media/vid_13f42e22f8c13a9e77.mp4",
      "whatsapp": "/api/effy/media/vid_6732f684890ac990f8.mp4"
    },
    "revisionAllowance": 1,
    "sceneCount": 2,
    "scenes": [
      {
        "audioNote": "No stray voices.",
        "clip": "vid_2c34c5657124f77106.mp4",
        "clipStale": true,
        "clipStatus": "audio_clean",
        "clipUrl": "/api/effy/media/vid_2c34c5657124f77106.mp4",
        "id": 1,
        "idx": 0,
        "line": "Ab chhat rahegi thandi.",
        "motion": "slow push-in",
        "op": "",
        "seconds": 4,
        "signoff": {
          "approver": {
            "email": "user-30079a1a0d@test.in",
            "name": "Asha Rao",
            "role": "Workspace admin"
          },
          "at": "2026-09-14T12:52:26.461404",
          "decision": "approved",
          "extraScope": false,
          "id": 10,
          "note": "",
          "round": 2,
          "stage": "stills",
          "target": "1"
        },
        "still": "img_fd634c59f7f10db75e.png",
        "stillStatus": "approved",
        "stillUrl": "/api/effy/media/img_fd634c59f7f10db75e.png",
        "takes": 1,
        "visual": "cracked rooftop",
        "vo": "aud_5171943aa35c79ef1e.mp3",
        "voSeconds": 3.6,
        "voStale": false,
        "voUrl": "/api/effy/media/aud_5171943aa35c79ef1e.mp3"
      },
      {
        "audioNote": "No stray voices.",
        "clip": "vid_cb21e4d3085552ea2d.mp4",
        "clipStale": false,
        "clipStatus": "audio_clean",
        "clipUrl": "/api/effy/media/vid_cb21e4d3085552ea2d.mp4",
        "id": 2,
        "idx": 1,
        "line": "Tab aata hai Roofseal.",
        "motion": "track the roller",
        "op": "",
        "seconds": 4,
        "signoff": {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.240725",
          "decision": "approved",
          "extraScope": true,
          "id": 6,
          "note": "",
          "round": 3,
          "stage": "stills",
          "target": "2"
        },
        "still": "img_5d32d8ba34a5d2a984.png",
        "stillStatus": "approved",
        "stillUrl": "/api/effy/media/img_5d32d8ba34a5d2a984.png",
        "takes": 2,
        "visual": "roller spreads coating",
        "vo": "aud_0fcbed46b1749554a8.mp3",
        "voSeconds": 3.6,
        "voStale": false,
        "voUrl": "/api/effy/media/aud_0fcbed46b1749554a8.mp3"
      }
    ],
    "signoffs": {
      "cutdowns": {},
      "history": [
        {
          "approver": {
            "email": "user-30079a1a0d@test.in",
            "name": "Asha Rao",
            "role": "Workspace admin"
          },
          "at": "2026-09-14T12:52:26.461404",
          "decision": "approved",
          "extraScope": false,
          "id": 10,
          "note": "",
          "round": 2,
          "stage": "stills",
          "target": "1"
        },
        {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.394199",
          "decision": "approved",
          "extraScope": false,
          "id": 9,
          "note": "",
          "round": 1,
          "stage": "cutdown",
          "target": "whatsapp"
        },
        {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.332921",
          "decision": "approved",
          "extraScope": false,
          "id": 8,
          "note": "",
          "round": 1,
          "stage": "master",
          "target": ""
        },
        {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.320385",
          "decision": "changes_requested",
          "extraScope": false,
          "id": 7,
          "note": "Logo bigger on the end card",
          "round": 1,
          "stage": "master",
          "target": ""
        },
        {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.240725",
          "decision": "approved",
          "extraScope": true,
          "id": 6,
          "note": "",
          "round": 3,
          "stage": "stills",
          "target": "2"
        },
        {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.202106",
          "decision": "changes_requested",
          "extraScope": false,
          "id": 5,
          "note": "Roller should be blue",
          "round": 2,
          "stage": "stills",
          "target": "2"
        },
        {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.189139",
          "decision": "approved",
          "extraScope": false,
          "id": 4,
          "note": "",
          "round": 2,
          "stage": "stills",
          "target": "2"
        },
        {
          "approver": {
            "email": "user-b48b69cad1@test.in",
            "name": "Meera Iyer",
            "role": "Client approver"
          },
          "at": "2026-09-14T12:52:26.150957",
          "decision": "changes_requested",
          "extraScope": false,
          "id": 3,
          "note": "Roller should be blue",
          "round": 1,
          "stage": "stills",
          "target": "2"
        },
        {
          "approver": {
            "email": "user-30079a1a0d@test.in",
            "name": "Asha Rao",
            "role": "Workspace admin"
          },
          "at": "2026-09-14T12:52:25.904249",
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
            "email": "user-30079a1a0d@test.in",
            "name": "Asha Rao",
            "role": "Workspace admin"
          },
          "at": "2026-09-14T12:52:25.866619",
          "decision": "approved",
          "extraScope": false,
          "id": 1,
          "note": "",
          "round": 1,
          "stage": "stills",
          "target": "1"
        }
      ],
      "master": null,
      "masterApproved": false
    },
    "spendUsd": 2.135,
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
    "updatedAt": "2026-09-14T12:52:26.449941",
    "voice": ""
  }
};

export default films;
