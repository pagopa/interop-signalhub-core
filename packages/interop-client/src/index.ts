import { getClientAssertion } from "./get-client-assertion.js";
import { config } from "./config/env.js";
import { obtainVoucher } from "./get-voucher.js";
import { getAgreementByPurposeId } from "./getAgreementByPurposeId.js";

export const getAgreementByPurpose = async (purposeId: string) => {
  try {
    const clientAssertion = await getClientAssertion();

    const voucher = await obtainVoucher(config, clientAssertion);

    return await getAgreementByPurposeId(purposeId, voucher);
  } catch (error) {
    throw error;
  }
};
