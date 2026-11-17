import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import Navbar from '../../../components/Navbar.jsx'

const Login = () => {

    const { user, loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ error, setError ] = useState("")
    const [ submitting, setSubmitting ] = useState(false)

    // Navigate only after auth state has actually committed.
    useEffect(() => {
        if (user) {
            navigate('/', { replace: true })
        }
    }, [ user, navigate ])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (submitting || loading) return

        setError("")
        setSubmitting(true)
        try {
            await handleLogin({ email, password })
        } catch (err) {
            const status = err?.response?.status
            if (status === 401 || status === 400) {
                setError("Email or password is incorrect.")
            } else if (err?.response?.data?.message) {
                setError(err.response.data.message)
            } else {
                setError("Couldn't reach the server. Check your connection and try again.")
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <Navbar />
            <main>
                <div className="form-container">
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={(e) => { setEmail(e.target.value) }}
                            value={email}
                            type="email" id="email" name='email' placeholder='Enter email address'
                            autoComplete='email' required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={(e) => { setPassword(e.target.value) }}
                            value={password}
                            type="password" id="password" name='password' placeholder='Enter password'
                            autoComplete='current-password' required />
                    </div>

                    {error && <p className='form-error' role='alert'>{error}</p>}

                    <button className='button primary-button' type='submit' disabled={submitting || loading}>
                        {submitting ? 'Signing in...' : 'Login'}
                    </button>
                </form>
                <p>Don't have an account? <Link to={"/register"} >Register</Link> </p>
            </div>
        </main>
        </>
    )
}

export default Login
