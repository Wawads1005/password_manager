import e from "express";
import { authRouter } from "@/routes/api/auth";
import { applicationsRouter } from "@/routes/api/applications";

const apiRouter = e.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/applications", applicationsRouter);

export { apiRouter };
