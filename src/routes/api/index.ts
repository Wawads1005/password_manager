import e from "express";
import { authRouter } from "@/routes/api/auth";

const apiRouter = e.Router();

apiRouter.use("/auth", authRouter);

export { apiRouter };
