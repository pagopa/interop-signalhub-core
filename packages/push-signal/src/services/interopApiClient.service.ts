import {
  getAccessToken,
  getAgreementByPurpose,
} from "pagopa-signalhub-interop-client";
import { genericInternalError, isTokenExpired } from "pagopa-signalhub-commons";
import { Agreement } from "../models/domain/models.js";

// eslint-disable-next-line functional/no-let
let cachedVoucher: string | null;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function interopApiClientServiceBuilder() {
  return {
    async getAgreementByPurposeId(
      purposeId: string
    ): Promise<Agreement | null> {
      try {
        const accessToken = await getCachedVoucher();
        const { data } = await getAgreementByPurpose(purposeId, accessToken);
        return data as unknown as Agreement;
      } catch (error) {
        // TODO: manage expired voucher
        throw genericInternalError(`Error getAgreementByPurpose: ${error}`);
      }
    },
  };
}

export type InteropApiClientService = ReturnType<
  typeof interopApiClientServiceBuilder
>;

async function getCachedVoucher(): Promise<string> {
  if (cachedVoucher && !isTokenExpired(cachedVoucher)) {
    return cachedVoucher;
  }
  cachedVoucher = await getAccessToken();
  return cachedVoucher;
}
