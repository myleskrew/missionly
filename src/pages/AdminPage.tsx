import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAdminData } from '../lib/db';

const ADMIN_EMAIL = 'myles.wanczyk@gmail.com';

export default function AdminPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<'overview' | 'users' | 'early-access'>('overview');

  useEffect(() => {
    if (!user) return;
    if (user.email !== ADMIN_EMAIL) { navigate('/dashboard'); return; }
    getAdminData().then(d => { setData(d); setLoading(false); });
  }, [user, navigate]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ff-body)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--ff-display)', fontSize: '1.5rem', color: 'var(--ink)' }}>Mission<span style={{ color: 'var(--gold)' }}>ly</span></div>
          <div style={{ color: 'var(--mist)', marginTop: '0.5rem', fontSize: '0.875rem' }}>Loading admin...</div>
        </div>
      </div>
    );
  }

  const activeUsers7d = new Set(data?.recentDailyPlans?.map((p: any) => p.user_id) || []).size;

  const navItems = [
    { key: 'overview', icon: '📊', label: 'Overview' },
    { key: 'users', icon: '👤', label: 'Users' },
    { key: 'early-access', icon: '✉️', label: 'Early Access' },
  ];

  const appNavItems = [
    { to: '/dashboard', icon: '⬛', label: 'Dashboard' },
    { to: '/daily-plan', icon: '☀️', label: 'Daily Plan' },
    { to: '/weekly-plan', icon: '📅', label: 'This Week' },
    { to: '/reflection', icon: '🌙', label: 'Reflection' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)', fontFamily: 'var(--ff-body)', display: 'flex' }}>

      {/* ── Sidebar ── */}
      <aside style={{ width: 240, flexShrink: 0, background: 'var(--ink)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 10 }}>
        <div style={{ padding: '1.5rem 1.5rem 0.5rem' }}>
          <span style={{ fontFamily: 'var(--ff-display)', fontSize: '1.4rem', color: '#fff' }}>
            Mission<span style={{ color: 'var(--gold)' }}>ly</span>
          </span>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginTop: '0.2rem', background: 'var(--gold-dim)', border: '1px solid rgba(201,168,76,0.3)', display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: 6 }}>Admin</div>
        </div>

        {/* Admin nav */}
        <div style={{ padding: '1rem 0.75rem 0' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mist)', padding: '0 0.75rem', marginBottom: '0.5rem' }}>Admin</div>
          {navItems.map(item => (
            <button key={item.key} onClick={() => setSection(item.key as any)} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              width: '100%', padding: '0.65rem 0.75rem', borderRadius: 8, marginBottom: 4,
              background: section === item.key ? 'rgba(201,168,76,0.15)' : 'transparent',
              color: section === item.key ? 'var(--gold)' : 'var(--mist)',
              border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, textAlign: 'left'
            }}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ margin: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }} />

        {/* App nav */}
        <div style={{ padding: '0 0.75rem', flex: 1 }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mist)', padding: '0 0.75rem', marginBottom: '0.5rem' }}>App</div>
          {appNavItems.map(({ to, icon, label }) => (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.65rem 0.75rem', borderRadius: 8, marginBottom: 4,
              textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500,
              color: 'var(--mist)', transition: 'all 0.15s'
            }}>
              <span>{icon}</span>{label}
            </Link>
          ))}
        </div>

        {/* User */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--mist)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          <button onClick={signOut} style={{ background: 'none', border: 'none', color: 'var(--mist)', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}>Sign out</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ marginLeft: 240, flex: 1, padding: '2rem' }}>

        {/* ── OVERVIEW ── */}
        {section === 'overview' && (
          <div>
            <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '1.75rem', color: 'var(--ink)', marginBottom: '0.25rem' }}>Overview</h1>
            <p style={{ color: 'var(--mist)', fontSize: '0.875rem', marginBottom: '2rem' }}>How Missionly is doing right now</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Total Users', value: data?.users?.length ?? 0, icon: '👤', sub: 'signed up' },
                { label: 'Early Access', value: data?.earlyAccess?.length ?? 0, icon: '✉️', sub: 'on the list' },
                { label: 'Active (7d)', value: activeUsers7d, icon: '🔥', sub: 'made a plan' },
                { label: 'Weekly Plans', value: data?.recentWeeklyPlans?.length ?? 0, icon: '📅', sub: 'last 30 days' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--paper)', borderRadius: 14, padding: '1.25rem' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                  <div style={{ fontFamily: 'var(--ff-display)', fontSize: '2.25rem', color: 'var(--ink)', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--ink)', marginTop: '0.35rem' }}>{s.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--mist)' }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Recent activity */}
            <div style={{ background: 'var(--paper)', borderRadius: 14, padding: '1.25rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '1rem' }}>Recent Signups</div>
              {data?.users?.slice(0, 5).map((u: any) => (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid var(--paper-dk)' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--ink)' }}>{u.email}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--mist)' }}>Joined {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--mist)' }}>🔥 {u.streak_daily || 0}</span>
                    <span style={{ fontSize: '0.72rem', background: u.plan === 'pro' ? 'var(--gold-dim)' : 'var(--paper-dk)', color: u.plan === 'pro' ? 'var(--gold)' : 'var(--mist)', padding: '0.2rem 0.6rem', borderRadius: 8, fontWeight: 600 }}>{u.plan || 'free'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {section === 'users' && (
          <div>
            <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '1.75rem', color: 'var(--ink)', marginBottom: '0.25rem' }}>Users</h1>
            <p style={{ color: 'var(--mist)', fontSize: '0.875rem', marginBottom: '2rem' }}>{data?.users?.length ?? 0} total accounts</p>
            <div style={{ background: 'var(--paper)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px 80px 80px', gap: '0.5rem', padding: '0.75rem 1.25rem', borderBottom: '2px solid var(--paper-dk)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--mist)' }}>
                <span>Email</span><span>Joined</span><span>Plan</span><span style={{ textAlign: 'center' }}>Onboarded</span><span style={{ textAlign: 'center' }}>🔥 Streak</span>
              </div>
              {data?.users?.map((u: any) => (
                <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px 80px 80px', gap: '0.5rem', padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--paper-dk)', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--ink)', fontWeight: 500 }}>{u.email}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--mist)' }}>{new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span style={{ fontSize: '0.72rem', background: u.plan === 'pro' ? 'var(--gold-dim)' : 'var(--paper-dk)', color: u.plan === 'pro' ? 'var(--gold)' : 'var(--mist)', padding: '0.2rem 0.6rem', borderRadius: 8, fontWeight: 600, display: 'inline-block' }}>{u.plan || 'free'}</span>
                  <span style={{ textAlign: 'center', fontSize: '0.875rem' }}>{u.onboarding_done ? '✅' : '○'}</span>
                  <span style={{ textAlign: 'center', fontSize: '0.875rem', fontWeight: 700, color: u.streak_daily > 0 ? 'var(--gold)' : 'var(--mist)' }}>{u.streak_daily || 0}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── EARLY ACCESS ── */}
        {section === 'early-access' && (
          <div>
            <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '1.75rem', color: 'var(--ink)', marginBottom: '0.25rem' }}>Early Access</h1>
            <p style={{ color: 'var(--mist)', fontSize: '0.875rem', marginBottom: '2rem' }}>{data?.earlyAccess?.length ?? 0} people on the list</p>
            <div style={{ background: 'var(--paper)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', padding: '0.75rem 1.25rem', borderBottom: '2px solid var(--paper-dk)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--mist)' }}>
                <span>Email</span><span>Signed Up</span>
              </div>
              {data?.earlyAccess?.map((e: any) => (
                <div key={e.email} style={{ display: 'grid', gridTemplateColumns: '1fr 160px', padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--paper-dk)', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--ink)', fontWeight: 500 }}>{e.email}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--mist)' }}>{new Date(e.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              ))}
              {(!data?.earlyAccess || data.earlyAccess.length === 0) && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--mist)', fontSize: '0.875rem' }}>No signups yet — share the landing page!</div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
