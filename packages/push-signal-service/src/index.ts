import * as swaggerUi from "swagger-ui-express";
import express, { Express, Response } from "express";
import { initServer, createExpressEndpoints } from "@ts-rest/express";
import { authenticationMiddleware, contextMiddleware } from "signalhub-commons";
import { authorizationMiddleware } from "./authorization/authorization.middleware.js";
import "./config/env.js";
import { contract } from "./contract/contract.js";
import { pushSignalRoute } from "./routes/push.route.js";
import { openApiDocument } from "./scripts/generate-interface.js";

const app: Express = express();
const server = initServer();

const routes = server.router(contract, {
  pushSignal: pushSignalRoute,
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.post("/", (_: unknown, res: Response) => {
  res.send("Hello signal-hub push!");
});

createExpressEndpoints(contract, routes, app, {
  globalMiddleware: [
    contextMiddleware,
    authenticationMiddleware,
    authorizationMiddleware,
  ],
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line no-console
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
