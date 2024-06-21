import {
  getAccessToken,
  getAgreementByPurpose,
} from "signalhub-interop-client";
import { genericInternalError } from "signalhub-commons";
import { Agreement } from "../model/domain/models.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function interopApiClientServiceBuilder() {
  return {
    async getAgreementByPurposeId(
      purposeId: string
    ): Promise<Agreement | null> {
      try {
        const accessToken = await getAccessToken();
        const { data } = await getAgreementByPurpose(purposeId, accessToken);
        return data as unknown as Agreement;
      } catch (error) {
        throw genericInternalError(`Error getAgreementByPurpose: ${error}`);
      }
    },
  };
}

export type InteropApiClientService = ReturnType<
  typeof interopApiClientServiceBuilder
>;
