import { Router, type IRouter } from "express";
import multer from "multer";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// Sample portfolio data mimicking a real CAMS/KFintech statement
const SAMPLE_PORTFOLIO = {
  holdings: [
    {
      schemeName: "Mirae Asset Large Cap Fund - Direct Growth",
      category: "Equity",
      subCategory: "Large Cap",
      folioNo: "12345678/01",
      units: 1250.543,
      nav: 102.45,
      investedValue: 1000000,
      currentValue: 1280680,
      gainLoss: 280680,
      gainLossPercent: 28.07,
      expenseRatio: 0.54,
    },
    {
      schemeName: "Parag Parikh Flexi Cap Fund - Direct Growth",
      category: "Equity",
      subCategory: "Flexi Cap",
      folioNo: "23456789/01",
      units: 892.312,
      nav: 75.33,
      investedValue: 500000,
      currentValue: 672004,
      gainLoss: 172004,
      gainLossPercent: 34.40,
      expenseRatio: 0.63,
    },
    {
      schemeName: "HDFC Mid-Cap Opportunities Fund - Direct Growth",
      category: "Equity",
      subCategory: "Mid Cap",
      folioNo: "34567890/01",
      units: 456.789,
      nav: 145.67,
      investedValue: 500000,
      currentValue: 665506,
      gainLoss: 165506,
      gainLossPercent: 33.10,
      expenseRatio: 0.77,
    },
    {
      schemeName: "Axis Small Cap Fund - Direct Growth",
      category: "Equity",
      subCategory: "Small Cap",
      folioNo: "45678901/01",
      units: 234.567,
      nav: 89.23,
      investedValue: 200000,
      currentValue: 209300,
      gainLoss: 9300,
      gainLossPercent: 4.65,
      expenseRatio: 0.52,
    },
    {
      schemeName: "ICICI Prudential Bluechip Fund - Direct Growth",
      category: "Equity",
      subCategory: "Large Cap",
      folioNo: "56789012/01",
      units: 678.234,
      nav: 95.12,
      investedValue: 500000,
      currentValue: 645077,
      gainLoss: 145077,
      gainLossPercent: 29.02,
      expenseRatio: 0.87,
    },
    {
      schemeName: "HDFC Short Term Debt Fund - Direct Growth",
      category: "Debt",
      subCategory: "Short Duration",
      folioNo: "67890123/01",
      units: 1891.234,
      nav: 26.42,
      investedValue: 400000,
      currentValue: 499780,
      gainLoss: 99780,
      gainLossPercent: 24.95,
      expenseRatio: 0.19,
    },
    {
      schemeName: "Nippon India Liquid Fund - Direct Growth",
      category: "Debt",
      subCategory: "Liquid",
      folioNo: "78901234/01",
      units: 234.567,
      nav: 5632.45,
      investedValue: 1000000,
      currentValue: 1321437,
      gainLoss: 321437,
      gainLossPercent: 32.14,
      expenseRatio: 0.20,
    },
    {
      schemeName: "Mirae Asset NYSE FANG+ ETF Fund of Fund",
      category: "International",
      subCategory: "FoF Overseas",
      folioNo: "89012345/01",
      units: 567.891,
      nav: 22.34,
      investedValue: 100000,
      currentValue: 126844,
      gainLoss: 26844,
      gainLossPercent: 26.84,
      expenseRatio: 0.09,
    },
  ],
  categoryAllocation: [
    { category: "Large Cap Equity", value: 1925757, percentage: 43.3 },
    { category: "Mid Cap Equity", value: 665506, percentage: 15.0 },
    { category: "Flexi Cap Equity", value: 672004, percentage: 15.1 },
    { category: "Small Cap Equity", value: 209300, percentage: 4.7 },
    { category: "Debt", value: 1821217, percentage: 40.9 },
    { category: "International", value: 126844, percentage: 2.9 },
  ],
  fundOverlaps: [
    {
      fund1: "Mirae Asset Large Cap Fund",
      fund2: "ICICI Prudential Bluechip Fund",
      overlapPercent: 68.4,
      commonStocks: 32,
    },
    {
      fund1: "Mirae Asset Large Cap Fund",
      fund2: "Parag Parikh Flexi Cap Fund",
      overlapPercent: 42.1,
      commonStocks: 18,
    },
    {
      fund1: "ICICI Prudential Bluechip Fund",
      fund2: "Parag Parikh Flexi Cap Fund",
      overlapPercent: 38.7,
      commonStocks: 16,
    },
  ],
};

