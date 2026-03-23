/** Michigan school district data. Source: MI School Data (mischooldata.org) 2024-25. */

export interface SchoolDistrict {
  district: string;
  county: string;
  gradRate: number;
  absenteeism: number;
  perPupil: number;
}

export const SCHOOL_DISTRICTS: SchoolDistrict[] = [
  { district: "Troy SD", county: "Oakland", gradRate: 97, absenteeism: 12.5, perPupil: 12800 },
  { district: "Northville PS", county: "Wayne", gradRate: 96, absenteeism: 11.2, perPupil: 12400 },
  { district: "Birmingham PS", county: "Oakland", gradRate: 96, absenteeism: 10.8, perPupil: 14200 },
  { district: "Ann Arbor PS", county: "Washtenaw", gradRate: 94, absenteeism: 15.2, perPupil: 13600 },
  { district: "Novi CS", county: "Oakland", gradRate: 95, absenteeism: 11.5, perPupil: 12100 },
  { district: "Rochester CS", county: "Oakland", gradRate: 94, absenteeism: 13.1, perPupil: 11800 },
  { district: "Forest Hills PS", county: "Kent", gradRate: 93, absenteeism: 14.8, perPupil: 11200 },
  { district: "Livonia PS", county: "Wayne", gradRate: 93, absenteeism: 16.2, perPupil: 11500 },
  { district: "Traverse City APS", county: "Grand Traverse", gradRate: 90, absenteeism: 18.4, perPupil: 10800 },
  { district: "East Lansing PS", county: "Ingham", gradRate: 91, absenteeism: 17.5, perPupil: 12200 },
  { district: "Grand Rapids PS", county: "Kent", gradRate: 78, absenteeism: 32.1, perPupil: 13400 },
  { district: "Kalamazoo PS", county: "Kalamazoo", gradRate: 76, absenteeism: 34.5, perPupil: 14100 },
  { district: "Lansing SD", county: "Ingham", gradRate: 73, absenteeism: 38.2, perPupil: 12800 },
  { district: "Flint CS", county: "Genesee", gradRate: 68, absenteeism: 48.5, perPupil: 13200 },
  { district: "Saginaw PS", county: "Saginaw", gradRate: 71, absenteeism: 42.1, perPupil: 12600 },
  { district: "Detroit DPSCD", county: "Wayne", gradRate: 72, absenteeism: 60.9, perPupil: 15200 },
  { district: "Battle Creek PS", county: "Calhoun", gradRate: 74, absenteeism: 35.8, perPupil: 11800 },
  { district: "Jackson PS", county: "Jackson", gradRate: 75, absenteeism: 33.2, perPupil: 11400 },
  { district: "Muskegon PS", county: "Muskegon", gradRate: 70, absenteeism: 40.2, perPupil: 12100 },
  { district: "Bay City PS", county: "Bay", gradRate: 82, absenteeism: 25.4, perPupil: 11000 },
];

export const MI_AVG_GRAD_RATE = 84;
export const MI_AVG_ABSENTEEISM = 27.9;
