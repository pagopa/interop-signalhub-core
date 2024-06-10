import * as swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { openApiDocument } from "../scripts/generate-interface.js";

export const setupSwaggerRoute = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
};
