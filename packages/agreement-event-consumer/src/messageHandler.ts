/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger } from "pagopa-signalhub-commons";
import { AgreementEvent } from "pagopa-interop-outbound-models";
import { AgreementService } from "./services/agreement.service.js";

export function handleMessageV1(
  agreementEvent: AgreementEvent,
  _agreementService: AgreementService,
  logger: Logger
): any {
  logger.info(`Processing event version: ${agreementEvent.event_version}`);
}

export function handleMessageV2(
  agreementEvent: AgreementEvent,
  _agreementService: AgreementService,
  logger: Logger
): any {
  logger.info(`Processing event version: ${agreementEvent.event_version}`);
}
