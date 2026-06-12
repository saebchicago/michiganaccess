import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  HeartPulse,
  Zap,
  Home,
  Apple,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Users,
  DollarSign,
  MapPin,
  Share2,
  Save,
  Phone,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  useCounty,
  MICHIGAN_COUNTIES,
  type MichiganCounty,
} from "@/contexts/CountyContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ─── Program data ─── */
interface Program {
  name: string;
  description: string;
  eligibility: string;
  link: string;
  category: "health" | "food" | "energy" | "housing" | "family";
  situations: string[];
  urgency: number; // 1-5, higher = more urgent
}

const PROGRAMS: Program[] = [
  {
    name: "Healthy Michigan Plan (Medicaid)",
    description: "Free or low-cost health coverage for adults 19–64.",
    eligibility: "138",
    link: "/find-care",
    category: "health",
    situations: ["healthcare", "bills"],
    urgency: 5,
  },
  {
    name: "MIChild",
    description: "Health coverage for uninsured children under 19.",
    eligibility: "212",
    link: "/find-care",
    category: "health",
    situations: ["healthcare"],
    urgency: 5,
  },
  {
    name: "Insurance Appeal Support",
    description: "Tools to fight health insurance denials.",
    eligibility: "all",
    link: "/health/insurance-appeals",
    category: "health",
    situations: ["healthcare", "bills"],
    urgency: 4,
  },
  {
    name: "SNAP (Bridge Card)",
    description: "Monthly food assistance on a Bridge Card for groceries.",
    eligibility: "130",
    link: "/financial-help",
    category: "food",
    situations: ["food", "bills"],
    urgency: 5,
  },
  {
    name: "WIC",
    description:
      "Nutrition for pregnant women, new mothers, and children under 5.",
    eligibility: "185",
    link: "/financial-help",
    category: "food",
    situations: ["food"],
    urgency: 4,
  },
  {
    name: "LIHEAP (Heating Assistance)",
    description: "Help paying home heating bills during cold months.",
    eligibility: "150",
    link: "/financial-help",
    category: "energy",
    situations: ["energy", "bills"],
    urgency: 5,
  },
  {
    name: "Consumers Energy - Helping Neighbors",
    description: "Free home energy upgrades for income-qualified customers.",
    eligibility: "200",
    link: "/environment",
    category: "energy",
    situations: ["energy"],
    urgency: 3,
  },
  {
    name: "MiHER HOMES Rebate",
    description: "Up to $8,000 for whole-home energy efficiency improvements.",
    eligibility: "150",
    link: "/environment",
    category: "energy",
    situations: ["energy"],
    urgency: 3,
  },
  {
    name: "MiHER HEAR Rebate",
    description: "Point-of-sale rebates up to $14,000 for heat pumps.",
    eligibility: "150",
    link: "/environment",
    category: "energy",
    situations: ["energy"],
    urgency: 3,
  },
  {
    name: "MSHDA Housing Assistance",
    description:
      "Rental assistance, homebuyer programs, and foreclosure prevention.",
    eligibility: "200",
    link: "/resources",
    category: "housing",
    situations: ["housing", "bills"],
    urgency: 5,
  },
  {
    name: "GSRP (Great Start Readiness)",
    description: "Free preschool for 4-year-olds.",
    eligibility: "250",
    link: "/resources",
    category: "family",
    situations: ["other"],
    urgency: 3,
  },
  {
    name: "Michigan Saves Green Loans",
    description: "Low-interest financing for solar, HVAC, and insulation.",
    eligibility: "all",
    link: "/environment",
    category: "energy",
    situations: ["energy"],
    urgency: 2,
  },
  {
    name: "MIHI Broadband Subsidy",
    description: "Affordable high-speed internet.",
    eligibility: "200",
    link: "/environment",
    category: "energy",
    situations: ["bills", "other"],
    urgency: 2,
  },
];

const FPL_BASE = 15060;
const FPL_PER = 5380;
const getFPL = (size: number) => FPL_BASE + FPL_PER * (size - 1);

