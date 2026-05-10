const { addonBuilder } = require("stremio-addon-sdk");
const { LRUCache } = require("lru-cache");
const manifest = require("./manifest");
const vidsrc = require("./providers/vidsrc");
const superstream = require("./providers/superstream");

const builder = new addonBuilder(manifest);

// Cache results for 1 hour to stay within Vercel execution limits
const cache = new LRUCache({
    max: 500,
    ttl: 1000 * 60 * 60, // 1 hour
});

// Stream handler
builder.defineStreamHandler(async ({ type, id }) => {
    // 1. Validation
    if (!id.startsWith("tt")) {
        return { streams: [] };
    }

    // 2. Cache Check
    const cacheKey = `${type}:${id}`;
    if (cache.has(cacheKey)) {
        console.log(`Cache hit for ${cacheKey}`);
        return { streams: cache.get(cacheKey) };
    }

    console.log(`Fetching streams for ${type} ${id}`);
    
    // 3. Provider Aggregation with Timeout
    const providers = [vidsrc, superstream];
    const timeout = 8000; // 8 seconds (Vercel limit is 10s)

    const results = await Promise.all(
        providers.map(p => {
            const fetchPromise = p.getStreams(type, id).catch(err => {
                console.error(`Provider ${p.name || 'unknown'} error:`, err.message);
                return [];
            });

            // Race against timeout
            return Promise.race([
                fetchPromise,
                new Promise(resolve => setTimeout(() => {
                    console.warn(`Provider ${p.name || 'unknown'} timed out`);
                    resolve([]);
                }, timeout))
            ]);
        })
    );

    const streams = results.flat();
    
    // 4. Cache Result
    if (streams.length > 0) {
        cache.set(cacheKey, streams);
    }
    
    return { streams };
});

module.exports = builder.getInterface();
