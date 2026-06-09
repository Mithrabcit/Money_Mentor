import { Router, type IRouter } from "express";
import healthRouter from "./health";
import moneyHealthRouter from "./moneyHealth";
import firePlannerRouter from "./firePlanner";
import portfolioRouter from "./portfolio";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/money-health", moneyHealthRouter);
router.use("/fire-planner", firePlannerRouter);
router.use("/portfolio", portfolioRouter);

export default router;
