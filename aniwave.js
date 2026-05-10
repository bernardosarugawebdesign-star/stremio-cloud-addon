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
        // 1. Absolute Episode Mapping (Crucial for Anime)
        let requestedEp = "1";
        if (id.includes(":")) {
            const parts = id.split(":");
            const season = parseInt(parts[1]);
            const episode = parseInt(parts[2]);
            
            // Basic absolute episode calculation
            // Many anime list total episodes. If S2 Ep1 is actually Ep25:
            if (season > 1 && meta.videos) {
                // Try to find the absolute number from Stremio metadata
                const targetVideo = meta.videos.find(v => v.season === season && v.number === episode);
                if (targetVideo && targetVideo.episode) {
                    requestedEp = targetVideo.episode.toString();
                } else {
                    // Fallback to seasonal numbering if absolute is unknown
                    requestedEp = episode.toString();
                }
            } else {
                requestedEp = episode.toString();
            }
        }

        // 2. Search for the show to get the Anime ID
        const searchUrl = `${baseUrl}/filter?keyword=${encodeURIComponent(title)}`;
        const searchResponse = await axios.get(searchUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Referer': baseUrl
            },
            timeout: 4000
        });
        
        const $ = cheerio.load(searchResponse.data);
        const firstResult = $(".name.d-title").first();
        const firstResultHref = firstResult.attr("href");
        
        if (!firstResultHref) return [];

        const slug = firstResultHref.replace("/watch/", "");
        const watchUrl = `${baseUrl}/watch/${slug}/ep-${requestedEp}`;
        
        // 3. Handshake with Episode AJAX
        const animeId = firstResultHref.split("-").pop();
        const episodesUrl = `${baseUrl}/ajax/episode/list?anime_id=${animeId}`;
        const epResponse = await axios.get(episodesUrl, { 
            headers: { 
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            } 
        }).catch(() => null);

        // Find the internal episode ID
        let epDataId = "";
        if (epResponse && epResponse.data) {
            const $$$ = cheerio.load(epResponse.data.html || epResponse.data);
            epDataId = $$$(`.ep-item[data-number="${requestedEp}"]`).attr("data-id");
        }

        if (!epDataId) {
            return [{
                name: "CloudStream (Pro)",
                title: `Aniwave - Ep ${requestedEp}\n(External Browser)`,
                externalUrl: watchUrl
            }];
        }

        // 4. Fetch Servers
        const serversUrl = `${baseUrl}/ajax/episode/servers?episode_id=${epDataId}`;
        const serversResponse = await axios.get(serversUrl, {
            headers: { 'X-Requested-With': 'XMLHttpRequest', 'Referer': watchUrl }
        });
        
        const $$$$ = cheerio.load(serversResponse.data.html || serversResponse.data);
        const streams = [];

        $$$$(".server-item").each((i, el) => {
            const serverName = $$$$(el).text().trim();
            const serverId = $$$$(el).attr("data-id");
            
            streams.push({
                name: "CloudStream (Native)",
                title: `Aniwave [${serverName}]\n(Direct Search Match)`,
                externalUrl: `${watchUrl}?server=${serverId}`,
                behaviorHints: {
                    notWebReady: true,
                    proxyHeaders: { "common": { "Referer": baseUrl } }
                }
            });
        });

        return streams;
    } catch (err) {
        return [];
    }
}

module.exports = { getStreams, name };
