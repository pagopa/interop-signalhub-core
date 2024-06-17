import { AxiosPromise } from "axios";
import { apiClient } from "../../client.js";
import { getAuthorizationHeader } from "../../utils/index.js";
import { Events, GetAgreementsEventsFromIdParams } from "../../index.js";

export const getAgreementsEventsFromId = async (
  voucher: string,
  params: GetAgreementsEventsFromIdParams
): AxiosPromise<Events> =>
  await apiClient.events.getAgreementsEventsFromId(
    {
      lastEventId: params.lastEventId,
      limit: params.limit,
    },
    getAuthorizationHeader(voucher)
  );
