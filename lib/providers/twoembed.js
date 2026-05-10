/**
 * Provider: 2Embed
 */
const name = "2Embed";

async function getStreams(type, id) {
    try {
        let url = "";
        if (type === "movie") {
            url = `https://www.2embed.cc/embed/${id}`;
        } else if (type === "series") {
            const [imdbId, season, episode] = id.split(":");
            url = `https://www.2embed.cc/embedtv/${imdbId}&s=${season}&e=${episode}`;
        }

        if (!url) return [];

        return [{
            name: "CloudStream",
            title: `2Embed (HD)\nSource: ${name}`,
            externalUrl: url
        }];
    } catch (err) {
        return [];
    }
}

module.exports = { getStreams, name };
