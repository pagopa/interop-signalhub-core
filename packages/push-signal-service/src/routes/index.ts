import { Router } from "express";
import { pushController } from "../controllers/push.controller.js";

// Create a new Router instance
const router = Router();

// Mount the routers
router.post("/push", pushController);

export default router;
