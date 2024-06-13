import { apiClient } from "../../client.js";
import { Agreement } from "../../index.js";
import { getAuthorizationHeader } from "../../utils/index.js";

export const getAgreement = async (
  voucher: string,
  agreementId: string
): Promise<Agreement> => {
  try {
    return await apiClient.agreements.getAgreement(
      agreementId,
      getAuthorizationHeader(voucher)
    );
  } catch (error) {
    throw error;
  }
};
