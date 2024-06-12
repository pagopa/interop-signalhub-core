import { AxiosResponse } from "axios";
import { apiClient } from "../client.js";
import { getClientAssertion } from "../auth/get-client-assertion.js";
import { getVoucher } from "../auth/get-voucher.js";
import { getAuthorizationHeader } from "../utils/index.js";
import { Agreement } from "../models/gateway.models.js";

export const getAgreementByPurpose = async (
  purposeId: string
): Promise<AxiosResponse<Agreement, unknown>> => {
  const clientAssertion = await getClientAssertion();
  const voucher = await getVoucher(clientAssertion);

  return await apiClient.purposes.getAgreementByPurpose(
    purposeId,
    getAuthorizationHeader(voucher)
  );
};
