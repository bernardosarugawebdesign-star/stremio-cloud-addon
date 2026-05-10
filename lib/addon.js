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
        const response = await axios.get(`https://v3-cinemeta.strem.io/meta/${type}/${imdbId}.json`, { timeout: 3000 });
        return response.data.meta || { name: "Unknown" };
    } catch (err) {
        console.error("Cinemeta error:", err.message);
        return { name: "Unknown" };
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
    if (!id.startsWith("tt")) return { streams: [] };

    const cacheKey = `${type}:${id}`;
    if (cache.has(cacheKey)) return { streams: cache.get(cacheKey) };

    // 3. Parallel Execution: Fetch Metadata and start providers simultaneously
    const metaPromise = getMetadata(type, id);
    
    const providers = [vidsrc, twoembed, moviesapi, autoembed, anime, aniwave];
    const timeout = 9000; 

    // We wait for meta first because providers need the Title
    const meta = await metaPromise;
    const title = meta.name || "Unknown";
    console.log(`Deep Search: ${title} (${id})`);

    const results = await Promise.all(
        providers.map(p => {
            return p.getStreams(type, id, meta).catch(err => {
                console.error(`Provider ${p.name} error:`, err.message);
                return [];
            });
        })
    );

    const streams = results.flat();
    
    if (streams.length > 0) {
        cache.set(cacheKey, streams);
    }
    
    return { streams };
});

module.exports = builder.getInterface();
