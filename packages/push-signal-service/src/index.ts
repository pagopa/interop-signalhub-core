import * as swaggerUi from "swagger-ui-express";
import express, { Express } from "express";
import { initServer, createExpressEndpoints } from "@ts-rest/express";
import { authenticationMiddleware, contextMiddleware } from "signalhub-commons";
import { authorizationMiddleware } from "./authorization/authorization.middleware.js";
import router from "./routes/index.js";
import { contract } from "./contract/contract.js";
import { pushSignalRoute } from "./routes/push.route.js";
import { openApiDocument } from "./scripts/generate-interface.js";
import "./config/env.js";

const app: Express = express();
const server = initServer();

const routes = server.router(contract, {
  pushSignal: pushSignalRoute,
});

app.use(contextMiddleware);
app.use(authenticationMiddleware);
app.use(authorizationMiddleware);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.use("/", router);

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
