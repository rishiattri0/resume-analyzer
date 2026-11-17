const app = require("../src/app")
const connectToDB = require("../src/config/database")

// Warm up the database connection on cold start; requests also await it.
connectToDB().catch(() => {})

module.exports = app
