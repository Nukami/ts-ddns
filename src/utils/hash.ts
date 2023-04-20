import * as crypto from "crypto";

export async function getSha1Hash(data: string): Promise<string> {
  const raw = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-1", raw);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
