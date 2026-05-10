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

        // Adding mirrors that are currently working
        return [
            {
                name: "CloudStream (Pro)",
                title: `VidSrc.to - 1080p\n(Most Reliable)`,
                externalUrl: `https://vidsrc.to/embed/${path}`
            },
            {
                name: "CloudStream (Pro)",
                title: `VidSrc.me - 1080p\n(Backup)`,
                externalUrl: `https://vidsrc.me/embed/${path}`
            },
            {
                name: "CloudStream (Pro)",
                title: `VidSrc.xyz - 720p\n(Fast)`,
                externalUrl: `https://vidsrc.xyz/embed/${path}`
            }
        ];
    } catch (err) {
        return [];
    }
}

module.exports = { getStreams, name };
