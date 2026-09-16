// Captured from the engine's sandbox ads provider (14 Sep 2026) so tests use real response shapes.
export const adsBudgets = {
 "budgets": [
  {
   "budget": 30127,
   "campaign": "Lead Gen — Always On",
   "cpl": 376,
   "id": "adc_1_0",
   "nearCap": false,
   "pacing": 0.64,
   "platform": "meta",
   "roas": 1.9,
   "spent": 19182,
   "status": "active",
   "underPacing": false
  },
  {
   "budget": 68254,
   "campaign": "Click-to-WhatsApp Offers",
   "cpl": 240,
   "id": "adc_1_1",
   "nearCap": false,
   "pacing": 0.39,
   "platform": "meta",
   "roas": 4.2,
   "spent": 26662,
   "status": "active",
   "underPacing": true
  }
 ],
 "mode": "sandbox",
 "provider": "meta_ads",
 "status": "ok",
 "totals": {
  "budget": 217239,
  "pacing": 0.42,
  "spend": 91366
 }
};

export const adsRules = {
 "mode": "sandbox",
 "provider": "meta_ads",
 "rules": [
  {
   "action": "notify",
   "enabled": true,
   "id": "rule_1_1789375409943",
   "metric": "cpl",
   "name": "CPL guard",
   "op": "gt",
   "scope": "all",
   "threshold": 500
  }
 ],
 "status": "ok"
};

export const adsDryRun = {
 "mode": "sandbox",
 "results": [
  {
   "matches": [],
   "rule": "CPL guard",
   "ruleId": "rule_1_1789375409943"
  }
 ],
 "status": "ok"
};

// POST /ads/campaigns/:id/budget with 999 — the server's range error.
export const budgetOutOfRange = [400, {"message":"Unknown campaign or budget out of range (₹1,000–₹1cr).","status":"error"}];

