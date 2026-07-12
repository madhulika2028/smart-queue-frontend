import { useState, useEffect, useRef } from 'react';
import { fetchMyTokens, fetchWaitTime, fetchQueuePosition, cancelToken } from '../api';
import { Link } from 'react-router-dom';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';

function MyTokens() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [waitTimes, setWaitTimes] = useState({});
  const [positions, setPositions] = useState({});
  const [cancellingId, setCancellingId] = useState(null);

  const prevStatusesRef = useRef({});
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const loadTokens = async () => {
    try {
      const data = await fetchMyTokens();
      setTokens(data);
      setError(null);

      // Check for status changes → SERVING
      data.forEach((token) => {
        const prevStatus = prevStatusesRef.current[token.id];
        if (prevStatus && prevStatus !== 'SERVING' && token.status === 'SERVING') {
          addToast(
            `🔔 Token ${token.tokenNumber} is now being served — please proceed to ${token.departmentName || 'your department'}.`,
            'success'
          );
          if (window.Notification && Notification.permission === 'granted') {
            new Notification('You are being called!', {
              body: `Token ${token.tokenNumber} — please proceed to ${token.departmentName || 'your department'}.`,
              icon: '/vite.svg',
            });
          }
        }
        prevStatusesRef.current[token.id] = token.status;
      });

      // Fetch wait times & positions for WAITING tokens
      data.forEach((token) => {
        if (token.status === 'WAITING') {
          fetchWaitTime(token.id)
            .then((time) => setWaitTimes((prev) => ({ ...prev, [token.id]: time })))
            .catch(() => setWaitTimes((prev) => ({ ...prev, [token.id]: 'N/A' })));

          fetchQueuePosition(token.id)
            .then((pos) => setPositions((prev) => ({ ...prev, [token.id]: pos })))
            .catch(() => {/* silently ignore */ });
        }
      });
    } catch (err) {
      if (err.message.includes('Unauthorized')) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.message || 'Failed to load tokens.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTokens();
    const interval = setInterval(loadTokens, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (tokenId) => {
    if (!window.confirm('Are you sure you want to cancel this token?')) return;
    setCancellingId(tokenId);
    try {
      await cancelToken(tokenId);
      addToast('Token cancelled successfully.', 'info');
      await loadTokens();
    } catch (err) {
      addToast(err.message || 'Failed to cancel token.', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const activeTokens = tokens.filter((t) => t.status === 'WAITING' || t.status === 'SERVING');
  const pastTokens = tokens.filter((t) => t.status === 'DONE' || t.status === 'CANCELLED');

  return (
    <main className="page">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="page-header">
        <h1>My Tokens</h1>
        <p>Track your queue positions and estimated wait times in real time.</p>
      </div>

      {loading && tokens.length === 0 && (
        <div className="loading-wrapper">
          <div className="spinner" />
          <span className="loading-text">Loading tokens…</span>
        </div>
      )}

      {error && (
        <div className="error-box">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {!loading && !error && tokens.length === 0 && (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3>No tokens found</h3>
          <p>You haven't joined any queues yet.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Find a Hospital
          </Link>
        </div>
      )}

      {/* ── Active Tokens ── */}
      {activeTokens.length > 0 && (
        <>
          <h2 className="section-heading">Active</h2>
          <div className="card-grid" style={{ marginBottom: '2.5rem' }}>
            {activeTokens.map((token) => (
              <div key={token.id} className={`card token-card ${token.status === 'SERVING' ? 'token-card-serving' : ''}`}>
                {/* Token header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="token-number-sm">{token.tokenNumber}</div>
                    <div className="card-subtitle" style={{ marginTop: 4, fontWeight: 600, color: 'var(--color-gray-700)' }}>
                      {token.hospitalName}
                    </div>
                    <div className="card-subtitle">{token.departmentName}</div>
                  </div>
                  <div className={`token-status status-${token.status}`} style={{ margin: 0, flexShrink: 0 }}>
                    {token.status === 'SERVING' && <span className="pulse-dot" />}
                    {token.status}
                  </div>
                </div>

                {token.emergency && (
                  <div className="emergency-chip" style={{ marginTop: '0.5rem' }}>
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Emergency
                  </div>
                )}

                {/* Stats row */}
                {token.status === 'WAITING' && (
                  <div className="token-stats">
                    {/* Position */}
                    <div className="token-stat">
                      <div className="token-stat-label">Position</div>
                      <div className="token-stat-value">
                        {positions[token.id] !== undefined ? `#${positions[token.id]}` : '—'}
                      </div>
                    </div>
                    {/* Wait time */}
                    <div className="token-stat">
                      <div className="token-stat-label">Est. Wait</div>
                      <div className="token-stat-value">
                        {waitTimes[token.id] !== undefined
                          ? waitTimes[token.id] === 'N/A' ? 'N/A' : `${waitTimes[token.id]} min`
                          : '…'}
                      </div>
                    </div>
                  </div>
                )}

                {token.status === 'SERVING' && (
                  <div className="serving-banner">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                    Please proceed to the department now
                  </div>
                )}

                {/* Cancel */}
                {token.status === 'WAITING' && (
                  <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                    <button
                      className="btn btn-outline"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                      onClick={() => handleCancel(token.id)}
                      disabled={cancellingId === token.id}
                    >
                      {cancellingId === token.id ? 'Cancelling…' : 'Cancel Token'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Past Tokens ── */}
      {pastTokens.length > 0 && (
        <>
          <h2 className="section-heading" style={{ color: 'var(--color-gray-400)' }}>History</h2>
          <div className="card-grid">
            {pastTokens.map((token) => (
              <div key={token.id} className="card card-muted">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="token-number-sm" style={{ opacity: 0.5 }}>{token.tokenNumber}</div>
                    <div className="card-subtitle" style={{ marginTop: 4 }}>{token.hospitalName} — {token.departmentName}</div>
                  </div>
                  <div className={`token-status status-${token.status}`} style={{ margin: 0 }}>
                    {token.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

export default MyTokens;
