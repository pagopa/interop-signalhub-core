import { AxiosPromise } from "axios";
import { apiClient } from "../client.js";
import { getAccessToken, getAuthorizationHeader } from "../utils/index.js";
import { Agreement } from "../index.js";

export const getAgreementByPurpose = async (
  purposeId: string
): AxiosPromise<Agreement> => {
  const voucher = await getAccessToken();

  return await apiClient.purposes.getAgreementByPurpose(
    purposeId,
    getAuthorizationHeader(voucher)
  );
};
