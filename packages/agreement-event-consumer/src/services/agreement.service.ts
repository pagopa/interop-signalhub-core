/* eslint-disable @typescript-eslint/no-unused-vars */
import { Agreement, Logger } from "pagopa-signalhub-commons";
import { IAgreementRepository } from "../repositories/agreement.repository.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function agreementServiceBuilder(
  _agreementRepository: IAgreementRepository
) {
  return {
    async update(agreement: Agreement, logger: Logger): Promise<void> {
      // some business logic
      logger.info(`updating event: ${JSON.stringify(agreement)}`);
    },
    async delete(agreementId: string, logger: Logger): Promise<void> {
      // some business logic
      logger.info(`deleting event: ${JSON.stringify(agreementId)}`);
    },
  };
}

export type AgreementService = ReturnType<typeof agreementServiceBuilder>;
