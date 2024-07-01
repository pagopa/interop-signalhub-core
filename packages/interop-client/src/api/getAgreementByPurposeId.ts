import { AxiosPromise } from "axios";
import { apiClient } from "../client.js";
import { getAuthorizationHeader } from "../auth/index.js";
import { Agreement } from "../index.js";

export const getAgreementByPurpose = async (
  purposeId: string,
  accessToken: string
): AxiosPromise<Agreement> =>
  await apiClient.purposes.getAgreementByPurpose(
    purposeId,
    getAuthorizationHeader(accessToken)
  );
