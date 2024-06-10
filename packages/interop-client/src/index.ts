import { generateClientAssertion } from "./client-assertion.js";
import { config } from "./config/interop-client.config.js";
import { obtainVoucher } from "./get-voucher.js";
import { getAgreementByPurposeId } from "./getAgreementByPurposeId.js";

export const getAgreementByPurpose = async (purposeId: string) => {
  try {
    const clientAssertion = await generateClientAssertion();

    const voucher = await obtainVoucher(config, clientAssertion);

    return await getAgreementByPurposeId(purposeId, voucher);
  } catch (error) {
    throw error;
  }
};
