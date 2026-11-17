import axios from "axios"

const TOKEN_KEY = "interviewai_token"

export function getStoredToken() {
    try {
        return window.localStorage.getItem(TOKEN_KEY)
    } catch (err) {
        return null
    }
}

export function setStoredToken(token) {
    try {
        if (token) {
            window.localStorage.setItem(TOKEN_KEY, token)
        } else {
            window.localStorage.removeItem(TOKEN_KEY)
        }
    } catch (err) {
        // Storage can be unavailable (private mode); cookies still work.
    }
}

// Same-origin by default: Vercel proxies /api to the backend, and Vite proxies
// it in development. Cookies work as first-party, and the bearer token is a
// fallback for devices that block cookies.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "",
    withCredentials: true
})

api.interceptors.request.use((config) => {
    const token = getStoredToken()
    if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api
