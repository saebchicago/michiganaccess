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
  { district: "Midland PS", county: "Midland", gradRate: 92, absenteeism: 14.2, perPupil: 11600 },
  { district: "Marquette APS", county: "Marquette", gradRate: 91, absenteeism: 15.8, perPupil: 11300 },
  { district: "Portage PS", county: "Kalamazoo", gradRate: 92, absenteeism: 14.5, perPupil: 11400 },
  { district: "Holland PS", county: "Ottawa", gradRate: 85, absenteeism: 22.1, perPupil: 10600 },
  { district: "Zeeland PS", county: "Ottawa", gradRate: 94, absenteeism: 12.8, perPupil: 10200 },
  { district: "Hudsonville PS", county: "Ottawa", gradRate: 95, absenteeism: 11.9, perPupil: 10100 },
  { district: "Saline ASD", county: "Washtenaw", gradRate: 96, absenteeism: 11.0, perPupil: 12000 },
  { district: "Dexter CS", county: "Washtenaw", gradRate: 95, absenteeism: 12.2, perPupil: 11700 },
  { district: "Plymouth-Canton CS", county: "Wayne", gradRate: 93, absenteeism: 15.5, perPupil: 11900 },
  { district: "Dearborn PS", county: "Wayne", gradRate: 81, absenteeism: 26.8, perPupil: 12400 },
  { district: "Utica CS", county: "Macomb", gradRate: 91, absenteeism: 16.1, perPupil: 11300 },
  { district: "L'Anse Creuse PS", county: "Macomb", gradRate: 88, absenteeism: 19.2, perPupil: 11100 },
  { district: "Chippewa Valley Schools", county: "Macomb", gradRate: 90, absenteeism: 17.4, perPupil: 11000 },
  { district: "Clarkston CS", county: "Oakland", gradRate: 94, absenteeism: 13.5, perPupil: 11500 },
  { district: "Lake Orion CS", county: "Oakland", gradRate: 93, absenteeism: 14.1, perPupil: 11400 },
  { district: "West Bloomfield SD", county: "Oakland", gradRate: 92, absenteeism: 14.8, perPupil: 13100 },
  { district: "Okemos PS", county: "Ingham", gradRate: 95, absenteeism: 12.0, perPupil: 12500 },
  { district: "Haslett PS", county: "Ingham", gradRate: 93, absenteeism: 13.8, perPupil: 11800 },
  { district: "East Grand Rapids PS", county: "Kent", gradRate: 97, absenteeism: 10.5, perPupil: 12800 },
  { district: "Byron Center PS", county: "Kent", gradRate: 95, absenteeism: 11.8, perPupil: 10400 },
  { district: "Monroe PS", county: "Monroe", gradRate: 84, absenteeism: 24.2, perPupil: 10800 },
  { district: "St. Joseph PS", county: "Berrien", gradRate: 89, absenteeism: 18.5, perPupil: 11200 },
  { district: "Benton Harbor ASD", county: "Berrien", gradRate: 55, absenteeism: 55.2, perPupil: 14800 },
  { district: "Mt. Pleasant PS", county: "Isabella", gradRate: 86, absenteeism: 20.4, perPupil: 11100 },
  { district: "Eaton Rapids PS", county: "Eaton", gradRate: 88, absenteeism: 19.8, perPupil: 10500 },
  { district: "Charlotte PS", county: "Eaton", gradRate: 86, absenteeism: 21.5, perPupil: 10300 },
  { district: "DeWitt PS", county: "Clinton", gradRate: 95, absenteeism: 12.4, perPupil: 11600 },
  { district: "Howell PS", county: "Livingston", gradRate: 93, absenteeism: 14.6, perPupil: 10900 },
  { district: "Brighton ASD", county: "Livingston", gradRate: 95, absenteeism: 12.1, perPupil: 11200 },
];

export const MI_AVG_GRAD_RATE = 84;
export const MI_AVG_ABSENTEEISM = 27.9;
