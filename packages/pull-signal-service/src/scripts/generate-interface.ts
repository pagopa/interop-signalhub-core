import { generateOpenApi } from "@ts-rest/open-api";
import { writeFileSync } from "fs";
import * as yaml from "js-yaml";
import { contract } from "../contract/contract.js";

export const openApiDocument = generateOpenApi(contract, {
  info: {
    title: "Pull signal Service API",
    version: "1.0",
  },
});

writeFileSync(
  `interface/pull-signals_${openApiDocument.info.version}_.yaml`,
  yaml.dump(openApiDocument)
);
