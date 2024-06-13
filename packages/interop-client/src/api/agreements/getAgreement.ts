import { apiClient } from "../../client.js";
import { getAuthorizationHeader } from "../../utils/index.js";

export const getAgreement = async (voucher: string, agreementId: string) => {
  try {
    return await apiClient.agreements.getAgreement(
      agreementId,
      getAuthorizationHeader(voucher)
    );
  } catch (error) {
    throw error;
  }
};
