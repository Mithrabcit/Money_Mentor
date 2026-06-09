import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useCalculateMoneyHealthScore } from "@workspace/api-client-react";
import { ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { formatINR } from "@/lib/format";

// We use Zod for client-side validation to ensure clean data before hitting the API
const formSchema = z.object({
  age: z.coerce.number().min(18).max(100),
  monthlyIncome: z.coerce.number().min(0),
  monthlyExpenses: z.coerce.number().min(0),
  dependents: z.coerce.number().min(0),
  currentSavings: z.coerce.number().min(0),
  emiAmount: z.coerce.number().min(0),
  currentInvestments: z.coerce.number().min(0),
  epfBalance: z.coerce.number().min(0),
  lifeInsuranceCover: z.coerce.number().min(0),
  healthInsuranceCover: z.coerce.number().min(0),
  taxSavingInvestments: z.coerce.number().min(0),
  hasRetirementPlan: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

const STEPS = [
  { id: 1, title: "Basics" },
  { id: 2, title: "Savings & Debt" },
  { id: 3, title: "Investments" },
  { id: 4, title: "Insurance" },
  { id: 5, title: "Tax & Retirement" }
];

export default function MoneyHealth() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  
  const mutation = useCalculateMoneyHealthScore();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 32,
      monthlyIncome: 120000,
      monthlyExpenses: 45000,
      dependents: 1,
      currentSavings: 800000,
      emiAmount: 15000,
      currentInvestments: 2500000,
      epfBalance: 1200000,
      lifeInsuranceCover: 10000000,
      healthInsuranceCover: 1000000,
      taxSavingInvestments: 150000,
      hasRetirementPlan: true,
    }
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate({ data });
  };

  const nextStep = () => {
    // Basic validation before moving next could be added here
    if (step < STEPS.length) {
      setDirection(1);
      setStep(s => s + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 50 : -50, opacity: 0 })
  };

  // Render Results View
  if (mutation.isSuccess && mutation.data) {
    const result = mutation.data;
    
    // Determine color based on grade
    const getGradeColor = (grade: string) => {
      if (grade === 'A') return 'text-green-500 border-green-500 bg-green-500/10';
      if (grade === 'B') return 'text-primary border-primary bg-primary/10';
      if (grade === 'C') return 'text-accent border-accent bg-accent/10';
      return 'text-destructive border-destructive bg-destructive/10';
    };

    const gradeColor = getGradeColor(result.grade);

    return (
      <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display font-bold">Your Money Health Report</h1>
          <button 
            onClick={() => { mutation.reset(); setStep(1); }}
            className="flex items-center px-4 py-2 text-sm bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Recalculate
          </button>
        </div>

        {/* Hero Score Card */}
        <div className="bg-card rounded-3xl border border-border p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
          {/* Big Circular Score */}
          <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted opacity-20" />
              <circle 
                cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" 
                className={result.grade === 'A' || result.grade === 'B' ? 'text-primary' : 'text-accent'}
                strokeDasharray={`${(result.totalScore / 100) * 283} 283`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-display font-bold">{result.totalScore}</span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className={`inline-block px-4 py-1.5 rounded-lg border font-bold text-lg ${gradeColor}`}>
              Grade {result.grade}
            </div>
            <h2 className="text-2xl font-bold">You are on the right track!</h2>
            <p className="text-muted-foreground text-lg">
              Your overall financial health is solid, but optimizing specific areas can significantly accelerate your wealth creation journey.
            </p>
          </div>
        </div>

        {/* Alerts Section */}
        {result.summaryAlerts.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6">
            <h3 className="font-bold text-destructive mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" /> Critical Alerts
            </h3>
            <ul className="space-y-2">
              {result.summaryAlerts.map((alert, i) => (
                <li key={i} className="text-destructive/90 flex items-start">
                  <span className="mr-2 mt-1">•</span> {alert}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Dimensions Grid */}
        <h3 className="text-2xl font-display font-bold pt-4">Detailed Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {result.dimensions.map((dim, i) => (
            <div key={i} className="bg-card border border-border/50 rounded-2xl p-6 shadow-md hover:border-primary/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-lg">{dim.name}</h4>
                <span className={`text-xs font-bold px-2 py-1 rounded border ${
                  dim.status === 'excellent' ? 'bg-primary/10 text-primary border-primary/20' :
                  dim.status === 'good' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  dim.status === 'fair' ? 'bg-accent/10 text-accent border-accent/20' :
                  'bg-destructive/10 text-destructive border-destructive/20'
                }`}>
                  {dim.status.toUpperCase()}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div 
                  className={`h-2 rounded-full ${dim.status === 'excellent' || dim.status === 'good' ? 'bg-primary' : 'bg-accent'}`} 
                  style={{ width: `${(dim.score / dim.maxScore) * 100}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mb-4 h-10">{dim.explanation}</p>
              <div className="p-3 bg-secondary/50 rounded-lg border border-border text-sm">
                <strong className="text-foreground block mb-1">Recommendation:</strong>
                <span className="text-muted-foreground">{dim.recommendation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render Form View
  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-display font-bold mb-3">Money Health Checkup</h1>
        <p className="text-muted-foreground">Answer a few questions to get a comprehensive analysis of your financial health.</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -z-10 -translate-y-1/2 rounded-full"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          ></div>
          
          {STEPS.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                step >= s.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-card border-2 border-muted text-muted-foreground'
              }`}>
                {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.id}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${step >= s.id ? 'text-primary' : 'text-muted-foreground'}`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden min-h-[400px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              {/* STEP 1: Basics */}
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Age</label>
                    <input type="number" {...register("age")} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dependents</label>
                    <input type="number" {...register("dependents")} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Monthly Income (₹)</label>
                    <input type="number" {...register("monthlyIncome")} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Monthly Expenses (₹)</label>
                    <input type="number" {...register("monthlyExpenses")} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                  </div>
                </div>
              )}

              {/* STEP 2: Savings & Debt */}
              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total Bank / FD Savings (₹)</label>
                    <input type="number" {...register("currentSavings")} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                    <p className="text-xs text-muted-foreground">Used to calculate emergency preparedness.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total Monthly EMI (₹)</label>
                    <input type="number" {...register("emiAmount")} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                    <p className="text-xs text-muted-foreground">All loans combined (Home, Auto, Personal).</p>
                  </div>
                </div>
              )}

              {/* STEP 3: Investments */}
              {step === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Market Investments (₹)</label>
                    <input type="number" {...register("currentInvestments")} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                    <p className="text-xs text-muted-foreground">Mutual funds, Stocks, Gold, etc.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">EPF/PPF Balance (₹)</label>
                    <input type="number" {...register("epfBalance")} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                    <p className="text-xs text-muted-foreground">Safe retirement corpus.</p>
                  </div>
                </div>
              )}

              {/* STEP 4: Insurance */}
              {step === 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Term Life Cover (₹)</label>
                    <input type="number" {...register("lifeInsuranceCover")} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Health Insurance Cover (₹)</label>
                    <input type="number" {...register("healthInsuranceCover")} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                    <p className="text-xs text-muted-foreground">Base + Super Top-up</p>
                  </div>
                </div>
              )}

              {/* STEP 5: Tax & Retirement */}
              {step === 5 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tax Saving Inv. (80C) this year (₹)</label>
                    <input type="number" {...register("taxSavingInvestments")} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                    <p className="text-xs text-muted-foreground">ELSS, PPF, Life Insurance Premium, etc. Max 1.5L.</p>
                  </div>
                  <div className="space-y-2 pt-8">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input type="checkbox" {...register("hasRetirementPlan")} className="w-5 h-5 rounded border-border text-primary focus:ring-primary bg-background" />
                      <span className="text-sm font-medium">I have a specific retirement plan/number.</span>
                    </label>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-10 pt-6 border-t border-border/50">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1 || mutation.isPending}
              className="px-6 py-3 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>
            
            {step < STEPS.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={mutation.isPending}
                className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary to-emerald-400 text-black hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center"
              >
                {mutation.isPending ? "Analyzing..." : "Get My Score"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
