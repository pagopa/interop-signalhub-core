import jwt, { JwtHeader, JwtPayload, SigningKeyCallback } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { Logger } from "../logging/index.js";
import { invalidClaim, jwtDecodingError } from "../errors/index.js";
import { SessionData, AuthToken } from "../models/index.js";
import { JWTConfig } from "../config/jwt.config.js";

export const getKey =
  (
    client: jwksClient.JwksClient,
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

export const validateToken = (
  token: string,
  config: JWTConfig,
  logger: Logger,
): Promise<{ success: boolean; err: jwt.JsonWebTokenError | null }> => {
  const client = jwksClient({
    jwksUri: config.wellKnownUrl,
  });

  return new Promise((resolve, _reject) => {
    jwt.verify(
      token,
      getKey(client),
      {
        audience: config.acceptedAudience,
      },
      function (err, _decoded) {
        if (err) {
          logger.warn(`Token verification failed: ${err}`);
          resolve({
            success: false,
            err: err,
          });
        }
        return resolve({
          success: true,
          err: null,
        });
      },
    );
  });
};
