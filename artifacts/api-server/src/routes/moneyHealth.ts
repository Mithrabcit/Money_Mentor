import { Router, type IRouter } from "express";
import { z } from "zod";

const router: IRouter = Router();

const MoneyHealthInputSchema = z.object({
  age: z.number(),
  monthlyIncome: z.number(),
  monthlyExpenses: z.number(),
  dependents: z.number(),
  currentSavings: z.number(),
  emiAmount: z.number(),
  currentInvestments: z.number(),
  lifeInsuranceCover: z.number(),
  healthInsuranceCover: z.number(),
  taxSavingInvestments: z.number(),
  hasRetirementPlan: z.boolean(),
  epfBalance: z.number(),
});

type Dimension = {
  name: string;
  score: number;
  maxScore: number;
  status: "excellent" | "good" | "fair" | "poor";
  explanation: string;
  recommendation: string;
};

function getStatus(score: number, max: number): "excellent" | "good" | "fair" | "poor" {
  const pct = score / max;
  if (pct >= 0.8) return "excellent";
  if (pct >= 0.6) return "good";
  if (pct >= 0.4) return "fair";
  return "poor";
}

router.post("/score", (req, res) => {
  const parsed = MoneyHealthInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }

  const d = parsed.data;
  const dimensions: Dimension[] = [];
  const alerts: string[] = [];
  const recommendations: string[] = [];

  // 1. Emergency Preparedness (out of 20)
  const monthsExpenses = d.monthlyExpenses + d.emiAmount;
  const emergencyMonths = d.currentSavings / monthsExpenses;
  let emergencyScore = 0;
  if (emergencyMonths >= 6) emergencyScore = 20;
  else if (emergencyMonths >= 4) emergencyScore = 14;
  else if (emergencyMonths >= 2) emergencyScore = 8;
  else emergencyScore = 3;
  const emergencyStatus = getStatus(emergencyScore, 20);
  if (emergencyMonths < 6) alerts.push("Your emergency fund is low. Aim for 6 months of expenses.");
  if (emergencyMonths < 6) recommendations.push(`Build emergency fund to ₹${Math.round((monthsExpenses * 6)).toLocaleString('en-IN')}`);
  dimensions.push({
    name: "Emergency Preparedness",
    score: emergencyScore,
    maxScore: 20,
    status: emergencyStatus,
    explanation: `You have ${emergencyMonths.toFixed(1)} months of expenses saved (target: 6 months).`,
    recommendation: emergencyMonths >= 6
      ? "Great! You have a strong emergency fund. Keep it in a liquid FD or sweep account."
      : `Increase your liquid savings. Current fund covers only ${emergencyMonths.toFixed(1)} months.`,
  });

  // 2. Insurance Adequacy (out of 20)
  const idealLifeCover = d.monthlyIncome * 12 * 10; // 10x annual income
  const idealHealthCover = d.dependents > 0 ? 1000000 : 500000; // ₹10L family, ₹5L individual
  const lifeCoverRatio = d.lifeInsuranceCover / idealLifeCover;
  const healthCoverRatio = d.healthInsuranceCover / idealHealthCover;
  const insuranceScore = Math.round(Math.min(lifeCoverRatio, 1) * 10 + Math.min(healthCoverRatio, 1) * 10);
  const insuranceStatus = getStatus(insuranceScore, 20);
  if (lifeCoverRatio < 1) {
    alerts.push(`You may be underinsured. Ideal life cover is ₹${Math.round(idealLifeCover / 100000)}L.`);
    recommendations.push(`Increase term insurance to ₹${Math.round(idealLifeCover / 100000)}L`);
  }
  if (healthCoverRatio < 1) {
    alerts.push("Health insurance cover is inadequate. Consider a top-up plan.");
    recommendations.push("Get a ₹10L super top-up health plan for family protection");
  }
  dimensions.push({
    name: "Insurance Adequacy",
    score: Math.min(insuranceScore, 20),
    maxScore: 20,
    status: insuranceStatus,
    explanation: `Life cover: ₹${(d.lifeInsuranceCover / 100000).toFixed(0)}L (need ₹${(idealLifeCover / 100000).toFixed(0)}L). Health: ₹${(d.healthInsuranceCover / 100000).toFixed(0)}L (need ₹${(idealHealthCover / 100000).toFixed(0)}L).`,
    recommendation: lifeCoverRatio >= 1 && healthCoverRatio >= 1
      ? "Insurance coverage looks adequate. Review annually."
      : "Purchase adequate term life and health insurance to protect your family.",
  });

  // 3. Debt Health (out of 15)
  const emiToIncomeRatio = d.emiAmount / d.monthlyIncome;
  let debtScore = 0;
  if (emiToIncomeRatio <= 0) debtScore = 15;
  else if (emiToIncomeRatio <= 0.2) debtScore = 13;
  else if (emiToIncomeRatio <= 0.3) debtScore = 9;
  else if (emiToIncomeRatio <= 0.4) debtScore = 5;
  else debtScore = 2;
  const debtStatus = getStatus(debtScore, 15);
  if (emiToIncomeRatio > 0.3) {
    alerts.push(`EMI burden is high at ${(emiToIncomeRatio * 100).toFixed(0)}% of income. Aim to keep below 30%.`);
    recommendations.push("Prepay high-interest loans to reduce EMI burden");
  }
  dimensions.push({
    name: "Debt Health",
    score: debtScore,
    maxScore: 15,
    status: debtStatus,
    explanation: `Your EMIs are ${(emiToIncomeRatio * 100).toFixed(0)}% of monthly income. Healthy limit is 30-40%.`,
    recommendation: emiToIncomeRatio <= 0.3
      ? "Debt levels are manageable. Avoid taking on new high-interest debt."
      : "Focus on prepaying expensive loans. Avoid lifestyle loans.",
  });

  // 4. Tax Efficiency (out of 15)
  const annualIncome = d.monthlyIncome * 12;
  const taxLimit80C = 150000;
  const taxUtilizationRatio = Math.min(d.taxSavingInvestments / taxLimit80C, 1);
  const taxScore = Math.round(taxUtilizationRatio * 15);
  const taxStatus = getStatus(taxScore, 15);
  if (taxUtilizationRatio < 1) {
    alerts.push(`Tax planning can improve. Only ₹${d.taxSavingInvestments.toLocaleString('en-IN')} invested under 80C.`);
    recommendations.push(`Invest ₹${(taxLimit80C - d.taxSavingInvestments).toLocaleString('en-IN')} more under 80C (ELSS/PPF/NPS)`);
  }
  dimensions.push({
    name: "Tax Efficiency",
    score: taxScore,
    maxScore: 15,
    status: taxStatus,
    explanation: `You've used ₹${d.taxSavingInvestments.toLocaleString('en-IN')} of the ₹1,50,000 80C limit (${(taxUtilizationRatio * 100).toFixed(0)}%). Annual income: ₹${(annualIncome / 100000).toFixed(1)}L.`,
    recommendation: taxUtilizationRatio >= 1
      ? "You've maximized 80C. Consider NPS for additional ₹50,000 deduction under 80CCD(1B)."
      : "Maximize 80C with ELSS funds for tax savings + wealth creation.",
  });

  // 5. Investment Diversification (out of 15)
  const investmentToIncomeRatio = d.currentInvestments / (d.monthlyIncome * 12);
  const savingsRate = (d.monthlyIncome - d.monthlyExpenses - d.emiAmount) / d.monthlyIncome;
  let diversScore = 0;
  if (investmentToIncomeRatio >= 3 && savingsRate >= 0.2) diversScore = 15;
  else if (investmentToIncomeRatio >= 2 && savingsRate >= 0.15) diversScore = 11;
  else if (investmentToIncomeRatio >= 1 && savingsRate >= 0.1) diversScore = 7;
  else diversScore = 3;
  const diversStatus = getStatus(diversScore, 15);
  if (savingsRate < 0.2) {
    recommendations.push("Aim to invest at least 20% of monthly income through SIPs");
  }
  dimensions.push({
    name: "Investment Diversification",
    score: diversScore,
    maxScore: 15,
    status: diversStatus,
    explanation: `Investments are ${investmentToIncomeRatio.toFixed(1)}x annual income. Savings rate: ${(savingsRate * 100).toFixed(0)}%.`,
    recommendation: diversScore >= 11
      ? "Good investment base. Ensure diversification across equity, debt, and gold."
      : "Start SIPs in diversified equity and debt mutual funds. Target 20%+ savings rate.",
  });

  // 6. Retirement Readiness (out of 15)
  const yearsToRetirement = Math.max(0, 60 - d.age);
  const totalRetirementCorpus = d.epfBalance + d.currentInvestments * 0.3;
  const idealCorpus = d.monthlyExpenses * 12 * 25; // 25x annual expenses (4% rule)
  const retirementRatio = totalRetirementCorpus / idealCorpus;
  let retirementScore = 0;
  if (d.hasRetirementPlan && retirementRatio >= 0.5) retirementScore = 15;
  else if (d.hasRetirementPlan && retirementRatio >= 0.2) retirementScore = 10;
  else if (d.hasRetirementPlan) retirementScore = 7;
  else if (retirementRatio >= 0.2) retirementScore = 5;
  else retirementScore = 2;
  const retirementStatus = getStatus(retirementScore, 15);
  if (!d.hasRetirementPlan) {
    alerts.push("No retirement plan detected. Start NPS or PPF immediately.");
    recommendations.push("Open NPS account and invest ₹50,000/year for additional tax benefit");
  }
  if (retirementRatio < 0.5) {
    alerts.push("Retirement readiness is moderate. Increase retirement-specific investments.");
  }
  dimensions.push({
    name: "Retirement Readiness",
    score: retirementScore,
    maxScore: 15,
    status: retirementStatus,
    explanation: `Target corpus: ₹${(idealCorpus / 10000000).toFixed(1)}Cr. Current progress: ${(retirementRatio * 100).toFixed(0)}%. ${yearsToRetirement} years left.`,
    recommendation: d.hasRetirementPlan && retirementRatio >= 0.5
      ? "You're on track for retirement. Continue contributions and review annually."
      : "Urgently start retirement planning with NPS, EPF, and long-term equity SIPs.",
  });

  const totalScore = dimensions.reduce((s, d) => s + d.score, 0);
  let grade = "D";
  if (totalScore >= 85) grade = "A+";
  else if (totalScore >= 75) grade = "A";
  else if (totalScore >= 65) grade = "B+";
  else if (totalScore >= 55) grade = "B";
  else if (totalScore >= 45) grade = "C";
  else grade = "D";

  res.json({
    totalScore,
    grade,
    dimensions,
    summaryAlerts: alerts,
    topRecommendations: recommendations,
  });
});

export default router;
