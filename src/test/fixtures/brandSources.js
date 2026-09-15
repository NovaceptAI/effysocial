// Brand source payloads captured from the engine's test flow (tests/test_effy_webread.py, with its
// stubbed site) on 15 Sep 2026: a website read, read again, one that returns no text, a written
// brief, and a plan whose website couldn't be read. Regenerate rather than hand-edit.
const brandSources = {
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
        "data": [
          {
            "chars": 545,
            "confidence": 85,
            "date": "2026-09-15",
            "freshness": "fresh",
            "id": 1,
            "name": "Nova Labs | AI services",
            "ref": "https://nova.example/",
            "type": "website"
          },
          {
            "chars": 0,
            "confidence": 85,
            "date": "2026-09-15",
            "freshness": "fresh",
            "id": 2,
            "name": "https://www.nova.example/",
            "ref": "https://www.nova.example/",
            "type": "website"
          },
          {
            "chars": 89,
            "confidence": 90,
            "date": "2026-09-15",
            "freshness": "fresh",
            "id": 3,
            "name": "Business brief",
            "ref": "",
            "type": "manual"
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
  "brief": {
    "source": {
      "chars": 89,
      "confidence": 90,
      "date": "2026-09-15",
      "freshness": "fresh",
      "id": 3,
      "name": "Business brief",
      "ref": "",
      "type": "manual"
    },
    "status": "ok"
  },
  "planWebsiteUnread": {
    "plan": {
      "createdAt": "2026-09-15T08:54:56.150866",
      "id": 1,
      "inputs": {
        "brandBrain": false,
        "connected": [],
        "currency": "INR",
        "documents": true,
        "goals": [],
        "industry": "",
        "location": "",
        "name": "Asha Rao's workspace",
        "offer": "both",
        "orgType": "business",
        "teamSize": "",
        "website": "https://www.nova.example/",
        "websiteNote": "We couldn't read much text from that website — it may build its pages with JavaScript. Upload a brochure or write a short brief instead.",
        "websiteRead": false
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
  "websiteAlreadyRead": {
    "read": {
      "already": true,
      "chars": 545,
      "ok": true,
      "pages": null
    },
    "source": {
      "chars": 545,
      "confidence": 85,
      "date": "2026-09-15",
      "freshness": "fresh",
      "id": 1,
      "name": "Nova Labs | AI services",
      "ref": "https://nova.example/",
      "type": "website"
    },
    "status": "ok"
  },
  "websiteRead": {
    "read": {
      "chars": 545,
      "ok": true,
      "pages": 3
    },
    "source": {
      "chars": 545,
      "confidence": 85,
      "date": "2026-09-15",
      "freshness": "fresh",
      "id": 1,
      "name": "Nova Labs | AI services",
      "ref": "https://nova.example/",
      "type": "website"
    },
    "status": "ok"
  },
  "websiteUnreadable": {
    "read": {
      "message": "We couldn't read much text from that website — it may build its pages with JavaScript. Upload a brochure or write a short brief instead.",
      "ok": false
    },
    "source": {
      "chars": 0,
      "confidence": 85,
      "date": "2026-09-15",
      "freshness": "fresh",
      "id": 2,
      "name": "https://www.nova.example/",
      "ref": "https://www.nova.example/",
      "type": "website"
    },
    "status": "ok"
  }
};

export default brandSources;
