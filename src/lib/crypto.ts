import {
  DEFAULT_BUFFER_ENCODING,
  DEFAULT_HASH_LENGTH,
  DEFAULT_HASH_SALT_SEPARATOR,
  DEFAULT_SALT_LENGTH,
} from "@/constants/crypto";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

async function generateSalt(
  length: number = DEFAULT_SALT_LENGTH,
  encoding: BufferEncoding = DEFAULT_BUFFER_ENCODING
) {
  const salt = await new Promise<string>((resolve, reject) => {
    randomBytes(length, (error, buffer) => {
      if (error || !buffer) {
        reject(error);
        return;
      }

      const salt = buffer.toString(encoding);

      resolve(salt);
    });
  });

  return salt;
}

async function hashSaltPassword(
  password: string,
  length: number = DEFAULT_HASH_LENGTH,
  encoding: BufferEncoding = DEFAULT_BUFFER_ENCODING,
  separator: string = DEFAULT_HASH_SALT_SEPARATOR,
  salt?: string
) {
  if (!salt) {
    salt = await generateSalt();
  }

  const saltedPassword = await new Promise<string>((resolve, reject) => {
    scrypt(password, salt, length, (error, buffer) => {
      if (error || !buffer) {
        reject(error);
        return;
      }

      const hashedPassword = buffer.toString(encoding);
      const saltedPassword = `${hashedPassword}${separator}${salt}`;

      resolve(saltedPassword);
    });
  });

  return saltedPassword;
}

async function comparePassword(
  saltedPasswordA: string,
  password: string,
  separator: string = DEFAULT_HASH_SALT_SEPARATOR,
  length: number = DEFAULT_HASH_LENGTH,
  encoding: BufferEncoding = DEFAULT_BUFFER_ENCODING
) {
  const [hashedPasswordA, salt] = saltedPasswordA.split(separator);

  if (!hashedPasswordA || !salt) {
    throw new Error("Unrecognized password format");
  }

  const saltedPasswordB = await hashSaltPassword(
    password,
    length,
    encoding,
    separator,
    salt
  );

  const [hashedPasswordB] = saltedPasswordB.split(separator);

  if (!hashedPasswordB) {
    throw new Error("Unexpected error occured upon comparing password");
  }

  const bufferA = Buffer.from(hashedPasswordA, encoding);
  const bufferB = Buffer.from(hashedPasswordB, encoding);

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  const matchedPassword = timingSafeEqual(bufferA, bufferB);

  return matchedPassword;
}

export { generateSalt, hashSaltPassword, comparePassword };
