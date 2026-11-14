const mongoose = require("mongoose")



async function connectToDB() {

    if (!process.env.MONGO_URI) {
        console.log("MONGO_URI not set, skipping DB connection")
        return
    }

    try {
        await mongoose.connect(process.env.MONGO_URI)

        console.log("Connected to Database")
    }
    catch (err) {
        console.log(err)
    }
}

module.exports = connectToDB