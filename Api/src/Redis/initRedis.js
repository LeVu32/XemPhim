import { createClient } from "redis";

let redisClient;

export async function initializeRedisClient() {
  // Read the Redis connection URL from the environment variables
  const redisURL = process.env.REDIS_URI;
  if (!redisURL) {
    console.error("REDIS_URI environment variable is not set.");
    return;
  }

  // Create the Redis client object
  redisClient = createClient({ url: redisURL });

  // Set up an error handler
  redisClient.on("error", (e) => {
    console.error(`Failed to create the Redis client with error:`);
    console.error(e);
  });

  try {
    // Connect to the Redis server
    await redisClient.connect();
    console.log(`Connected to Redis successfully!`);
  } catch (e) {
    console.error(`Connection to Redis failed with error:`);
    console.error(e);
  }
}

export const cacheOtp = async (key, value) => {
  if (!redisClient) {
    console.error("Redis client is not initialized.");
    return;
  }
  try {
    // Set the key-value pair in the Redis cache with expiration time
    await redisClient.set(key, value, { EX: 60 * 5 });
    console.log(`Cached OTP for key ${key}`);
  } catch (e) {
    console.error(`Failed to cache OTP with error:`);
    console.error(e);
  }
};

export const getOtp = async (key) => {
  if (!redisClient) {
    console.error("Redis client is not initialized.");
    return null;
  }
  try {
    // Get the value associated with the key from the Redis cache
    const value = await redisClient.get(key);
    console.log(`Retrieved OTP for key ${key}`);
    return value;
  } catch (e) {
    console.error(`Failed to retrieve OTP with error:`);
    console.error(e);
    return null;
  }
};
export const deleteOtp = async (key) => {
  if (!redisClient) {
    console.error("Redis client is not initialized.");
    return;
  }
  try {
    // Delete the key from the Redis cache
    await redisClient.del(key);
    console.log(`Deleted OTP for key ${key}`);
  } catch (e) {
    console.error(`Failed to delete OTP with error:`);
    console.error(e);
  }
};

export default { cacheOtp, getOtp, deleteOtp };
