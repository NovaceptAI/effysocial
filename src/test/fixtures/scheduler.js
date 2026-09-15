// Scheduler status payloads (GET /admin/scheduler) captured from the engine's test flow on 16 Sep 2026:
// never run, after a run, and with one job failing. Regenerate rather than hand-edit.
const scheduler = {
  "failing": {
    "jobs": [
      {
        "error": "",
        "failures": 0,
        "label": "Publish scheduled posts when they're due",
        "lastFinishedAt": "2026-09-15T18:50:02.466714+00:00",
        "lastStartedAt": "2026-09-15T18:50:02.458583+00:00",
        "name": "publish-due-posts",
        "ok": true,
        "result": {
          "due": 0,
          "failed": 0,
          "later": 0,
          "published": 0,
          "publishing": 0
        },
        "runs": 2
      },
      {
        "error": "ConnectionError: could not reach the database",
        "failures": 1,
        "label": "Finish uploads Instagram is still processing",
        "lastFinishedAt": "2026-09-15T18:50:02.480995+00:00",
        "lastStartedAt": "2026-09-15T18:50:02.472837+00:00",
        "name": "follow-publishing-posts",
        "ok": false,
        "result": {},
        "runs": 2
      }
    ],
    "lastRunAt": "2026-09-15T18:50:02.480995+00:00",
    "running": true,
    "status": "ok"
  },
  "neverRun": {
    "jobs": [
      {
        "error": "",
        "failures": 0,
        "label": "Publish scheduled posts when they're due",
        "lastFinishedAt": null,
        "lastStartedAt": null,
        "name": "publish-due-posts",
        "ok": null,
        "result": {},
        "runs": 0
      },
      {
        "error": "",
        "failures": 0,
        "label": "Finish uploads Instagram is still processing",
        "lastFinishedAt": null,
        "lastStartedAt": null,
        "name": "follow-publishing-posts",
        "ok": null,
        "result": {},
        "runs": 0
      }
    ],
    "lastRunAt": null,
    "running": false,
    "status": "ok"
  },
  "running": {
    "jobs": [
      {
        "error": "",
        "failures": 0,
        "label": "Publish scheduled posts when they're due",
        "lastFinishedAt": "2026-09-15T18:50:02.433850+00:00",
        "lastStartedAt": "2026-09-15T18:50:02.421214+00:00",
        "name": "publish-due-posts",
        "ok": true,
        "result": {
          "due": 0,
          "failed": 0,
          "later": 0,
          "published": 0,
          "publishing": 0
        },
        "runs": 1
      },
      {
        "error": "",
        "failures": 0,
        "label": "Finish uploads Instagram is still processing",
        "lastFinishedAt": "2026-09-15T18:50:02.450176+00:00",
        "lastStartedAt": "2026-09-15T18:50:02.441509+00:00",
        "name": "follow-publishing-posts",
        "ok": true,
        "result": {
          "checked": 0,
          "failed": 0,
          "later": 0,
          "published": 0,
          "publishing": 0
        },
        "runs": 1
      }
    ],
    "lastRunAt": "2026-09-15T18:50:02.450176+00:00",
    "running": true,
    "status": "ok"
  }
};

export default scheduler;
