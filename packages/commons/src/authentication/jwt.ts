import jwt, { JwtHeader, JwtPayload, SigningKeyCallback } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { Logger } from "../logging/index.js";
import { invalidClaim, jwtDecodingError } from "../errors/index.js";
import { SessionData, AuthToken } from "../models/index.js";
import { JWTConfig } from "../config/jwt.config.js";

const getKey =
  (
    clients: jwksClient.JwksClient[],
    logger: Logger
  ): ((header: JwtHeader, callback: SigningKeyCallback) => void) =>
  (header, callback) => {
    for (const { client, last } of clients.map((c, i) => ({
      client: c,
      last: i === clients.length - 1,
    }))) {
      client.getSigningKey(header.kid, function (err, key) {
        if (err && last) {
          logger.error(`Error getting signing key: ${err}`);
          return callback(err, undefined);
        } else {
          const signKey = key?.getPublicKey();
          if (signKey) {
            return callback(null, signKey);
          }
        }
      });
    }
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

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeJwtToken(token);
  const currentDate = Date.now() / 1000;
  return decoded?.exp ? decoded.exp < currentDate : true;
};

export const validateToken = (
  token: string,
  logger: Logger
): Promise<{ success: boolean; err: jwt.JsonWebTokenError | null }> => {
  const config = JWTConfig.parse(process.env);

  const clients = config.wellKnownUrls.map((url) =>
    jwksClient({
      jwksUri: url,
    })
  );

  return new Promise((resolve, _reject) => {
    jwt.verify(
      token,
      getKey(clients, logger),
      {
        audience: config.acceptedAudience,
      },
      function (err, _decoded) {
        if (err) {
          logger.warn(`Token verification failed: ${err}`);
          resolve({
            success: false,
            err,
          });
        }
        return resolve({
          success: true,
          err: null,
        });
      }
    );
  });
};
