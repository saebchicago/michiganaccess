export interface SpecialtyGroup {
  label: string;
  items: { value: string; label: string }[];
}

export const SPECIALTY_GROUPS: SpecialtyGroup[] = [
  {
    label: "Primary Care",
    items: [
      { value: "Family Medicine", label: "Family Medicine" },
      { value: "Internal Medicine", label: "Internal Medicine" },
      { value: "General Practice", label: "General Practice" },
      { value: "Pediatrics", label: "Pediatrics" },
      { value: "Geriatric Medicine", label: "Geriatric Medicine" },
    ],
  },
  {
    label: "Specialists",
    items: [
      { value: "Cardiology", label: "Cardiology" },
      { value: "Dermatology", label: "Dermatology" },
      { value: "Endocrinology", label: "Endocrinology" },
      { value: "Gastroenterology", label: "Gastroenterology" },
      { value: "Neurology", label: "Neurology" },
      { value: "Oncology", label: "Oncology" },
      { value: "Ophthalmology", label: "Ophthalmology" },
      { value: "Orthopedic Surgery", label: "Orthopedic Surgery" },
      { value: "Otolaryngology", label: "ENT (Otolaryngology)" },
      { value: "Psychiatry", label: "Psychiatry" },
      { value: "Pulmonology", label: "Pulmonology" },
      { value: "Rheumatology", label: "Rheumatology" },
      { value: "Urology", label: "Urology" },
      { value: "Obstetrics & Gynecology", label: "OB/GYN" },
      { value: "Allergy & Immunology", label: "Allergy & Immunology" },
      { value: "Nephrology", label: "Nephrology" },
      { value: "Infectious Disease", label: "Infectious Disease" },
      { value: "Hematology", label: "Hematology" },
      { value: "Physical Medicine & Rehabilitation", label: "Physical Medicine & Rehabilitation" },
    ],
  },
  {
    label: "Surgery",
    items: [
      { value: "General Surgery", label: "General Surgery" },
      { value: "Cardiovascular Surgery", label: "Cardiovascular Surgery" },
      { value: "Neurological Surgery", label: "Neurological Surgery" },
      { value: "Plastic Surgery", label: "Plastic Surgery" },
      { value: "Thoracic Surgery", label: "Thoracic Surgery" },
      { value: "Vascular Surgery", label: "Vascular Surgery" },
      { value: "Colorectal Surgery", label: "Colorectal Surgery" },
    ],
  },
  {
    label: "Dental & Vision",
    items: [
      { value: "Dentist", label: "Dentist" },
      { value: "Orthodontist", label: "Orthodontist" },
      { value: "Oral Surgery", label: "Oral Surgery" },
      { value: "Optometry", label: "Optometry" },
      { value: "Optician", label: "Optician" },
    ],
  },
  {
    label: "Therapy & Rehab",
    items: [
      { value: "Physical Therapy", label: "Physical Therapy" },
      { value: "Occupational Therapy", label: "Occupational Therapy" },
      { value: "Speech-Language Pathology", label: "Speech Therapy" },
      { value: "Chiropractic", label: "Chiropractic" },
      { value: "Acupuncture", label: "Acupuncture" },
    ],
  },
  {
    label: "Behavioral Health",
    items: [
      { value: "Psychology", label: "Psychology" },
      { value: "Clinical Social Worker", label: "Clinical Social Worker" },
      { value: "Licensed Professional Counselor", label: "Licensed Professional Counselor" },
      { value: "Marriage & Family Therapist", label: "Marriage & Family Therapist" },
    ],
  },
  {
    label: "Other",
    items: [
      { value: "Pharmacy", label: "Pharmacy" },
      { value: "Podiatry", label: "Podiatry" },
      { value: "Home Health", label: "Home Health" },
      { value: "Hospice", label: "Hospice" },
      { value: "Nurse Practitioner", label: "Nurse Practitioner" },
      { value: "Physician Assistant", label: "Physician Assistant" },
      { value: "Certified Nurse Midwife", label: "Certified Nurse Midwife" },
      { value: "Dietitian/Nutritionist", label: "Dietitian/Nutritionist" },
    ],
  },
];

export const ALL_SPECIALTIES = SPECIALTY_GROUPS.flatMap((g) => g.items);
