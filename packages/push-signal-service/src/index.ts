import express, { Express, Response } from "express";
import { authenticationMiddleware, contextMiddleware } from "signalhub-commons";
import { authorizationMiddleware } from "./authorization/authorization.middleware.js";
import "./config/env.js";

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(contextMiddleware);
app.use(authenticationMiddleware);
app.use(authorizationMiddleware);

app.post("/", (_: unknown, res: Response) => {
  res.send("Hello signal-hub push!");
});

app.listen(port, () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line no-console
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
