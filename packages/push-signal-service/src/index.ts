import express, { Express, Response, Request } from "express";
import { authenticationMiddleware, contextMiddleware } from "signalhub-commons";
import { authorizationMiddleware } from "./authorization/authorization.middleware.js";
import router from "./routes/index.ts.js";
import "./config/env.js";

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(contextMiddleware);
app.use(authenticationMiddleware);
app.use(authorizationMiddleware);
app.use("/", router);

app.post("/", (_request: Request, res: Response) => {
  res.send("Hi!");
});

app.listen(port, () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line no-console
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
