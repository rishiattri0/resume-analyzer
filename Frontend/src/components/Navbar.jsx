import React from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../features/auth/hooks/useAuth.js'

const Navbar = () => {
  const { handleLogout, user } = useAuth()
  const navigate = useNavigate()

  const onSignOut = async () => {
    await handleLogout()
    navigate('/login')
  }

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 10,
      background: 'rgba(9,9,11,0.8)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div className="container" style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ color: 'var(--text)', fontWeight: 600, fontSize: '1.125rem', textDecoration: 'none' }}>
          InterviewAI
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user && (
            <span className="navbar-user" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {user.username || user.email}
            </span>
          )}
          {user && (
            <button className="signout-btn" onClick={onSignOut}>Sign out</button>
          )}
          {!user && (
            <>
              <Link to="/login" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Login</Link>
              <Link to="/register" className="button primary-button" style={{ padding: '8px 14px', fontSize: '0.875rem' }}>Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar