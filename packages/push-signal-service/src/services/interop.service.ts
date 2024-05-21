import { z } from "zod";
import fs from "fs";
import { operationForbidden } from "signalhub-commons";

export const Agreement = z.object({
  purposeId: z.string(),
  eServiceId: z.string(),
  producerId: z.string(),
  consumerId: z.string(),
  descriptorId: z.string(),
  state: z.string(),
});

export type Agreement = z.infer<typeof Agreement>;

export const getAgreementByPurposeId = async (
  purposeId: string
): Promise<Agreement> => {
  const jsonResponse = JSON.parse(
    Buffer.from(fs.readFileSync("./src/data/data.json")).toString()
  );

  if (jsonResponse[purposeId]) {
    return jsonResponse[purposeId];
  } else {
    throw operationForbidden;
  }
};
