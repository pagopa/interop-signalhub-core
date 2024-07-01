import { AxiosPromise } from "axios";
import { apiClient } from "../../client.js";
import { getAuthorizationHeader } from "../../auth/index.js";
import { Events, GetEservicesEventsFromIdParams } from "../../index.js";

export const getEServicesEventsFromId = async (
  voucher: string,
  params: GetEservicesEventsFromIdParams
): AxiosPromise<Events> =>
  await apiClient.events.getEservicesEventsFromId(
    {
      lastEventId: params.lastEventId,
      limit: params.limit,
    },
    getAuthorizationHeader(voucher)
  );
