// Usage:
//   npx tsx hash-password.ts <password> [salt]
// If no salt is given, a random 8-byte hex salt is generated.

import { randomBytes, scrypt } from "node:crypto";

const KEY_LENGTH = 16; // bytes -> 32 hex characters

export function hashPassword(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (err: Error | null, hashedPasswordBuffer: Buffer) => {
      if (err) return reject(err);
      resolve(hashedPasswordBuffer.toString("hex"));
    });
  });
}

async function main(): Promise<void> {
  const [clearPassword = "password", givenSalt] = process.argv.slice(2);
  const salt: string = givenSalt ?? randomBytes(8).toString("hex");

  const passwordToSaveInDB: string = await hashPassword(clearPassword, salt);

  console.log("=== DATA TO INSERT INTO THE DB ===");
  console.log(`Salt:     ${salt}`);
  console.log(`Password: ${passwordToSaveInDB}`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
