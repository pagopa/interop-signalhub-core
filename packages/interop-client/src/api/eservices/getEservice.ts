import { AxiosPromise } from "axios";
import { apiClient } from "../../client.js";
import { getAuthorizationHeader } from "../../utils/index.js";
import { EService } from "../../index.js";

export const getEservice = async (
  voucher: string,
  eServiceId: string
): AxiosPromise<EService> =>
  await apiClient.eservices.getEService(
    eServiceId,
    getAuthorizationHeader(voucher)
  );
