import {
  getAccessToken,
  getAgreementByPurpose,
} from "signalhub-interop-client";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function interopClientServiceBuilder() {
  return {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    async getAgreementByPurposeId(purposeId: string) {
      const accessToken = await getAccessToken();
      return await getAgreementByPurpose(purposeId, accessToken);
    },
  };
}

export type InteropClientService = ReturnType<
  typeof interopClientServiceBuilder
>;
