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

export const MEASURE_GROUPS: Record<string, string[]> = {
  "Health Outcomes": [
    "Current Asthma", "High Blood Pressure", "Cancer (except skin)",
    "Kidney Disease", "COPD", "Coronary Heart Disease",
    "Diabetes", "Obesity", "Stroke", "Depression",
    "High Cholesterol", "All Teeth Lost",
  ],
  "Prevention": [
    "Annual Checkup", "Dental Visit", "Cholesterol Screening",
    "Mammography", "Cervical Cancer Screening",
    "Colorectal Cancer Screening",
  ],
  "Risk Behaviors": [
    "Binge Drinking", "Current Smoking", "No Leisure-Time Physical Activity",
    "Sleeping Less Than 7 Hours",
  ],
  "Disabilities": [
    "Any Disability", "Hearing Disability", "Vision Disability",
    "Cognitive Disability", "Mobility Disability",
  ],
  "Health Status": [
    "Fair or Poor Self-Rated Health Status",
    "Frequent Mental Health Not Good Days",
    "Frequent Physical Health Not Good Days",
  ],
  "Social Needs": [
    "Lack of Health Insurance",
    "Could Not See Doctor Due to Cost",
  ],
};

export const POPULAR_MEASURES = [
  "Diabetes", "Obesity", "Current Asthma", "Depression",
  "Lack of Health Insurance", "No Leisure-Time Physical Activity",
  "Current Smoking", "Fair or Poor Self-Rated Health Status",
];

export async function fetchZCTAData(zcta: string): Promise<PlacesMeasure[]> {
  try {
    const res = await fetch(`${PLACES_BASE}?$where=locationid='${zcta}'&$limit=50`);
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

export const MI_STATE_AVERAGES: Record<string, number> = {
  "Current Asthma": 11.2, "High Blood Pressure": 33.4, "Diabetes": 12.1,
  "Obesity": 36.4, "Current Smoking": 18.7, "Depression": 23.8,
  "No Leisure-Time Physical Activity": 27.6, "Binge Drinking": 18.2,
  "Fair or Poor Self-Rated Health Status": 20.1, "Lack of Health Insurance": 6.8,
  "Annual Checkup": 76.3, "Dental Visit": 62.1, "Any Disability": 30.3,
  "Frequent Mental Health Not Good Days": 17.2, "Cancer (except skin)": 6.8,
  "COPD": 8.4, "Coronary Heart Disease": 6.2, "Stroke": 3.8,
  "Kidney Disease": 3.2, "Sleeping Less Than 7 Hours": 37.8,
  "High Cholesterol": 31.2, "Obesity": 36.4, "All Teeth Lost": 14.2,
  "Could Not See Doctor Due to Cost": 11.8,
};

export const US_AVERAGES: Record<string, number> = {
  "Current Asthma": 10.3, "High Blood Pressure": 32.5, "Diabetes": 11.4,
  "Obesity": 33.0, "Current Smoking": 15.3, "Depression": 21.4,
  "No Leisure-Time Physical Activity": 26.1, "Binge Drinking": 17.4,
  "Fair or Poor Self-Rated Health Status": 18.4, "Lack of Health Insurance": 10.3,
  "Annual Checkup": 77.4, "Dental Visit": 65.0, "Any Disability": 28.7,
  "Frequent Mental Health Not Good Days": 15.6, "Cancer (except skin)": 6.3,
  "COPD": 6.6, "Coronary Heart Disease": 5.7, "Stroke": 3.4,
  "Kidney Disease": 3.0, "Sleeping Less Than 7 Hours": 35.6,
  "High Cholesterol": 29.8, "All Teeth Lost": 12.1,
  "Could Not See Doctor Due to Cost": 10.4,
};
