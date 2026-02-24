import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  ChevronRight, ChevronLeft, Lock, AlertCircle, CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface WizardState {
  step: number;
  zipCode: string;
  ageGroup: string;
  healthProfile: string;
  incomeLevel: string;
}

interface Plan {
  id: string;
  name: string;
  type: string;
  description: string;
  matchScore: number;
  premium?: string;
  coverage?: string;
  eligibility?: string;
  link: string;
}

const generatePlans = (state: WizardState): Plan[] => {
  const plans: Plan[] = [];

  // Medicaid (for low income)
  if (state.incomeLevel === "very-low" || state.incomeLevel === "low") {
    plans.push({
      id: "medicaid",
      name: "Medicaid",
      type: "Government Program",
      description: "Free or low-cost health coverage for eligible Michigan residents.",
      matchScore: state.incomeLevel === "very-low" ? 100 : 95,
      premium: "Free or low monthly cost",
      coverage: "Comprehensive (doctor visits, hospital, prescriptions)",
      eligibility: "Based on income and household size",
      link: "https://www.michigan.gov/mdhhs/0,5885,7-339-73971_4911---,00.html",
    });
  }

  // Marketplace (for uninsured/self-employed)
  plans.push({
    id: "marketplace",
    name: "Health Insurance Marketplace",
    type: "Federal Program",
    description: "Compare and enroll in private health plans with possible subsidies.",
    matchScore: state.incomeLevel === "moderate" || state.incomeLevel === "low" ? 90 : 70,
    premium: "Varies by plan (subsidies available)",
    coverage: "Bronze, Silver, Gold, Platinum tiers",
    eligibility: "Open Enrollment or qualifying life event",
    link: "https://www.healthcare.gov/",
  });

  // Medicare (for 65+)
  if (state.ageGroup === "65+") {
    plans.push({
      id: "medicare",
      name: "Medicare",
      type: "Federal Program",
      description: "Health coverage for people 65 and older.",
      matchScore: 100,
      premium: "Deductibles and copays apply",
      coverage: "Hospital (Part A), Medical (Part B), Prescription (Part D)",
      eligibility: "Age 65 or older",
      link: "https://www.medicare.gov/",
    });
  }

  // Child Health Plus (for families with children)
  if ((state.ageGroup === "under-18" || state.ageGroup === "18-26") && state.incomeLevel !== "high") {
    plans.push({
      id: "chip",
      name: "Medicaid for Children (Child Health Plus)",
      type: "Government Program",
      description: "Low-cost or free health coverage for Michigan children and teens.",
      matchScore: 95,
      premium: "Free or low monthly cost",
      coverage: "Comprehensive pediatric care",
      eligibility: "Children under 19, based on income",
      link: "https://www.michigan.gov/mdhhs/0,5885,7-339-73971_4911---,00.html",
    });
  }

  // LIHEAP / Safety-net programs
  if (state.incomeLevel === "very-low" || state.incomeLevel === "low") {
    plans.push({
      id: "safetynet",
      name: "Community Health Centers (Safety Net)",
      type: "Local Program",
      description: "Sliding-scale clinics providing care regardless of ability to pay.",
      matchScore: 85,
      premium: "Sliding scale based on income",
      coverage: "Primary care, preventive care, urgent care",
      eligibility: "Open to uninsured/underinsured",
      link: "https://findahealthcenter.hrsa.gov/",
    });
  }

  // Employer (for employed)
  if (state.healthProfile === "mostly-healthy") {
    plans.push({
      id: "employer",
      name: "Employer-Sponsored Coverage",
      type: "Private Insurance",
      description: "If you have access through an employer, review your options.",
      matchScore: 80,
      premium: "Shared with employer",
      coverage: "Varies by plan",
      eligibility: "Through current or prospective employer",
      link: "#",
    });
  }

  // Sort by match score
  return plans.sort((a, b) => b.matchScore - a.matchScore);
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function InsuranceComparisonPage() {
  usePageMeta({
    title: "Compare Insurance Options — Access Michigan",
    description:
      "Find which health insurance programs you might qualify for. No personal data stored. Completely private.",
    path: "/insurance-comparison",
  });

  const [state, setState] = useState<WizardState>({
    step: 1,
    zipCode: "",
    ageGroup: "",
    healthProfile: "",
    incomeLevel: "",
  });

  const plans = generatePlans(state);
  const progress = (state.step / 5) * 100;

  const nextStep = () => {
    if (state.step < 5) {
      setState((prev) => ({ ...prev, step: prev.step + 1 }));
    }
  };

  const prevStep = () => {
    if (state.step > 1) {
      setState((prev) => ({ ...prev, step: prev.step - 1 }));
    }
  };

  const isStepValid = () => {
    switch (state.step) {
      case 1:
        return state.zipCode.length >= 5;
      case 2:
        return state.ageGroup.length > 0;
      case 3:
        return state.healthProfile.length > 0;
      case 4:
        return true; // Income is optional
      default:
        return true;
    }
  };

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Insurance Comparison" }]} />

      <div className="container py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 max-w-2xl"
        >
          <h1 className="text-3xl font-bold text-foreground md:text-4xl mb-3">
            Find Your Insurance Options
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Answer a few quick questions to see which health coverage programs you might qualify for.
          </p>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-michigan-navy/5 border border-michigan-navy/20">
            <Lock className="h-4 w-4 text-michigan-navy flex-shrink-0" />
            <p className="text-sm text-foreground">
              <strong>Private & Secure:</strong> No personal data stored. All answers stay in your browser.
            </p>
          </div>
        </motion.div>

        <div className="max-w-2xl">
          {/* Progress Bar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground">
                Step {state.step} of 5
              </p>
              <p className="text-sm text-muted-foreground">
                ~2 minutes
              </p>
            </div>
            <Progress value={progress} className="h-2" />
          </motion.div>

          {/* Wizard Steps */}
          <AnimatePresence mode="wait">
            {/* Step 1: ZIP Code */}
            {state.step === 1 && (
              <motion.div key="step1" initial="hidden" animate="visible" exit="hidden" variants={fadeUp}>
                <Card>
                  <CardContent className="pt-8 space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-2">Where do you live?</h2>
                      <p className="text-sm text-muted-foreground">
                        We'll use this to find programs available in your area.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="zipcode" className="text-base font-medium mb-2 block">
                        ZIP Code
                      </Label>
                      <input
                        id="zipcode"
                        type="text"
                        placeholder="48xxx"
                        maxLength={5}
                        value={state.zipCode}
                        onChange={(e) => setState({ ...state, zipCode: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      💡 Don't have a ZIP code? Use your county code instead.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Age Group */}
            {state.step === 2 && (
              <motion.div key="step2" initial="hidden" animate="visible" exit="hidden" variants={fadeUp}>
                <Card>
                  <CardContent className="pt-8 space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-2">What's your age?</h2>
                      <p className="text-sm text-muted-foreground">
                        Some programs are designed for specific age groups.
                      </p>
                    </div>

                    <RadioGroup value={state.ageGroup} onValueChange={(value) => setState({ ...state, ageGroup: value })}>
                      <div className="space-y-3">
                        {["under-18", "18-26", "27-64", "65+"].map((age) => (
                          <Label key={age} className="flex items-center gap-3 p-3 rounded-lg border border-input cursor-pointer hover:bg-muted/50 transition-colors">
                            <RadioGroupItem value={age} id={age} />
                            <span className="font-medium">
                              {age === "under-18" && "Under 18"}
                              {age === "18-26" && "18–26"}
                              {age === "27-64" && "27–64"}
                              {age === "65+" && "65 and older"}
                            </span>
                          </Label>
                        ))}
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Health Profile */}
            {state.step === 3 && (
              <motion.div key="step3" initial="hidden" animate="visible" exit="hidden" variants={fadeUp}>
                <Card>
                  <CardContent className="pt-8 space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-2">How's your health?</h2>
                      <p className="text-sm text-muted-foreground">
                        This helps us recommend plans with appropriate coverage.
                      </p>
                    </div>

                    <RadioGroup
                      value={state.healthProfile}
                      onValueChange={(value) => setState({ ...state, healthProfile: value })}
                    >
                      <div className="space-y-3">
                        {[
                          { value: "mostly-healthy", label: "Mostly healthy", desc: "Rarely see a doctor" },
                          { value: "some-conditions", label: "Some conditions", desc: "Manage chronic conditions" },
                          { value: "intensive-care", label: "Intensive care", desc: "Need frequent medical care" },
                          { value: "not-sure", label: "Not sure", desc: "Prefer not to say" },
                        ].map((option) => (
                          <Label
                            key={option.value}
                            className="flex items-start gap-3 p-3 rounded-lg border border-input cursor-pointer hover:bg-muted/50 transition-colors"
                          >
                            <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                            <div>
                              <p className="font-medium">{option.label}</p>
                              <p className="text-xs text-muted-foreground">{option.desc}</p>
                            </div>
                          </Label>
                        ))}
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Income Level (Optional) */}
            {state.step === 4 && (
              <motion.div key="step4" initial="hidden" animate="visible" exit="hidden" variants={fadeUp}>
                <Card>
                  <CardContent className="pt-8 space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-2">Household income (optional)</h2>
                      <p className="text-sm text-muted-foreground">
                        This helps us identify cost-assistance programs. Your answer is not saved.
                      </p>
                    </div>

                    <RadioGroup
                      value={state.incomeLevel}
                      onValueChange={(value) => setState({ ...state, incomeLevel: value })}
                    >
                      <div className="space-y-3">
                        {[
                          { value: "very-low", label: "Very low income", desc: "Below $25k/year" },
                          { value: "low", label: "Low income", desc: "$25k–$50k/year" },
                          { value: "moderate", label: "Moderate income", desc: "$50k–$100k/year" },
                          { value: "high", label: "Higher income", desc: "$100k+/year" },
                          { value: "not-sure", label: "Not sure / Prefer not to say", desc: "" },
                        ].map((option) => (
                          <Label
                            key={option.value}
                            className="flex items-start gap-3 p-3 rounded-lg border border-input cursor-pointer hover:bg-muted/50 transition-colors"
                          >
                            <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                            <div>
                              <p className="font-medium">{option.label}</p>
                              {option.desc && <p className="text-xs text-muted-foreground">{option.desc}</p>}
                            </div>
                          </Label>
                        ))}
                      </div>
                    </RadioGroup>

                    <div className="p-3 rounded-lg bg-michigan-gold/5 border border-michigan-gold/20">
                      <p className="text-xs text-muted-foreground flex items-start gap-2">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                        Your income information is used only to calculate eligibility and is not stored.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 5: Results */}
            {state.step === 5 && (
              <motion.div key="step5" initial="hidden" animate="visible" exit="hidden" variants={fadeUp} className="space-y-6">
                {plans.length > 0 ? (
                  <>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">Your options</h2>
                      <p className="text-muted-foreground">
                        Based on your answers, here are programs you likely qualify for (sorted by match).
                      </p>
                    </div>

                    <div className="space-y-4">
                      {plans.map((plan, i) => (
                        <motion.div
                          key={plan.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                            <CardHeader>
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                                    {plan.matchScore >= 95 && (
                                      <CheckCircle2 className="h-5 w-5 text-michigan-forest flex-shrink-0" />
                                    )}
                                  </div>
                                  <Badge variant="outline" className="text-xs mb-2">
                                    {plan.type}
                                  </Badge>
                                </div>
                                <Badge className="bg-michigan-teal text-white whitespace-nowrap">
                                  {plan.matchScore}% match
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <p className="text-sm text-muted-foreground">{plan.description}</p>

                              <div className="grid gap-3 sm:grid-cols-3 text-sm">
                                {plan.premium && (
                                  <div>
                                    <p className="font-medium text-foreground text-xs mb-1">Cost</p>
                                    <p className="text-muted-foreground">{plan.premium}</p>
                                  </div>
                                )}
                                {plan.coverage && (
                                  <div>
                                    <p className="font-medium text-foreground text-xs mb-1">Coverage</p>
                                    <p className="text-muted-foreground">{plan.coverage}</p>
                                  </div>
                                )}
                                {plan.eligibility && (
                                  <div>
                                    <p className="font-medium text-foreground text-xs mb-1">Eligibility</p>
                                    <p className="text-muted-foreground">{plan.eligibility}</p>
                                  </div>
                                )}
                              </div>

                              <a href={plan.link} target="_blank" rel="noopener noreferrer">
                                <Button variant="default" className="w-full">
                                  Learn More & Enroll
                                </Button>
                              </a>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">Need help finding coverage?</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Call 211 (free, confidential) to speak with a specialist who can help.
                      </p>
                      <a href="tel:211">
                        <Button>Call 211</Button>
                      </a>
                    </CardContent>
                  </Card>
                )}

                <div className="text-xs text-muted-foreground space-y-1 p-3 rounded-lg bg-muted/50">
                  <p>
                    <strong>Disclaimer:</strong> This tool provides general information about insurance programs.
                    Actual eligibility depends on your specific circumstances. Always verify with the program directly.
                  </p>
                  <p>
                    Enrollment links open official government or organization websites where you can apply.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={state.step === 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            {state.step < 5 ? (
              <Button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => setState({
                  step: 1,
                  zipCode: "",
                  ageGroup: "",
                  healthProfile: "",
                  incomeLevel: "",
                })}
              >
                Start Over
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}