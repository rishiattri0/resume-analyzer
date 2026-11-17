import { createContext, useEffect, useState } from "react";
import { getMe } from "./services/auth.api";


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
                // Not signed in; the login page handles it.
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
