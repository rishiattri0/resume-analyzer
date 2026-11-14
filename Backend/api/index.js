const app = require("../src/app")
const connectToDB = require("../src/config/database")

connectToDB()

module.exports = app
