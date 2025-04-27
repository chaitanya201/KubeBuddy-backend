import Redis from "ioredis";
import appConfig from "../../config/appConfig";

let redisClient: Redis;

export const initRedis = async () => {
  redisClient = new Redis(appConfig.REDIS_URL);
  console.log("Redis connected");
};

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    throw new Error("Redis client is not initialized.");
  }
  return redisClient;
};

export const saveInRedis = async ({
  key,
  value,
}: {
  key: string;
  value: string;
}) => {
  const redisClient = getRedisClient();
  await redisClient.set(key, value, "EX", 60 * 60 * 24 * 7); // 7 days
};

export const getFromRedis = async (key: string) => {
  const redisClient = getRedisClient();
  const value = await redisClient.get(key);
  return value;
};

export const disconnectRedis = async () => {
  if (!redisClient) {
    throw new Error("Redis client is not initialized.");
  }
  await redisClient.quit();
};
