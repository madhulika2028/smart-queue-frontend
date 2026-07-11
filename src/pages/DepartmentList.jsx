import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { fetchDepartments } from '../api';

function DepartmentList() {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const hospitalName = location.state?.hospitalName || `Hospital #${hospitalId}`;

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchDepartments(hospitalId)
      .then((data) => {
        if (!cancelled) setDepartments(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load departments.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [hospitalId]);

  return (
    <main className="page">
      {/* Breadcrumb */}
      <div className="breadcrumb" id="dept-breadcrumb">
        <Link to="/">Hospitals</Link>
        <span className="separator">/</span>
        <span>{hospitalName}</span>
      </div>

      {/* Header */}
      <div className="page-header">
        <h1>{hospitalName}</h1>
        <p>Choose a department to join the queue.</p>
      </div>

      {/* States */}
      {loading && (
        <div className="loading-wrapper" id="dept-loading">
          <div className="spinner" />
          <span className="loading-text">Loading departments…</span>
        </div>
      )}

      {error && (
        <div className="error-box" id="dept-error">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {!loading && !error && departments.length === 0 && (
        <div className="empty-state" id="dept-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
          </svg>
          <h3>No departments found</h3>
          <p>This hospital has not registered any departments yet.</p>
        </div>
      )}

      {/* Card Grid */}
      {!loading && !error && departments.length > 0 && (
        <div className="card-grid" id="dept-grid">
          {departments.map((d) => (
            <div
              key={d.id}
              className="card"
              id={`dept-card-${d.id}`}
              onClick={() => navigate(`/departments/${d.id}/join`, { state: { departmentName: d.name, hospitalName } })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/departments/${d.id}/join`, { state: { departmentName: d.name, hospitalName } })}
            >
              <div className="card-title">{d.name}</div>
              <div className="card-meta">
                <span className="card-badge badge-blue">
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Avg. {d.avgServiceTimeMinutes} min
                </span>
                <span className="card-badge badge-green">Join Queue →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default DepartmentList;
