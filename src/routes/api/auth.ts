import e from "express";
import z from "zod";
import { prismaClient } from "@/lib/db";
import { comparePassword, hashSaltPassword } from "@/lib/crypto";
import { AccountProvider } from "@prisma/client";
import { jwtVerify, SignJWT } from "jose";
import { keys } from "@/lib/keys";
import { TextEncoder } from "node:util";

const textEncoder = new TextEncoder();
const encodedSecret = textEncoder.encode(keys.authSecret);

const authRouter = e.Router();

const signUpInput = z.object({
  email: z.email(),
  name: z.string(),
  password: z.string(),
});

authRouter.get("/", async (req, res) => {
  try {
    const { headers } = req;
    const { authorization } = headers;

    if (!authorization) {
      res.status(200).json({ user: null });
      return;
    }

    const [scheme, credentials] = authorization.split(" ");

    if (scheme !== "Bearer" || !credentials) {
      res.status(200).json({ user: null });
      return;
    }

    const { payload } = await jwtVerify(credentials, encodedSecret);
    const { sub } = payload;

    if (!sub) {
      res.status(200).json({ user: null });
      return;
    }

    const foundUser = await prismaClient.user.findUnique({
      where: { id: sub },
    });

    if (!foundUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user: foundUser });
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

const signInInput = z.object({
  email: z.email(),
  password: z.string(),
});

authRouter.post("/sign-in", async (req, res) => {
  try {
    const { body } = req;
    const { error, success, data } = signInInput.safeParse(body);

    if (!success) {
      res.status(400).json({ message: error.message });
      return;
    }

    const { email, password } = data;

    const foundUser = await prismaClient.user.findUnique({ where: { email } });

    if (!foundUser) {
      res.status(404).json({ message: "Email is not yet registered" });
      return;
    }

    const foundAccount = await prismaClient.account.findUnique({
      where: {
        provider_userId: {
          provider: AccountProvider.Credentials,
          userId: foundUser.id,
        },
      },
    });

    if (!foundAccount || !foundAccount.password) {
      res.status(404).json({
        message:
          "User have no credentials account, try signing in using other provider",
      });
      return;
    }

    const matchedPassword = await comparePassword(
      foundAccount.password,
      password
    );

    if (!matchedPassword) {
      res.status(401).json({ message: "Wrong credentials" });
      return;
    }

    const token = await new SignJWT()
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(foundUser.id)
      .setExpirationTime("1hr")
      .sign(encodedSecret);

    res.status(200).json({ user: foundUser, token });
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
