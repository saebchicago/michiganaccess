import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, CheckCircle2, XCircle, Share2, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Question { q: string; options: string[]; answer: number; fact: string; source: string; }

const QUESTIONS: Question[] = [
  { q: "How many Michigan cities have their own income tax?", options: ["8", "14", "24", "36"], answer: 2, fact: "24 Michigan cities levy their own income tax. Detroit's is the highest at 2.4%.", source: "MI Treasury" },
  { q: "What percentage of Michigan households are below the ALICE threshold?", options: ["22%", "31%", "41%", "55%"], answer: 2, fact: "41% of Michigan households earn too much for safety nets but can't afford basics.", source: "United For ALICE 2023" },
  { q: "Which Michigan city has the most expensive auto insurance?", options: ["Detroit", "Flint", "Hamtramck", "Pontiac"], answer: 2, fact: "Hamtramck averages $773/month - the highest in Michigan.", source: "Quadrant Information Services 2025" },
  { q: "How many Michigan counties have zero pedestrian infrastructure data?", options: ["12", "38", "54", "76"], answer: 3, fact: "76 of 83 counties have no publicly available sidewalk data.", source: "SEMCOG / GATIS" },
  { q: "What is Michigan's statewide infant mortality rate?", options: ["3.2/1K", "4.8/1K", "6.1/1K", "8.4/1K"], answer: 2, fact: "6.1 per 1,000 live births (2023). Black IMR is 2-3× the white rate.", source: "MDHHS / March of Dimes" },
  { q: "How many 'Do Not Eat' water bodies does Michigan have for PFAS?", options: ["28", "55", "102", "184"], answer: 2, fact: "102 water bodies - Michigan has the nation's most aggressive PFAS monitoring.", source: "EGLE MPART / MDHHS" },
  { q: "What is Michigan's flat state income tax rate?", options: ["3.25%", "4.25%", "5.0%", "5.75%"], answer: 1, fact: "Michigan has a flat 4.25% state income tax - one of the simpler systems in the US.", source: "MI Treasury" },
  { q: "How many people experienced homelessness in Michigan in 2024?", options: ["8,400", "18,200", "31,211", "52,500"], answer: 2, fact: "31,211 Michiganders experienced homelessness. Black households are 3.6× more likely.", source: "HUD PIT Count 2024" },
  { q: "What percentage of Michigan counties have dental health professional shortages?", options: ["28%", "45%", "59/83 (71%)", "78/83 (94%)"], answer: 2, fact: "59 of 83 counties have dental HPSAs. 12 counties have fewer than 5 dentists.", source: "MDHHS / HRSA" },
  { q: "Michigan's BEAD broadband allocation is the 4th highest in the US. How much?", options: ["$450M", "$892M", "$1.559B", "$2.3B"], answer: 2, fact: "$1.559 billion to connect 492,000 unserved/underserved households.", source: "NTIA / MIHI" },
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
    const text = `I scored ${score}/10 on the Michigan Data Quiz! How well do you know Michigan? accessmi.org/quiz`;
    navigator.clipboard.writeText(text).then(() => toast.success("Score copied - share it!"));
  };

  const reset = () => { setCurrent(0); setScore(0); setSelected(null); setShowAnswer(false); setDone(false); };

  if (done) {
    const grade = score >= 8 ? "Michigan Expert!" : score >= 6 ? "Well Informed" : score >= 4 ? "Getting There" : "Keep Learning";
    return (
      <Card className="text-center">
        <CardContent className="py-8 space-y-4">
          <p className="text-4xl font-bold text-primary">{score}/10</p>
          <Badge className="text-sm">{grade}</Badge>
          <p className="text-sm text-muted-foreground">You answered {score} of 10 questions correctly.</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleShare} className="gap-1"><Share2 className="h-3 w-3" /> Share Score</Button>
            <Button variant="outline" onClick={reset} className="gap-1"><RotateCcw className="h-3 w-3" /> Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2"><HelpCircle className="h-4 w-4 text-primary" /> Question {current + 1}/10</CardTitle>
          <Badge variant="outline" className="text-[10px]">Score: {score}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm font-medium text-foreground">{q.q}</p>
        <div className="grid gap-2">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => handleSelect(i)} disabled={showAnswer}
              className={`text-left rounded-lg border p-3 text-sm transition-colors ${
                showAnswer && i === q.answer ? "border-michigan-forest bg-michigan-forest/10 text-michigan-forest font-semibold" :
                showAnswer && i === selected && i !== q.answer ? "border-michigan-coral bg-michigan-coral/10 text-michigan-coral" :
                selected === i ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
              }`}>
              <div className="flex items-center gap-2">
                {showAnswer && i === q.answer && <CheckCircle2 className="h-4 w-4 text-michigan-forest" />}
                {showAnswer && i === selected && i !== q.answer && <XCircle className="h-4 w-4 text-michigan-coral" />}
                {opt}
              </div>
            </button>
          ))}
        </div>
        <AnimatePresence>
          {showAnswer && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-xs text-foreground">{q.fact}</p>
              <p className="text-[9px] text-muted-foreground mt-1">Source: {q.source}</p>
            </motion.div>
          )}
        </AnimatePresence>
        {showAnswer && <Button onClick={handleNext} className="w-full">{current < QUESTIONS.length - 1 ? "Next Question" : "See Results"}</Button>}
      </CardContent>
    </Card>
  );
}
