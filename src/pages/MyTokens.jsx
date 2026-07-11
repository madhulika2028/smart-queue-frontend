import { useState, useEffect, useRef } from 'react';
import { fetchMyTokens, fetchWaitTime } from '../api';
import { Link } from 'react-router-dom';

function MyTokens() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [waitTimes, setWaitTimes] = useState({});
  const [alertToken, setAlertToken] = useState(null);

  const prevStatusesRef = useRef({});

  useEffect(() => {
    // Request notification permission if not already granted/denied
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const loadTokens = async () => {
    try {
      const data = await fetchMyTokens();
      setTokens(data);
      setError(null);

      // Check for status changes to SERVING
      data.forEach((token) => {
        const prevStatus = prevStatusesRef.current[token.id];
        if (prevStatus !== 'SERVING' && token.status === 'SERVING') {
          setAlertToken(token);
          if (window.Notification && Notification.permission === 'granted') {
            new Notification('You are being called!', {
              body: `Token ${token.tokenNumber} - please proceed to ${token.departmentName || 'your department'}.`,
            });
          }
        }
        prevStatusesRef.current[token.id] = token.status;
      });

      // Fetch wait times for WAITING tokens
      data.forEach((token) => {
        if (token.status === 'WAITING') {
          fetchWaitTime(token.id)
            .then((time) => {
              setWaitTimes((prev) => ({ ...prev, [token.id]: time }));
            })
            .catch(() => {
              setWaitTimes((prev) => ({ ...prev, [token.id]: 'N/A' }));
            });
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

  return (
    <main className="page">
      <div className="page-header">
        <h1>My Tokens</h1>
        <p>View the status and estimated wait time of your queue tokens.</p>
      </div>

      {alertToken && (
        <div style={{
          backgroundColor: 'var(--color-primary-50)',
          color: 'var(--color-primary-700)',
          padding: '1rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2rem',
          border: '1px solid var(--color-primary-200)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong>You're being called!</strong> Token {alertToken.tokenNumber} - please proceed to {alertToken.departmentName || 'your department'}.
          </div>
          <button onClick={() => setAlertToken(null)} className="btn btn-outline" style={{ backgroundColor: 'white' }}>
            Dismiss
          </button>
        </div>
      )}

      {loading && tokens.length === 0 && (
        <div className="loading-wrapper">
          <div className="spinner" />
          <span className="loading-text">Loading tokens...</span>
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <h3>No tokens found</h3>
          <p>You haven't joined any queues yet.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Find a Hospital</Link>
        </div>
      )}

      <div className="card-grid">
        {tokens.map((token) => (
          <div key={token.id} className="card">
            <div className="card-title" style={{ fontSize: '1.5rem', color: 'var(--color-primary-600)' }}>
              {token.tokenNumber}
            </div>
            <div className="card-subtitle" style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
              {token.hospitalName} - {token.departmentName}
            </div>
            <div className="card-subtitle" style={{ marginTop: '0.5rem' }}>
              Patient: {token.patientName}
            </div>
            
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className={`token-status status-${token.status}`} style={{ margin: 0 }}>
                {token.status === 'SERVING' && <span className="pulse-dot" />}
                {token.status}
              </div>
              
              {token.status === 'WAITING' && (
                <div style={{ fontSize: '0.9rem', color: 'var(--color-gray-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {waitTimes[token.id] !== undefined ? (
                    waitTimes[token.id] === 'N/A' ? 'Wait time N/A' : `${waitTimes[token.id]} min wait`
                  ) : (
                    'Calculating...'
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default MyTokens;
