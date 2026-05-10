const axios = require("axios");

/**
 * Provider: VidSrc
 */
const name = "VidSrc";

async function getStreams(type, id) {
    try {
        let path = "";
        if (type === "movie") {
            path = `movie?imdb=${id}`;
        } else if (type === "series") {
            const [imdbId, season, episode] = id.split(":");
            path = `tv?imdb=${imdbId}&season=${season}&episode=${episode}`;
        }

        if (!path) return [];

        return [
            {
                name: "CloudStream",
                title: `VidSrc.me (1080p)\nSource: ${name}`,
                externalUrl: `https://vidsrc.me/embed/${path}`
            },
            {
                name: "CloudStream",
                title: `VidSrc.to (Fast)\nSource: ${name}`,
                externalUrl: `https://vidsrc.to/embed/${path}`
            },
            {
                name: "CloudStream",
                title: `VidSrc.xyz (Mirror)\nSource: ${name}`,
                externalUrl: `https://vidsrc.xyz/embed/${path}`
            }
        ];
    } catch (err) {
        return [];
    }
}

module.exports = { getStreams, name };
