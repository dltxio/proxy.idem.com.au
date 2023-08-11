import Redis from "ioredis";

let _redisClient: Redis;

export const redisClient = () => {
    if (!_redisClient) {
        _redisClient = new Redis(process.env.REDIS_URL);
    }
    return _redisClient;
};

export const getCache = async <T>(key: string): Promise<T | undefined> => {
    const result = await redisClient().get(key);
    return JSON.parse(result);
};

export const setCache = async <T>(
    key: string,
    value: T,
    seconds: string | number
) => {
    await redisClient().set(key, JSON.stringify(value), "EX", seconds);
};
