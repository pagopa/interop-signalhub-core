import express, { Express, Response } from "express";

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/", (_, res: Response) => {
  res.send("Hello signal-hub push!");
});

app.listen(port, () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line no-console
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
