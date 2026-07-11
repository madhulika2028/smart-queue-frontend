import { useState, useEffect } from 'react';
import { fetchHospitals, fetchDepartments, callNext, markComplete } from '../api';

function StaffDashboard() {
  // ── Hospital + Department selectors ──
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');

  const [hospitalsLoading, setHospitalsLoading] = useState(true);
  const [hospitalsError, setHospitalsError] = useState(null);
  const [deptsLoading, setDeptsLoading] = useState(false);
  const [deptsError, setDeptsError] = useState(null);

  // ── Action state ──
  const [callingNext, setCallingNext] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [actionError, setActionError] = useState(null);

  // ── Currently serving token ──
  const [serving, setServing] = useState(null);

  // Load hospitals on mount
  useEffect(() => {
    setHospitalsLoading(true);
    fetchHospitals()
      .then((data) => {
        setHospitals(data);
        setHospitalsError(null);
      })
      .catch((err) => setHospitalsError(err.message || 'Failed to load hospitals.'))
      .finally(() => setHospitalsLoading(false));
  }, []);

  // Load departments when hospital changes
  useEffect(() => {
    if (!selectedHospitalId) {
      setDepartments([]);
      setSelectedDeptId('');
      return;
    }
    let cancelled = false;
    setDeptsLoading(true);
    setDeptsError(null);
    setDepartments([]);
    setSelectedDeptId('');
    setServing(null);
    fetchDepartments(selectedHospitalId)
      .then((data) => { if (!cancelled) setDepartments(data); })
      .catch((err) => { if (!cancelled) setDeptsError(err.message || 'Failed to load departments.'); })
      .finally(() => { if (!cancelled) setDeptsLoading(false); });
    return () => { cancelled = true; };
  }, [selectedHospitalId]);

  // Reset serving when department changes
  useEffect(() => {
    setServing(null);
    setActionError(null);
  }, [selectedDeptId]);

  // ── Handlers ──
  async function handleCallNext() {
    if (!selectedDeptId) return;
    setCallingNext(true);
    setActionError(null);
    try {
      const token = await callNext(selectedDeptId);
      setServing(token);
    } catch (err) {
      setActionError(err.message || 'Failed to call next token.');
    } finally {
      setCallingNext(false);
    }
  }

  async function handleComplete() {
    if (!serving) return;
    setCompleting(true);
    setActionError(null);
    try {
      await markComplete(serving.id);
      setServing(null);
    } catch (err) {
      setActionError(err.message || 'Failed to mark complete.');
    } finally {
      setCompleting(false);
    }
  }

  return (
    <main className="page">
      <div className="page-header">
        <h1>Staff Dashboard</h1>
        <p>Manage the queue — call the next patient and mark tokens as completed.</p>
      </div>

      <div className="staff-layout">
        {/* ── Left: Controls ── */}
        <div>
          <div className="panel" id="staff-controls">
            {/* Hospital selector */}
            <div className="form-group">
              <label className="form-label" htmlFor="staff-hospital-select">Hospital</label>
              {hospitalsLoading && <span className="loading-text">Loading hospitals…</span>}
              {hospitalsError && (
                <div className="error-box" style={{ marginBottom: 12 }}>{hospitalsError}</div>
              )}
              {!hospitalsLoading && !hospitalsError && (
                <select
                  id="staff-hospital-select"
                  className="form-select"
                  value={selectedHospitalId}
                  onChange={(e) => setSelectedHospitalId(e.target.value)}
                >
                  <option value="">— Select a hospital —</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>{h.name} ({h.city})</option>
                  ))}
                </select>
              )}
            </div>

            {/* Department selector */}
            <div className="form-group">
              <label className="form-label" htmlFor="staff-dept-select">Department</label>
              {deptsLoading && <span className="loading-text">Loading departments…</span>}
              {deptsError && (
                <div className="error-box" style={{ marginBottom: 12 }}>{deptsError}</div>
              )}
              {!deptsLoading && !deptsError && (
                <select
                  id="staff-dept-select"
                  className="form-select"
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  disabled={!selectedHospitalId || departments.length === 0}
                >
                  <option value="">
                    {!selectedHospitalId
                      ? '— Select a hospital first —'
                      : departments.length === 0
                        ? '— No departments —'
                        : '— Select a department —'}
                  </option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleCallNext}
                disabled={!selectedDeptId || callingNext}
                id="call-next-btn"
              >
                {callingNext ? (
                  <>
                    <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    Calling…
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                    Call Next
                  </>
                )}
              </button>

              {serving && (
                <button
                  className="btn btn-success btn-lg"
                  onClick={handleComplete}
                  disabled={completing}
                  id="mark-complete-btn"
                >
                  {completing ? (
                    <>
                      <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                      Completing…
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Mark Complete
                    </>
                  )}
                </button>
              )}
            </div>

            {actionError && (
              <div className="error-box" id="staff-action-error" style={{ marginTop: '1rem' }}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {actionError}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Now Serving ── */}
        <div>
          {!serving && selectedDeptId && (
            <div className="panel" style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--color-gray-400)' }} id="staff-idle">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 12, opacity: 0.4 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <p style={{ fontWeight: 500 }}>Press <strong>"Call Next"</strong> to serve the next patient</p>
            </div>
          )}

          {!serving && !selectedDeptId && (
            <div className="panel" style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--color-gray-400)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 12, opacity: 0.4 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
              <p style={{ fontWeight: 500 }}>Select a hospital and department to begin</p>
            </div>
          )}

          {serving && (
            <div className="now-serving" id="now-serving-display">
              <div className="now-serving-label">Now Serving</div>
              <div className="token-number">{serving.tokenNumber}</div>
              <div className="token-patient-name">{serving.patientName}</div>
              {serving.emergency && (
                <div className="emergency-chip" style={{ marginBottom: '0.5rem' }}>
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Emergency
                </div>
              )}
              <div className={`token-status status-${serving.status}`}>
                <span className="pulse-dot" />
                {serving.status}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default StaffDashboard;
