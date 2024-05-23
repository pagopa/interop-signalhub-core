import { ServerInferResponses, ServerInferRequest } from "@ts-rest/core";
import { contract } from "../contract/contract.js";

type PSignalRequest = ServerInferRequest<typeof contract.pushSignal>;
type PSignalResponse = ServerInferResponses<typeof contract.pushSignal>;

export const pushSignalRoute = async (
  _request: PSignalRequest
): Promise<PSignalResponse> => {
  return {
    status: 200,
    body: {
      signalId: 1,
    },
  };
};
