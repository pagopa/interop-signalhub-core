import { apiClient } from "./client.js";
import { getAuthorizationHeader } from "./utils/index.js";

export const getAgreementByPurposeId = async (
  purposeId: string,
  voucher: string
) => {
  await apiClient.purposes.getAgreementByPurpose(
    purposeId,
    getAuthorizationHeader(voucher)
  );
};
