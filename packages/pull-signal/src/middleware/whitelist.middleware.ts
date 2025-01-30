import { NextFunction, Request, Response } from "express";
import { logger } from "pagopa-signalhub-commons";
import { match } from "ts-pattern";

import { config } from "../config/env.js";
import {
  makeApiProblem,
  notInWhitelistError as organizationIdNotInWhitelistError
} from "../model/domain/errors.js";

function isFeatureFlagEnabledAndOrganizationIdOnWhitelist(
  isFeatureFlagEnabled: boolean,
  organizationId: string,
  whitelist: string[] | undefined
) {
  return isFeatureFlagEnabled && whitelist?.includes(organizationId);
}
export const whitelistMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void | Response> => {
  const { serviceName, correlationId, sessionData } = request.ctx;

  const log = logger({
    serviceName,
    correlationId
  });

  try {
    const organizationId = sessionData.organizationId;
    const isFeatureFlaghShEnabled = config.featureFlagSignalhubWhitelist;

    if (
      !isFeatureFlaghShEnabled ||
      isFeatureFlagEnabledAndOrganizationIdOnWhitelist(
        isFeatureFlaghShEnabled,
        organizationId,
        config.signalhubWhitelist
      )
    ) {
      log.debug(
        `whitelist:middleware : ${organizationId} is on whitelist or feature flag SH WHITELIST is disabled`
      );
      return next();
    }

    throw organizationIdNotInWhitelistError(organizationId);
  } catch (error) {
    const problem = makeApiProblem(
      error,
      (err) =>
        match(err.code)
          .with("organizationIdNotInWhitelist", () => 403)
          .otherwise(() => 500),
      log,
      correlationId
    );

    return response.status(problem.status).json(problem).end();
  }
};
