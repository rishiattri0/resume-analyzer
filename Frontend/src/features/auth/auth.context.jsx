import { createContext, useEffect, useState } from "react";
import { getMe } from "./services/auth.api";
import { setStoredToken } from "../../lib/api";


export const AuthContext = createContext()


export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true

        const loadSession = async () => {
            try {
                const data = await getMe()
                if (active && data?.user) {
                    setUser(data.user)
                }
            } catch (err) {
                // Not signed in; drop any stale local token and let the login page handle it.
                if (err?.response?.status === 401) {
                    setStoredToken(null)
                }
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        loadSession()

        return () => { active = false }
    }, [])


    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }} >
            {children}
        </AuthContext.Provider>
    )
}
