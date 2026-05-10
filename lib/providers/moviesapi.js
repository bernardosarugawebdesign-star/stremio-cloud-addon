/**
 * Provider: MoviesAPI
 */
const name = "MoviesAPI";

async function getStreams(type, id) {
    try {
        let url = "";
        if (type === "movie") {
            url = `https://moviesapi.club/movie/${id}`;
        } else if (type === "series") {
            const [imdbId, season, episode] = id.split(":");
            url = `https://moviesapi.club/tv/${imdbId}-${season}-${episode}`;
        }

        if (!url) return [];

        return [{
            name: "CloudStream",
            title: `MoviesAPI (Multi)\nSource: ${name}`,
            externalUrl: url
        }];
    } catch (err) {
        return [];
    }
}

module.exports = { getStreams, name };
