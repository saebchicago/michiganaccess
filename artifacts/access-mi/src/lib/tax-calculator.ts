import {
  FEDERAL_BRACKETS_SINGLE, FEDERAL_BRACKETS_MARRIED,
  MI_STATE_INCOME_TAX, MI_PERSONAL_EXEMPTION, MI_SALES_TAX,
  FICA_SS_RATE, FICA_SS_CAP, FICA_MEDICARE_RATE,
  CITY_INCOME_TAX, PROPERTY_TAX_RATES, AUTO_INSURANCE_MONTHLY,
} from "@/data/michigan-taxes";

export interface TaxInput {
  annualSalary: number;
  filingStatus: "single" | "married";
  dependents: number;
  city: string;
  isResident: boolean;
  homeValue?: number;
}

export interface TaxBreakdown {
  federal: number;
  fica: number;
  stateIncome: number;
  cityIncome: number;
  propertyTax: number;
  salesTax: number;
  autoInsurance: number;
  totalTax: number;
  effectiveRate: number;
  takeHomePay: number;
  monthlyTakeHome: number;
}

export function calculateTaxBurden(input: TaxInput): TaxBreakdown {
  const { annualSalary, filingStatus, dependents, city, isResident, homeValue } = input;

  // Federal
  const stdDeduction = filingStatus === "married" ? 30000 : 15000;
  const taxableIncome = Math.max(0, annualSalary - stdDeduction);
  const brackets = filingStatus === "married" ? FEDERAL_BRACKETS_MARRIED : FEDERAL_BRACKETS_SINGLE;
  let federal = 0;
  for (const b of brackets) {
    if (taxableIncome > b.min) {
      federal += (Math.min(taxableIncome, b.max) - b.min) * b.rate;
    }
  }

  // FICA
  const fica = Math.min(annualSalary, FICA_SS_CAP) * FICA_SS_RATE + annualSalary * FICA_MEDICARE_RATE;

  // State
  const exemptions = MI_PERSONAL_EXEMPTION * (1 + dependents + (filingStatus === "married" ? 1 : 0));
  const stateIncome = Math.max(0, annualSalary - exemptions) * MI_STATE_INCOME_TAX;

  // City
  const cityData = CITY_INCOME_TAX[city];
  const cityIncome = cityData ? annualSalary * (isResident ? cityData.resident : cityData.nonResident) : 0;

  // Property
  const propData = PROPERTY_TAX_RATES[city];
  const actualHome = homeValue ?? propData?.medianHomeValue ?? 200000;
  const propertyTax = propData ? (actualHome * 0.5 * propData.millageRate / 1000) : 0;

  // Sales (estimate ~30% of income on taxable goods)
  const salesTax = annualSalary * 0.3 * MI_SALES_TAX;

  // Auto insurance
  const autoInsurance = (AUTO_INSURANCE_MONTHLY[city] ?? 250) * 12;

  const totalTax = federal + fica + stateIncome + cityIncome + propertyTax + salesTax;
  const effectiveRate = annualSalary > 0 ? totalTax / annualSalary : 0;
  const takeHomePay = annualSalary - totalTax;

  return {
    federal: Math.round(federal),
    fica: Math.round(fica),
    stateIncome: Math.round(stateIncome),
    cityIncome: Math.round(cityIncome),
    propertyTax: Math.round(propertyTax),
    salesTax: Math.round(salesTax),
    autoInsurance: Math.round(autoInsurance),
    totalTax: Math.round(totalTax),
    effectiveRate: Math.round(effectiveRate * 1000) / 10,
    takeHomePay: Math.round(takeHomePay),
    monthlyTakeHome: Math.round(takeHomePay / 12),
  };
}
