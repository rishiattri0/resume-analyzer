const mongoose = require("mongoose")

let connectionPromise = null

async function connectToDB() {

    if (!process.env.MONGO_URI) {
        console.log("MONGO_URI not set, skipping DB connection")
        return
    }

    if (mongoose.connection.readyState === 1) {
        return
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 8000,
            maxPoolSize: 5
        })
            .then(() => {
                console.log("Connected to Database")
            })
            .catch((err) => {
                connectionPromise = null
                throw err
            })
    }

    return connectionPromise
}

module.exports = connectToDB
