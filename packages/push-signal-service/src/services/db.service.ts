import fs from "fs";
import { operationForbidden } from "signalhub-commons";

export const findEServiceBy = async (
  producerId: string,
  eserviceId: string
): Promise<void> => {
  const jsonResponse = JSON.parse(
    Buffer.from(fs.readFileSync("./src/data/table.json")).toString()
  );

  if (
    jsonResponse[eserviceId] &&
    jsonResponse[eserviceId].producerId === producerId &&
    jsonResponse[eserviceId].state === "PUBLISHED"
  ) {
    return;
  }

  throw operationForbidden;
};
