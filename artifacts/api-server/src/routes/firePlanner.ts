import { Router, type IRouter } from "express";
import { z } from "zod";

const router: IRouter = Router();

const FinancialGoalSchema = z.object({
  name: z.string(),
  targetAmount: z.number(),
  targetYear: z.number(),
  currentSavings: z.number(),
});

const FirePlannerInputSchema = z.object({
  age: z.number(),
  monthlyIncome: z.number(),
  monthlyExpenses: z.number(),
  dependents: z.number(),
  currentSavings: z.number(),
  currentInvestments: z.number(),
  emiAmount: z.number(),
  targetRetirementAge: z.number(),
  expectedInflation: z.number(),
  expectedReturnRate: z.number(),
  riskProfile: z.enum(["conservative", "moderate", "aggressive"]),
  goals: z.array(FinancialGoalSchema),
});

// Future Value of existing lump sum
function futureValue(pv: number, rate: number, years: number): number {
  return pv * Math.pow(1 + rate, years);
}

// Future Value of SIP (PMT * ((1+r)^n - 1) / r)
function sipFutureValue(monthlyAmount: number, annualRate: number, years: number): number {
  const r = annualRate / 12;
  const n = years * 12;
  return monthlyAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}

// Required SIP to reach target given existing savings
function requiredSip(targetAmount: number, existingSavings: number, annualRate: number, years: number): number {
  const fvExisting = futureValue(existingSavings, annualRate, years);
  const remaining = Math.max(0, targetAmount - fvExisting);
  if (remaining === 0) return 0;
  const r = annualRate / 12;
  const n = years * 12;
  const fvFactor = ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  return remaining / fvFactor;
}

router.post("/plan", (req, res) => {
  const parsed = FirePlannerInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }

  const d = parsed.data;
  const currentYear = new Date().getFullYear();
  const yearsToRetirement = d.targetRetirementAge - d.age;
  const annualReturnRate = d.expectedReturnRate / 100;
  const annualInflation = d.expectedInflation / 100;
  const realRate = (1 + annualReturnRate) / (1 + annualInflation) - 1;

  // FIRE Number: 25x annual expenses inflated to retirement
  const inflatedMonthlyExpense = d.monthlyExpenses * Math.pow(1 + annualInflation, yearsToRetirement);
  const fireNumber = inflatedMonthlyExpense * 12 * 25;
  const retirementCorpus = fireNumber;

  // Emergency Fund Target: 6 months of (expenses + EMI)
  const emergencyFundTarget = (d.monthlyExpenses + d.emiAmount) * 6;

  // Calculate SIP goals
  const sipGoals = d.goals.map(goal => {
    const yearsToGoal = goal.targetYear - currentYear;
    const inflatedTarget = goal.targetAmount * Math.pow(1 + annualInflation, Math.max(0, yearsToGoal));
    const sip = requiredSip(inflatedTarget, goal.currentSavings, annualReturnRate, Math.max(1, yearsToGoal));
    const projectedCorpus = sipFutureValue(sip, annualReturnRate, Math.max(1, yearsToGoal)) + futureValue(goal.currentSavings, annualReturnRate, Math.max(1, yearsToGoal));
    return {
      goalName: goal.name,
      targetAmount: Math.round(inflatedTarget),
      targetYear: goal.targetYear,
      requiredSip: Math.round(sip),
      fundingGap: Math.max(0, Math.round(inflatedTarget - projectedCorpus)),
      projectedCorpus: Math.round(projectedCorpus),
    };
  });

  // Retirement SIP
  const retirementSip = requiredSip(
    retirementCorpus,
    d.currentInvestments + d.currentSavings * 0.5,
    annualReturnRate,
    yearsToRetirement
  );

  const totalMonthlySip = Math.round(retirementSip + sipGoals.reduce((s, g) => s + g.requiredSip, 0));

  // Months to FIRE (simplified)
  const monthlySavings = d.monthlyIncome - d.monthlyExpenses - d.emiAmount;
  const currentCorpus = d.currentInvestments + d.currentSavings;
  // Simplified: how many months at current savings rate to reach FIRE
  const monthsToFire = yearsToRetirement * 12;

  // Retirement projections
  const retirementProjections = [];
  let corpus = currentCorpus;
  for (let yr = 0; yr <= yearsToRetirement; yr++) {
    retirementProjections.push({
      year: currentYear + yr,
      age: d.age + yr,
      corpus: Math.round(corpus),
    });
    corpus = corpus * (1 + annualReturnRate) + totalMonthlySip * 12;
  }

  // Asset allocation based on risk profile
  let assetAllocation = { equity: 0, debt: 0, gold: 0, realEstate: 0 };
  if (d.riskProfile === "conservative") {
    assetAllocation = { equity: 40, debt: 45, gold: 10, realEstate: 5 };
  } else if (d.riskProfile === "moderate") {
    assetAllocation = { equity: 60, debt: 25, gold: 10, realEstate: 5 };
  } else {
    assetAllocation = { equity: 80, debt: 10, gold: 5, realEstate: 5 };
  }

  // Tax optimizations
  const taxOptimizations = [
    "Invest ₹1,50,000 in ELSS mutual funds to maximize Section 80C deduction",
    "Contribute ₹50,000 to NPS for additional Section 80CCD(1B) deduction",
    "Consider switching to New Tax Regime if your deductions are less than ₹3.75L",
    "Use HRA exemption if you're paying rent",
    "Claim LTA exemption for domestic travel twice in 4 years",
    "Invest in SCSS or Senior Citizen FD for parents to save tax on family income",
  ];

  // Insurance gap
  const idealLifeCover = d.monthlyIncome * 12 * 10;
  const idealHealthCover = d.dependents > 0 ? 1000000 : 500000;
  const insuranceGap = {
    lifeInsurance: Math.max(0, idealLifeCover),
    healthInsurance: idealHealthCover,
  };

  // Action checklist
  const actionChecklist = [
    `Build emergency fund of ₹${emergencyFundTarget.toLocaleString('en-IN')}`,
    `Start SIP of ₹${totalMonthlySip.toLocaleString('en-IN')} per month`,
    "Get adequate term life insurance (10x annual income)",
    "Maximize 80C investments (₹1.5L/year)",
    "Open NPS account for additional ₹50,000 tax benefit",
    "Review and rebalance portfolio every 6 months",
    "Create a will and nominate beneficiaries",
    "Track net worth quarterly using this dashboard",
  ];

  res.json({
    fireNumber: Math.round(fireNumber),
    retirementCorpus: Math.round(retirementCorpus),
    monthsToFire,
    emergencyFundTarget: Math.round(emergencyFundTarget),
    totalMonthlySip,
    sipGoals,
    assetAllocation,
    retirementProjections,
    taxOptimizations,
    insuranceGap,
    actionChecklist,
  });
});

export default router;