// Advertising Analytics payloads captured from the engine (launch plan 5.3;
// tests/test_effy_ads_analytics.py) on 16 Sep 2026. Regenerate rather than hand-edit.
export const adsAnalyticsSandbox = {
 "bestCampaign": {
  "cpl": 132,
  "id": "adc_20_2",
  "name": "Search \u2014 Brand + Category",
  "roas": 10.6,
  "spend": 106558
 },
 "byAudience": [
  {
   "cpl": 155,
   "key": "aud_20_0",
   "label": "Broad 25-45",
   "leads": 512,
   "size": 1800000,
   "spend": 79631,
   "type": "saved"
  },
  {
   "cpl": 155,
   "key": "aud_20_1",
   "label": "Retargeting 30d",
   "leads": 512,
   "size": 42000,
   "spend": 79631,
   "type": "custom"
  },
  {
   "cpl": 257,
   "key": "aud_20_2",
   "label": "Lookalike 1%",
   "leads": 28,
   "size": 950000,
   "spend": 7202,
   "type": "lookalike"
  }
 ],
 "byFormat": [
  {
   "ads": 7,
   "cpl": 158,
   "ctr": 1.17,
   "key": "image",
   "label": "Image",
   "leads": 435,
   "spend": 68757
  },
  {
   "ads": 7,
   "cpl": 158,
   "ctr": 1.27,
   "key": "video",
   "label": "Video",
   "leads": 435,
   "spend": 68757
  },
  {
   "ads": 4,
   "cpl": 161,
   "ctr": 1.4,
   "key": "carousel",
   "label": "Carousel",
   "leads": 179,
   "spend": 28942
  }
 ],
 "byObjective": [
  {
   "campaigns": 1,
   "clicks": 13426,
   "cpl": 132,
   "cpm": 111.1,
   "ctr": 1.4,
   "impressions": 959022,
   "key": "Website traffic",
   "label": "Website traffic",
   "leads": 805,
   "roas": 10.6,
   "spend": 106558
  },
  {
   "campaigns": 1,
   "clicks": 4136,
   "cpl": 232,
   "cpm": 111.1,
   "ctr": 1.2,
   "impressions": 344709,
   "key": "Lead generation",
   "label": "Lead generation",
   "leads": 165,
   "roas": 5.3,
   "spend": 38301
  },
  {
   "campaigns": 1,
   "clicks": 1685,
   "cpl": 257,
   "cpm": 166.7,
   "ctr": 1.3,
   "impressions": 129642,
   "key": "WhatsApp conversations",
   "label": "WhatsApp conversations",
   "leads": 84,
   "roas": 2.8,
   "spend": 21607
  }
 ],
 "byPlatform": [
  {
   "campaigns": 1,
   "clicks": 13426,
   "cpl": 132,
   "cpm": 111.1,
   "ctr": 1.4,
   "impressions": 959022,
   "key": "google",
   "label": "Google",
   "leads": 805,
   "roas": 10.6,
   "spend": 106558
  },
  {
   "campaigns": 2,
   "clicks": 5821,
   "cpl": 240,
   "cpm": 126.3,
   "ctr": 1.23,
   "impressions": 474351,
   "key": "meta",
   "label": "Meta",
   "leads": 249,
   "roas": 4.4,
   "spend": 59908
  }
 ],
 "funnel": [
  {
   "key": "impressions",
   "label": "Impressions",
   "value": 1433373
  },
  {
   "key": "clicks",
   "label": "Clicks",
   "value": 19247
  },
  {
   "key": "leads",
   "label": "Leads",
   "value": 1054
  }
 ],
 "mode": "sandbox",
 "provider": "meta_ads",
 "series": [
  {
   "cpl": 93,
   "leads": 166,
   "spend": 15457,
   "week": "W1"
  },
  {
   "cpl": 108,
   "leads": 197,
   "spend": 21334,
   "week": "W2"
  },
  {
   "cpl": 160,
   "leads": 173,
   "spend": 27684,
   "week": "W3"
  },
  {
   "cpl": 245,
   "leads": 117,
   "spend": 28668,
   "week": "W4"
  },
  {
   "cpl": 292,
   "leads": 80,
   "spend": 23382,
   "week": "W5"
  },
  {
   "cpl": 173,
   "leads": 96,
   "spend": 16686,
   "week": "W6"
  },
  {
   "cpl": 97,
   "leads": 151,
   "spend": 14736,
   "week": "W7"
  },
  {
   "cpl": 100,
   "leads": 193,
   "spend": 19325,
   "week": "W8"
  }
 ],
 "status": "ok",
 "totals": {
  "budget": 253074,
  "clicks": 19247,
  "cpc": 8.6,
  "cpl": 157,
  "cpm": 116.1,
  "ctr": 1.34,
  "impressions": 1433373,
  "leads": 1054,
  "pacing": 0.66,
  "reach": 1032028,
  "roas": 8.4,
  "spend": 166466
 },
 "worstCampaign": {
  "cpl": 257,
  "id": "adc_20_1",
  "name": "Click-to-WhatsApp Offers",
  "roas": 2.8,
  "spend": 21607
 }
};

