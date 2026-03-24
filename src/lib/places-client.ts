/**
 * CDC PLACES API client — ZCTA (ZIP code) level health data
 * Source: CDC, Robert Wood Johnson Foundation, CDC Foundation
 * Dataset: qnzd-25i4 (ZCTA 2024 release)
 * No auth required.
 */

const PLACES_BASE = "https://data.cdc.gov/resource/qnzd-25i4.json";

export interface PlacesMeasure {
  locationid: string;
  measure: string;
  short_question_text: string;
  category: string;
  data_value: number;
  data_value_type: string;
  totalpopulation: number;
  low_confidence_limit: number;
  high_confidence_limit: number;
}

// IMPORTANT: These names must EXACTLY match the API's short_question_text values
export const MEASURE_GROUPS: Record<string, string[]> = {
  "Health Outcomes": [
    "Current Asthma", "High Blood Pressure", "Cancer (non-skin) or Melanoma",
    "COPD", "Coronary Heart Disease", "Arthritis",
    "Diabetes", "Obesity", "Stroke", "Depression",
    "High Cholesterol", "All Teeth Lost",
  ],
  "Prevention": [
    "Annual Checkup", "Dental Visit", "Cholesterol Screening",
    "Mammography", "Colorectal Cancer Screening",
    "High Blood Pressure Medication",
  ],
  "Risk Behaviors": [
    "Binge Drinking", "Current Cigarette Smoking", "Physical Inactivity",
    "Short Sleep Duration",
  ],
  "Disabilities": [
    "Any Disability", "Hearing Disability", "Vision Disability",
    "Cognitive Disability", "Mobility Disability",
    "Self-care Disability", "Independent Living Disability",
  ],
  "Health Status": [
    "General Health",
    "Frequent Mental Distress",
    "Frequent Physical Distress",
  ],
  "Social Needs": [
    "Health Insurance", "Food Stamps", "Food Insecurity",
    "Housing Insecurity", "Utility Services Threat",
    "Transportation Barriers",
  ],
};

export const POPULAR_MEASURES = [
  "Diabetes", "Obesity", "Current Asthma", "Depression",
  "Health Insurance", "Physical Inactivity",
  "Current Cigarette Smoking", "General Health",
];

export async function fetchZCTAData(zcta: string): Promise<PlacesMeasure[]> {
  try {
    const res = await fetch(`${PLACES_BASE}?locationid=${encodeURIComponent(zcta)}&$limit=1000`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((d: any) => ({
      locationid: d.locationid,
      measure: d.measure,
      short_question_text: d.short_question_text,
      category: d.category,
      data_value: parseFloat(d.data_value) || 0,
      data_value_type: d.data_value_type,
      totalpopulation: parseInt(d.totalpopulation) || 0,
      low_confidence_limit: parseFloat(d.low_confidence_limit) || 0,
      high_confidence_limit: parseFloat(d.high_confidence_limit) || 0,
    }));
  } catch {
    return [];
  }
}

// Keys must match API short_question_text exactly
export const MI_STATE_AVERAGES: Record<string, number> = {
  "Current Asthma": 11.2, "High Blood Pressure": 33.4, "Diabetes": 12.1,
  "Obesity": 36.4, "Current Cigarette Smoking": 18.7, "Depression": 23.8,
  "Physical Inactivity": 27.6, "Binge Drinking": 18.2,
  "General Health": 20.1, "Health Insurance": 6.8,
  "Annual Checkup": 76.3, "Dental Visit": 62.1, "Any Disability": 30.3,
  "Frequent Mental Distress": 17.2, "Cancer (non-skin) or Melanoma": 6.8,
  "COPD": 8.4, "Coronary Heart Disease": 6.2, "Stroke": 3.8,
  "Short Sleep Duration": 37.8, "Arthritis": 26.5,
  "High Cholesterol": 31.2, "All Teeth Lost": 14.2,
  "Food Stamps": 22.0, "Food Insecurity": 12.5,
  "Housing Insecurity": 15.0, "Utility Services Threat": 8.5,
};

export const US_AVERAGES: Record<string, number> = {
  "Current Asthma": 10.3, "High Blood Pressure": 32.5, "Diabetes": 11.4,
  "Obesity": 33.0, "Current Cigarette Smoking": 15.3, "Depression": 21.4,
  "Physical Inactivity": 26.1, "Binge Drinking": 17.4,
  "General Health": 18.4, "Health Insurance": 10.3,
  "Annual Checkup": 77.4, "Dental Visit": 65.0, "Any Disability": 28.7,
  "Frequent Mental Distress": 15.6, "Cancer (non-skin) or Melanoma": 6.3,
  "COPD": 6.6, "Coronary Heart Disease": 5.7, "Stroke": 3.4,
  "Short Sleep Duration": 35.6, "Arthritis": 24.8,
  "High Cholesterol": 29.8, "All Teeth Lost": 12.1,
  "Food Stamps": 19.5, "Food Insecurity": 11.0,
  "Housing Insecurity": 13.5, "Utility Services Threat": 7.2,
};
