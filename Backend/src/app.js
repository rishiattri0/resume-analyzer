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
    // Some runtimes (Vercel) have already parsed the body for us.
    if (req.body && typeof req.body === "object" && Object.keys(req.body).length > 0) {
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

// Request log so we can see exactly what a remote device sends and gets back.
app.use((req, res, next) => {
    const startedAt = Date.now()
    res.on("finish", () => {
        const entry = {
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            ms: Date.now() - startedAt,
            country: req.headers["x-vercel-ip-country"] || "-",
            ua: String(req.headers["user-agent"] || "-").slice(0, 48)
        }
        if (entry.status >= 400 || entry.path.startsWith("/api/interview") || entry.path === "/api/health") {
            console.log("req", JSON.stringify(entry))
        }
    })
    next()
})

app.get("/api/health", (req, res) => {
    res.json({
        ok: true,
        service: "interview-ai-backend",
        db: mongoose.connection.readyState === 1 ? "connected" : "connecting",
        model: process.env.GEMINI_MODEL || "default",
        region: process.env.VERCEL_REGION || "local",
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
    console.error("Unhandled error:", err?.message || err)

    if (err?.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: "That file is too large. Please upload a PDF under 3MB." })
    }
    if (err?.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({ message: "Unexpected file upload. Please attach one resume PDF." })
    }

    const status = Number(err?.status || err?.statusCode) || 500
    res.status(status).json({
        message: status >= 500
            ? "Something went wrong on our side. Please try again in a moment."
            : (err?.message || "Request failed.")
    })
})



module.exports = app