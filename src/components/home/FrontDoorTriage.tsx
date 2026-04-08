import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Apple, Home, Zap, DollarSign, Phone,
  MapPin, Users, ArrowRight, ArrowLeft, X, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const MICHIGAN_COUNTIES = [
  "Alcona","Alger","Allegan","Alpena","Antrim","Arenac","Baraga","Barry","Bay","Benzie",
  "Berrien","Branch","Calhoun","Cass","Charlevoix","Cheboygan","Chippewa","Clare","Clinton",
  "Crawford","Delta","Dickinson","Eaton","Emmet","Genesee","Gladwin","Gogebic","Grand Traverse",
  "Gratiot","Hillsdale","Houghton","Huron","Ingham","Ionia","Iosco","Iron","Isabella","Jackson",
  "Kalamazoo","Kalkaska","Kent","Keweenaw","Lake","Lapeer","Leelanau","Lenawee","Livingston",
  "Luce","Mackinac","Macomb","Manistee","Marquette","Mason","Mecosta","Menominee","Midland",
  "Missaukee","Monroe","Montcalm","Montmorency","Muskegon","Newaygo","Oakland","Oceana",
  "Ogemaw","Ontonagon","Osceola","Oscoda","Otsego","Ottawa","Presque Isle","Roscommon",
  "Saginaw","Sanilac","Schoolcraft","Shiawassee","St. Clair","St. Joseph","Tuscola",
  "Van Buren","Washtenaw","Wayne","Wexford",
];

const NEEDS = [
  { key: "healthcare", label: "Healthcare", icon: Heart, sub: "Find care, insurance, prescriptions", color: "text-red-500", route: "/find-care" },
  { key: "food", label: "Food", icon: Apple, sub: "SNAP, food pantries, WIC", color: "text-green-600", route: "/financial-help" },
  { key: "housing", label: "Housing", icon: Home, sub: "Rent help, shelter, housing programs", color: "text-blue-600", route: "/housing-options" },
  { key: "energy", label: "Energy Help", icon: Zap, sub: "LIHEAP, utility assistance, weatherization", color: "text-amber-500", route: "/environment/energy" },
  { key: "money", label: "Money / Benefits", icon: DollarSign, sub: "Unclaimed benefits, tax credits, SSI", color: "text-teal-600", route: "/financial-help" },
  { key: "crisis", label: "Crisis / Emergency", icon: Phone, sub: "988 Lifeline, 211, shelters", color: "text-red-600", route: "/resources" },
];

interface FrontDoorTriageProps {
  onClose: () => void;
}

export default function FrontDoorTriage({ onClose }: FrontDoorTriageProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [need, setNeed] = useState("");
  const [county, setCounty] = useState("");
  const [zip, setZip] = useState("");
  const [insured, setInsured] = useState<boolean | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);


  const handleFinish = () => {
    const selectedNeed = NEEDS.find(n => n.key === need);
    if (selectedNeed) {
      const params = new URLSearchParams();
      if (county) params.set("county", county);
      if (zip) params.set("zip", zip);
      navigate(`${selectedNeed.route}?${params.toString()}`);
    }
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm overflow-y-auto">
      <div className="container max-w-lg py-8 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold text-foreground">Get Help Now</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Close">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: What do you need? */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-bold text-foreground mb-2">What do you need right now?</h2>
              <p className="text-sm text-muted-foreground mb-6">Select the type of help you're looking for.</p>
              <div className="grid grid-cols-2 gap-3">
                {NEEDS.map(n => (
                  <button key={n.key} onClick={() => { setNeed(n.key); setStep(2); }}
                    className={`rounded-xl border-2 p-4 text-left transition-all hover:shadow-md ${need === n.key ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                    <n.icon className={`h-6 w-6 ${n.color} mb-2`} />
                    <p className="text-sm font-bold text-foreground">{n.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{n.sub}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Where in Michigan? */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-bold text-foreground mb-2">Where in Michigan?</h2>
              <p className="text-sm text-muted-foreground mb-6">We'll find resources near you.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">County</label>
                  <Select value={county} onValueChange={setCounty}>
                    <SelectTrigger><SelectValue placeholder="Select your county" /></SelectTrigger>
                    <SelectContent>
                      {MICHIGAN_COUNTIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Or enter ZIP code</label>
                  <Input value={zip} onChange={e => setZip(e.target.value)} placeholder="48201" maxLength={5} />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back</Button>
                <Button onClick={() => setStep(3)} disabled={!county && !zip} className="flex-1">Next <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Your situation + results */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-bold text-foreground mb-2">Your situation</h2>
              <p className="text-sm text-muted-foreground mb-6">This helps us estimate which programs you may qualify for.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Insurance status</label>
                  <div className="flex gap-2">
                    <button onClick={() => setInsured(true)} className={`flex-1 rounded-lg border-2 py-2.5 text-sm font-medium transition-all ${insured === true ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>Insured</button>
                    <button onClick={() => setInsured(false)} className={`flex-1 rounded-lg border-2 py-2.5 text-sm font-medium transition-all ${insured === false ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>Uninsured</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1.5 block">Adults</label>
                    <Select value={String(adults)} onValueChange={v => setAdults(Number(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{[1,2,3,4].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1.5 block">Children</label>
                    <Select value={String(children)} onValueChange={v => setChildren(Number(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{[0,1,2,3,4].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Benefit prompt */}
              {(county || zip) && need && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-6 rounded-xl border border-primary/20 bg-primary/[0.03] p-4">
                  <p className="text-sm font-medium text-foreground">Find financial help that fits your situation.</p>
                  <p className="text-xs text-muted-foreground mt-1">Based on {county || `ZIP ${zip}`} — see programs you may qualify for below.</p>
                </motion.div>
              )}

              <div className="flex gap-3 mt-8">
                <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back</Button>
                <Button onClick={handleFinish} className="flex-1">Find Resources <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Crisis footer - always visible */}
        <div className="mt-auto pt-8 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            In crisis? Call <a href="tel:988" className="font-bold text-foreground hover:underline">988</a> (Suicide & Crisis) or <a href="tel:211" className="font-bold text-foreground hover:underline">211</a> (All services)
          </p>
        </div>
      </div>
    </motion.div>
  );
}
