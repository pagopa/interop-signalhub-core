import * as swaggerUi from "swagger-ui-express";
import express, { Express } from "express";
import { initServer, createExpressEndpoints } from "@ts-rest/express";
import { authenticationMiddleware, contextMiddleware } from "signalhub-commons";
import { contract } from "./contract/contract.js";
import { openApiDocument } from "./scripts/generate-interface.js";
import "./config/env.js";
import { pushController } from "./controllers/push.controller.js";
import { authorizationMiddleware } from "./authorization/authorization.middleware.js";

const app: Express = express();
const server = initServer();

app.use(express.json());

const routes = server.router(contract, {
  pushSignal: pushController,
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

createExpressEndpoints(contract, routes, app, {
  globalMiddleware: [
    contextMiddleware,
    authenticationMiddleware,
    authorizationMiddleware,
  ],
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
