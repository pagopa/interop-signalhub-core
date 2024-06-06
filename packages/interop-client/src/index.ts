import { generateClientAssertion } from "./client-assertion.js";
import { config } from "./config/interop-client.config.js";
import { obtainVoucher } from "./get-voucher.js";
import { getAgreementByPurposeId } from "./getAgreementByPurposeId.js";

export const hasUserAnAgreement = async (purposeId: string) => {
  // Define client assertion
  const clientAssertion = await generateClientAssertion(config);
  // Retrieve voucher
  const voucher = await obtainVoucher(config, clientAssertion);

  await getAgreementByPurposeId(purposeId, voucher);
};
