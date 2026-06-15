import { PORT } from "./config/env.js";
import createApp from "./app.js";
import { logger } from "./config/logger.js";

const app = createApp();

process.on("uncaughtException", (error: Error) => {
  logger.error(error);
});

process.on("unhandledRejection", (reason: unknown) => {
  logger.error(`Unhandled Rejection: ${String(reason)}`);
});

app.listen(PORT, (): void => {
  logger.info(`Server running on port ${PORT}`);
});
