import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import Navbar from '../../../components/Navbar.jsx'

const Register = () => {

    const navigate = useNavigate()
    const [ username, setUsername ] = useState("")
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ error, setError ] = useState("")
    const [ submitting, setSubmitting ] = useState(false)

    const { user, loading, handleRegister } = useAuth()

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
            await handleRegister({ username, email, password })
        } catch (err) {
            const status = err?.response?.status
            if (status === 409) {
                setError("An account with this email already exists. Try logging in instead.")
            } else if (status === 400) {
                setError(err?.response?.data?.message || "Please check your details and try again.")
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
                <h1>Register</h1>

                <form onSubmit={handleSubmit}>

                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            onChange={(e) => { setUsername(e.target.value) }}
                            value={username}
                            type="text" id="username" name='username' placeholder='Enter username'
                            autoComplete='username' required />
                    </div>
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
                            autoComplete='new-password' required />
                    </div>

                    {error && <p className='form-error' role='alert'>{error}</p>}

                    <button className='button primary-button' type='submit' disabled={submitting || loading}>
                        {submitting ? 'Creating account...' : 'Register'}
                    </button>

                </form>

                <p>Already have an account? <Link to={"/login"} >Login</Link> </p>
            </div>
        </main>
        </>
    )
}

export default Register
