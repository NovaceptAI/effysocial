// Ad Films payloads captured from the engine's own test flow (tests/test_effy_film_staleness.py)
// on 14 Sep 2026, so the shapes match what /films/:id really returns. Regenerate rather than hand-edit.
const films = {
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
    "createdAt": "2026-09-14T12:21:49.873398",
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
    "posterUrl": "/api/effy/media/img_62eb3fcec27426d532.png",
    "product": "Roofseal",
    "renders": {
      "master": "/api/effy/media/vid_9db487a4bfe46b5732.mp4",
      "personalized": [
        {
          "media": "vid_9f02f133bf854e043e.mp4",
          "name": "Sharma",
          "url": "/api/effy/media/vid_9f02f133bf854e043e.mp4"
        }
      ],
      "qa": {
        "durationS": 12.0,
        "note": "No stray voices.",
        "status": "audio_clean"
      },
      "reel": "/api/effy/media/vid_367b9cded21aa14c71.mp4",
      "whatsapp": "/api/effy/media/vid_98adbabd2066371021.mp4"
    },
    "sceneCount": 2,
    "scenes": [
      {
        "audioNote": "No stray voices.",
        "clip": "vid_dcef57931ac52decb0.mp4",
        "clipStale": false,
        "clipStatus": "audio_clean",
        "clipUrl": "/api/effy/media/vid_dcef57931ac52decb0.mp4",
        "id": 1,
        "idx": 0,
        "line": "Har chhat jhelti hai dhoop.",
        "motion": "slow push-in",
        "op": "",
        "seconds": 4,
        "still": "img_62eb3fcec27426d532.png",
        "stillStatus": "approved",
        "stillUrl": "/api/effy/media/img_62eb3fcec27426d532.png",
        "takes": 1,
        "visual": "cracked rooftop",
        "vo": "aud_a86090eb36d2b0b29f.mp3",
        "voSeconds": 3.6,
        "voStale": false,
        "voUrl": "/api/effy/media/aud_a86090eb36d2b0b29f.mp3"
      },
      {
        "audioNote": "No stray voices.",
        "clip": "vid_0231be9bde5b8a8d41.mp4",
        "clipStale": false,
        "clipStatus": "audio_clean",
        "clipUrl": "/api/effy/media/vid_0231be9bde5b8a8d41.mp4",
        "id": 2,
        "idx": 1,
        "line": "Tab aata hai Roofseal.",
        "motion": "track the roller",
        "op": "",
        "seconds": 4,
        "still": "img_d610f64521feab6d81.png",
        "stillStatus": "approved",
        "stillUrl": "/api/effy/media/img_d610f64521feab6d81.png",
        "takes": 1,
        "visual": "roller spreads coating",
        "vo": "aud_2c98ae0602ecfbbb8b.mp3",
        "voSeconds": 3.6,
        "voStale": false,
        "voUrl": "/api/effy/media/aud_2c98ae0602ecfbbb8b.mp3"
      }
    ],
    "spendUsd": 1.334,
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
    "updatedAt": "2026-09-14T12:21:50.127832",
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
    "createdAt": "2026-09-14T12:21:49.873398",
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
    "posterUrl": "/api/effy/media/img_62eb3fcec27426d532.png",
    "product": "Roofseal",
    "renders": {
      "master": "/api/effy/media/vid_9db487a4bfe46b5732.mp4",
      "personalized": [
        {
          "media": "vid_9f02f133bf854e043e.mp4",
          "name": "Sharma",
          "url": "/api/effy/media/vid_9f02f133bf854e043e.mp4"
        }
      ],
      "qa": {
        "durationS": 12.0,
        "note": "No stray voices.",
        "status": "audio_clean"
      },
      "reel": "/api/effy/media/vid_367b9cded21aa14c71.mp4",
      "whatsapp": "/api/effy/media/vid_98adbabd2066371021.mp4"
    },
    "sceneCount": 2,
    "scenes": [
      {
        "audioNote": "No stray voices.",
        "clip": "vid_dcef57931ac52decb0.mp4",
        "clipStale": false,
        "clipStatus": "audio_clean",
        "clipUrl": "/api/effy/media/vid_dcef57931ac52decb0.mp4",
        "id": 1,
        "idx": 0,
        "line": "Ab chhat rahegi thandi.",
        "motion": "slow push-in",
        "op": "",
        "seconds": 4,
        "still": "img_62eb3fcec27426d532.png",
        "stillStatus": "approved",
        "stillUrl": "/api/effy/media/img_62eb3fcec27426d532.png",
        "takes": 1,
        "visual": "cracked rooftop",
        "vo": "aud_a86090eb36d2b0b29f.mp3",
        "voSeconds": 3.6,
        "voStale": true,
        "voUrl": "/api/effy/media/aud_a86090eb36d2b0b29f.mp3"
      },
      {
        "audioNote": "No stray voices.",
        "clip": "vid_0231be9bde5b8a8d41.mp4",
        "clipStale": false,
        "clipStatus": "audio_clean",
        "clipUrl": "/api/effy/media/vid_0231be9bde5b8a8d41.mp4",
        "id": 2,
        "idx": 1,
        "line": "Tab aata hai Roofseal.",
        "motion": "track the roller",
        "op": "",
        "seconds": 4,
        "still": "img_d610f64521feab6d81.png",
        "stillStatus": "approved",
        "stillUrl": "/api/effy/media/img_d610f64521feab6d81.png",
        "takes": 1,
        "visual": "roller spreads coating",
        "vo": "aud_2c98ae0602ecfbbb8b.mp3",
        "voSeconds": 3.6,
        "voStale": false,
        "voUrl": "/api/effy/media/aud_2c98ae0602ecfbbb8b.mp3"
      }
    ],
    "spendUsd": 1.334,
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
    "updatedAt": "2026-09-14T12:21:50.127832",
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
    "createdAt": "2026-09-14T12:21:49.873398",
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
    "posterUrl": "/api/effy/media/img_8e2f50bbf57d361b40.png",
    "product": "Roofseal",
    "renders": {
      "master": "/api/effy/media/vid_9db487a4bfe46b5732.mp4",
      "personalized": [
        {
          "media": "vid_9f02f133bf854e043e.mp4",
          "name": "Sharma",
          "url": "/api/effy/media/vid_9f02f133bf854e043e.mp4"
        }
      ],
      "qa": {
        "durationS": 12.0,
        "note": "No stray voices.",
        "status": "audio_clean"
      },
      "reel": "/api/effy/media/vid_367b9cded21aa14c71.mp4",
      "whatsapp": "/api/effy/media/vid_98adbabd2066371021.mp4"
    },
    "sceneCount": 2,
    "scenes": [
      {
        "audioNote": "No stray voices.",
        "clip": "vid_dcef57931ac52decb0.mp4",
        "clipStale": true,
        "clipStatus": "audio_clean",
        "clipUrl": "/api/effy/media/vid_dcef57931ac52decb0.mp4",
        "id": 1,
        "idx": 0,
        "line": "Ab chhat rahegi thandi.",
        "motion": "slow push-in",
        "op": "",
        "seconds": 4,
        "still": "img_8e2f50bbf57d361b40.png",
        "stillStatus": "approved",
        "stillUrl": "/api/effy/media/img_8e2f50bbf57d361b40.png",
        "takes": 1,
        "visual": "cracked rooftop",
        "vo": "aud_a383d4684bf8078e15.mp3",
        "voSeconds": 3.6,
        "voStale": false,
        "voUrl": "/api/effy/media/aud_a383d4684bf8078e15.mp3"
      },
      {
        "audioNote": "No stray voices.",
        "clip": "vid_0231be9bde5b8a8d41.mp4",
        "clipStale": false,
        "clipStatus": "audio_clean",
        "clipUrl": "/api/effy/media/vid_0231be9bde5b8a8d41.mp4",
        "id": 2,
        "idx": 1,
        "line": "Tab aata hai Roofseal.",
        "motion": "track the roller",
        "op": "",
        "seconds": 4,
        "still": "img_d610f64521feab6d81.png",
        "stillStatus": "approved",
        "stillUrl": "/api/effy/media/img_d610f64521feab6d81.png",
        "takes": 1,
        "visual": "roller spreads coating",
        "vo": "aud_2c98ae0602ecfbbb8b.mp3",
        "voSeconds": 3.6,
        "voStale": false,
        "voUrl": "/api/effy/media/aud_2c98ae0602ecfbbb8b.mp3"
      }
    ],
    "spendUsd": 1.401,
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
    "updatedAt": "2026-09-14T12:21:50.184707",
    "voice": ""
  },
  "exportRefusal": [
    409,
    {
      "message": "The film changed after it was assembled — re-assemble it first.",
      "status": "error"
    }
  ],
  "assembleRefusal": [
    409,
    {
      "blockers": [
        "Scene 1 changed after it was animated — retake it."
      ],
      "message": "Not ready to assemble. Scene 1 changed after it was animated — retake it.",
      "status": "error"
    }
  ]
};

export default films;
