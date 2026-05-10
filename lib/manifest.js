const manifest = {
    id: "org.cloudstream.addon",
    version: "1.0.0",
    name: "Cloud Stream Addon",
    description: "Multi-source stream provider for Stremio, inspired by CloudStream.",
    resources: ["stream"],
    types: ["movie", "series"],
    idPrefixes: ["tt"], // IMDB IDs
    catalogs: []
};

module.exports = manifest;
