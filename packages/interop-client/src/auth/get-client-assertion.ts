import { kmsClientBuilder } from "../security/kmsClientHandler.js";

export async function getClientAssertion() {
  const kmsClient = kmsClientBuilder();
  const assertion = await kmsClient.buildJWT();
  return assertion;
}
