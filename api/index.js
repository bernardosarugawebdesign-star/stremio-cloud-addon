const { getRouter } = require("stremio-addon-sdk");
const addonInterface = require("../lib/addon");

const router = getRouter(addonInterface);

module.exports = (req, res) => {
    // Vercel function needs to handle the request
    // Since getRouter returns an Express router, we can use it
    router(req, res, (err) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(404).send("Not Found");
        }
    });
};
