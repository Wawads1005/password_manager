import e from "express";
import { prismaClient } from "@/lib/db";
import { authenticate } from "@/middleware/auth";
import z from "zod";

const applicationsRouter = e.Router();

const createApplicationInput = z.object({
  name: z.string(),
  password: z.string(),
});

applicationsRouter.post("/", authenticate, async (req, res) => {
  try {
    const { user, body } = req;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { success, error, data } = createApplicationInput.safeParse(body);

    if (!success) {
      res.status(400).json({ message: error.message });
      return;
    }

    const { name, password } = data;

    const application = await prismaClient.application.create({
      data: {
        name,
        password,
        userId: user.id,
      },
    });

    res.status(201).json({
      message: "You have successfully created a new application",
      application,
    });
  } catch (error) {
    if (error instanceof Error) {
      const { message } = error;

      console.error(message);
    }

    res
      .status(500)
      .json({ message: "Unexpected error occured upon creating applications" });
  }
});

export { applicationsRouter };
