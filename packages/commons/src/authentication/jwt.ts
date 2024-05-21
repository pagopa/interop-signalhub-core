import jwt, { JwtHeader, JwtPayload, SigningKeyCallback } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { Logger } from "../logging/index.js";
import { invalidClaim, jwtDecodingError } from "../errors/index.js";
import { AuthData, AuthToken, getAuthDataFromToken } from "./authData.js";
// import { AuthData } from "./authData.js";

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
export const readAuthDataFromJwtToken = (jwtToken: string): AuthData => {
  const decoded = decodeJwtToken(jwtToken);
  console.log("decoded", decoded);
  const token = AuthToken.safeParse(decoded);
  console.log("token", token);
  if (token.success === false) {
    throw invalidClaim(token.error);
  } else {
    return getAuthDataFromToken(token.data);
  }
};

export const validateToken = (token: string, logger: Logger) => {
  console.log("process.env", process.env);
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
