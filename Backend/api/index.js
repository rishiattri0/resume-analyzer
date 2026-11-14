let app
let connectToDB
try {
    app = require("../src/app")
    connectToDB = require("../src/config/database")
} catch (err) {
    module.exports = (req, res) => {
        res.status(500).json({ error: "Require failed", message: err && err.message, stack: err && err.stack })
    }
    return
}

try {
    connectToDB()
} catch (err) {
    // ignore
}

module.exports = (req, res) => {
    try {
        return app(req, res)
    } catch (err) {
        res.status(500).json({ error: "Handler failed", message: err && err.message, stack: err && err.stack })
    }
}
