import { AxiosPromise } from "axios";
import { apiClient } from "../../client.js";
import { Agreement } from "../../index.js";
import { getAuthorizationHeader } from "../../utils/index.js";

export const getAgreement = async (
  voucher: string,
  agreementId: string
): AxiosPromise<Agreement> =>
  await apiClient.agreements.getAgreement(
    agreementId,
    getAuthorizationHeader(voucher)
  );
