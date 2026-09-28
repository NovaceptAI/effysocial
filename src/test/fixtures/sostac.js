// Marketing plan payloads on SOSTAC (launch plan 6.18), captured from the engine's test flow
// (tests/test_effy_sostac.py shapes, the model's answer being tests/conftest.py SOSTAC_RAW) on
// 28 Sep 2026: a business with a brief (40 leads, INR 30,000, 5 posts a week) writes a plan;
// one lead and one post arrive in week 1; the plan is accepted; then, with no target in the
// brief, a new plan suggests one. Instagram wasn't connected. Regenerate rather than hand-edit.
const sostac = {
  "written": {
    "plan": {
      "createdAt": "2026-09-28T16:13:07.556001",
      "id": 1,
      "inputs": {
        "brandBrain": false,
        "budget": 30000,
        "capacity": 5,
        "clientOfAgency": false,
        "connected": [],
        "currency": "INR",
        "customer": "Housing societies in Pune",
        "documents": false,
        "format": "sostac",
        "goal": {
          "label": "Leads",
          "metric": "leads",
          "target": 40,
          "unit": "leads a month"
        },
        "goals": [
          "Leads"
        ],
        "industry": "",
        "kind": "business",
        "location": "",
        "name": "Roofseal Pune",
        "offer": "Terrace waterproofing with a 5-year warranty",
        "orgType": "business",
        "website": ""
      },
      "month": "2026-09",
      "plan": {
        "action": {
          "weeks": [
            {
              "focus": "Launch",
              "tasks": [
                "Post the first reel",
                "Set up WhatsApp replies"
              ],
              "week": 1
            },
            {
              "focus": "Proof",
              "tasks": [
                "Share two before-and-afters"
              ],
              "week": 2
            },
            {
              "focus": "Offer",
              "tasks": [
                "Run the check-up offer"
              ],
              "week": 3
            },
            {
              "focus": "Review",
              "tasks": [
                "Compare leads against the target"
              ],
              "week": 4
            }
          ]
        },
        "capacity": 5,
        "channels": [
          {
            "channel": "instagram",
            "postsPerWeek": 3,
            "role": "Reels of repairs"
          },
          {
            "channel": "whatsapp",
            "postsPerWeek": 2,
            "role": "Follow-ups"
          }
        ],
        "control": {
          "kpis": [
            {
              "metric": "Leads",
              "target": "Aim for 50",
              "why": "The goal"
            }
          ],
          "weekly": [
            {
              "end": "2026-10-04",
              "plannedGoal": 10,
              "plannedPosts": 5,
              "start": "2026-09-28",
              "week": 1
            },
            {
              "end": "2026-10-11",
              "plannedGoal": 10,
              "plannedPosts": 5,
              "start": "2026-10-05",
              "week": 2
            },
            {
              "end": "2026-10-18",
              "plannedGoal": 10,
              "plannedPosts": 5,
              "start": "2026-10-12",
              "week": 3
            },
            {
              "end": "2026-10-25",
              "plannedGoal": 10,
              "plannedPosts": 5,
              "start": "2026-10-19",
              "week": 4
            }
          ]
        },
        "endsOn": "2026-10-25",
        "firstWeek": [
          "Post the first reel",
          "Set up WhatsApp replies"
        ],
        "format": "sostac",
        "funnel": [
          "Reel",
          "WhatsApp chat",
          "Site visit"
        ],
        "ideas": [
          {
            "channel": "instagram",
            "format": "Reel",
            "pillar": "Proof",
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
            "pillar": "Proof",
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
            "pillar": "Proof",
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
            "pillar": "Proof",
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
            "pillar": "Proof",
            "title": "Idea 8"
          },
          {
            "channel": "instagram",
            "format": "Reel",
            "pillar": "Proof",
            "title": "Idea 9"
          }
        ],
        "kpis": [
          {
            "metric": "Leads",
            "target": "Aim for 50",
            "why": "The goal"
          }
        ],
        "objective": {
          "baseline": 0,
          "baselineSource": "Leads in the last 30 days",
          "by": "2026-10-25",
          "label": "Leads",
          "measured": true,
          "metric": "leads",
          "suggested": false,
          "target": 40,
          "unit": "leads a month",
          "why": "A realistic step up from the last month."
        },
        "pillars": [
          {
            "name": "Proof",
            "share": 50,
            "why": "Show real work."
          },
          {
            "name": "Education",
            "share": 30,
            "why": "Explain leaks."
          },
          {
            "name": "Offer",
            "share": 20,
            "why": "A reason to call."
          }
        ],
        "situation": {
          "gaps": [
            "No channel is connected, so nothing publishes or reports automatically yet.",
            "Instagram isn't connected: followers, reach and engagement can't be measured.",
            "Brand Brain is less than half filled in, so the plan knows little about the brand."
          ],
          "numbers": [
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "followers",
              "label": "Instagram followers",
              "source": null,
              "unit": null,
              "value": null,
              "why": "Connect Instagram to measure this."
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "reach28",
              "label": "People reached on Instagram, last 28 days",
              "source": null,
              "unit": null,
              "value": null,
              "why": "Connect Instagram to measure this."
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "interactions28",
              "label": "Instagram interactions, last 28 days",
              "source": null,
              "unit": null,
              "value": null,
              "why": "Connect Instagram to measure this."
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "postsPublished30",
              "label": "Posts published through EffySocial, last 30 days",
              "source": "EffySocial",
              "unit": null,
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "postEngagement",
              "label": "Average engagement of measured posts",
              "source": null,
              "unit": "%",
              "value": null,
              "why": "No published post has its Instagram numbers read yet."
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "leads30",
              "label": "Leads, last 30 days",
              "source": "Lead pipeline",
              "unit": null,
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "whatsapp30",
              "label": "Leads from WhatsApp, last 30 days",
              "source": "Lead pipeline",
              "unit": null,
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "sales30",
              "label": "Purchases marked on leads, last 30 days",
              "source": "Lead outcomes",
              "unit": null,
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "bookings30",
              "label": "Appointments marked on leads, last 30 days",
              "source": "Lead outcomes",
              "unit": null,
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "spend",
              "label": "Spend recorded on live campaigns",
              "source": "Campaigns",
              "unit": "INR",
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "channels",
              "label": "Connected channels",
              "source": "Integrations",
              "unit": null,
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "brandBrain",
              "label": "Brand Brain filled in",
              "source": "Brand Brain",
              "unit": "%",
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "competitors",
              "label": "Competitors tracked",
              "source": "Competitors",
              "unit": null,
              "value": 0,
              "why": null
            }
          ],
          "reading": [
            "Leads are steady but few come from Instagram.",
            "Nothing has been measured on Instagram yet."
          ],
          "swot": {
            "opportunities": [
              "The weeks before the monsoon"
            ],
            "strengths": [
              "A written 5-year warranty"
            ],
            "threats": [
              "Cheaper local contractors"
            ],
            "weaknesses": [
              "Few published posts"
            ]
          }
        },
        "startsOn": "2026-09-28",
        "strategy": {
          "audience": "Housing society committees in Pune",
          "funnel": [
            "Reel",
            "WhatsApp chat",
            "Site visit"
          ],
          "pillars": [
            {
              "name": "Proof",
              "share": 50,
              "why": "Show real work."
            },
            {
              "name": "Education",
              "share": 30,
              "why": "Explain leaks."
            },
            {
              "name": "Offer",
              "share": 20,
              "why": "A reason to call."
            }
          ],
          "positioning": "The warranty-backed choice"
        },
        "summary": "Win monsoon enquiries from housing societies with proof of past work.",
        "tactics": {
          "budget": {
            "currency": "INR",
            "note": "",
            "split": [
              {
                "amount": 15000,
                "area": "Meta ads",
                "why": "Reach committees"
              },
              {
                "amount": 15000,
                "area": "Boosted reels",
                "why": "Proof"
              }
            ],
            "total": 30000
          },
          "campaigns": [
            {
              "budget": 24000,
              "channels": [
                "instagram"
              ],
              "endWeek": 2,
              "name": "Monsoon check-up",
              "objective": "Lead generation",
              "pillar": "Offer",
              "startWeek": 1,
              "why": "Before the rains."
            },
            {
              "budget": 6000,
              "channels": [
                "instagram"
              ],
              "endWeek": 4,
              "name": "Society proof series",
              "objective": "Lead generation",
              "pillar": "Proof",
              "startWeek": 3,
              "why": "Trust."
            }
          ],
          "channels": [
            {
              "channel": "instagram",
              "postsPerWeek": 3,
              "role": "Reels of repairs"
            },
            {
              "channel": "whatsapp",
              "postsPerWeek": 2,
              "role": "Follow-ups"
            }
          ],
          "ideas": [
            {
              "channel": "instagram",
              "format": "Reel",
              "pillar": "Proof",
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
              "pillar": "Proof",
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
              "pillar": "Proof",
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
              "pillar": "Proof",
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
              "pillar": "Proof",
              "title": "Idea 8"
            },
            {
              "channel": "instagram",
              "format": "Reel",
              "pillar": "Proof",
              "title": "Idea 9"
            }
          ]
        }
      },
      "source": "marketing_plan",
      "workspace": "ws_1"
    },
    "progress": [
      {
        "actualGoal": 0,
        "actualPosts": 0,
        "end": "2026-10-04",
        "plannedGoal": 10,
        "plannedPosts": 5,
        "start": "2026-09-28",
        "status": "current",
        "week": 1
      },
      {
        "actualGoal": null,
        "actualPosts": null,
        "end": "2026-10-11",
        "plannedGoal": 10,
        "plannedPosts": 5,
        "start": "2026-10-05",
        "status": "ahead",
        "week": 2
      },
      {
        "actualGoal": null,
        "actualPosts": null,
        "end": "2026-10-18",
        "plannedGoal": 10,
        "plannedPosts": 5,
        "start": "2026-10-12",
        "status": "ahead",
        "week": 3
      },
      {
        "actualGoal": null,
        "actualPosts": null,
        "end": "2026-10-25",
        "plannedGoal": 10,
        "plannedPosts": 5,
        "start": "2026-10-19",
        "status": "ahead",
        "week": 4
      }
    ],
    "status": "ok"
  },
  "page": {
    "brief": {
      "budget": 30000,
      "capacity": 5,
      "currency": "INR",
      "customer": "Housing societies in Pune",
      "goal": {
        "label": "Leads",
        "metric": "leads",
        "target": 40,
        "unit": "leads a month"
      },
      "kind": "business",
      "kindEditable": false,
      "kindLabel": "Business",
      "missing": [],
      "offer": "Terrace waterproofing with a 5-year warranty",
      "updatedAt": "2026-09-28T16:13:07.520703+00:00",
      "website": ""
    },
    "briefOptions": {
      "kinds": [
        {
          "key": "business",
          "label": "Business"
        },
        {
          "key": "personal_brand",
          "label": "Personal Brand"
        }
      ],
      "metrics": [
        {
          "key": "leads",
          "label": "Leads",
          "unit": "leads a month"
        },
        {
          "key": "sales",
          "label": "Sales",
          "unit": "sales a month"
        },
        {
          "key": "bookings",
          "label": "Bookings",
          "unit": "bookings a month"
        },
        {
          "key": "calls",
          "label": "Phone calls",
          "unit": "calls a month"
        },
        {
          "key": "whatsapp",
          "label": "WhatsApp chats",
          "unit": "WhatsApp chats a month"
        },
        {
          "key": "followers",
          "label": "Followers",
          "unit": "followers by the end of the month"
        },
        {
          "key": "reach",
          "label": "Reach",
          "unit": "people reached a month"
        },
        {
          "key": "engagement",
          "label": "Engagement",
          "unit": "interactions a month"
        }
      ]
    },
    "plan": {
      "createdAt": "2026-09-28T16:13:07.556001",
      "id": 1,
      "inputs": {
        "brandBrain": false,
        "budget": 30000,
        "capacity": 5,
        "clientOfAgency": false,
        "connected": [],
        "currency": "INR",
        "customer": "Housing societies in Pune",
        "documents": false,
        "format": "sostac",
        "goal": {
          "label": "Leads",
          "metric": "leads",
          "target": 40,
          "unit": "leads a month"
        },
        "goals": [
          "Leads"
        ],
        "industry": "",
        "kind": "business",
        "location": "",
        "name": "Roofseal Pune",
        "offer": "Terrace waterproofing with a 5-year warranty",
        "orgType": "business",
        "website": ""
      },
      "month": "2026-09",
      "plan": {
        "action": {
          "weeks": [
            {
              "focus": "Launch",
              "tasks": [
                "Post the first reel",
                "Set up WhatsApp replies"
              ],
              "week": 1
            },
            {
              "focus": "Proof",
              "tasks": [
                "Share two before-and-afters"
              ],
              "week": 2
            },
            {
              "focus": "Offer",
              "tasks": [
                "Run the check-up offer"
              ],
              "week": 3
            },
            {
              "focus": "Review",
              "tasks": [
                "Compare leads against the target"
              ],
              "week": 4
            }
          ]
        },
        "capacity": 5,
        "channels": [
          {
            "channel": "instagram",
            "postsPerWeek": 3,
            "role": "Reels of repairs"
          },
          {
            "channel": "whatsapp",
            "postsPerWeek": 2,
            "role": "Follow-ups"
          }
        ],
        "control": {
          "kpis": [
            {
              "metric": "Leads",
              "target": "Aim for 50",
              "why": "The goal"
            }
          ],
          "weekly": [
            {
              "end": "2026-10-04",
              "plannedGoal": 10,
              "plannedPosts": 5,
              "start": "2026-09-28",
              "week": 1
            },
            {
              "end": "2026-10-11",
              "plannedGoal": 10,
              "plannedPosts": 5,
              "start": "2026-10-05",
              "week": 2
            },
            {
              "end": "2026-10-18",
              "plannedGoal": 10,
              "plannedPosts": 5,
              "start": "2026-10-12",
              "week": 3
            },
            {
              "end": "2026-10-25",
              "plannedGoal": 10,
              "plannedPosts": 5,
              "start": "2026-10-19",
              "week": 4
            }
          ]
        },
        "endsOn": "2026-10-25",
        "firstWeek": [
          "Post the first reel",
          "Set up WhatsApp replies"
        ],
        "format": "sostac",
        "funnel": [
          "Reel",
          "WhatsApp chat",
          "Site visit"
        ],
        "ideas": [
          {
            "channel": "instagram",
            "format": "Reel",
            "pillar": "Proof",
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
            "pillar": "Proof",
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
            "pillar": "Proof",
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
            "pillar": "Proof",
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
            "pillar": "Proof",
            "title": "Idea 8"
          },
          {
            "channel": "instagram",
            "format": "Reel",
            "pillar": "Proof",
            "title": "Idea 9"
          }
        ],
        "kpis": [
          {
            "metric": "Leads",
            "target": "Aim for 50",
            "why": "The goal"
          }
        ],
        "objective": {
          "baseline": 0,
          "baselineSource": "Leads in the last 30 days",
          "by": "2026-10-25",
          "label": "Leads",
          "measured": true,
          "metric": "leads",
          "suggested": false,
          "target": 40,
          "unit": "leads a month",
          "why": "A realistic step up from the last month."
        },
        "pillars": [
          {
            "name": "Proof",
            "share": 50,
            "why": "Show real work."
          },
          {
            "name": "Education",
            "share": 30,
            "why": "Explain leaks."
          },
          {
            "name": "Offer",
            "share": 20,
            "why": "A reason to call."
          }
        ],
        "situation": {
          "gaps": [
            "No channel is connected, so nothing publishes or reports automatically yet.",
            "Instagram isn't connected: followers, reach and engagement can't be measured.",
            "Brand Brain is less than half filled in, so the plan knows little about the brand."
          ],
          "numbers": [
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "followers",
              "label": "Instagram followers",
              "source": null,
              "unit": null,
              "value": null,
              "why": "Connect Instagram to measure this."
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "reach28",
              "label": "People reached on Instagram, last 28 days",
              "source": null,
              "unit": null,
              "value": null,
              "why": "Connect Instagram to measure this."
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "interactions28",
              "label": "Instagram interactions, last 28 days",
              "source": null,
              "unit": null,
              "value": null,
              "why": "Connect Instagram to measure this."
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "postsPublished30",
              "label": "Posts published through EffySocial, last 30 days",
              "source": "EffySocial",
              "unit": null,
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "postEngagement",
              "label": "Average engagement of measured posts",
              "source": null,
              "unit": "%",
              "value": null,
              "why": "No published post has its Instagram numbers read yet."
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "leads30",
              "label": "Leads, last 30 days",
              "source": "Lead pipeline",
              "unit": null,
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "whatsapp30",
              "label": "Leads from WhatsApp, last 30 days",
              "source": "Lead pipeline",
              "unit": null,
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "sales30",
              "label": "Purchases marked on leads, last 30 days",
              "source": "Lead outcomes",
              "unit": null,
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "bookings30",
              "label": "Appointments marked on leads, last 30 days",
              "source": "Lead outcomes",
              "unit": null,
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "spend",
              "label": "Spend recorded on live campaigns",
              "source": "Campaigns",
              "unit": "INR",
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "channels",
              "label": "Connected channels",
              "source": "Integrations",
              "unit": null,
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "brandBrain",
              "label": "Brand Brain filled in",
              "source": "Brand Brain",
              "unit": "%",
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "competitors",
              "label": "Competitors tracked",
              "source": "Competitors",
              "unit": null,
              "value": 0,
              "why": null
            }
          ],
          "reading": [
            "Leads are steady but few come from Instagram.",
            "Nothing has been measured on Instagram yet."
          ],
          "swot": {
            "opportunities": [
              "The weeks before the monsoon"
            ],
            "strengths": [
              "A written 5-year warranty"
            ],
            "threats": [
              "Cheaper local contractors"
            ],
            "weaknesses": [
              "Few published posts"
            ]
          }
        },
        "startsOn": "2026-09-28",
        "strategy": {
          "audience": "Housing society committees in Pune",
          "funnel": [
            "Reel",
            "WhatsApp chat",
            "Site visit"
          ],
          "pillars": [
            {
              "name": "Proof",
              "share": 50,
              "why": "Show real work."
            },
            {
              "name": "Education",
              "share": 30,
              "why": "Explain leaks."
            },
            {
              "name": "Offer",
              "share": 20,
              "why": "A reason to call."
            }
          ],
          "positioning": "The warranty-backed choice"
        },
        "summary": "Win monsoon enquiries from housing societies with proof of past work.",
        "tactics": {
          "budget": {
            "currency": "INR",
            "note": "",
            "split": [
              {
                "amount": 15000,
                "area": "Meta ads",
                "why": "Reach committees"
              },
              {
                "amount": 15000,
                "area": "Boosted reels",
                "why": "Proof"
              }
            ],
            "total": 30000
          },
          "campaigns": [
            {
              "budget": 24000,
              "channels": [
                "instagram"
              ],
              "endWeek": 2,
              "name": "Monsoon check-up",
              "objective": "Lead generation",
              "pillar": "Offer",
              "startWeek": 1,
              "why": "Before the rains."
            },
            {
              "budget": 6000,
              "channels": [
                "instagram"
              ],
              "endWeek": 4,
              "name": "Society proof series",
              "objective": "Lead generation",
              "pillar": "Proof",
              "startWeek": 3,
              "why": "Trust."
            }
          ],
          "channels": [
            {
              "channel": "instagram",
              "postsPerWeek": 3,
              "role": "Reels of repairs"
            },
            {
              "channel": "whatsapp",
              "postsPerWeek": 2,
              "role": "Follow-ups"
            }
          ],
          "ideas": [
            {
              "channel": "instagram",
              "format": "Reel",
              "pillar": "Proof",
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
              "pillar": "Proof",
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
              "pillar": "Proof",
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
              "pillar": "Proof",
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
              "pillar": "Proof",
              "title": "Idea 8"
            },
            {
              "channel": "instagram",
              "format": "Reel",
              "pillar": "Proof",
              "title": "Idea 9"
            }
          ]
        }
      },
      "source": "marketing_plan",
      "workspace": "ws_1"
    },
    "progress": [
      {
        "actualGoal": 1,
        "actualPosts": 1,
        "end": "2026-10-04",
        "plannedGoal": 10,
        "plannedPosts": 5,
        "start": "2026-09-28",
        "status": "current",
        "week": 1
      },
      {
        "actualGoal": null,
        "actualPosts": null,
        "end": "2026-10-11",
        "plannedGoal": 10,
        "plannedPosts": 5,
        "start": "2026-10-05",
        "status": "ahead",
        "week": 2
      },
      {
        "actualGoal": null,
        "actualPosts": null,
        "end": "2026-10-18",
        "plannedGoal": 10,
        "plannedPosts": 5,
        "start": "2026-10-12",
        "status": "ahead",
        "week": 3
      },
      {
        "actualGoal": null,
        "actualPosts": null,
        "end": "2026-10-25",
        "plannedGoal": 10,
        "plannedPosts": 5,
        "start": "2026-10-19",
        "status": "ahead",
        "week": 4
      }
    ],
    "status": "ok"
  },
  "accepted": {
    "campaigns": [
      {
        "budget": 24000,
        "channels": [
          "instagram"
        ],
        "counts": {},
        "end": "2026-10-11",
        "id": 1,
        "kpis": {},
        "name": "Monsoon check-up",
        "objective": "Lead generation",
        "owner": "",
        "pillar": "Offer",
        "recommendations": 0,
        "spent": 0,
        "start": "2026-09-28",
        "status": "draft",
        "workspaceId": "ws_1"
      },
      {
        "budget": 6000,
        "channels": [
          "instagram"
        ],
        "counts": {},
        "end": "2026-10-25",
        "id": 2,
        "kpis": {},
        "name": "Society proof series",
        "objective": "Lead generation",
        "owner": "",
        "pillar": "Proof",
        "recommendations": 0,
        "spent": 0,
        "start": "2026-10-12",
        "status": "draft",
        "workspaceId": "ws_1"
      }
    ],
    "plan": {
      "createdAt": "2026-09-28T16:13:07.556001",
      "id": 1,
      "inputs": {
        "brandBrain": false,
        "budget": 30000,
        "capacity": 5,
        "clientOfAgency": false,
        "connected": [],
        "currency": "INR",
        "customer": "Housing societies in Pune",
        "documents": false,
        "format": "sostac",
        "goal": {
          "label": "Leads",
          "metric": "leads",
          "target": 40,
          "unit": "leads a month"
        },
        "goals": [
          "Leads"
        ],
        "industry": "",
        "kind": "business",
        "location": "",
        "name": "Roofseal Pune",
        "offer": "Terrace waterproofing with a 5-year warranty",
        "orgType": "business",
        "website": ""
      },
      "month": "2026-09",
      "plan": {
        "accepted": {
          "at": "2026-09-28T16:13:07.615926+00:00",
          "by": 1,
          "campaignIds": [
            1,
            2
          ]
        },
        "action": {
          "weeks": [
            {
              "focus": "Launch",
              "tasks": [
                "Post the first reel",
                "Set up WhatsApp replies"
              ],
              "week": 1
            },
            {
              "focus": "Proof",
              "tasks": [
                "Share two before-and-afters"
              ],
              "week": 2
            },
            {
              "focus": "Offer",
              "tasks": [
                "Run the check-up offer"
              ],
              "week": 3
            },
            {
              "focus": "Review",
              "tasks": [
                "Compare leads against the target"
              ],
              "week": 4
            }
          ]
        },
        "capacity": 5,
        "channels": [
          {
            "channel": "instagram",
            "postsPerWeek": 3,
            "role": "Reels of repairs"
          },
          {
            "channel": "whatsapp",
            "postsPerWeek": 2,
            "role": "Follow-ups"
          }
        ],
        "control": {
          "kpis": [
            {
              "metric": "Leads",
              "target": "Aim for 50",
              "why": "The goal"
            }
          ],
          "weekly": [
            {
              "end": "2026-10-04",
              "plannedGoal": 10,
              "plannedPosts": 5,
              "start": "2026-09-28",
              "week": 1
            },
            {
              "end": "2026-10-11",
              "plannedGoal": 10,
              "plannedPosts": 5,
              "start": "2026-10-05",
              "week": 2
            },
            {
              "end": "2026-10-18",
              "plannedGoal": 10,
              "plannedPosts": 5,
              "start": "2026-10-12",
              "week": 3
            },
            {
              "end": "2026-10-25",
              "plannedGoal": 10,
              "plannedPosts": 5,
              "start": "2026-10-19",
              "week": 4
            }
          ]
        },
        "endsOn": "2026-10-25",
        "firstWeek": [
          "Post the first reel",
          "Set up WhatsApp replies"
        ],
        "format": "sostac",
        "funnel": [
          "Reel",
          "WhatsApp chat",
          "Site visit"
        ],
        "ideas": [
          {
            "channel": "instagram",
            "format": "Reel",
            "pillar": "Proof",
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
            "pillar": "Proof",
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
            "pillar": "Proof",
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
            "pillar": "Proof",
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
            "pillar": "Proof",
            "title": "Idea 8"
          },
          {
            "channel": "instagram",
            "format": "Reel",
            "pillar": "Proof",
            "title": "Idea 9"
          }
        ],
        "kpis": [
          {
            "metric": "Leads",
            "target": "Aim for 50",
            "why": "The goal"
          }
        ],
        "objective": {
          "baseline": 0,
          "baselineSource": "Leads in the last 30 days",
          "by": "2026-10-25",
          "label": "Leads",
          "measured": true,
          "metric": "leads",
          "suggested": false,
          "target": 40,
          "unit": "leads a month",
          "why": "A realistic step up from the last month."
        },
        "pillars": [
          {
            "name": "Proof",
            "share": 50,
            "why": "Show real work."
          },
          {
            "name": "Education",
            "share": 30,
            "why": "Explain leaks."
          },
          {
            "name": "Offer",
            "share": 20,
            "why": "A reason to call."
          }
        ],
        "situation": {
          "gaps": [
            "No channel is connected, so nothing publishes or reports automatically yet.",
            "Instagram isn't connected: followers, reach and engagement can't be measured.",
            "Brand Brain is less than half filled in, so the plan knows little about the brand."
          ],
          "numbers": [
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "followers",
              "label": "Instagram followers",
              "source": null,
              "unit": null,
              "value": null,
              "why": "Connect Instagram to measure this."
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "reach28",
              "label": "People reached on Instagram, last 28 days",
              "source": null,
              "unit": null,
              "value": null,
              "why": "Connect Instagram to measure this."
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "interactions28",
              "label": "Instagram interactions, last 28 days",
              "source": null,
              "unit": null,
              "value": null,
              "why": "Connect Instagram to measure this."
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "postsPublished30",
              "label": "Posts published through EffySocial, last 30 days",
              "source": "EffySocial",
              "unit": null,
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "postEngagement",
              "label": "Average engagement of measured posts",
              "source": null,
              "unit": "%",
              "value": null,
              "why": "No published post has its Instagram numbers read yet."
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "leads30",
              "label": "Leads, last 30 days",
              "source": "Lead pipeline",
              "unit": null,
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "whatsapp30",
              "label": "Leads from WhatsApp, last 30 days",
              "source": "Lead pipeline",
              "unit": null,
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "sales30",
              "label": "Purchases marked on leads, last 30 days",
              "source": "Lead outcomes",
              "unit": null,
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "bookings30",
              "label": "Appointments marked on leads, last 30 days",
              "source": "Lead outcomes",
              "unit": null,
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "spend",
              "label": "Spend recorded on live campaigns",
              "source": "Campaigns",
              "unit": "INR",
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "channels",
              "label": "Connected channels",
              "source": "Integrations",
              "unit": null,
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "brandBrain",
              "label": "Brand Brain filled in",
              "source": "Brand Brain",
              "unit": "%",
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.537799+00:00",
              "key": "competitors",
              "label": "Competitors tracked",
              "source": "Competitors",
              "unit": null,
              "value": 0,
              "why": null
            }
          ],
          "reading": [
            "Leads are steady but few come from Instagram.",
            "Nothing has been measured on Instagram yet."
          ],
          "swot": {
            "opportunities": [
              "The weeks before the monsoon"
            ],
            "strengths": [
              "A written 5-year warranty"
            ],
            "threats": [
              "Cheaper local contractors"
            ],
            "weaknesses": [
              "Few published posts"
            ]
          }
        },
        "startsOn": "2026-09-28",
        "strategy": {
          "audience": "Housing society committees in Pune",
          "funnel": [
            "Reel",
            "WhatsApp chat",
            "Site visit"
          ],
          "pillars": [
            {
              "name": "Proof",
              "share": 50,
              "why": "Show real work."
            },
            {
              "name": "Education",
              "share": 30,
              "why": "Explain leaks."
            },
            {
              "name": "Offer",
              "share": 20,
              "why": "A reason to call."
            }
          ],
          "positioning": "The warranty-backed choice"
        },
        "summary": "Win monsoon enquiries from housing societies with proof of past work.",
        "tactics": {
          "budget": {
            "currency": "INR",
            "note": "",
            "split": [
              {
                "amount": 15000,
                "area": "Meta ads",
                "why": "Reach committees"
              },
              {
                "amount": 15000,
                "area": "Boosted reels",
                "why": "Proof"
              }
            ],
            "total": 30000
          },
          "campaigns": [
            {
              "budget": 24000,
              "channels": [
                "instagram"
              ],
              "endWeek": 2,
              "name": "Monsoon check-up",
              "objective": "Lead generation",
              "pillar": "Offer",
              "startWeek": 1,
              "why": "Before the rains."
            },
            {
              "budget": 6000,
              "channels": [
                "instagram"
              ],
              "endWeek": 4,
              "name": "Society proof series",
              "objective": "Lead generation",
              "pillar": "Proof",
              "startWeek": 3,
              "why": "Trust."
            }
          ],
          "channels": [
            {
              "channel": "instagram",
              "postsPerWeek": 3,
              "role": "Reels of repairs"
            },
            {
              "channel": "whatsapp",
              "postsPerWeek": 2,
              "role": "Follow-ups"
            }
          ],
          "ideas": [
            {
              "channel": "instagram",
              "format": "Reel",
              "pillar": "Proof",
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
              "pillar": "Proof",
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
              "pillar": "Proof",
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
              "pillar": "Proof",
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
              "pillar": "Proof",
              "title": "Idea 8"
            },
            {
              "channel": "instagram",
              "format": "Reel",
              "pillar": "Proof",
              "title": "Idea 9"
            }
          ]
        }
      },
      "source": "marketing_plan",
      "workspace": "ws_1"
    },
    "status": "ok"
  },
  "suggested": {
    "plan": {
      "createdAt": "2026-09-28T16:13:07.655824",
      "id": 2,
      "inputs": {
        "brandBrain": false,
        "budget": 30000,
        "capacity": 5,
        "clientOfAgency": false,
        "connected": [],
        "currency": "INR",
        "customer": "Housing societies in Pune",
        "documents": false,
        "format": "sostac",
        "goal": {
          "label": "Leads",
          "metric": "leads",
          "target": null,
          "unit": "leads a month"
        },
        "goals": [
          "Leads"
        ],
        "industry": "",
        "kind": "business",
        "location": "",
        "name": "Roofseal Pune",
        "offer": "Terrace waterproofing with a 5-year warranty",
        "orgType": "business",
        "website": ""
      },
      "month": "2026-09",
      "plan": {
        "action": {
          "weeks": [
            {
              "focus": "Launch",
              "tasks": [
                "Post the first reel",
                "Set up WhatsApp replies"
              ],
              "week": 1
            },
            {
              "focus": "Proof",
              "tasks": [
                "Share two before-and-afters"
              ],
              "week": 2
            },
            {
              "focus": "Offer",
              "tasks": [
                "Run the check-up offer"
              ],
              "week": 3
            },
            {
              "focus": "Review",
              "tasks": [
                "Compare leads against the target"
              ],
              "week": 4
            }
          ]
        },
        "capacity": 5,
        "channels": [
          {
            "channel": "instagram",
            "postsPerWeek": 3,
            "role": "Reels of repairs"
          },
          {
            "channel": "whatsapp",
            "postsPerWeek": 2,
            "role": "Follow-ups"
          }
        ],
        "control": {
          "kpis": [
            {
              "metric": "Leads",
              "target": "Aim for 50",
              "why": "The goal"
            }
          ],
          "weekly": [
            {
              "end": "2026-10-04",
              "plannedGoal": 12,
              "plannedPosts": 5,
              "start": "2026-09-28",
              "week": 1
            },
            {
              "end": "2026-10-11",
              "plannedGoal": 13,
              "plannedPosts": 5,
              "start": "2026-10-05",
              "week": 2
            },
            {
              "end": "2026-10-18",
              "plannedGoal": 13,
              "plannedPosts": 5,
              "start": "2026-10-12",
              "week": 3
            },
            {
              "end": "2026-10-25",
              "plannedGoal": 12,
              "plannedPosts": 5,
              "start": "2026-10-19",
              "week": 4
            }
          ]
        },
        "endsOn": "2026-10-25",
        "firstWeek": [
          "Post the first reel",
          "Set up WhatsApp replies"
        ],
        "format": "sostac",
        "funnel": [
          "Reel",
          "WhatsApp chat",
          "Site visit"
        ],
        "ideas": [
          {
            "channel": "instagram",
            "format": "Reel",
            "pillar": "Proof",
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
            "pillar": "Proof",
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
            "pillar": "Proof",
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
            "pillar": "Proof",
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
            "pillar": "Proof",
            "title": "Idea 8"
          },
          {
            "channel": "instagram",
            "format": "Reel",
            "pillar": "Proof",
            "title": "Idea 9"
          }
        ],
        "kpis": [
          {
            "metric": "Leads",
            "target": "Aim for 50",
            "why": "The goal"
          }
        ],
        "objective": {
          "baseline": 1,
          "baselineSource": "Leads in the last 30 days",
          "by": "2026-10-25",
          "label": "Leads",
          "measured": true,
          "metric": "leads",
          "suggested": true,
          "target": 50,
          "unit": "leads a month",
          "why": "A realistic step up from the last month."
        },
        "pillars": [
          {
            "name": "Proof",
            "share": 50,
            "why": "Show real work."
          },
          {
            "name": "Education",
            "share": 30,
            "why": "Explain leaks."
          },
          {
            "name": "Offer",
            "share": 20,
            "why": "A reason to call."
          }
        ],
        "situation": {
          "gaps": [
            "No channel is connected, so nothing publishes or reports automatically yet.",
            "Instagram isn't connected: followers, reach and engagement can't be measured.",
            "Brand Brain is less than half filled in, so the plan knows little about the brand."
          ],
          "numbers": [
            {
              "asOf": "2026-09-28T16:13:07.649688+00:00",
              "key": "followers",
              "label": "Instagram followers",
              "source": null,
              "unit": null,
              "value": null,
              "why": "Connect Instagram to measure this."
            },
            {
              "asOf": "2026-09-28T16:13:07.649688+00:00",
              "key": "reach28",
              "label": "People reached on Instagram, last 28 days",
              "source": null,
              "unit": null,
              "value": null,
              "why": "Connect Instagram to measure this."
            },
            {
              "asOf": "2026-09-28T16:13:07.649688+00:00",
              "key": "interactions28",
              "label": "Instagram interactions, last 28 days",
              "source": null,
              "unit": null,
              "value": null,
              "why": "Connect Instagram to measure this."
            },
            {
              "asOf": "2026-09-28T16:13:07.649688+00:00",
              "key": "postsPublished30",
              "label": "Posts published through EffySocial, last 30 days",
              "source": "EffySocial",
              "unit": null,
              "value": 1,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.649688+00:00",
              "key": "postEngagement",
              "label": "Average engagement of measured posts",
              "source": null,
              "unit": "%",
              "value": null,
              "why": "No published post has its Instagram numbers read yet."
            },
            {
              "asOf": "2026-09-28T16:13:07.649688+00:00",
              "key": "leads30",
              "label": "Leads, last 30 days",
              "source": "Lead pipeline",
              "unit": null,
              "value": 1,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.649688+00:00",
              "key": "whatsapp30",
              "label": "Leads from WhatsApp, last 30 days",
              "source": "Lead pipeline",
              "unit": null,
              "value": 1,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.649688+00:00",
              "key": "sales30",
              "label": "Purchases marked on leads, last 30 days",
              "source": "Lead outcomes",
              "unit": null,
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.649688+00:00",
              "key": "bookings30",
              "label": "Appointments marked on leads, last 30 days",
              "source": "Lead outcomes",
              "unit": null,
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.649688+00:00",
              "key": "spend",
              "label": "Spend recorded on live campaigns",
              "source": "Campaigns",
              "unit": "INR",
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.649688+00:00",
              "key": "channels",
              "label": "Connected channels",
              "source": "Integrations",
              "unit": null,
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.649688+00:00",
              "key": "brandBrain",
              "label": "Brand Brain filled in",
              "source": "Brand Brain",
              "unit": "%",
              "value": 0,
              "why": null
            },
            {
              "asOf": "2026-09-28T16:13:07.649688+00:00",
              "key": "competitors",
              "label": "Competitors tracked",
              "source": "Competitors",
              "unit": null,
              "value": 0,
              "why": null
            }
          ],
          "reading": [
            "Leads are steady but few come from Instagram.",
            "Nothing has been measured on Instagram yet."
          ],
          "swot": {
            "opportunities": [
              "The weeks before the monsoon"
            ],
            "strengths": [
              "A written 5-year warranty"
            ],
            "threats": [
              "Cheaper local contractors"
            ],
            "weaknesses": [
              "Few published posts"
            ]
          }
        },
        "startsOn": "2026-09-28",
        "strategy": {
          "audience": "Housing society committees in Pune",
          "funnel": [
            "Reel",
            "WhatsApp chat",
            "Site visit"
          ],
          "pillars": [
            {
              "name": "Proof",
              "share": 50,
              "why": "Show real work."
            },
            {
              "name": "Education",
              "share": 30,
              "why": "Explain leaks."
            },
            {
              "name": "Offer",
              "share": 20,
              "why": "A reason to call."
            }
          ],
          "positioning": "The warranty-backed choice"
        },
        "summary": "Win monsoon enquiries from housing societies with proof of past work.",
        "tactics": {
          "budget": {
            "currency": "INR",
            "note": "",
            "split": [
              {
                "amount": 15000,
                "area": "Meta ads",
                "why": "Reach committees"
              },
              {
                "amount": 15000,
                "area": "Boosted reels",
                "why": "Proof"
              }
            ],
            "total": 30000
          },
          "campaigns": [
            {
              "budget": 24000,
              "channels": [
                "instagram"
              ],
              "endWeek": 2,
              "name": "Monsoon check-up",
              "objective": "Lead generation",
              "pillar": "Offer",
              "startWeek": 1,
              "why": "Before the rains."
            },
            {
              "budget": 6000,
              "channels": [
                "instagram"
              ],
              "endWeek": 4,
              "name": "Society proof series",
              "objective": "Lead generation",
              "pillar": "Proof",
              "startWeek": 3,
              "why": "Trust."
            }
          ],
          "channels": [
            {
              "channel": "instagram",
              "postsPerWeek": 3,
              "role": "Reels of repairs"
            },
            {
              "channel": "whatsapp",
              "postsPerWeek": 2,
              "role": "Follow-ups"
            }
          ],
          "ideas": [
            {
              "channel": "instagram",
              "format": "Reel",
              "pillar": "Proof",
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
              "pillar": "Proof",
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
              "pillar": "Proof",
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
              "pillar": "Proof",
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
              "pillar": "Proof",
              "title": "Idea 8"
            },
            {
              "channel": "instagram",
              "format": "Reel",
              "pillar": "Proof",
              "title": "Idea 9"
            }
          ]
        }
      },
      "source": "marketing_plan",
      "workspace": "ws_1"
    },
    "progress": [
      {
        "actualGoal": 1,
        "actualPosts": 1,
        "end": "2026-10-04",
        "plannedGoal": 12,
        "plannedPosts": 5,
        "start": "2026-09-28",
        "status": "current",
        "week": 1
      },
      {
        "actualGoal": null,
        "actualPosts": null,
        "end": "2026-10-11",
        "plannedGoal": 13,
        "plannedPosts": 5,
        "start": "2026-10-05",
        "status": "ahead",
        "week": 2
      },
      {
        "actualGoal": null,
        "actualPosts": null,
        "end": "2026-10-18",
        "plannedGoal": 13,
        "plannedPosts": 5,
        "start": "2026-10-12",
        "status": "ahead",
        "week": 3
      },
      {
        "actualGoal": null,
        "actualPosts": null,
        "end": "2026-10-25",
        "plannedGoal": 12,
        "plannedPosts": 5,
        "start": "2026-10-19",
        "status": "ahead",
        "week": 4
      }
    ],
    "status": "ok"
  }
};

export default sostac;
