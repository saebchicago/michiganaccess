import { Router, type IRouter } from "express";
import healthRouter from "./health";
import narrativesRouter from "./narratives";

const router: IRouter = Router();

router.use(healthRouter);
router.use(narrativesRouter);

export default router;
