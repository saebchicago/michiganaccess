import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Share2,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Question {
  q: string;
  options: string[];
  answer: number;
  fact: string;
  source: string;
}

export const QUESTIONS: Question[] = [
  {
    q: "What share of Michigan households were below the ALICE Threshold in 2024?",
    options: ["22%", "31%", "40%", "55%"],
    answer: 2,
    fact: "40% of Michigan households were below the ALICE Threshold in 2024: 13% in poverty and 26% above the poverty line but unable to afford basics.",
    source: "United For ALICE 2026 Report (2024 data)",
  },
  {
    q: "What was Michigan's statewide infant mortality rate in 2024?",
    options: ["3.2/1K", "4.8/1K", "6.3/1K", "8.4/1K"],
    answer: 2,
    fact: "6.3 per 1,000 live births in 2024.",
    source: "MDHHS Vital Records, Summary of 2024 Infant Death Statistics",
  },
  {
    q: "How many of Michigan's 83 counties contain a designated dental shortage area?",
    options: ["24", "41", "59", "76"],
    answer: 3,
    fact: "76 of 83 counties contain at least one HRSA-designated dental Health Professional Shortage Area. Many designations cover only part of a county or one population group.",
    source: "HRSA HPSA Dental Health detail file (11/02/2026), AccessMI county rollup",
  },
  {
    q: "How many Michigan counties contain a designated primary care shortage area?",
    options: ["31", "47", "62", "79"],
    answer: 3,
    fact: "79 of 83 counties contain at least one HRSA-designated primary care Health Professional Shortage Area.",
    source: "HRSA HPSA Primary Care detail file (11/02/2026), AccessMI county rollup",
  },
  {
    q: "Michigan's prison population is at its lowest level since which year?",
    options: ["1975", "1991", "2003", "2012"],
    answer: 1,
    fact: "32,778 people, down from 51,554 in 2007 and the lowest since 1991.",
    source: "Michigan Department of Corrections, July 2, 2025",
  },
  {
    q: "What was Michigan's three-year recidivism rate in the 2025 MDOC report?",
    options: ["21.0%", "29.5%", "36.0%", "44.2%"],
    answer: 0,
    fact: "21.0%, the lowest rate on state record.",
    source: "Michigan Department of Corrections, July 2, 2025",
  },
  {
    q: "How many PFAS sites had Michigan identified as of July 2026?",
    options: ["90", "180", "350", "720"],
    answer: 2,
    fact: "350 sites, according to the state's PFAS response team.",
    source: "EGLE / MPART, Aug 12, 2026",
  },
  {
    q: "Rx Kids began in Flint in 2024. How many Michigan counties now have a participating community?",
    options: ["3", "11", "28", "61"],
    answer: 2,
    fact: "Communities in 28 of 83 counties, some covering the whole county and some only certain cities or townships.",
    source: "Rx Kids coverage compiled by AccessMI from local announcements, mid-2026",
  },
  {
    q: "What was Michigan's seat belt use rate in 2025?",
    options: ["78.4%", "85.1%", "93.2%", "98.7%"],
    answer: 2,
    fact: "93.2%, the highest since 2019.",
    source: "Michigan State Police, Feb 10, 2026",
  },
  {
    q: "What share of Michigan residents lived below the poverty line in 2024, by the Census Bureau's SAIPE estimate?",
    options: ["7.9%", "13.4%", "18.8%", "24.1%"],
    answer: 1,
    fact: "13.4% statewide. SAIPE is a model-based estimate.",
    source: "U.S. Census Bureau SAIPE, 2024 estimates (MODELED)",
  },
];

export default function MichiganQuiz() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [done, setDone] = useState(false);

  const q = QUESTIONS[current];

  const handleSelect = (idx: number) => {
    if (showAnswer) return;
    setSelected(idx);
    setShowAnswer(true);
    if (idx === q.answer) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (current < QUESTIONS.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowAnswer(false);
    } else {
      setDone(true);
    }
  };

  const handleShare = () => {
    const text = `I scored ${score}/${QUESTIONS.length} on the Michigan Data Quiz! How well do you know Michigan? accessmi.org/quiz`;
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Score copied - share it!"));
  };

  const reset = () => {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setShowAnswer(false);
    setDone(false);
  };

  if (done) {
    const grade =
      score >= 8
        ? "Michigan Expert!"
        : score >= 6
          ? "Well Informed"
          : score >= 4
            ? "Getting There"
            : "Keep Learning";
    return (
      <Card className="text-center">
        <CardContent className="py-8 space-y-4">
          <p className="text-4xl font-bold text-primary">{score}/{QUESTIONS.length}</p>
          <Badge className="text-sm">{grade}</Badge>
          <p className="text-sm text-muted-foreground">
            You answered {score} of 10 questions correctly.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleShare} className="gap-1">
              <Share2 className="h-3 w-3" /> Share Score
            </Button>
            <Button variant="outline" onClick={reset} className="gap-1">
              <RotateCcw className="h-3 w-3" /> Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-primary" /> Question{" "}
            {current + 1}/{QUESTIONS.length}
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            Score: {score}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm font-medium text-foreground">{q.q}</p>
        <div className="grid gap-2">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={showAnswer}
              className={`text-left rounded-lg border p-3 text-sm transition-colors ${
                showAnswer && i === q.answer
                  ? "border-michigan-forest bg-michigan-forest/10 text-michigan-forest-deep font-semibold"
                  : showAnswer && i === selected && i !== q.answer
                    ? "border-michigan-coral bg-michigan-coral/10 text-michigan-coral-deep"
                    : selected === i
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2">
                {showAnswer && i === q.answer && (
                  <CheckCircle2 className="h-4 w-4 text-michigan-forest-deep" />
                )}
                {showAnswer && i === selected && i !== q.answer && (
                  <XCircle className="h-4 w-4 text-michigan-coral-deep" />
                )}
                {opt}
              </div>
            </button>
          ))}
        </div>
        <AnimatePresence>
          {showAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-primary/20 bg-primary/5 p-3"
            >
              <p className="text-xs text-foreground">{q.fact}</p>
              <p className="text-[9px] text-muted-foreground mt-1">
                Source: {q.source}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        {showAnswer && (
          <Button onClick={handleNext} className="w-full">
            {current < QUESTIONS.length - 1 ? "Next Question" : "See Results"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
