import { apiClient } from "../client.js";
import { getAccessToken, getAuthorizationHeader } from "../utils/index.js";

export const getAgreementByPurpose = async (purposeId: string) => {
  try {
    const voucher = await getAccessToken();

    return await apiClient.purposes.getAgreementByPurpose(
      purposeId,
      getAuthorizationHeader(voucher)
    );
  } catch (error) {
    throw error;
  }
};
