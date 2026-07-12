import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <main className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <div className="not-found-number">404</div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-gray-800)', marginBottom: '0.75rem' }}>
        Page Not Found
      </h1>
      <p style={{ color: 'var(--color-gray-500)', maxWidth: 400, marginBottom: '2rem' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        ← Back to Home
      </Link>
    </main>
  );
}

export default NotFound;
