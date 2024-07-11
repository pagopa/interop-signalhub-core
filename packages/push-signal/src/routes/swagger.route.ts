import * as swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { openApiDocument } from "../api/generate-api.js";

export const setupSwaggerRoute = (app: Express): void => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
};
