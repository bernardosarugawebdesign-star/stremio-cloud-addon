const { addonBuilder } = require("stremio-addon-sdk");
const { LRUCache } = require("lru-cache");
const axios = require("axios");
const manifest = require("./manifest");

// Providers
const vidsrc = require("./providers/vidsrc");
const twoembed = require("./providers/twoembed");
const moviesapi = require("./providers/moviesapi");
const autoembed = require("./providers/autoembed");
const anime = require("./providers/anime");
const aniwave = require("./providers/aniwave");

/**
 * Fetch metadata (Title, Year) from Cinemeta
 */
async function getMetadata(type, id) {
    const imdbId = id.split(":")[0];
    try {
        const response = await axios.get(`https://v3-cinemeta.strem.io/meta/${type}/${imdbId}.json`);
        return response.data.meta || {};
    } catch (err) {
        console.error("Cinemeta error:", err.message);
        return {};
    }
}

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
        return { streams: cache.get(cacheKey) };
    }

    // 3. Fetch Metadata (Title, Year)
    const meta = await getMetadata(type, id);
    const title = meta.name || "";
    console.log(`Searching for: ${title} (${type} ${id})`);
    
    // 4. Provider Aggregation with Timeout
    const providers = [vidsrc, twoembed, moviesapi, autoembed, anime, aniwave];
    const timeout = 8500; 

    const results = await Promise.all(
        providers.map(p => {
            const fetchPromise = p.getStreams(type, id, meta).catch(err => {
                console.error(`Provider ${p.name || 'unknown'} error:`, err.message);
                return [];
            });

            return Promise.race([
                fetchPromise,
                new Promise(resolve => setTimeout(() => resolve([]), timeout))
            ]);
        })
    );

    const streams = results.flat();
    
    // 5. Cache Result
    if (streams.length > 0) {
        cache.set(cacheKey, streams);
    }
    
    return { streams };
});

module.exports = builder.getInterface();
