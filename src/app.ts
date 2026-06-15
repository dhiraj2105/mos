import express from "express";
import { router as memoryRoutes } from "./modules/memory/memory.routes.js";
import { logger } from "./config/logger.js";

export default function createApp(): express.Application {
  const app = express();

  app.use(express.json());

  app.use(
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ): void => {
      logger.info(`${req.method} ${req.originalUrl}`);
      next();
    },
  );

  app.get("/health", (req: express.Request, res: express.Response): void => {
    res.json({ status: "ok" });
  });

  app.use("/memories", memoryRoutes);

  return app;
}
