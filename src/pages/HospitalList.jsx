import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchHospitals } from '../api';

function HospitalList() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [city, setCity] = useState('');
  const navigate = useNavigate();

  const load = useCallback(async (cityFilter) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHospitals(cityFilter);
      setHospitals(data);
    } catch (err) {
      setError(err.message || 'Failed to load hospitals. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load is handled by the debounced city filter since city defaults to ''
  // Debounced city filter
  useEffect(() => {
    const timer = setTimeout(() => load(city), 350);
    return () => clearTimeout(timer);
  }, [city, load]);

  return (
    <main className="page">
      {/* Header */}
      <div className="page-header">
        <h1>Find a Hospital</h1>
        <p>Search by city to browse hospitals and join a department queue.</p>
      </div>

      {/* Search */}
      <div className="search-bar" id="hospital-search">
        <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
        <input
          type="text"
          placeholder="Filter by city…"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          id="city-filter-input"
        />
      </div>

      {/* States */}
      {loading && (
        <div className="loading-wrapper" id="hospital-loading">
          <div className="spinner" />
          <span className="loading-text">Loading hospitals…</span>
        </div>
      )}

      {error && (
        <div className="error-box" id="hospital-error">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {!loading && !error && hospitals.length === 0 && (
        <div className="empty-state" id="hospital-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <h3>No hospitals found</h3>
          <p>Try a different city filter or clear the search.</p>
        </div>
      )}

      {/* Card Grid */}
      {!loading && !error && hospitals.length > 0 && (
        <div className="card-grid" id="hospital-grid">
          {hospitals.map((h) => (
            <div
              key={h.id}
              className="card"
              id={`hospital-card-${h.id}`}
              onClick={() => navigate(`/hospitals/${h.id}/departments`, { state: { hospitalName: h.name } })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/hospitals/${h.id}/departments`, { state: { hospitalName: h.name } })}
            >
              <div className="card-title">{h.name}</div>
              <div className="card-subtitle">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0 }}>
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {h.city}
              </div>
              <div className="card-subtitle" style={{ marginTop: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0 }}>
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                {h.address}
              </div>
              <div className="card-meta">
                <span className="card-badge badge-blue">View Departments →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default HospitalList;