export const adsAnalyticsMock = {
 "bestCampaign": {
  "cpl": 132,
  "id": "adc_20_2",
  "name": "Search \u2014 Brand + Category",
  "roas": 10.6,
  "spend": 106558
 },
 "byAudience": [
  {
   "cpl": 155,
   "key": "aud_20_0",
   "label": "Broad 25-45",
   "leads": 512,
   "size": 1800000,
   "spend": 79631,
   "type": "saved"
  },
  {
   "cpl": 155,
   "key": "aud_20_1",
   "label": "Retargeting 30d",
   "leads": 512,
   "size": 42000,
   "spend": 79631,
   "type": "custom"
  },
  {
   "cpl": 257,
   "key": "aud_20_2",
   "label": "Lookalike 1%",
   "leads": 28,
   "size": 950000,
   "spend": 7202,
   "type": "lookalike"
  }
 ],
 "byFormat": [
  {
   "ads": 7,
   "cpl": 158,
   "ctr": 1.17,
   "key": "image",
   "label": "Image",
   "leads": 435,
   "spend": 68757
  },
  {
   "ads": 7,
   "cpl": 158,
   "ctr": 1.27,
   "key": "video",
   "label": "Video",
   "leads": 435,
   "spend": 68757
  },
  {
   "ads": 4,
   "cpl": 161,
   "ctr": 1.4,
   "key": "carousel",
   "label": "Carousel",
   "leads": 179,
   "spend": 28942
  }
 ],
 "byObjective": [
  {
   "campaigns": 1,
   "clicks": 13426,
   "cpl": 132,
   "cpm": 111.1,
   "ctr": 1.4,
   "impressions": 959022,
   "key": "Website traffic",
   "label": "Website traffic",
   "leads": 805,
   "roas": 10.6,
   "spend": 106558
  },
  {
   "campaigns": 1,
   "clicks": 4136,
   "cpl": 232,
   "cpm": 111.1,
   "ctr": 1.2,
   "impressions": 344709,
   "key": "Lead generation",
   "label": "Lead generation",
   "leads": 165,
   "roas": 5.3,
   "spend": 38301
  },
  {
   "campaigns": 1,
   "clicks": 1685,
   "cpl": 257,
   "cpm": 166.7,
   "ctr": 1.3,
   "impressions": 129642,
   "key": "WhatsApp conversations",
   "label": "WhatsApp conversations",
   "leads": 84,
   "roas": 2.8,
   "spend": 21607
  }
 ],
 "byPlatform": [
  {
   "campaigns": 1,
   "clicks": 13426,
   "cpl": 132,
   "cpm": 111.1,
   "ctr": 1.4,
   "impressions": 959022,
   "key": "google",
   "label": "Google",
   "leads": 805,
   "roas": 10.6,
   "spend": 106558
  },
  {
   "campaigns": 2,
   "clicks": 5821,
   "cpl": 240,
   "cpm": 126.3,
   "ctr": 1.23,
   "impressions": 474351,
   "key": "meta",
   "label": "Meta",
   "leads": 249,
   "roas": 4.4,
   "spend": 59908
  }
 ],
 "funnel": [
  {
   "key": "impressions",
   "label": "Impressions",
   "value": 1433373
  },
  {
   "key": "clicks",
   "label": "Clicks",
   "value": 19247
  },
  {
   "key": "leads",
   "label": "Leads",
   "value": 1054
  }
 ],
 "mode": "mock",
 "provider": "mock",
 "series": [
  {
   "cpl": 93,
   "leads": 166,
   "spend": 15457,
   "week": "W1"
  },
  {
   "cpl": 108,
   "leads": 197,
   "spend": 21334,
   "week": "W2"
  },
  {
   "cpl": 160,
   "leads": 173,
   "spend": 27684,
   "week": "W3"
  },
  {
   "cpl": 245,
   "leads": 117,
   "spend": 28668,
   "week": "W4"
  },
  {
   "cpl": 292,
   "leads": 80,
   "spend": 23382,
   "week": "W5"
  },
  {
   "cpl": 173,
   "leads": 96,
   "spend": 16686,
   "week": "W6"
  },
  {
   "cpl": 97,
   "leads": 151,
   "spend": 14736,
   "week": "W7"
  },
  {
   "cpl": 100,
   "leads": 193,
   "spend": 19325,
   "week": "W8"
  }
 ],
 "status": "ok",
 "totals": {
  "budget": 253074,
  "clicks": 19247,
  "cpc": 8.6,
  "cpl": 157,
  "cpm": 116.1,
  "ctr": 1.34,
  "impressions": 1433373,
  "leads": 1054,
  "pacing": 0.66,
  "reach": 1032028,
  "roas": 8.4,
  "spend": 166466
 },
 "worstCampaign": {
  "cpl": 257,
  "id": "adc_20_1",
  "name": "Click-to-WhatsApp Offers",
  "roas": 2.8,
  "spend": 21607
 }
};

