import { useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import HospitalList from './pages/HospitalList';
import DepartmentList from './pages/DepartmentList';
import JoinQueue from './pages/JoinQueue';
import StaffDashboard from './pages/StaffDashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyTokens from './pages/MyTokens';
import { useAuth } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';

function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      navigate('/login');
    };
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, [logout, navigate]);

  return (
    <div className="app-wrapper">
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <NavLink to="/" className="navbar-brand">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="#2563eb" />
              <path d="M10 16h12M16 10v12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            SmartQueue
          </NavLink>
          <div className="navbar-links">
            {(!user || user.role === 'PATIENT') && (
              <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
                Hospitals
              </NavLink>
            )}
            
            {user?.role === 'PATIENT' && (
              <NavLink to="/my-tokens" className={({ isActive }) => isActive ? 'active' : ''}>
                My Tokens
              </NavLink>
            )}

            {user?.role === 'STAFF' && (
              <NavLink to="/staff" className={({ isActive }) => isActive ? 'active' : ''}>
                Staff Dashboard
              </NavLink>
            )}

            {!user && (
              <>
                <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>
                  Login
                </NavLink>
                <NavLink to="/signup" className={({ isActive }) => isActive ? 'active' : ''}>
                  Sign Up
                </NavLink>
              </>
            )}

            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-gray-500)' }}>
                  {user.fullName} ({user.role})
                </span>
                <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
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
      </Routes>
    </div>
  );
}

export default App;
