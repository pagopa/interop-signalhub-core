import jwt, { JwtHeader, JwtPayload, Secret } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { Logger } from "../logging/index.js";
import { invalidClaim, jwtDecodingError } from "../errors/index.js";
import { SessionData, AuthToken } from "../models/index.js";
import { JWTConfig } from "../config/jwt.config.js";

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

const getPublicKey = async (
  token: string,
  jwkClient: jwksClient.JwksClient[],
  logger: Logger
): Promise<Secret> => {
  const clientList = jwkClient.map((c, i) => ({
    client: c,
    last: i === jwkClient.length - 1,
  }));
  for (const { client, last } of clientList) {
    try {
      const decoded = jwt.decode(token, { complete: true });
      const header = decoded?.header as JwtHeader;
      const key = await client.getSigningKey(header.kid);
      logger.debug(`Authentication::getPublicKey kid: ${header.kid}`);
      return key?.getPublicKey();
    } catch (error) {
      logger.debug(
        `Authentication::getPublicKey failed: ${JSON.stringify(error, null, 2)}`
      );
      if (error && last) {
        throw error;
      }
    }
  }
  return "";
};

export const validateToken = async (
  token: string,
  logger: Logger
): Promise<{ success: boolean; err: jwt.JsonWebTokenError | null }> => {
  const config = JWTConfig.parse(process.env);

  const clients = config.wellKnownUrls.map((url) =>
    jwksClient({
      jwksUri: url,
    })
  );
  try {
    const pubKey = await getPublicKey(token, clients, logger);
    return new Promise((resolve, _reject) => {
      jwt.verify(
        token,
        pubKey,
        {
          audience: config.acceptedAudience,
        },
        function (err, _decoded) {
          if (err) {
            logger.warn(`Authentication::validateToken, failed: ${err}`);
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
  } catch (error) {
    return new Promise((resolve, _reject) => {
      resolve({
        success: false,
        err: error as jwt.JsonWebTokenError,
      });
    });
  }
};
