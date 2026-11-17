const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")



async function authUser(req, res, next) {

    try {
        const bearer = req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.slice(7)
            : null

        // Accept either the cookie (normal browsing) or a bearer token (devices
        // that block cookies). Try both before rejecting.
        const candidates = [ bearer, req.cookies?.token ].filter(Boolean)

        if (!candidates.length) {
            return res.status(401).json({
                message: "Token not provided."
            })
        }

        for (const token of candidates) {
            const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token })
            if (isTokenBlacklisted) {
                continue
            }

            try {
                req.user = jwt.verify(token, process.env.JWT_SECRET)
                return next()
            } catch (err) {
                if (err?.name !== "JsonWebTokenError" && err?.name !== "TokenExpiredError") {
                    return next(err)
                }
            }
        }

        return res.status(401).json({
            message: "Invalid token."
        })
    } catch (err) {
        next(err)
    }

}


module.exports = { authUser }
