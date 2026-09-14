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
