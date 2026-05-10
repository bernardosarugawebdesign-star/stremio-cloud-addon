const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Provider: Aniwave (Search-based)
 * This provider searches for the show by title to find the correct ID.
 */
const name = "Aniwave";
const baseUrl = "https://aniwaves.ru";

async function getStreams(type, id, meta) {
    if (type !== "series" && type !== "movie") return [];

    const title = meta.name;
    if (!title) return [];

    try {
        // 1. Search for the show
        const searchUrl = `${baseUrl}/search?q=${encodeURIComponent(title)}`;
        const searchResponse = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        const $ = cheerio.load(searchResponse.data);
        const firstResult = $(".anime-item a").first().attr("href");
        
        if (!firstResult) return [];

        // Example firstResult: /watch/black-clover-80711
        const slug = firstResult.replace("/watch/", "");
        
        let watchUrl = "";
        if (type === "series") {
            const [, season, episode] = id.split(":");
            // Note: Most anime use absolute episode numbering
            watchUrl = `${baseUrl}/watch/${slug}/ep-${episode}`;
        } else {
            watchUrl = `${baseUrl}/watch/${slug}`;
        }

        // 2. Fetch the watch page to find servers
        const watchResponse = await axios.get(watchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        const $$ = cheerio.load(watchResponse.data);
        const streams = [];

        // Extracting iframes (Vidplay, etc.)
        $$("iframe").each((i, el) => {
            let src = $$(el).attr("src");
            if (src) {
                if (src.startsWith("//")) src = "https:" + src;
                
                streams.push({
                    name: "CloudStream (Native)",
                    title: `Aniwave Server ${i + 1}\n(Native Internal Player)`,
                    url: src, // Using 'url' instead of 'externalUrl' tells Stremio to try playing it
                    behaviorHints: {
                        notWebReady: true,
                        proxyHeaders: {
                            "common": {
                                "Referer": watchUrl,
                                "User-Agent": "Mozilla/5.0"
                            }
                        }
                    }
                });
            }
        });

        // Always provide the fallback external link
        streams.push({
            name: "CloudStream (Backup)",
            title: `Open in Browser\n(If internal player fails)`,
            externalUrl: watchUrl
        });

        return streams;
    } catch (err) {
        console.error("Aniwave Scraper Error:", err.message);
        return [];
    }
}

module.exports = { getStreams, name };
