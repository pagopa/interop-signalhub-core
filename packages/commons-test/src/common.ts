import fs from "fs";
import path from "path";

function getActors() {
  const catalogInteropData = JSON.parse(
    Buffer.from(
      fs.readFileSync(path.resolve(__dirname, "../data/data.json"))
    ).toString()
  );

  const signalProducer = catalogInteropData.PRODUCERS[0].organization;
  const eserviceProducer = catalogInteropData.PRODUCERS[1].organization;
  const signalConsumer = catalogInteropData.CONSUMERS[0].organization;
  const eserviceIdPushSignals = signalProducer.eservices[0].id;
  const eserviceIdSecondPushSignals = signalProducer.eservices[1].id;
  const eserviceIdNotAgreementWithConsumer = signalProducer.eservices[1].id;
  const eserviceIdNotPublished = signalProducer.eservices[2].id;
  const eserviceIdPublishedByAnotherOrganization =
    eserviceProducer.eservices[0].id;
  const purposeIdDifferentFromEservicePushSignals =
    signalProducer.agreements[1].purpose;
  return {
    signalProducer,
    signalConsumer,
    eserviceProducer,
    eserviceIdPushSignals,
    eserviceIdSecondPushSignals,
    eserviceIdNotAgreementWithConsumer,
    eserviceIdNotPublished,
    eserviceIdPublishedByAnotherOrganization,
    purposeIdDifferentFromEservicePushSignals,
  };
}

export const {
  signalProducer,
  signalConsumer,
  eserviceProducer,
  eserviceIdPushSignals,
  eserviceIdSecondPushSignals,
  eserviceIdNotAgreementWithConsumer,
  eserviceIdNotPublished,
  eserviceIdPublishedByAnotherOrganization,
  purposeIdDifferentFromEservicePushSignals,
} = getActors();
