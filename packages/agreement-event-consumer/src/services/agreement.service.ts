/* eslint-disable @typescript-eslint/no-unused-vars */
import { Agreement } from "pagopa-signalhub-commons";
import { IAgreementRepository } from "../repositories/agreement.repository.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function agreementServiceBuilder(
  _agreementRepository: IAgreementRepository
) {
  return {
    async updateAgreement(_agreement: Agreement): Promise<void> {
      // some business logic
    },
  };
}

export type AgreementService = ReturnType<typeof agreementServiceBuilder>;
