import fs from "fs";
import path from "path";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getActors() {
  const catalogInteropData = JSON.parse(
    Buffer.from(
      fs.readFileSync(path.resolve(__dirname, "../__mocks__/data.json")),
    ).toString(),
  );

  const signalProducer = catalogInteropData.PRODUCERS[0].organization;
  const eserviceProducer = catalogInteropData.PRODUCERS[1].organization;
  const signalConsumer = catalogInteropData.CONSUMERS[0].organization;
  const eserviceIdPushSignals = signalProducer.eservices[0].id;
  const eserviceIdSecondPushSignals = signalProducer.eservices[1].id;
  const eserviceIdNotAgreementWithConsumer = signalProducer.eservices[1].id;
  const eserviceNotPublished = signalProducer.eservices[2];
  const eserviceIdPublishedByAnotherOrganization =
    eserviceProducer.eservices[0].id;
  const purposeIdDifferentFromEservicePushSignals =
    signalProducer.agreements[1].purpose;

  const authorizedPurposeIdForPushSignals =
    signalProducer.agreements[0].purpose;

  const authorizedPurposeIdForPullSignals =
    signalConsumer.agreements[1].purpose;

  const consumerAgreementDraftState = signalConsumer.agreements[2];

  const eServiceWithNotActiveAgreement = signalProducer.eservices[2].id;
  return {
    authorizedPurposeIdForPullSignals,
    authorizedPurposeIdForPushSignals,
    consumerAgreementDraftState,
    eServiceWithNotActiveAgreement,
    eserviceIdNotAgreementWithConsumer,
    eserviceIdPublishedByAnotherOrganization,
    eserviceIdPushSignals,
    eserviceIdSecondPushSignals,
    eserviceNotPublished,
    eserviceProducer,
    purposeIdDifferentFromEservicePushSignals,
    signalConsumer,
    signalProducer,
  };
}

export const {
  authorizedPurposeIdForPullSignals,
  authorizedPurposeIdForPushSignals,
  consumerAgreementDraftState,
  eServiceWithNotActiveAgreement,
  eserviceIdNotAgreementWithConsumer,
  eserviceIdPublishedByAnotherOrganization,
  eserviceIdPushSignals,
  eserviceIdSecondPushSignals,
  eserviceNotPublished,
  eserviceProducer,
  purposeIdDifferentFromEservicePushSignals,
  signalConsumer,
  signalProducer,
} = getActors();
