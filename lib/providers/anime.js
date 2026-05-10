const axios = require("axios");

/**
 * Provider: AnimeSpecialist
 * Focused on anime sources like GogoAnime and Aniwave (simulated via robust embeds)
 */
const name = "AnimeSpecialist";

async function getStreams(type, id, meta) {
    if (meta.genres && !meta.genres.includes("Animation") && !meta.genres.includes("Anime")) {
        // Skip if it's definitely not anime
        // return []; // Actually, let's keep it for safety
    }

    const imdbId = id.split(":")[0];
    let season = "";
    let episode = "";
    if (id.includes(":")) {
        [, season, episode] = id.split(":");
    }

    const results = [];

    // Source 1: Vidsrc.me Anime Path
    if (type === "series") {
        results.push({
            name: "CloudStream (Anime)",
            title: `Mirror 1 - 1080p\nSource: ${name}`,
            externalUrl: `https://vidsrc.me/embed/tv?imdb=${imdbId}&season=${season}&episode=${episode}`
        });
    }

    // Source 2: SuperEmbed Anime specialized
    results.push({
        name: "CloudStream (Anime)",
        title: `Mirror 2 - 720p\nSource: ${name}`,
        externalUrl: `https://multiembed.mov/directstream.php?video_id=${imdbId}${type === "series" ? `&s=${season}&e=${episode}` : ""}`
    });

    // Source 3: Search-based simulation (Redirects to search if unavailable)
    const searchQuery = encodeURIComponent(meta.name || "");
    if (searchQuery) {
        results.push({
            name: "CloudStream (Search)",
            title: `Search on GogoAnime\n(Use if mirrors fail)`,
            externalUrl: `https://gogoanime3.co/search.html?keyword=${searchQuery}`
        });
    }

    return results;
}

module.exports = { getStreams, name };
