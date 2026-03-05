import Redis from 'ioredis';

// ---------------------------------------------------------------------------
// Redis client — single shared instance (singleton)
// ---------------------------------------------------------------------------
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redis: Redis | null = null;
let redisConnected = false;

function getRedisClient(): Redis | null {
    if (redis) return redis;

    try {
        redis = new Redis(REDIS_URL, {
            // Don't keep retrying forever if Redis is not available
            maxRetriesPerRequest: 1,
            enableReadyCheck: true,
            lazyConnect: false,
        });

        redis.on('connect', () => {
            redisConnected = true;
            console.log('✅ Redis connected:', REDIS_URL.replace(/:\/\/.*@/, '://***@'));
        });

        redis.on('error', (err) => {
            if (redisConnected) {
                console.warn('⚠️  Redis connection error:', err.message);
            }
            redisConnected = false;
        });

        redis.on('close', () => {
            redisConnected = false;
        });

        return redis;
    } catch (err) {
        console.warn('⚠️  Redis init failed — caching disabled:', err);
        return null;
    }
}

// Initialise immediately so the connection is ready before the first request
getRedisClient();

// ---------------------------------------------------------------------------
// Default TTLs (seconds)
// ---------------------------------------------------------------------------
const DEFAULT_TTL = 300; // 5 minutes

// ---------------------------------------------------------------------------
// Public cache helpers  (drop-in replacement for node-cache API)
// ---------------------------------------------------------------------------

/** Retrieve a cached value. Returns undefined on miss or when Redis is down. */
export async function cacheGet<T>(key: string): Promise<T | undefined> {
    const client = redis;
    if (!client || !redisConnected) {
        console.log(`[Cache MISS] ${key} (Redis unavailable — using MongoDB)`);
        return undefined;
    }
    try {
        const raw = await client.get(key);
        if (raw === null) {
            console.log(`[Cache MISS] ${key}`);
            return undefined;
        }
        console.log(`[Cache HIT ] ${key}`);
        return JSON.parse(raw) as T;
    } catch (err) {
        console.warn('[Cache] GET error:', err);
        return undefined;
    }
}

/** Store a value with an optional TTL in seconds (default 300 s). */
export async function cacheSet<T>(key: string, value: T, ttlSeconds: number = DEFAULT_TTL): Promise<void> {
    const client = redis;
    if (!client || !redisConnected) return;
    try {
        await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
        console.warn('[Cache] SET error:', err);
    }
}

/** Delete one or more exact cache keys. */
export async function cacheDel(...keys: string[]): Promise<void> {
    const client = redis;
    if (!client || !redisConnected || keys.length === 0) return;
    try {
        await client.del(...keys);
    } catch (err) {
        console.warn('[Cache] DEL error:', err);
    }
}

/** Delete all keys whose name starts with a given prefix (uses SCAN — safe for production). */
export async function cacheDelByPrefix(prefix: string): Promise<void> {
    const client = redis;
    if (!client || !redisConnected) return;
    try {
        let cursor = '0';
        const keysToDelete: string[] = [];

        do {
            const [nextCursor, keys] = await client.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', 100);
            cursor = nextCursor;
            keysToDelete.push(...keys);
        } while (cursor !== '0');

        if (keysToDelete.length > 0) {
            await client.del(...keysToDelete);
        }
    } catch (err) {
        console.warn('[Cache] DEL-BY-PREFIX error:', err);
    }
}

export default redis;
