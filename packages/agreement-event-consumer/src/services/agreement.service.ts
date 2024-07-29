/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger } from "pagopa-signalhub-commons";
import { IAgreementRepository } from "../repositories/agreement.repository.js";
import { AgreementEntity } from "../models/domain/model.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function agreementServiceBuilder(
  _agreementRepository: IAgreementRepository
) {
  return {
    async update(agreement: AgreementEntity, logger: Logger): Promise<void> {
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
