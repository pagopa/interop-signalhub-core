import { importPKCS8, SignJWT } from "jose";
import { v4 as uuidv4 } from "uuid";
import { InteropClientConfig } from "./config/interop-client.config.js";

const expireIn = "1h";

export async function generateClientAssertion(config: InteropClientConfig) {
  // Load the private key from the protected keystore
  const algorithm = "RS256";
  const privateKeyPem = config.privateKey ?? "";
  const privateKey = await importPKCS8(privateKeyPem, algorithm);

  // Provide other details provided by the API owner
  const keyId = config.keyId;
  const subject = config.subject;
  const issuer = config.issuer;
  const audience = config.audience;
  const purposeId = config.purposeId;
  const typ = "JWT";

  const JWTPayload = {
    sub: subject,
    iss: issuer,
    aud: audience,
    jti: uuidv4(),
    purposeId: purposeId,
  };

  const headersRSA = { kid: keyId, alg: algorithm, typ: typ };

  // Create a JWT client assertion signed with the private key
  const assertion = await new SignJWT(JWTPayload)
    .setProtectedHeader(headersRSA)
    .setIssuedAt()
    .setExpirationTime(expireIn)
    .sign(privateKey);

  return assertion;
}
