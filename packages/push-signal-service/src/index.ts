import express, { Express, Response } from "express";
import { authenticationMiddleware } from "signalhub-commons";
const app: Express = express();
const port = 3000;
app.use(authenticationMiddleware);

app.get("/", (_: any, res: Response) => {
  res.send("Hello signal-hub push!");
});

app.listen(port, () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line no-console
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