// The rules payload after a scheduled check found breaches (launch plan 5.4;
// tests/test_effy_ad_rules.py) on 16 Sep 2026. Regenerate rather than hand-edit.
export const adsRulesAlerting = {
 "alerts": [
  {
   "action": "notify",
   "campaign": "Click-to-WhatsApp Offers",
   "campaignId": "adc_1_1",
   "dismissed": false,
   "firstSeen": "2026-09-16T10:30:58.868328+00:00",
   "id": "rule_1_1789554658850:adc_1_1",
   "lastSeen": "2026-09-16T10:30:58.868328+00:00",
   "metric": "cpl",
   "op": "gt",
   "rule": "CPL guard",
   "ruleId": "rule_1_1789554658850",
   "suggestedAction": "notify",
   "threshold": 200.0,
   "value": 240
  },
  {
   "action": "notify",
   "campaign": "Lead Gen \u2014 Always On",
   "campaignId": "adc_1_0",
   "dismissed": false,
   "firstSeen": "2026-09-16T10:30:58.868328+00:00",
   "id": "rule_1_1789554658850:adc_1_0",
   "lastSeen": "2026-09-16T10:30:58.868328+00:00",
   "metric": "cpl",
   "op": "gt",
   "rule": "CPL guard",
   "ruleId": "rule_1_1789554658850",
   "suggestedAction": "notify",
   "threshold": 200.0,
   "value": 376
  },
  {
   "action": "notify",
   "campaign": "Search \u2014 Brand + Category",
   "campaignId": "adc_1_2",
   "dismissed": false,
   "firstSeen": "2026-09-16T10:30:58.868328+00:00",
   "id": "rule_1_1789554658850:adc_1_2",
   "lastSeen": "2026-09-16T10:30:58.868328+00:00",
   "metric": "cpl",
   "op": "gt",
   "rule": "CPL guard",
   "ruleId": "rule_1_1789554658850",
   "suggestedAction": "notify",
   "threshold": 200.0,
   "value": 337
  },
  {
   "action": "pause",
   "campaign": "Click-to-WhatsApp Offers",
   "campaignId": "adc_1_1",
   "dismissed": false,
   "firstSeen": "2026-09-16T10:30:58.868328+00:00",
   "id": "rule_1_1789554658860:adc_1_1",
   "lastSeen": "2026-09-16T10:30:58.868328+00:00",
   "metric": "roas",
   "op": "lt",
   "rule": "Stop the bleeding",
   "ruleId": "rule_1_1789554658860",
   "suggestedAction": "pause",
   "threshold": 9.0,
   "value": 4.2
  },
  {
   "action": "pause",
   "campaign": "Lead Gen \u2014 Always On",
   "campaignId": "adc_1_0",
   "dismissed": false,
   "firstSeen": "2026-09-16T10:30:58.868328+00:00",
   "id": "rule_1_1789554658860:adc_1_0",
   "lastSeen": "2026-09-16T10:30:58.868328+00:00",
   "metric": "roas",
   "op": "lt",
   "rule": "Stop the bleeding",
   "ruleId": "rule_1_1789554658860",
   "suggestedAction": "pause",
   "threshold": 9.0,
   "value": 1.9
  },
  {
   "action": "pause",
   "campaign": "Search \u2014 Brand + Category",
   "campaignId": "adc_1_2",
   "dismissed": false,
   "firstSeen": "2026-09-16T10:30:58.868328+00:00",
   "id": "rule_1_1789554658860:adc_1_2",
   "lastSeen": "2026-09-16T10:30:58.868328+00:00",
   "metric": "roas",
   "op": "lt",
   "rule": "Stop the bleeding",
   "ruleId": "rule_1_1789554658860",
   "suggestedAction": "pause",
   "threshold": 9.0,
   "value": 4.1
  }
 ],
 "checkedAt": "2026-09-16T10:30:58.868328+00:00",
 "mode": "sandbox",
 "provider": "meta_ads",
 "rules": [
  {
   "action": "notify",
   "enabled": true,
   "id": "rule_1_1789554658850",
   "metric": "cpl",
   "name": "CPL guard",
   "op": "gt",
   "scope": "all",
   "threshold": 200.0
  },
  {
   "action": "pause",
   "enabled": true,
   "id": "rule_1_1789554658860",
   "metric": "roas",
   "name": "Stop the bleeding",
   "op": "lt",
   "scope": "all",
   "threshold": 9.0
  }
 ],
 "status": "ok"
};
