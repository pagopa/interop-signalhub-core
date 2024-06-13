import { kmsClientBuilder } from "../security/kmsClientHandler.js";

export async function getClientAssertion(): Promise<string> {
  const kmsClient = kmsClientBuilder();
  return await kmsClient.buildJWT();
}
