import express, { Express } from "express";
import { authenticationMiddleware, contextMiddleware } from "signalhub-commons";
import { authorizationMiddleware } from "./authorization/authorization.middleware.js";
import router from "./routes/index.js";
import "./config/env.js";

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(contextMiddleware);
app.use(authenticationMiddleware);
app.use(authorizationMiddleware);
app.use("/", router);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
