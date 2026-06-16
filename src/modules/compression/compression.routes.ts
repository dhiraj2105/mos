import { Router } from "express";
import { compress } from "./compression.controller.js";

const router: Router = Router();

router.post("/", compress);

export { router };