// Situation IDs - labels resolved via i18n at render time
const SITUATION_IDS = [
  {
    id: "healthcare",
    icon: HeartPulse,
    color: "border-emerald-500/40 bg-emerald-500/10",
  },
  {
    id: "bills",
    icon: DollarSign,
    color: "border-amber-500/40 bg-amber-500/10",
  },
  { id: "housing", icon: Home, color: "border-blue-500/40 bg-blue-500/10" },
  { id: "food", icon: Apple, color: "border-orange-500/40 bg-orange-500/10" },
  { id: "energy", icon: Zap, color: "border-yellow-500/40 bg-yellow-500/10" },
  {
    id: "other",
    icon: HelpCircle,
    color: "border-slate-500/40 bg-slate-500/10",
  },
];

const categoryColors: Record<string, string> = {
  health: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  food: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  energy: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  housing: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  family: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
};

const step_anim = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.25 },
};

interface DiscoveryWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DiscoveryWizard({
  open,
  onOpenChange,
}: DiscoveryWizardProps) {
  const { t } = useTranslation();
  const { county, setCounty, eligibility, setEligibility } = useCounty();

  const [step, setStep] = useState(1);
  const [situation, setSituation] = useState<string | null>(null);
  const [hhSize, setHhSize] = useState(eligibility.householdSize ?? 1);
  const [income, setIncome] = useState(eligibility.annualIncome ?? 30000);
  const [selectedCounty, setSelectedCounty] = useState<string>(
    county ?? "Oakland",
  );
  const [saved, setSaved] = useState(false);

  const fplPct = useMemo(
    () => Math.round((income / getFPL(hhSize)) * 100),
    [income, hhSize],
  );

  const results = useMemo(() => {
    if (!situation) return [];
    return PROGRAMS.filter((p) => {
      if (!p.situations.includes(situation) && situation !== "other")
        return false;
      if (p.eligibility === "all") return true;
      return fplPct <= parseInt(p.eligibility);
    }).sort((a, b) => b.urgency - a.urgency);
  }, [situation, fplPct]);

  const reset = () => {
    setStep(1);
    setSituation(null);
    setHhSize(eligibility.householdSize ?? 1);
    setIncome(eligibility.annualIncome ?? 30000);
    setSelectedCounty(county ?? "Oakland");
    setSaved(false);
  };

  const goNext = () => {
    if (step === 2) {
      setEligibility({ householdSize: hhSize, annualIncome: income });
    }
    if (step === 3) {
      if (selectedCounty) setCounty(selectedCounty as MichiganCounty);
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleSave = () => {
    try {
      localStorage.setItem(
        "mi-wizard-results",
        JSON.stringify({
          situation,
          hhSize,
          income,
          county: selectedCounty,
          results: results.map((r) => r.name),
          savedAt: new Date().toISOString(),
        }),
      );
      setSaved(true);
    } catch {
      toast.error("Could not save results - your browser storage may be full.");
    }
  };

  const handleShare = async () => {
    // Only include non-sensitive fields (situation + county) in the share URL - no income or household size
    const params = new URLSearchParams({
      s: situation ?? "",
      c: selectedCounty,
    });
    const url = `${window.location.origin}/?wizard=${params.toString()}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error(
        "Could not copy link - please copy the URL from your browser's address bar.",
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" /> {t("wizard.title")}
          </DialogTitle>
          <DialogDescription>
            {step < 4
              ? t("wizard.intro")
              : t("wizard.foundPrograms", { count: results.length })}
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("wizard.stepOf", { step })}</span>
            <span>{t("wizard.seconds")}</span>
          </div>
          <Progress value={(step / 4) * 100} className="h-1.5" />
        </div>

        <AnimatePresence mode="wait">
          {/* ─── Step 1: Situation ─── */}
          {step === 1 && (
            <motion.div key="s1" {...step_anim} className="space-y-3 py-2">
              <p className="text-sm font-medium">{t("wizard.step1Title")}</p>
              <div className="grid grid-cols-2 gap-2">
                {SITUATION_IDS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSituation(s.id)}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-all ${
                      situation === s.id
                        ? `${s.color} border-2 ring-1 ring-primary/30`
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <s.icon className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-medium">
                      {t(`wizard.sit_${s.id}`)}
                    </span>
                  </button>
                ))}
              </div>
              <Button onClick={goNext} disabled={!situation} className="w-full">
                {t("wizard.next")} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* ─── Step 2: Household ─── */}
          {step === 2 && (
            <motion.div key="s2" {...step_anim} className="space-y-5 py-2">
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" /> {t("wizard.step2HhSize")}
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setHhSize(Math.max(1, hhSize - 1))}
                    aria-label="Decrease household size"
                  >
                    −
                  </Button>
                  <span className="text-2xl font-bold w-8 text-center">
                    {hhSize}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setHhSize(Math.min(10, hhSize + 1))}
                    aria-label="Increase household size"
                  >
                    +
                  </Button>
                  {hhSize >= 8 && (
                    <Badge variant="outline" className="text-[10px]">
                      8+
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> {t("wizard.step2Income")}
                </label>
                <Slider
                  value={[income]}
                  onValueChange={([v]) => setIncome(v)}
                  min={0}
                  max={120000}
                  step={1000}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>${income.toLocaleString()}/yr</span>
                  <Badge variant="outline" className="text-[10px]">
                    {fplPct}% FPL
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> {t("wizard.back")}
                </Button>
                <Button onClick={goNext} className="flex-1">
                  {t("wizard.next")} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ─── Step 3: County ─── */}
          {step === 3 && (
            <motion.div key="s3" {...step_anim} className="space-y-4 py-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {t("wizard.step3County")}
              </label>
              <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                <SelectTrigger>
                  <SelectValue placeholder={t("county.searchPlaceholder")} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {MICHIGAN_COUNTIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t("wizard.step3Note")}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> {t("wizard.back")}
                </Button>
                <Button onClick={goNext} className="flex-1">
                  {t("wizard.seePrograms")}{" "}
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ─── Step 4: Results ─── */}
          {step === 4 && (
            <motion.div key="s4" {...step_anim} className="space-y-4 py-2">
              {results.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {t("wizard.qualifyText", { count: results.length })}
                  </p>
                  <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1">
                    {results.map((p, i) => (
                      <motion.div
                        key={p.name}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                      >
                        <Card className="border-border/60">
                          <CardContent className="p-3.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold">
                                  {p.name}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {p.description}
                                </p>
                              </div>
                              <Badge
                                className={`shrink-0 text-[10px] ${categoryColors[p.category]}`}
                              >
                                {p.category}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between mt-2.5">
                              <span className="text-[11px] text-muted-foreground">
                                {p.eligibility === "all"
                                  ? t("wizard.allResidents")
                                  : t("wizard.fplLabel", {
                                      pct: p.eligibility,
                                    })}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-primary"
                                asChild
                              >
                                <Link to={p.link}>
                                  {t("wizard.applyNow")}{" "}
                                  <ArrowRight className="ml-1 h-3 w-3" />
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground/40" />
                  <h3 className="text-base font-semibold">
                    {t("wizard.emptyTitle")}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    {t("wizard.emptyBody")}
                  </p>
                  <a
                    href="tel:211"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                  >
                    <Phone className="h-4 w-4" /> {t("wizard.call211")}
                  </a>
                </div>
              )}

              <p className="text-[11px] text-muted-foreground text-center">
                {t("wizard.disclaimer")}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(3)}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> {t("wizard.back")}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={saved || results.length === 0}
                  className="flex-1"
                >
                  <Save className="mr-2 h-4 w-4" />{" "}
                  {saved ? t("wizard.saved") : t("wizard.saveResults")}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                  title={t("wizard.shareLink")}
                  aria-label={t("wizard.shareLink")}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="ghost"
                onClick={reset}
                className="w-full text-xs"
              >
                {t("wizard.startOver")}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
