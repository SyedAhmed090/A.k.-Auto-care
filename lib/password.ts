// Password hashing for per-user admin accounts (#12). Uses Node's scrypt — no
// extra dependency. Only ever imported by Node route handlers (login, staff),
// never by Edge middleware. Stored format: "scrypt$<saltHex>$<hashHex>".
import { scrypt, randomBytes, timingSafeEqual } from "crypto";

const KEYLEN = 64;

function scryptAsync(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEYLEN, (err, derived) => {
      if (err) reject(err);
      else resolve(derived);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  const actual = await scryptAsync(password, salt);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
