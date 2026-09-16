// Content templates: a proven shape for a post, with the brief AI Studio starts from.
// They carry no brand claims — the words come from your Brand Brain when Studio writes
// the draft, so the same template reads differently for a dentist and a roofing firm.
export const TEMPLATE_GOALS = ['Awareness', 'Trust', 'Offer', 'Education', 'Community'];

export const TEMPLATES = [
  {
    id: 'proof-before-after', name: 'Before and after', format: 'ig_reel', goal: 'Trust',
    structure: ['Open on the problem as the customer saw it', 'Show the work happening', 'End on the result and who did it'],
    brief: 'A before-and-after reel of one real job: the problem, the work, the result, and a line inviting the viewer to ask for the same.',
  },
  {
    id: 'proof-customer-story', name: 'Customer story', format: 'ig_carousel', goal: 'Trust',
    structure: ['The customer and what they needed', 'What we did, in plain words', 'What changed for them', 'How to get the same'],
    brief: 'A short customer story carousel: who they were, what they needed, what we did, what changed — no invented quotes or numbers.',
  },
  {
    id: 'trust-team', name: 'Meet the team', format: 'ig_post', goal: 'Community',
    structure: ['Who this is and what they do', 'One thing they are known for', 'An invitation to say hello'],
    brief: 'Introduce one team member warmly: their role, one thing customers notice about their work, and an invitation to get in touch.',
  },
  {
    id: 'edu-myth', name: 'Myth versus fact', format: 'ig_carousel', goal: 'Education',
    structure: ['The myth people repeat', 'Why it is wrong', 'What to do instead', 'Where to ask for help'],
    brief: 'Bust one common myth in our field: state the myth, explain plainly why it is wrong, and give the better thing to do.',
  },
  {
    id: 'edu-how-to', name: 'How to, in three steps', format: 'ig_carousel', goal: 'Education',
    structure: ['The task and why it matters', 'Step one, two, three', 'When to call a professional'],
    brief: 'A three-step how-to the customer can actually follow, ending with the point where our help is worth it.',
  },
  {
    id: 'edu-faq', name: 'The question we hear most', format: 'ig_post', goal: 'Education',
    structure: ['The question, in the customer’s words', 'The honest answer', 'What to do next'],
    brief: 'Answer the question customers ask most often, in their words, honestly, with a clear next step.',
  },
  {
    id: 'edu-checklist', name: 'Checklist before you buy', format: 'ig_carousel', goal: 'Education',
    structure: ['What to check first', 'What to compare', 'What to avoid', 'What we do about each'],
    brief: 'A buyer’s checklist for our category — what to check, compare and avoid — with how we handle each point.',
  },
  {
    id: 'offer-limited', name: 'This week’s offer', format: 'ig_post', goal: 'Offer',
    structure: ['What the offer is, exactly', 'Who it suits', 'When it ends and how to claim it'],
    brief: 'Announce one clear offer: what it includes, who it is for, when it ends and exactly how to claim it.',
  },
  {
    id: 'offer-seasonal', name: 'Season is coming', format: 'ig_reel', goal: 'Offer',
    structure: ['What the season does to customers', 'What to get ready now', 'The offer that helps'],
    brief: 'Tie this season to a real problem customers face, what to prepare now, and the service or offer that helps.',
  },
  {
    id: 'aware-behind-scenes', name: 'Behind the scenes', format: 'ig_reel', goal: 'Awareness',
    structure: ['Start mid-action', 'Show the craft or care that is usually invisible', 'Say what it means for the customer'],
    brief: 'A behind-the-scenes reel of ordinary work done well, and why that care matters to the person paying for it.',
  },
  {
    id: 'aware-day-in-life', name: 'A day in our work', format: 'ig_reel', goal: 'Awareness',
    structure: ['Morning: what we set up', 'Middle: the hard part', 'End: the finished job'],
    brief: 'One working day in three beats — setup, the hard part, the finished job — showing what the customer is really buying.',
  },
  {
    id: 'aware-local', name: 'Local landmark or street', format: 'ig_post', goal: 'Awareness',
    structure: ['Name the place', 'Our connection to it', 'An invitation to neighbours'],
    brief: 'A neighbourly post tying our work to a place we serve, ending with an invitation to people nearby.',
  },
  {
    id: 'community-question', name: 'Ask the audience', format: 'ig_post', goal: 'Community',
    structure: ['A question with two clear sides', 'Why we are asking', 'Promise to share what people say'],
    brief: 'Ask followers one simple either-or question relevant to our work, and say what we will do with the answers.',
  },
  {
    id: 'community-thanks', name: 'Thank you post', format: 'ig_post', goal: 'Community',
    structure: ['What happened', 'Who made it happen', 'What we are doing next'],
    brief: 'Thank customers or the team for something that actually happened, and say what comes next.',
  },
  {
    id: 'trust-guarantee', name: 'What we promise', format: 'ig_carousel', goal: 'Trust',
    structure: ['The promise, in one line', 'What it covers', 'What it does not cover', 'How to hold us to it'],
    brief: 'State our guarantee plainly: what it covers, what it does not, and how a customer holds us to it.',
  },
  {
    id: 'offer-whatsapp', name: 'WhatsApp broadcast', format: 'wa_promo', goal: 'Offer',
    structure: ['One line on what is new', 'Why it matters to this customer', 'A single reply-to-book line'],
    brief: 'A short WhatsApp message for existing customers: what is new, why it matters to them, and one way to reply.',
  },
  {
    id: 'trust-linkedin', name: 'What we learned', format: 'li_post', goal: 'Trust',
    structure: ['The situation', 'What we tried', 'What we learned and would do again'],
    brief: 'A LinkedIn post about a real lesson from our work: the situation, what we tried, what we would do again.',
  },
  {
    id: 'edu-comparison', name: 'Two options compared', format: 'ig_carousel', goal: 'Education',
    structure: ['Option A and who it suits', 'Option B and who it suits', 'How to choose', 'What we recommend and why'],
    brief: 'Compare the two options customers weigh up, say who each suits, and give an honest recommendation.',
  },
];

export const templatesFor = (goal, query) => TEMPLATES.filter((t) => (
  (!goal || t.goal === goal)
  && (!query || `${t.name} ${t.goal} ${t.brief}`.toLowerCase().includes(query.toLowerCase()))
));
