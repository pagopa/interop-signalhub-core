import { kmsClientBuilder } from "./security/kms.js";

export async function generateClientAssertion() {
  const kmsClient = kmsClientBuilder();
  const assertion = await kmsClient.buildJWT("RS256");
  return assertion;
}
