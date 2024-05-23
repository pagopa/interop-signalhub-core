import { findEServiceBy } from "../services/db.service.js";
import { getAgreementByPurposeId } from "../services/interop.service.js";

export const producerHasAgreementWithPushSignalEService = async (
  purposeId: string
) => {
  const { consumerId } = await getAgreementByPurposeId(purposeId);
  return consumerId;
};

export const isProducerEserviceOwned = async (
  producerId: string,
  eserviceId: string
): Promise<void> => {
  await findEServiceBy(producerId, eserviceId);
};
