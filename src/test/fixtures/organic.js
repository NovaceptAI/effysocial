// Organic Analytics payloads captured from the engine's test flow (launch plan 5.9;
// tests/test_effy_insights.py, Graph API stubbed as a 31-follower and a 2,400-follower account)
// on 17 Sep 2026: not connected, connected with nothing published, and six measured posts.
// Regenerate rather than hand-edit.
const organic = {
 "bootstrap": {
  "org": {
   "id": 1,
   "name": "user-dc34bc62a1's workspace",
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
    "plan": "Trial",
    "storedPlan": "Trial",
    "trial": {
     "daysLeft": 14,
     "endsAt": "2026-09-30T19:34:44.178700+00:00",
     "expired": false
    },
    "usage": {
     "seats": 1,
     "workspaces": 1
    }
   },
   "timezone": "Asia/Kolkata",
   "type": "business"
  },
  "role": "Workspace admin",
  "status": "ok",
  "user": {
   "email": "user-dc34bc62a1@test.in",
   "email_verified": false,
   "id": 1,
   "is_admin": false,
   "name": "user-dc34bc62a1",
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
    "dbId": 1,
    "id": "ws_1",
    "industry": "",
    "location": "",
    "logo": "\u2726",
    "managerId": 1,
    "name": "user-dc34bc62a1's workspace"
   }
  ]
 },
 "connectedNothingPublished": {
  "account": {
   "avatar": "https://cdn.example.in/p.jpg",
   "followers": 31,
   "following": 12,
   "posts": 6,
   "username": "clinic"
  },
  "audience": {
   "age": [],
   "available": false,
   "cities": [],
   "gender": [],
   "reason": "Instagram shares this once an account has 100 followers."
  },
  "bestTimes": {
   "available": false,
   "best": null,
   "parts": [
    "Morning",
    "Afternoon",
    "Evening",
    "Night"
   ],
   "reason": "Needs at least 6 published posts with numbers \u2014 you have 0.",
   "rows": []
  },
  "followerGrowth": {
   "available": false,
   "reason": "Instagram shares this once an account has 100 followers.",
   "series": []
  },
  "kpis": {
   "accountsEngaged28": 90,
   "followers": 31,
   "interactions28": 135,
   "linkTaps28": 4,
   "postEngagement": null,
   "profileViews28": 70,
   "reach28": 1240,
   "views28": 5400
  },
  "reachSeries": [
   {
    "date": "2026-09-14",
    "reach": 40
   },
   {
    "date": "2026-09-15",
    "reach": 55
   }
  ],
  "sources": {
   "instagram": {
    "connected": true,
    "username": "clinic"
   },
   "posts": {
    "measured": 0,
    "published": 0
   }
  },
  "status": "ok",
  "topPosts": [],
  "working": {
   "bestFormat": null,
   "bestHook": null,
   "bestPost": null,
   "bestTime": null
  }
 },
 "largeAccount": {
  "account": {
   "avatar": "https://cdn.example.in/p.jpg",
   "followers": 2400,
   "following": 12,
   "posts": 6,
   "username": "clinic"
  },
  "audience": {
   "age": [
    {
     "label": "25-34",
     "value": 60
    },
    {
     "label": "35-44",
     "value": 40
    }
   ],
   "available": true,
   "cities": [
    {
     "label": "City 0",
     "value": 20
    },
    {
     "label": "City 1",
     "value": 18
    },
    {
     "label": "City 2",
     "value": 16
    },
    {
     "label": "City 3",
     "value": 14
    },
    {
     "label": "City 4",
     "value": 12
    }
   ],
   "gender": [
    {
     "label": "F",
     "value": 70
    },
    {
     "label": "M",
     "value": 30
    }
   ],
   "reason": ""
  },
  "bestTimes": {
   "available": true,
   "best": {
    "day": "Wed",
    "engagement": 10.9,
    "part": "Evening",
    "posts": 1
   },
   "parts": [
    "Morning",
    "Afternoon",
    "Evening",
    "Night"
   ],
   "reason": "",
   "rows": [
    {
     "cells": [
      {
       "engagement": null,
       "part": "Morning",
       "posts": 0
      },
      {
       "engagement": null,
       "part": "Afternoon",
       "posts": 0
      },
      {
       "engagement": 8.8,
       "part": "Evening",
       "posts": 1
      },
      {
       "engagement": null,
       "part": "Night",
       "posts": 0
      }
     ],
     "day": "Mon"
    },
    {
     "cells": [
      {
       "engagement": null,
       "part": "Morning",
       "posts": 0
      },
      {
       "engagement": null,
       "part": "Afternoon",
       "posts": 0
      },
      {
       "engagement": null,
       "part": "Evening",
       "posts": 0
      },
      {
       "engagement": 2.0,
       "part": "Night",
       "posts": 1
      }
     ],
     "day": "Tue"
    },
    {
     "cells": [
      {
       "engagement": null,
       "part": "Morning",
       "posts": 0
      },
      {
       "engagement": null,
       "part": "Afternoon",
       "posts": 0
      },
      {
       "engagement": 10.9,
       "part": "Evening",
       "posts": 1
      },
      {
       "engagement": null,
       "part": "Night",
       "posts": 0
      }
     ],
     "day": "Wed"
    },
    {
     "cells": [
      {
       "engagement": 4.2,
       "part": "Morning",
       "posts": 1
      },
      {
       "engagement": null,
       "part": "Afternoon",
       "posts": 0
      },
      {
       "engagement": null,
       "part": "Evening",
       "posts": 0
      },
      {
       "engagement": null,
       "part": "Night",
       "posts": 0
      }
     ],
     "day": "Thu"
    },
    {
     "cells": [
      {
       "engagement": null,
       "part": "Morning",
       "posts": 0
      },
      {
       "engagement": null,
       "part": "Afternoon",
       "posts": 0
      },
      {
       "engagement": 6.1,
       "part": "Evening",
       "posts": 1
      },
      {
       "engagement": null,
       "part": "Night",
       "posts": 0
      }
     ],
     "day": "Fri"
    },
    {
     "cells": [
      {
       "engagement": 3.0,
       "part": "Morning",
       "posts": 1
      },
      {
       "engagement": null,
       "part": "Afternoon",
       "posts": 0
      },
      {
       "engagement": null,
       "part": "Evening",
       "posts": 0
      },
      {
       "engagement": null,
       "part": "Night",
       "posts": 0
      }
     ],
     "day": "Sat"
    },
    {
     "cells": [
      {
       "engagement": null,
       "part": "Morning",
       "posts": 0
      },
      {
       "engagement": null,
       "part": "Afternoon",
       "posts": 0
      },
      {
       "engagement": null,
       "part": "Evening",
       "posts": 0
      },
      {
       "engagement": null,
       "part": "Night",
       "posts": 0
      }
     ],
     "day": "Sun"
    }
   ]
  },
  "followerGrowth": {
   "available": true,
   "reason": "",
   "series": [
    {
     "date": "2026-09-15",
     "gained": 3
    }
   ]
  },
  "kpis": {
   "accountsEngaged28": 90,
   "followers": 2400,
   "interactions28": 135,
   "linkTaps28": 4,
   "postEngagement": 5.8,
   "profileViews28": 70,
   "reach28": 1240,
   "views28": 5400
  },
  "reachSeries": [
   {
    "date": "2026-09-14",
    "reach": 40
   },
   {
    "date": "2026-09-15",
    "reach": 55
   }
  ],
  "sources": {
   "instagram": {
    "connected": true,
    "username": "clinic"
   },
   "posts": {
    "measured": 6,
    "published": 6
   }
  },
  "status": "ok",
  "topPosts": [
   {
    "channel": "instagram",
    "id": 1,
    "metrics": {
     "engagement": 10.9,
     "likes": 1,
     "reach": 1240,
     "syncedAt": "2026-09-09T13:30:00+00:00"
    },
    "permalink": "https://www.instagram.com/p/Terrace before and after/",
    "publishedAt": "2026-09-09T13:30:00+00:00",
    "title": "Terrace before and after",
    "type": "reel"
   },
   {
    "channel": "instagram",
    "id": 5,
    "metrics": {
     "engagement": 8.8,
     "likes": 1,
     "reach": 880,
     "syncedAt": "2026-09-14T13:30:00+00:00"
    },
    "permalink": "https://www.instagram.com/p/Is your roof ready?/",
    "publishedAt": "2026-09-14T13:30:00+00:00",
    "title": "Is your roof ready?",
    "type": "reel"
   },
   {
    "channel": "instagram",
    "id": 3,
    "metrics": {
     "engagement": 6.1,
     "likes": 1,
     "reach": 610,
     "syncedAt": "2026-09-11T13:30:00+00:00"
    },
    "permalink": "https://www.instagram.com/p/3 signs of a leak/",
    "publishedAt": "2026-09-11T13:30:00+00:00",
    "title": "3 signs of a leak",
    "type": "post"
   },
   {
    "channel": "instagram",
    "id": 2,
    "metrics": {
     "engagement": 4.2,
     "likes": 1,
     "reach": 420,
     "syncedAt": "2026-09-10T04:30:00+00:00"
    },
    "permalink": "https://www.instagram.com/p/Monsoon offer/",
    "publishedAt": "2026-09-10T04:30:00+00:00",
    "title": "Monsoon offer",
    "type": "post"
   },
   {
    "channel": "instagram",
    "id": 4,
    "metrics": {
     "engagement": 3.0,
     "likes": 1,
     "reach": 300,
     "syncedAt": "2026-09-12T04:30:00+00:00"
    },
    "permalink": "https://www.instagram.com/p/Meet Priya/",
    "publishedAt": "2026-09-12T04:30:00+00:00",
    "title": "Meet Priya",
    "type": "post"
   },
   {
    "channel": "instagram",
    "id": 6,
    "metrics": {
     "engagement": 2.0,
     "likes": 1,
     "reach": 150,
     "syncedAt": "2026-09-15T16:30:00+00:00"
    },
    "permalink": "https://www.instagram.com/p/Thank you, Pune/",
    "publishedAt": "2026-09-15T16:30:00+00:00",
    "title": "Thank you, Pune",
    "type": "post"
   }
  ],
  "working": {
   "bestFormat": {
    "engagement": 9.9,
    "key": "reel",
    "label": "Reel",
    "posts": 2,
    "reach": 2120
   },
   "bestHook": {
    "engagement": 5.8,
    "key": "story",
    "label": "Statement or story",
    "posts": 6,
    "reach": 3600
   },
   "bestPost": {
    "reach": 1240,
    "title": "Terrace before and after"
   },
   "bestTime": {
    "day": "Wed",
    "engagement": 10.9,
    "part": "Evening",
    "posts": 1
   }
  }
 },
 "notConnected": {
  "account": null,
  "audience": null,
  "bestTimes": {
   "available": false,
   "best": null,
   "parts": [
    "Morning",
    "Afternoon",
    "Evening",
    "Night"
   ],
   "reason": "Needs at least 6 published posts with numbers \u2014 you have 0.",
   "rows": []
  },
  "followerGrowth": null,
  "kpis": {
   "accountsEngaged28": null,
   "followers": null,
   "interactions28": null,
   "linkTaps28": null,
   "postEngagement": null,
   "profileViews28": null,
   "reach28": null,
   "views28": null
  },
  "reachSeries": [],
  "sources": {
   "instagram": {
    "connected": false,
    "reason": "Instagram isn't connected."
   },
   "posts": {
    "measured": 0,
    "published": 0
   }
  },
  "status": "ok",
  "topPosts": [],
  "working": {
   "bestFormat": null,
   "bestHook": null,
   "bestPost": null,
   "bestTime": null
  }
 },
 "smallAccount": {
  "account": {
   "avatar": "https://cdn.example.in/p.jpg",
   "followers": 31,
   "following": 12,
   "posts": 6,
   "username": "clinic"
  },
  "audience": {
   "age": [],
   "available": false,
   "cities": [],
   "gender": [],
   "reason": "Instagram shares this once an account has 100 followers."
  },
  "bestTimes": {
   "available": true,
   "best": {
    "day": "Wed",
    "engagement": 10.9,
    "part": "Evening",
    "posts": 1
   },
   "parts": [
    "Morning",
    "Afternoon",
    "Evening",
    "Night"
   ],
   "reason": "",
   "rows": [
    {
     "cells": [
      {
       "engagement": null,
       "part": "Morning",
       "posts": 0
      },
      {
       "engagement": null,
       "part": "Afternoon",
       "posts": 0
      },
      {
       "engagement": 8.8,
       "part": "Evening",
       "posts": 1
      },
      {
       "engagement": null,
       "part": "Night",
       "posts": 0
      }
     ],
     "day": "Mon"
    },
    {
     "cells": [
      {
       "engagement": null,
       "part": "Morning",
       "posts": 0
      },
      {
       "engagement": null,
       "part": "Afternoon",
       "posts": 0
      },
      {
       "engagement": null,
       "part": "Evening",
       "posts": 0
      },
      {
       "engagement": 2.0,
       "part": "Night",
       "posts": 1
      }
     ],
     "day": "Tue"
    },
    {
     "cells": [
      {
       "engagement": null,
       "part": "Morning",
       "posts": 0
      },
      {
       "engagement": null,
       "part": "Afternoon",
       "posts": 0
      },
      {
       "engagement": 10.9,
       "part": "Evening",
       "posts": 1
      },
      {
       "engagement": null,
       "part": "Night",
       "posts": 0
      }
     ],
     "day": "Wed"
    },
    {
     "cells": [
      {
       "engagement": 4.2,
       "part": "Morning",
       "posts": 1
      },
      {
       "engagement": null,
       "part": "Afternoon",
       "posts": 0
      },
      {
       "engagement": null,
       "part": "Evening",
       "posts": 0
      },
      {
       "engagement": null,
       "part": "Night",
       "posts": 0
      }
     ],
     "day": "Thu"
    },
    {
     "cells": [
      {
       "engagement": null,
       "part": "Morning",
       "posts": 0
      },
      {
       "engagement": null,
       "part": "Afternoon",
       "posts": 0
      },
      {
       "engagement": 6.1,
       "part": "Evening",
       "posts": 1
      },
      {
       "engagement": null,
       "part": "Night",
       "posts": 0
      }
     ],
     "day": "Fri"
    },
    {
     "cells": [
      {
       "engagement": 3.0,
       "part": "Morning",
       "posts": 1
      },
      {
       "engagement": null,
       "part": "Afternoon",
       "posts": 0
      },
      {
       "engagement": null,
       "part": "Evening",
       "posts": 0
      },
      {
       "engagement": null,
       "part": "Night",
       "posts": 0
      }
     ],
     "day": "Sat"
    },
    {
     "cells": [
      {
       "engagement": null,
       "part": "Morning",
       "posts": 0
      },
      {
       "engagement": null,
       "part": "Afternoon",
       "posts": 0
      },
      {
       "engagement": null,
       "part": "Evening",
       "posts": 0
      },
      {
       "engagement": null,
       "part": "Night",
       "posts": 0
      }
     ],
     "day": "Sun"
    }
   ]
  },
  "followerGrowth": {
   "available": false,
   "reason": "Instagram shares this once an account has 100 followers.",
   "series": []
  },
  "kpis": {
   "accountsEngaged28": 90,
   "followers": 31,
   "interactions28": 135,
   "linkTaps28": 4,
   "postEngagement": 5.8,
   "profileViews28": 70,
   "reach28": 1240,
   "views28": 5400
  },
  "reachSeries": [
   {
    "date": "2026-09-14",
    "reach": 40
   },
   {
    "date": "2026-09-15",
    "reach": 55
   }
  ],
  "sources": {
   "instagram": {
    "connected": true,
    "username": "clinic"
   },
   "posts": {
    "measured": 6,
    "published": 6
   }
  },
  "status": "ok",
  "topPosts": [
   {
    "channel": "instagram",
    "id": 1,
    "metrics": {
     "engagement": 10.9,
     "likes": 1,
     "reach": 1240,
     "syncedAt": "2026-09-09T13:30:00+00:00"
    },
    "permalink": "https://www.instagram.com/p/Terrace before and after/",
    "publishedAt": "2026-09-09T13:30:00+00:00",
    "title": "Terrace before and after",
    "type": "reel"
   },
   {
    "channel": "instagram",
    "id": 5,
    "metrics": {
     "engagement": 8.8,
     "likes": 1,
     "reach": 880,
     "syncedAt": "2026-09-14T13:30:00+00:00"
    },
    "permalink": "https://www.instagram.com/p/Is your roof ready?/",
    "publishedAt": "2026-09-14T13:30:00+00:00",
    "title": "Is your roof ready?",
    "type": "reel"
   },
   {
    "channel": "instagram",
    "id": 3,
    "metrics": {
     "engagement": 6.1,
     "likes": 1,
     "reach": 610,
     "syncedAt": "2026-09-11T13:30:00+00:00"
    },
    "permalink": "https://www.instagram.com/p/3 signs of a leak/",
    "publishedAt": "2026-09-11T13:30:00+00:00",
    "title": "3 signs of a leak",
    "type": "post"
   },
   {
    "channel": "instagram",
    "id": 2,
    "metrics": {
     "engagement": 4.2,
     "likes": 1,
     "reach": 420,
     "syncedAt": "2026-09-10T04:30:00+00:00"
    },
    "permalink": "https://www.instagram.com/p/Monsoon offer/",
    "publishedAt": "2026-09-10T04:30:00+00:00",
    "title": "Monsoon offer",
    "type": "post"
   },
   {
    "channel": "instagram",
    "id": 4,
    "metrics": {
     "engagement": 3.0,
     "likes": 1,
     "reach": 300,
     "syncedAt": "2026-09-12T04:30:00+00:00"
    },
    "permalink": "https://www.instagram.com/p/Meet Priya/",
    "publishedAt": "2026-09-12T04:30:00+00:00",
    "title": "Meet Priya",
    "type": "post"
   },
   {
    "channel": "instagram",
    "id": 6,
    "metrics": {
     "engagement": 2.0,
     "likes": 1,
     "reach": 150,
     "syncedAt": "2026-09-15T16:30:00+00:00"
    },
    "permalink": "https://www.instagram.com/p/Thank you, Pune/",
    "publishedAt": "2026-09-15T16:30:00+00:00",
    "title": "Thank you, Pune",
    "type": "post"
   }
  ],
  "working": {
   "bestFormat": {
    "engagement": 9.9,
    "key": "reel",
    "label": "Reel",
    "posts": 2,
    "reach": 2120
   },
   "bestHook": {
    "engagement": 5.8,
    "key": "story",
    "label": "Statement or story",
    "posts": 6,
    "reach": 3600
   },
   "bestPost": {
    "reach": 1240,
    "title": "Terrace before and after"
   },
   "bestTime": {
    "day": "Wed",
    "engagement": 10.9,
    "part": "Evening",
    "posts": 1
   }
  }
 }
};

export default organic;