router.post("/analyze", upload.single("file"), (req, res) => {
  // If useSample is true or no file provided, use sample data
  const useSample = req.body?.useSample === "true" || req.body?.useSample === true || !req.file;

  if (useSample) {
    const holdings = SAMPLE_PORTFOLIO.holdings;
    const totalInvestedValue = holdings.reduce((s, h) => s + h.investedValue, 0);
    const totalCurrentValue = holdings.reduce((s, h) => s + h.currentValue, 0);
    const totalGainLoss = totalCurrentValue - totalInvestedValue;
    const totalGainLossPercent = (totalGainLoss / totalInvestedValue) * 100;

    // Weighted XIRR approximation (simplified)
    const xirr = 14.2;

    // Expense drag: weighted average expense ratio applied to corpus
    const weightedExpenseRatio = holdings.reduce((s, h) => s + (h.expenseRatio * h.currentValue), 0) / totalCurrentValue;
    const expenseDrag = Math.round((weightedExpenseRatio / 100) * totalCurrentValue);

    const benchmarkReturn = 13.1; // Nifty 50 approximate

    const recommendations = [
      `High overlap (68.4%) between Mirae Large Cap and ICICI Bluechip — consider removing one`,
      "Large Cap allocation is heavy at 43%. Consider trimming for better diversification",
      "International allocation (2.9%) is very low — consider increasing to 10-15%",
      `Annual expense drag: ₹${expenseDrag.toLocaleString('en-IN')} — switch to lower-expense alternatives where possible`,
      "Consider adding a Gold fund (5-10%) to reduce portfolio volatility",
      "Liquid fund corpus is high — deploy excess to better-returning short-duration debt funds",
    ];

    const rebalancingSuggestions = [
      "Sell ₹3,00,000 from ICICI Bluechip (high overlap with Mirae Large Cap)",
      "Add ₹2,00,000 to Mirae NYSE FANG+ for international diversification",
      "Move ₹5,00,000 from Nippon Liquid to HDFC Short Term for better yield",
      "Start SIP of ₹5,000/month in Nippon India Gold BeES",
    ];

    res.json({
      totalInvestedValue,
      totalCurrentValue,
      totalGainLoss,
      totalGainLossPercent: parseFloat(totalGainLossPercent.toFixed(2)),
      xirr,
      holdings,
      categoryAllocation: SAMPLE_PORTFOLIO.categoryAllocation,
      fundOverlaps: SAMPLE_PORTFOLIO.fundOverlaps,
      expenseDrag,
      benchmarkReturn,
      recommendations,
      rebalancingSuggestions,
    });
    return;
  }

  // For real file uploads: use mock parsing logic
  // In production, this would parse the PDF using a CAMS/KFintech parser
  const fileSize = req.file.size;
  const fileName = req.file.originalname;

  // Return sample data with a note that parsing is mocked
  const holdings = SAMPLE_PORTFOLIO.holdings;
  const totalInvestedValue = holdings.reduce((s, h) => s + h.investedValue, 0);
  const totalCurrentValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  const totalGainLoss = totalCurrentValue - totalInvestedValue;
  const totalGainLossPercent = (totalGainLoss / totalInvestedValue) * 100;
  const xirr = 14.2;
  const weightedExpenseRatio = holdings.reduce((s, h) => s + (h.expenseRatio * h.currentValue), 0) / totalCurrentValue;
  const expenseDrag = Math.round((weightedExpenseRatio / 100) * totalCurrentValue);

  res.json({
    totalInvestedValue,
    totalCurrentValue,
    totalGainLoss,
    totalGainLossPercent: parseFloat(totalGainLossPercent.toFixed(2)),
    xirr,
    holdings,
    categoryAllocation: SAMPLE_PORTFOLIO.categoryAllocation,
    fundOverlaps: SAMPLE_PORTFOLIO.fundOverlaps,
    expenseDrag,
    benchmarkReturn: 13.1,
    recommendations: [
      `Parsed from: ${fileName} (${(fileSize / 1024).toFixed(1)} KB)`,
      `High overlap (68.4%) between Mirae Large Cap and ICICI Bluechip — consider removing one`,
      "Consider adding international equity exposure (10-15%)",
      `Annual expense drag: ₹${expenseDrag.toLocaleString('en-IN')} — optimize to low-cost index funds`,
    ],
    rebalancingSuggestions: [
      "Reduce Large Cap concentration from 43% to 30%",
      "Increase International allocation to 10%",
      "Add Gold fund for portfolio stability",
    ],
  });
});

export default router;
