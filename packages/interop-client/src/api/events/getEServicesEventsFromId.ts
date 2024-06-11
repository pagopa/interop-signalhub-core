import { apiClient } from "../../client.js";
import { getAuthorizationHeader } from "../../utils/index.js";

export const getEServicesEventsFromId = async (
  voucher: string,
  lastEventId: number
) => {
  return await apiClient.events.getEservicesEventsFromId(
    {
      lastEventId: lastEventId,
      limit: 500,
    },
    getAuthorizationHeader(voucher)
  );
};
