import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { createToken, fetchWaitTime } from '../api';

function JoinQueue() {
  const { departmentId } = useParams();
  const location = useLocation();
  const departmentName = location.state?.departmentName || `Department #${departmentId}`;
  const hospitalName = location.state?.hospitalName || 'Hospital';

  // Form state
  const [patientName, setPatientName] = useState('');
  const [emergency, setEmergency] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Token state (after successful submission)
  const [token, setToken] = useState(null);
  const [waitTime, setWaitTime] = useState(null);
  const [waitError, setWaitError] = useState(null);
  const intervalRef = useRef(null);

  // Submit the form
  async function handleSubmit(e) {
    e.preventDefault();
    if (!patientName.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const t = await createToken(departmentId, { patientName: patientName.trim(), emergency });
      setToken(t);
    } catch (err) {
      setSubmitError(err.message || 'Failed to join queue.');
    } finally {
      setSubmitting(false);
    }
  }

  // Poll wait time when we have a token
  useEffect(() => {
    if (!token) return;

    async function poll() {
      try {
        const minutes = await fetchWaitTime(token.id);
        setWaitTime(minutes);
        setWaitError(null);
      } catch {
        setWaitError('Unable to fetch wait time');
      }
    }

    poll(); // immediate first fetch
    intervalRef.current = setInterval(poll, 5000);
    return () => clearInterval(intervalRef.current);
  }, [token]);

  return (
    <main className="page">
      {/* Breadcrumb */}
      <div className="breadcrumb" id="join-breadcrumb">
        <Link to="/">Hospitals</Link>
        <span className="separator">/</span>
        <span>{hospitalName}</span>
        <span className="separator">/</span>
        <span>{departmentName}</span>
      </div>

      {/* ────────── FORM (before token is created) ────────── */}
      {!token && (
        <div style={{ maxWidth: 520 }}>
          <div className="page-header">
            <h1>Join the Queue</h1>
            <p>Enter your details to receive a queue token for <strong>{departmentName}</strong>.</p>
          </div>

          <form className="panel" onSubmit={handleSubmit} id="join-form">
            <div className="form-group">
              <label className="form-label" htmlFor="patient-name">Patient Name</label>
              <input
                id="patient-name"
                className="form-input"
                type="text"
                placeholder="e.g. John Doe"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-checkbox-wrapper">
                <input
                  id="emergency-checkbox"
                  className="form-checkbox"
                  type="checkbox"
                  checked={emergency}
                  onChange={(e) => setEmergency(e.target.checked)}
                />
                <span className="form-checkbox-label">This is an emergency</span>
              </label>
            </div>

            {submitError && (
              <div className="error-box" id="join-error" style={{ marginBottom: '1rem' }}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {submitError}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting || !patientName.trim()}
              id="join-submit-btn"
            >
              {submitting ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Joining…
                </>
              ) : (
                'Join Queue'
              )}
            </button>
          </form>
        </div>
      )}

      {/* ────────── TOKEN DISPLAY (after creation) ────────── */}
      {token && (
        <div className="panel token-display" id="token-result" style={{ maxWidth: 520, margin: '0 auto' }}>
          <div className="token-label">Your Token Number</div>
          <div className="token-number">{token.tokenNumber}</div>

          <div className="token-patient-name">{token.patientName}</div>

          {token.emergency && (
            <div className="emergency-chip" style={{ marginBottom: '1rem' }}>
              <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Emergency
            </div>
          )}

          <div className={`token-status status-${token.status}`}>
            <span className="pulse-dot" />
            {token.status}
          </div>

          {/* Wait Time */}
          <div className="wait-time-box" id="wait-time-display">
            <div className="wait-time-label">
              <span className="pulse-dot" style={{ marginRight: 6 }} />
              Estimated Wait
            </div>
            {waitTime !== null && !waitError && (
              <>
                <div className="wait-time-value">{waitTime}</div>
                <div className="wait-time-unit">minutes</div>
              </>
            )}
            {waitTime === null && !waitError && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 8 }}>
                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                <span className="loading-text">Calculating…</span>
              </div>
            )}
            {waitError && (
              <div style={{ color: 'var(--color-danger-500)', fontSize: '0.85rem', paddingTop: 4 }}>
                {waitError}
              </div>
            )}
          </div>

          <div style={{ marginTop: 'var(--space-8)' }}>
            <Link to="/" className="btn btn-outline">
              ← Back to Hospitals
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

export default JoinQueue;
