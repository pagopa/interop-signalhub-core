import { AxiosPromise } from "axios";
import { apiClient } from "../../client.js";
import { getAuthorizationHeader } from "../../utils/index.js";
import { Events } from "../../index.js";

export const getAgreementsEventsFromId = async (
  voucher: string,
  lastEventId: number
): AxiosPromise<Events> =>
  await apiClient.events.getAgreementsEventsFromId(
    {
      lastEventId,
      limit: 500,
    },
    getAuthorizationHeader(voucher)
  );
