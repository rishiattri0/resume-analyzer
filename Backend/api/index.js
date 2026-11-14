const app = require("../src/app")
const connectToDB = require("../src/config/database")

try {
    connectToDB()
} catch (e) {
    // ignore
}

module.exports = app
