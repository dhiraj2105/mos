import { Router } from "express";
import { context } from "./context.controller.js";

const router: Router = Router();

router.post("/", context);

export { router };
