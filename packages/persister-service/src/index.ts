import express, { Express } from "express";

const app: Express = express();

const port = 3001;

app.listen(port, () => {
  console.log("Hello Persister service!");
});
