/**
 * Wraps async route handlers so rejected promises reach the Express error
 * handler instead of hanging the request (Express 4 doesn't do this itself).
 */
function asyncHandler(handler) {
    return function (req, res, next) {
        Promise.resolve(handler(req, res, next)).catch(next)
    }
}

module.exports = asyncHandler
