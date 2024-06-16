import { getAgreementByPurpose } from "signalhub-interop-client";
import { Agreement } from "../model/domain/models.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function interopApiClientServiceBuilder() {
  return {
    async getAgreementByPurposeId(purposeId: string): Promise<Agreement> {
      const { data } = await getAgreementByPurpose(purposeId);
      return data as unknown as Agreement;
    },
  };
}

export type InteropApiClientService = ReturnType<
  typeof interopApiClientServiceBuilder
>;
