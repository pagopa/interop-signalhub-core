import { apiClient } from "../../client.js";
import { getAuthorizationHeader } from "../../utils/index.js";

export const getEServicesEventsFromId = async (
  voucher: string,
  lastEventId: number
) =>
  await apiClient.events.getEservicesEventsFromId(
    {
      lastEventId,
      limit: 500,
    },
    getAuthorizationHeader(voucher)
  );
