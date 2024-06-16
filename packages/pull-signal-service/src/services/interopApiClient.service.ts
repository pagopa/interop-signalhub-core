import { getAgreementByPurpose } from "signalhub-interop-client";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function interopApiClientServiceBuilder() {
  return {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    async getAgreementByPurposeId(purposeId: string) {
      return await getAgreementByPurpose(purposeId);
    },
  };
}

export type InteropApiClientService = ReturnType<
  typeof interopApiClientServiceBuilder
>;
