import { getAgreementByPurposeId } from "../services/interop.service.js";

export const producerHasAgreementWithPushSignalEService = async (
  purposeId: string
) => {
  const { consumerId } = await getAgreementByPurposeId(purposeId);
  return consumerId;
};
