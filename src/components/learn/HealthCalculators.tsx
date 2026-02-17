import { useState } from "react";
import {
  Heart, Activity, Scale, HeartPulse, Shield
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

export default function HealthCalculators() {
  // BMI state
  const [bmiHeight, setBmiHeight] = useState(67);
  const [bmiWeight, setBmiWeight] = useState(150);

  // Blood pressure state
  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);

  // Heart disease risk state
  const [hdAge, setHdAge] = useState(50);
  const [hdCholesterol, setHdCholesterol] = useState(200);
  const [hdHdl, setHdHdl] = useState(50);
  const [hdSmoker, setHdSmoker] = useState(false);
  const [hdDiabetic, setHdDiabetic] = useState(false);
  const [hdSystolic, setHdSystolic] = useState(130);

  // Diabetes risk state
  const [dbAge, setDbAge] = useState(45);
  const [dbBmi, setDbBmi] = useState(27);
  const [dbWaist, setDbWaist] = useState(36);
  const [dbFamilyHistory, setDbFamilyHistory] = useState(false);
  const [dbInactive, setDbInactive] = useState(false);
  const [dbHighBP, setDbHighBP] = useState(false);

  // Waist-to-hip ratio state
  const [whrWaist, setWhrWaist] = useState(32);
  const [whrHip, setWhrHip] = useState(38);
  const [whrGender, setWhrGender] = useState<"male" | "female">("female");

  // Target heart rate state
  const [thrAge, setThrAge] = useState(35);
  const [thrResting, setThrResting] = useState(72);

  // BMI calculations
  const bmi = ((bmiWeight / (bmiHeight * bmiHeight)) * 703).toFixed(1);
  const bmiCategory = parseFloat(bmi) < 18.5 ? "Underweight" : parseFloat(bmi) < 25 ? "Normal" : parseFloat(bmi) < 30 ? "Overweight" : "Obese";
  const bmiColor = parseFloat(bmi) < 18.5 ? "text-michigan-gold" : parseFloat(bmi) < 25 ? "text-michigan-forest" : parseFloat(bmi) < 30 ? "text-michigan-gold" : "text-michigan-coral";

  // Blood pressure calculations
  const bpCategory = systolic < 120 && diastolic < 80 ? "Normal" : systolic < 130 && diastolic < 80 ? "Elevated" : systolic < 140 || diastolic < 90 ? "High (Stage 1)" : "High (Stage 2)";
  const bpColor = bpCategory === "Normal" ? "text-michigan-forest" : bpCategory === "Elevated" ? "text-michigan-gold" : "text-michigan-coral";

  // Heart disease risk (Framingham-inspired)
  const hdRiskScore = (() => {
    let score = 0;
    if (hdAge >= 40) score += (hdAge - 40) * 0.5;
    if (hdCholesterol > 200) score += (hdCholesterol - 200) * 0.05;
    if (hdHdl < 40) score += 8; else if (hdHdl < 50) score += 4;
    if (hdSmoker) score += 8;
    if (hdDiabetic) score += 6;
    if (hdSystolic > 130) score += (hdSystolic - 130) * 0.15;
    return Math.min(Math.max(Math.round(score), 1), 50);
  })();
  const hdRiskLabel = hdRiskScore < 10 ? "Low" : hdRiskScore < 20 ? "Moderate" : "High";
  const hdRiskColor = hdRiskScore < 10 ? "text-michigan-forest" : hdRiskScore < 20 ? "text-michigan-gold" : "text-michigan-coral";

  // Diabetes risk (ADA-inspired)
  const dbRiskScore = (() => {
    let score = 0;
    if (dbAge >= 40 && dbAge < 50) score += 1; else if (dbAge >= 50 && dbAge < 60) score += 2; else if (dbAge >= 60) score += 3;
    if (dbBmi >= 25 && dbBmi < 30) score += 1; else if (dbBmi >= 30 && dbBmi < 40) score += 2; else if (dbBmi >= 40) score += 3;
    if (dbWaist > 40) score += 2; else if (dbWaist > 35) score += 1;
    if (dbFamilyHistory) score += 2;
    if (dbInactive) score += 1;
    if (dbHighBP) score += 1;
    return score;
  })();
  const dbRiskLabel = dbRiskScore <= 3 ? "Low" : dbRiskScore <= 6 ? "Moderate" : "High";
  const dbRiskColor = dbRiskScore <= 3 ? "text-michigan-forest" : dbRiskScore <= 6 ? "text-michigan-gold" : "text-michigan-coral";

  // Waist-to-hip ratio
  const whrRatio = (whrWaist / whrHip).toFixed(2);
  const whrRisk = whrGender === "male"
    ? (parseFloat(whrRatio) < 0.90 ? "Low" : parseFloat(whrRatio) < 1.0 ? "Moderate" : "High")
    : (parseFloat(whrRatio) < 0.80 ? "Low" : parseFloat(whrRatio) < 0.85 ? "Moderate" : "High");
  const whrColor = whrRisk === "Low" ? "text-michigan-forest" : whrRisk === "Moderate" ? "text-michigan-gold" : "text-michigan-coral";

  // Target heart rate (Karvonen)
  const thrMax = 220 - thrAge;
  const thrReserve = thrMax - thrResting;
  const thrModLow = Math.round(thrReserve * 0.5 + thrResting);
  const thrModHigh = Math.round(thrReserve * 0.7 + thrResting);
  const thrVigLow = Math.round(thrReserve * 0.7 + thrResting);
  const thrVigHigh = Math.round(thrReserve * 0.85 + thrResting);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Simple health tools to help you understand your numbers. <strong>These are not diagnostic tools</strong> — discuss results with your healthcare provider.</p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* BMI Calculator */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="h-5 w-5 text-michigan-teal" />
              <h3 className="text-lg font-bold text-foreground">BMI Calculator</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Height: {Math.floor(bmiHeight / 12)}'{bmiHeight % 12}"</label>
                <Slider value={[bmiHeight]} onValueChange={v => setBmiHeight(v[0])} min={48} max={84} step={1} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Weight: {bmiWeight} lbs</label>
                <Slider value={[bmiWeight]} onValueChange={v => setBmiWeight(v[0])} min={80} max={400} step={1} />
              </div>
              <Separator />
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{bmi}</p>
                <p className={`text-sm font-semibold ${bmiColor}`}>{bmiCategory}</p>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                <span>Underweight<br/>&lt;18.5</span>
                <span className="text-michigan-forest">Normal<br/>18.5–24.9</span>
                <span>Overweight<br/>25–29.9</span>
                <span>Obese<br/>30+</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blood Pressure Checker */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-2 mb-4">
              <HeartPulse className="h-5 w-5 text-michigan-coral" />
              <h3 className="text-lg font-bold text-foreground">Blood Pressure Check</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Systolic (top number): {systolic} mmHg</label>
                <Slider value={[systolic]} onValueChange={v => setSystolic(v[0])} min={80} max={200} step={1} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Diastolic (bottom number): {diastolic} mmHg</label>
                <Slider value={[diastolic]} onValueChange={v => setDiastolic(v[0])} min={40} max={130} step={1} />
              </div>
              <Separator />
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{systolic}/{diastolic}</p>
                <p className={`text-sm font-semibold ${bpColor}`}>{bpCategory}</p>
              </div>
              <div className="text-xs text-muted-foreground space-y-1 bg-muted/40 rounded-lg p-3">
                <p><strong className="text-michigan-forest">Normal:</strong> Below 120/80</p>
                <p><strong className="text-michigan-gold">Elevated:</strong> 120-129 / below 80</p>
                <p><strong className="text-michigan-coral">High Stage 1:</strong> 130-139 / 80-89</p>
                <p><strong className="text-michigan-coral">High Stage 2:</strong> 140+ / 90+</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Heart Disease Risk */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-michigan-coral" />
              <h3 className="text-lg font-bold text-foreground">Heart Disease Risk</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Simplified 10-year cardiovascular risk estimate based on Framingham-style factors.</p>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Age: {hdAge}</label>
                <Slider value={[hdAge]} onValueChange={v => setHdAge(v[0])} min={20} max={80} step={1} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Total Cholesterol: {hdCholesterol} mg/dL</label>
                <Slider value={[hdCholesterol]} onValueChange={v => setHdCholesterol(v[0])} min={100} max={350} step={5} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">HDL ("Good") Cholesterol: {hdHdl} mg/dL</label>
                <Slider value={[hdHdl]} onValueChange={v => setHdHdl(v[0])} min={20} max={100} step={1} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Systolic BP: {hdSystolic} mmHg</label>
                <Slider value={[hdSystolic]} onValueChange={v => setHdSystolic(v[0])} min={90} max={200} step={1} />
              </div>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" checked={hdSmoker} onChange={e => setHdSmoker(e.target.checked)} className="rounded border-border" />
                  Current smoker
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" checked={hdDiabetic} onChange={e => setHdDiabetic(e.target.checked)} className="rounded border-border" />
                  Diabetic
                </label>
              </div>
              <Separator />
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{hdRiskScore}%</p>
                <p className={`text-sm font-semibold ${hdRiskColor}`}>10-Year Risk: {hdRiskLabel}</p>
              </div>
              <div className="text-xs text-muted-foreground space-y-1 bg-muted/40 rounded-lg p-3">
                <p><strong className="text-michigan-forest">Low:</strong> Below 10%</p>
                <p><strong className="text-michigan-gold">Moderate:</strong> 10–19%</p>
                <p><strong className="text-michigan-coral">High:</strong> 20% or more</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diabetes Risk */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-michigan-gold" />
              <h3 className="text-lg font-bold text-foreground">Diabetes Risk Assessment</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Based on ADA risk factors for Type 2 diabetes. Higher scores suggest increased risk.</p>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Age: {dbAge}</label>
                <Slider value={[dbAge]} onValueChange={v => setDbAge(v[0])} min={18} max={85} step={1} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">BMI: {dbBmi}</label>
                <Slider value={[dbBmi]} onValueChange={v => setDbBmi(v[0])} min={15} max={50} step={1} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Waist Circumference: {dbWaist} inches</label>
                <Slider value={[dbWaist]} onValueChange={v => setDbWaist(v[0])} min={24} max={60} step={1} />
              </div>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" checked={dbFamilyHistory} onChange={e => setDbFamilyHistory(e.target.checked)} className="rounded border-border" />
                  Family history
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" checked={dbInactive} onChange={e => setDbInactive(e.target.checked)} className="rounded border-border" />
                  Physically inactive
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" checked={dbHighBP} onChange={e => setDbHighBP(e.target.checked)} className="rounded border-border" />
                  High blood pressure
                </label>
              </div>
              <Separator />
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{dbRiskScore}</p>
                <p className={`text-sm font-semibold ${dbRiskColor}`}>Risk Level: {dbRiskLabel}</p>
              </div>
              <div className="text-xs text-muted-foreground space-y-1 bg-muted/40 rounded-lg p-3">
                <p><strong className="text-michigan-forest">Low (0–3):</strong> Maintain healthy habits</p>
                <p><strong className="text-michigan-gold">Moderate (4–6):</strong> Talk to your doctor about screening</p>
                <p><strong className="text-michigan-coral">High (7+):</strong> Get tested — schedule an A1C test</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Waist-to-Hip Ratio */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="h-5 w-5 text-michigan-forest" />
              <h3 className="text-lg font-bold text-foreground">Waist-to-Hip Ratio</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">A key indicator of cardiovascular and metabolic risk. Measures fat distribution around your midsection.</p>
            <div className="space-y-3">
              <div className="flex gap-3">
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="radio" name="whrGender" checked={whrGender === "female"} onChange={() => setWhrGender("female")} /> Female
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="radio" name="whrGender" checked={whrGender === "male"} onChange={() => setWhrGender("male")} /> Male
                </label>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Waist: {whrWaist} inches</label>
                <Slider value={[whrWaist]} onValueChange={v => setWhrWaist(v[0])} min={20} max={60} step={0.5} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Hip: {whrHip} inches</label>
                <Slider value={[whrHip]} onValueChange={v => setWhrHip(v[0])} min={28} max={65} step={0.5} />
              </div>
              <Separator />
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{whrRatio}</p>
                <p className={`text-sm font-semibold ${whrColor}`}>Risk: {whrRisk}</p>
              </div>
              <div className="text-xs text-muted-foreground space-y-1 bg-muted/40 rounded-lg p-3">
                {whrGender === "male" ? (
                  <>
                    <p><strong className="text-michigan-forest">Low:</strong> Below 0.90</p>
                    <p><strong className="text-michigan-gold">Moderate:</strong> 0.90–0.99</p>
                    <p><strong className="text-michigan-coral">High:</strong> 1.00 or above</p>
                  </>
                ) : (
                  <>
                    <p><strong className="text-michigan-forest">Low:</strong> Below 0.80</p>
                    <p><strong className="text-michigan-gold">Moderate:</strong> 0.80–0.84</p>
                    <p><strong className="text-michigan-coral">High:</strong> 0.85 or above</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Target Heart Rate */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-2 mb-4">
              <HeartPulse className="h-5 w-5 text-michigan-coral" />
              <h3 className="text-lg font-bold text-foreground">Target Heart Rate Zones</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Karvonen method — personalized training zones based on your age and resting heart rate.</p>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Age: {thrAge}</label>
                <Slider value={[thrAge]} onValueChange={v => setThrAge(v[0])} min={15} max={85} step={1} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Resting Heart Rate: {thrResting} bpm</label>
                <Slider value={[thrResting]} onValueChange={v => setThrResting(v[0])} min={40} max={110} step={1} />
              </div>
              <Separator />
              <div className="text-center mb-2">
                <p className="text-sm text-muted-foreground">Max Heart Rate</p>
                <p className="text-2xl font-bold text-foreground">{thrMax} bpm</p>
              </div>
              <div className="space-y-2 bg-muted/40 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-michigan-forest">Moderate Zone (50–70%)</p>
                    <p className="text-xs text-muted-foreground">Walking, light jogging, cycling</p>
                  </div>
                  <p className="text-sm font-bold text-foreground">{thrModLow}–{thrModHigh} bpm</p>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-michigan-coral">Vigorous Zone (70–85%)</p>
                    <p className="text-xs text-muted-foreground">Running, HIIT, swimming laps</p>
                  </div>
                  <p className="text-sm font-bold text-foreground">{thrVigLow}–{thrVigHigh} bpm</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Aim for 150 min/week moderate or 75 min/week vigorous activity (AHA guidelines).</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20">
        <CardContent className="py-4">
          <p className="text-xs text-muted-foreground">
            <Shield className="inline h-3 w-3 mr-1 text-primary" />
            These calculators provide general health information only. They do not account for individual factors like muscle mass, age, or medical conditions. Always consult your healthcare provider for personalized health assessments.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
