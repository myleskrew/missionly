import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ff-body)' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '3rem', color: '#fff' }}>
          Mission<span style={{ color: 'var(--gold)' }}>ly</span>
        </h1>
        <p style={{ color: 'var(--mist)', marginBottom: '2rem' }}>Live with intention.</p>
        <Link to="/signin" style={{ background: 'var(--gold)', color: 'var(--ink)', padding: '0.75rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
          Get Started
        </Link>
      </div>
    </div>
  );
}
