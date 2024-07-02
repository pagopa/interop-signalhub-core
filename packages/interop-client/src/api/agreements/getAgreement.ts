import { AxiosPromise } from "axios";
import { apiClient } from "../../client.js";
import { Agreement } from "../../index.js";
import { getAuthorizationHeader } from "../../auth/index.js";

export const getAgreement = async (
  voucher: string,
  agreementId: string
): AxiosPromise<Agreement> =>
  await apiClient.agreements.getAgreement(
    agreementId,
    getAuthorizationHeader(voucher)
  );
