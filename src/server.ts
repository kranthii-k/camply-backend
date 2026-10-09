import "dotenv/config";
import http from "http";
import { initSocket } from "./config/socket";
import { connectRedis, redisClient } from "./config/redis";
import { assertProductionEnvironment } from "./config/production";
import logger from "./config/logger";

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  assertProductionEnvironment();

  // Redis is optional in development but required for production requests.
  try {
    await connectRedis();
  } catch (err) {
    logger.warn("Redis unavailable – running without cache", err);
  }

  if (process.env.NODE_ENV === "production" && !redisClient.isReady) {
    throw new Error("Redis must be available in production");
  }

  // Import app AFTER Redis is connected so rate-limit-redis can load its script
  const { default: app } = await import("./app");

  const httpServer = http.createServer(app);
  await initSocket(httpServer);

  httpServer.listen(PORT, () => {
    logger.info(`🚀 Camply API running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
}

bootstrap().catch((err) => {
  logger.error("Fatal startup error", err);
  process.exit(1);
});
