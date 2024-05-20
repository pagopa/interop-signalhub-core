import jwt, { JwtHeader, SigningKeyCallback } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { Logger } from "../logging/index.js";

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
