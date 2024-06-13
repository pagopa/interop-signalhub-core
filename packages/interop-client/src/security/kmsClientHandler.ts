import {
  KMSClient,
  KMSClientConfig,
  SignCommand,
  SignCommandOutput,
  SignRequest,
  SigningAlgorithmSpec,
} from "@aws-sdk/client-kms";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config/env.js";
type Claims = {
  sub: string;
  iss: string;
  exp: number;
  iat: number;
  aud: string;
  jti: string;
};
export const kmsClientBuilder = (): { buildJWT: () => Promise<string> } => {
  const configuration: KMSClientConfig = {
    region: config.kmsRegion,
  };
  const kms: KMSClient = new KMSClient(configuration);

  return {
    async buildJWT(): Promise<string> {
      const token = createToken();
      const signRequest: SignRequest = {
        KeyId: config.kmsKeyId,
        Message: Buffer.from(token),
        SigningAlgorithm: "RSASSA_PKCS1_V1_5_SHA_256" as SigningAlgorithmSpec,
      };

      const signCommand = new SignCommand(signRequest);

      const result: SignCommandOutput = await kms.send(signCommand);

      if (!result.Signature) {
        throw Error("JWT Signature failed. Empty signature returned");
      }

      return `${token}.${removePadding(
        Buffer.from(result.Signature).toString("base64")
      )}`;
    },
  };
};

function removePadding(base64Text: string): string {
  return base64Text.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function createToken(): string {
  const header = createHeader();
  const payload = createPayload();

  return `${header}.${payload}`;
}

function createHeader(): string {
  const headerObj = {
    kid: config.keyId,
    typ: "at+jwt",
    use: "sig",
    alg: "RS256",
  };

  return removePadding(
    Buffer.from(JSON.stringify(headerObj)).toString("base64")
  );
}

function createPayload(): string {
  const { issuer, subject, audience, expiresInSec } = config;

  const currentTimeInSeconds = Math.floor(Date.now() / 1000);
  const expiresIn = currentTimeInSeconds + expiresInSec;

  const claims: Claims = {
    sub: subject,
    iss: issuer,
    exp: expiresIn,
    iat: currentTimeInSeconds,
    aud: audience,
    jti: uuidv4(),
  };

  return removePadding(Buffer.from(JSON.stringify(claims)).toString("base64"));
}
