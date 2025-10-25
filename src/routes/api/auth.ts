import e from "express";
import z from "zod";
import { prismaClient } from "@/lib/db";
import { hashSaltPassword } from "@/lib/crypto";
import { AccountProvider } from "@prisma/client";

const authRouter = e.Router();

const signUpInput = z.object({
  email: z.email(),
  name: z.string(),
  password: z.string(),
});

authRouter.post("/sign-up", async (req, res) => {
  try {
    const { body } = req;
    const { error, success, data } = signUpInput.safeParse(body);

    if (!success) {
      res.status(400).json({ message: error.message });
      return;
    }

    const { email, name, password } = data;

    const foundUser = await prismaClient.user.findUnique({
      where: { email },
    });

    if (foundUser) {
      res.status(409).json({ message: "Email is already registered" });
      return;
    }

    const hashedPassword = await hashSaltPassword(password);

    const user = await prismaClient.user.create({ data: { email, name } });
    const account = await prismaClient.account.create({
      data: {
        provider: AccountProvider.Credentials,
        providerId: user.id,
        userId: user.id,
        password: hashedPassword,
      },
    });

    res
      .status(201)
      .json({ message: "You have successfully created a new account" });
  } catch (error) {
    if (error instanceof Error) {
      const { message } = error;

      console.error(message);
    }

    res
      .status(500)
      .json({ message: "Unexpected error occured upon signing up" });
  }
});

export { authRouter };
