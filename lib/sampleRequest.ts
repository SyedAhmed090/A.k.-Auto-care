// Shared constants for the "Order a Sample" lead-capture flow.
// Imported by the public form, the submit API, and the admin views so the
// monthly-usage bands and statuses stay in sync across the stack.

export const MONTHLY_USAGE_OPTIONS = [
  "Under 5 kg / month",
  "5-20 kg / month",
  "20-50 kg / month",
  "50-100 kg / month",
  "100+ kg / month",
  "Not sure yet",
] as const;

export type MonthlyUsage = (typeof MONTHLY_USAGE_OPTIONS)[number];

export const SAMPLE_STATUSES = ["new", "contacted", "converted", "closed"] as const;
export type SampleStatus = (typeof SAMPLE_STATUSES)[number];
