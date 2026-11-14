const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

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

app.post("/api/debug", (req, res) => {
    res.json({ body: req.body, contentType: req.headers["content-type"] })
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