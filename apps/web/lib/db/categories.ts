// Fixed category list for job posting (matches DB enum)
export const JOB_CATEGORIES = [
  'PLUMBING',
  'ELECTRICAL',
  'CLEANING',
  'GARDENING',
  'MOVING',
  'HANDYMAN',
  'PAINTING',
  'OTHER',
] as const

export type JobCategory = (typeof JOB_CATEGORIES)[number]
