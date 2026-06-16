import { Router } from "express";
import { search } from "./retrieval.controller.js";

const router: Router = Router();

router.post("/", search);

export { router };
