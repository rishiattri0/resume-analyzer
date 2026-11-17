const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const mongoose = require("mongoose")

const app = express()

app.use((req, res, next) => {
    const contentType = req.headers["content-type"] || ""
    if (req.method !== "POST" && req.method !== "PUT" && req.method !== "PATCH") {
        return next()
    }
    if (!contentType.includes("application/json")) {
        return next()
    }
    let data = ""
    req.on("data", (chunk) => { data += chunk })
    req.on("end", () => {
        try {
            req.body = data ? JSON.parse(data) : {}
        } catch (e) {
            req.body = {}
        }
        next()
    })
    req.on("error", next)
})
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}))

app.get("/api/health", (req, res) => {
    res.json({
        ok: true,
        service: "interview-ai-backend",
        db: mongoose.connection.readyState === 1 ? "connected" : "connecting",
        time: new Date().toISOString()
    })
})

const connectToDB = require("./config/database")

app.use(async (req, res, next) => {
    try {
        await connectToDB()
        next()
    } catch (err) {
        res.status(503).json({ message: "Database temporarily unavailable. Please retry in a moment." })
    }
})

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")


/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

app.use((err, req, res, next) => {
    res.status(500).json({ error: err && err.message, stack: err && err.stack })
})



module.exports = app