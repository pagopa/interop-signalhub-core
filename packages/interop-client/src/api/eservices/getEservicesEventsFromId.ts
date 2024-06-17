import { AxiosPromise } from "axios";
import { apiClient } from "../../client.js";
import { getAuthorizationHeader } from "../../utils/index.js";
import { Events } from "../../index.js";

export const getEservicesEventsFromId = async (
  voucher: string,
  lastEventId: number,
  limit: number
): AxiosPromise<Events> =>
  await apiClient.events.getEservicesEventsFromId(
    {
      lastEventId,
      limit,
    },
    getAuthorizationHeader(voucher)
  );
