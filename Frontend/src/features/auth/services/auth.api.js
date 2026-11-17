import api, { setStoredToken } from "../../../lib/api"

export async function register({ username, email, password }) {
    const response = await api.post('/api/auth/register', {
        username, email, password
    })

    setStoredToken(response.data?.token)

    return response.data
}

export async function login({ email, password }) {
    const response = await api.post("/api/auth/login", {
        email, password
    })

    setStoredToken(response.data?.token)

    return response.data
}

export async function logout() {
    try {
        const response = await api.get("/api/auth/logout")
        return response.data
    } finally {
        setStoredToken(null)
    }
}

export async function getMe() {
    const response = await api.get("/api/auth/get-me")

    return response.data
}
