import {
  AgreementEvent,
  encodeOutboundAgreementEvent,
} from "pagopa-interop-outbound-models";

const agreementEvent: AgreementEvent = {
  event_version: 2,
  stream_id: "1",
  timestamp: new Date(),
  version: 1,
  type: "AgreementAdded",
  data: {
    agreement: {
      id: "1234",
      certifiedAttributes: [],
      consumerDocuments: [],
      consumerId: "123",
      createdAt: 1n,
      declaredAttributes: [],
      descriptorId: "",
      eserviceId: "",
      producerId: "",
      verifiedAttributes: [],
      consumerNotes: "",
      contract: {
        contentType: "application/json",
        createdAt: 1n,
        id: "",
        name: "",
        prettyName: "",
      },
      rejectionReason: "",
      state: 1,
    },
  },
};

export function createFakeAgreementEvent(): AgreementEvent {
  return agreementEvent;
}

export function produceAgreementEvent(agreementEvent: AgreementEvent): string {
  return encodeOutboundAgreementEvent(agreementEvent);
}
