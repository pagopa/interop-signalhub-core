import { AxiosPromise } from "axios";
import { apiClient } from "../../client.js";
import { getAuthorizationHeader } from "../../auth/index.js";
import { EServiceDescriptor } from "../../index.js";

export const getEServiceDescriptor = async (
  voucher: string,
  eServiceId: string,
  descriptorId: string
): AxiosPromise<EServiceDescriptor> =>
  await apiClient.eservices.getEServiceDescriptor(
    eServiceId,
    descriptorId,
    getAuthorizationHeader(voucher)
  );
