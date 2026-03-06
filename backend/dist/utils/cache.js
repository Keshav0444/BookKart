"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheGet = cacheGet;
exports.cacheSet = cacheSet;
exports.cacheDel = cacheDel;
exports.cacheDelByPrefix = cacheDelByPrefix;
const redis_1 = require("@upstash/redis");
// ---------------------------------------------------------------------------
// Redis client — single shared instance (singleton)
// ---------------------------------------------------------------------------
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL || '';
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || '';
let redis = null;
function getRedisClient() {
    if (redis)
        return redis;
    try {
        if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
            console.warn('⚠️  Upstash Redis credentials missing — caching disabled');
            return null;
        }
        redis = new redis_1.Redis({
            url: UPSTASH_REDIS_REST_URL,
            token: UPSTASH_REDIS_REST_TOKEN,
        });
        console.log('✅ Upstash Redis initialized');
        return redis;
    }
    catch (err) {
        console.warn('⚠️  Upstash Redis init failed — caching disabled:', err);
        return null;
    }
}
// Initialise immediately
getRedisClient();
// ---------------------------------------------------------------------------
// Default TTLs (seconds)
// ---------------------------------------------------------------------------
const DEFAULT_TTL = 300; // 5 minutes
// ---------------------------------------------------------------------------
// Public cache helpers
// ---------------------------------------------------------------------------
/** Retrieve a cached value. Returns undefined on miss or when Redis is down. */
function cacheGet(key) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = getRedisClient();
        if (!client) {
            console.log(`[Cache MISS] ${key} (Redis unavailable — using MongoDB)`);
            return undefined;
        }
        try {
            const data = yield client.get(key);
            if (data === null) {
                console.log(`[Cache MISS] ${key}`);
                return undefined;
            }
            console.log(`[Cache HIT ] ${key}`);
            return data; // @upstash/redis automatically parses JSON
        }
        catch (err) {
            console.warn('[Cache] GET error:', err);
            return undefined;
        }
    });
}
/** Store a value with an optional TTL in seconds (default 300 s). */
function cacheSet(key_1, value_1) {
    return __awaiter(this, arguments, void 0, function* (key, value, ttlSeconds = DEFAULT_TTL) {
        const client = getRedisClient();
        if (!client)
            return;
        try {
            yield client.set(key, value, { ex: ttlSeconds });
        }
        catch (err) {
            console.warn('[Cache] SET error:', err);
        }
    });
}
/** Delete one or more exact cache keys. */
function cacheDel(...keys) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = getRedisClient();
        if (!client || keys.length === 0)
            return;
        try {
            yield client.del(...keys);
        }
        catch (err) {
            console.warn('[Cache] DEL error:', err);
        }
    });
}
/** Delete all keys whose name starts with a given prefix. */
function cacheDelByPrefix(prefix) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = getRedisClient();
        if (!client)
            return;
        try {
            let cursor = '0';
            const keysToDelete = [];
            do {
                const [nextCursor, keys] = yield client.scan(cursor, { match: `${prefix}*`, count: 100 });
                cursor = nextCursor === '0' || !nextCursor ? '0' : nextCursor.toString();
                if (keys && keys.length > 0) {
                    keysToDelete.push(...keys);
                }
            } while (cursor !== '0');
            if (keysToDelete.length > 0) {
                yield client.del(...keysToDelete);
            }
        }
        catch (err) {
            console.warn('[Cache] DEL-BY-PREFIX error:', err);
        }
    });
}
exports.default = getRedisClient;
