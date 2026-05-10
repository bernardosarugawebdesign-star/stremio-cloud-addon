/**
 * Provider: AutoEmbed
 */
const name = "AutoEmbed";

async function getStreams(type, id) {
    try {
        let url = "";
        if (type === "movie") {
            url = `https://autoembed.to/movie/imdb/${id}`;
        } else if (type === "series") {
            const [imdbId, season, episode] = id.split(":");
            url = `https://autoembed.to/tv/imdb/${imdbId}-${season}-${episode}`;
        }

        if (!url) return [];

        return [{
            name: "CloudStream",
            title: `AutoEmbed (Speed)\nSource: ${name}`,
            externalUrl: url
        }];
    } catch (err) {
        return [];
    }
}

module.exports = { getStreams, name };
