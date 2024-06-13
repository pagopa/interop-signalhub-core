import { getAgreementByPurpose } from "signalhub-interop-client";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function interopClientServiceBuilder() {
  return {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    async getAgreementByPurposeId(purposeId: string) {
      return await getAgreementByPurpose(purposeId);
    },
  };
}

export type InteropClientService = ReturnType<
  typeof interopClientServiceBuilder
>;
