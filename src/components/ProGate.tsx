import { startCheckout } from '../lib/stripe';
import { useState } from 'react';

interface ProGateProps {
  user: any;
  feature: string;
  description: string;
  children: React.ReactNode;
}

export function ProGate({ user, feature, description, children }: ProGateProps) {
  const isPro = user?.plan === 'pro';
  const [loading, setLoading] = useState(false);

  if (isPro) return <>{children}</>;

  const handleUpgrade = async (annual: boolean) => {
    if (!user?.id || !user?.email) return;
    setLoading(true);
    try {
      await startCheckout(user.id, user.email, annual);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--ivory)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--ff-body)',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: 480,
        width: '100%',
        textAlign: 'center',
      }}>
        <div style={{
          width: 64, height: 64,
          borderRadius: '50%',
          background: 'var(--night)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
          fontSize: '1.75rem',
        }}>✦</div>

        <h1 style={{
          fontFamily: 'var(--ff-display)',
          fontSize: '1.75rem',
          color: 'var(--ink)',
          margin: '0 0 0.5rem',
        }}>
          {feature} is a Pro feature
        </h1>

        <p style={{
          color: 'var(--slate)',
          fontSize: '1rem',
          lineHeight: 1.6,
          margin: '0 0 2rem',
        }}>
          {description}
        </p>

        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: '1.5rem',
          border: '1px solid var(--fog)',
          marginBottom: '1.5rem',
          textAlign: 'left',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--mist)', textTransform: 'uppercase', marginBottom: '1rem' }}>
            What you get with Pro
          </div>
          {[
            '☀️  Daily planning — check-in, priorities, win statement',
            '🌙  Evening reflection — review your day, reset for tomorrow',
            '🤖  Eli AI coach — full access with memory across sessions',
            '♾️   Unlimited life roles',
            '🔥  Streaks & planning history',
          ].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0', fontSize: '0.9rem', color: 'var(--ink)' }}>
              {item}
            </div>
          ))}
        </div>

        <button
          onClick={() => handleUpgrade(false)}
          disabled={loading}
          style={{
            width: '100%',
            background: 'var(--gold)',
            border: 'none',
            borderRadius: 10,
            padding: '0.9rem',
            fontWeight: 700,
            fontSize: '1rem',
            color: 'var(--ink)',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '0.75rem',
          }}
        >
          {loading ? 'Redirecting…' : 'Upgrade to Pro — $9/month'}
        </button>

        <button
          onClick={() => handleUpgrade(true)}
          disabled={loading}
          style={{
            width: '100%',
            background: 'transparent',
            border: '1.5px solid var(--gold)',
            borderRadius: 10,
            padding: '0.9rem',
            fontWeight: 600,
            fontSize: '0.95rem',
            color: 'var(--ink)',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '1.5rem',
          }}
        >
          $79/year — save $29
        </button>

        <p style={{ fontSize: '0.8rem', color: 'var(--mist)' }}>
          Cancel anytime.
        </p>
      </div>
    </div>
  );
}
