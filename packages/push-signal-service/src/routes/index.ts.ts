import { Router } from "express";
import { rootController } from "../controllers/root.controller.js";
import { pushByConsumersController } from "../controllers/push.by.consumers.controller.js";
import { pushController } from "../controllers/push.controller.js";

// Create a new Router instance
const router = Router();

// Mount the routers
router.post("/", rootController);
router.post("/push", pushController);
router.post("/push-by-consumers", pushByConsumersController);

export default router;
