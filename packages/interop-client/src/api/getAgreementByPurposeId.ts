import { apiClient } from "../client.js";
import { getClientAssertion } from "../auth/get-client-assertion.js";
import { getVoucher } from "../auth/get-voucher.js";
import { getAuthorizationHeader } from "../utils/index.js";

export const getAgreementByPurpose = async (purposeId: string) => {
  try {
    const clientAssertion = await getClientAssertion();
    const voucher = await getVoucher(clientAssertion);

    return await apiClient.purposes.getAgreementByPurpose(
      purposeId,
      getAuthorizationHeader(voucher),
    );
  } catch (error) {
    throw error;
  }
};
