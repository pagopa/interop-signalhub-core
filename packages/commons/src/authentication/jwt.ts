import jwt, { JwtHeader, JwtPayload, SigningKeyCallback } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { Logger } from "../logging/index.js";
import { invalidClaim, jwtDecodingError } from "../errors/index.js";
import { SessionData, AuthToken } from "./authentication.data.js";

export const getKey =
  (
    client: jwksClient.JwksClient
  ): ((header: JwtHeader, callback: SigningKeyCallback) => void) =>
  (header, callback) => {
    client.getSigningKey(header.kid, function (err, key) {
      if (err) {
        return callback(err, undefined);
      } else {
        return callback(null, key?.getPublicKey());
      }
    });
  };
const decodeJwtToken = (jwtToken: string): JwtPayload | null => {
  try {
    return jwt.decode(jwtToken, { json: true });
  } catch (err) {
    throw jwtDecodingError(err);
  }
};
export const readSessionDataFromJwtToken = (jwtToken: string): SessionData => {
  const decoded = decodeJwtToken(jwtToken);
  const token = AuthToken.safeParse(decoded);
  if (token.success === false) {
    throw invalidClaim(token.error);
  } else {
    return {
      purposeId: token.data.purposeId,
    };
  }
};

export const validateToken = (token: string, logger: Logger) => {
  const client = jwksClient({
    jwksUri: process.env.WELL_KNOWN_URL as string,
  });

  return new Promise((resolve, _reject) => {
    jwt.verify(
      token,
      getKey(client),
      {
        audience: process.env.ACCEPTED_AUDIENCE as string,
      },
      function (err, _decoded) {
        if (err) {
          logger.warn(`Token verification failed: ${err}`);
          return resolve(false);
        }
        return resolve(true);
      }
    );
  });
};
