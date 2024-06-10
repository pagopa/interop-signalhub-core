import { getAgreementByPurpose } from "signalhub-interop-client";

export function interopClientServiceBuilder() {
  return {
    async getAgreementByPurposeId(purposeId: string) {
      return await getAgreementByPurpose(purposeId);
    },
  };
}

export type InteropClientService = ReturnType<
  typeof interopClientServiceBuilder
>;
