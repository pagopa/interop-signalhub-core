import { getAgreementByPurpose } from "signalhub-interop-client";
import { Agreement } from "../model/domain/models.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function interopApiClientServiceBuilder() {
  return {
    async getAgreementByPurposeId(
      purposeId: string
    ): Promise<Agreement | null> {
      try {
        const { data } = await getAgreementByPurpose(purposeId);
        return data as unknown as Agreement;
      } catch (error) {
        // TODO: handle error
      }
      return null;
    },
  };
}

export type InteropApiClientService = ReturnType<
  typeof interopApiClientServiceBuilder
>;
