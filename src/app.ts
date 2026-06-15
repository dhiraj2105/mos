import express from "express";

export default function createApp(): express.Application {
  const app = express();

  app.use(express.json());

  app.get("/health", (req: express.Request, res: express.Response): void => {
    res.json({ status: "ok" });
  });

  return app;
}
