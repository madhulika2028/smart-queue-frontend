import { useEffect, useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import HospitalList from './pages/HospitalList';
import DepartmentList from './pages/DepartmentList';
import JoinQueue from './pages/JoinQueue';
import StaffDashboard from './pages/StaffDashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyTokens from './pages/MyTokens';
import NotFound from './pages/NotFound';
import { useAuth } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';

function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      navigate('/login');
    };
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, [logout, navigate]);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (!e.target.closest('.navbar-inner')) setMenuOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [menuOpen]);

  return (
    <div className="app-wrapper">
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <NavLink to="/" className="navbar-brand" onClick={closeMenu}>
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="#2563eb" />
              <path d="M10 16h12M16 10v12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            SmartQueue
          </NavLink>

          {/* Mobile hamburger */}
          <button
            className="navbar-hamburger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>

          {/* Nav links */}
          <div className={`navbar-links ${menuOpen ? 'navbar-links-open' : ''}`}>
            {(!user || user.role === 'PATIENT') && (
              <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>
                Hospitals
              </NavLink>
            )}

            {user?.role === 'PATIENT' && (
              <NavLink to="/my-tokens" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>
                My Tokens
              </NavLink>
            )}

            {user?.role === 'STAFF' && (
              <NavLink to="/staff" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>
                Staff Dashboard
              </NavLink>
            )}

            {!user && (
              <>
                <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>
                  Login
                </NavLink>
                <NavLink to="/signup" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>
                  Sign Up
                </NavLink>
              </>
            )}

            {user && (
              <div className="navbar-user">
                <span className="navbar-user-name">{user.fullName}</span>
                <span className="navbar-user-role">{user.role}</span>
                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Routes ── */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<HospitalList />} />
        <Route path="/hospitals/:hospitalId/departments" element={<DepartmentList />} />

        {/* Protected Patient Routes */}
        <Route
          path="/departments/:departmentId/join"
          element={
            <ProtectedRoute>
              <JoinQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-tokens"
          element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <MyTokens />
            </ProtectedRoute>
          }
        />

        {/* Protected Staff Route */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['STAFF']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
