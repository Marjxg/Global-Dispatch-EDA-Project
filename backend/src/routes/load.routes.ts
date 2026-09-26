import { Router } from "express";
import { acceptLoad } from "../controllers/load.controller.js";

const router = Router();

router.post("/:id/accept", acceptLoad);

export default router;