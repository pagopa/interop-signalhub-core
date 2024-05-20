import { Response, Request, NextFunction } from "express";
import { validateToken } from "./jwt.js";

export const authenticationMiddleware = async (
  req: Request,
  _response: Response,
  next: NextFunction
) => {
  const addCtxAuthData = async (
    authHeader: string
    // logger:  Add logger
  ): Promise<void> => {
    const authorizationHeader = authHeader.split(" ");
    if (
      authorizationHeader.length !== 2 ||
      authorizationHeader[0] !== "Bearer"
    ) {
      // logger.warn(
      //   `No authentication has been provided for this call ${req.method} ${req.url}`
      // );
      throw Error("Missing bearer");
    }

    const jwtToken = authorizationHeader[1];
    const valid = await validateToken(jwtToken);
    if (!valid) {
      throw Error("Invalid token");
    }

    // const authData: AuthData = readAuthDataFromJwtToken(jwtToken);
    // eslint-disable-next-line functional/immutable-data
    // req.ctx.authData = authData;
    next();
  };

  next();
};
