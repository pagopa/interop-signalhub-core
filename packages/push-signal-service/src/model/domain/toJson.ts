import { SignalMessage } from "signalhub-commons";
import fastJson from "fast-json-stringify";

const signalMessageToJson = (signalMessage: SignalMessage): string => {
  const jsonSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Signal Message Schema",
    type: "object",
    properties: {
      correlationId: {
        type: "string",
      },
      signalId: {
        type: "number",
      },
      objectId: {
        type: "string",
      },
      eserviceId: {
        type: "string",
      },
      objectType: {
        type: "string",
      },
      signalType: {
        enum: ["CREATE", "UPDATE", "DELETE", "SEEDUPDATE"],
      },
    },
    required: [
      "correlationId",
      "objectId",
      "eserviceId",
      "signalId",
      "objectType",
      "signalType",
    ],
  };
  const stringify = fastJson(jsonSchema);
  return stringify(signalMessage);
};

export default signalMessageToJson;
