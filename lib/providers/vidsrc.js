const axios = require("axios");

/**
 * Provider: VidSrc
 */
const name = "VidSrc";

async function getStreams(type, id) {
    try {
        let url = "";
        if (type === "movie") {
            url = `https://vidsrc.me/embed/movie?imdb=${id}`;
        } else if (type === "series") {
            const [imdbId, season, episode] = id.split(":");
            url = `https://vidsrc.me/embed/tv?imdb=${imdbId}&season=${season}&episode=${episode}`;
        }

        if (!url) return [];

        return [
            {
                name: "CloudStream",
                title: `VidSrc - 1080p\nSource: ${name}`,
                externalUrl: url
            },
            {
                name: "CloudStream",
                title: `VidSrc (Mirror) - 720p\nSource: ${name}`,
                externalUrl: url.replace("vidsrc.me", "vidsrc.to")
            }
        ];
    } catch (err) {
        return [];
    }
}

module.exports = { getStreams, name };
