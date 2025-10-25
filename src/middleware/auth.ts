import e from "express";
import { prismaClient } from "@/lib/db";
import { jwtVerify } from "jose";
import { keys } from "@/lib/keys";

const textEncoder = new TextEncoder();
const encodedSecret = textEncoder.encode(keys.authSecret);

async function authenticate(
  req: e.Request,
  res: e.Response,
  next: e.NextFunction
) {
  try {
    const { headers } = req;
    const { authorization } = headers;

    if (!authorization) {
      res.status(401).json({ message: "Missing authorization header" });
      return;
    }

    const [scheme, credentials] = authorization.split(" ");

    if (scheme !== "Bearer" || !credentials) {
      res.status(401).json({ message: "Missing bearer token" });
      return;
    }

    const { payload } = await jwtVerify(credentials, encodedSecret);
    const { sub } = payload;

    if (!sub) {
      res.status(404).json({ message: "Missing user ID" });
      return;
    }

    const foundUser = await prismaClient.user.findUnique({
      where: { id: sub },
    });

    if (!foundUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    req.user = foundUser;

    next();
  } catch (error) {
    if (error instanceof Error) {
      const { message } = error;

      console.error(message);
    }

    res
      .status(500)
      .json({ message: "Unexpected error occured upon signing up" });
  }
}

export { authenticate };
