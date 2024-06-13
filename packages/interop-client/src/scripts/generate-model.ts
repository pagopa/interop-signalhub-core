import path from "path";
import { generateApi } from "swagger-typescript-api";

const openApiSpecificationFileUrl =
  "https://raw.githubusercontent.com/pagopa/interop-be-api-gateway/1.0.x/src/main/resources/interface-specification.yml";

const apiFolderPath = path.resolve("./src/models");

generateApi({
  name: "gateway.models.ts",
  url: openApiSpecificationFileUrl,
  output: apiFolderPath,
  generateClient: true,
  httpClientType: "axios",
  generateUnionEnums: true,
  extractRequestParams: true,
  extractRequestBody: true,
  generateRouteTypes: true,
  // eslint-disable-next-line no-console
}).catch((e) => console.error(e));
