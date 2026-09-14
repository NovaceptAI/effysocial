// Review status for the Privacy Policy and Terms. While `draft` is true both pages
// show a notice and every <Ph> placeholder stays visibly highlighted. Set it to false
// only after the owner and client approve the text and every placeholder is replaced.
export const LEGAL = {
  draft: true,
  lastUpdated: '14 September 2026',
  // Details the approvers must supply before publishing as final.
  placeholders: [
    'Legal entity name',
    'Registered address',
    'Contact email',
    'Grievance Officer name and email',
    'City for courts',
    'Liability cap amount',
    'Deletion and response times (days)',
  ],
};
