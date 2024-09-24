import { Express } from "express";

export const setupHealthRoute = (app: Express): void => {
  app.get("/health", async (_, res) => res.status(200).end());
};
