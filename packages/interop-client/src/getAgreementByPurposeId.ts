import { apiClient } from "./api/client.js";
import { getAuthorizationHeader } from "./utils/index.js";

export const getAgreementByPurposeId = async (
  purposeId: string,
  voucher: string
) => {
  return await apiClient.purposes.getAgreementByPurpose(
    purposeId,
    getAuthorizationHeader(voucher)
  );
};
