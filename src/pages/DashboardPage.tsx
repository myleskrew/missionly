import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDashboardData, updatePriorityStatus, getYesterdaysPriorities } from '../lib/db';
import { DashboardSummary, DailyPriority } from '../types';
import { useEli } from '../hooks/useEli';
import { EliPanel } from '../components/eli/EliPanel';
import { startCheckout } from '../lib/stripe';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [upgraded, setUpgraded] = useState(false);
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [yesterdayPriorities, setYesterdayPriorities] = useState<DailyPriority[]>([]);
  const [loading, setLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [eliOpen, setEliOpen] = useState(false);
  const isAdmin = user?.email === 'myles.wanczyk@gmail.com';

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getDashboardData(user.id),
      getYesterdaysPriorities(user.id),
    ]).then(([d, yp]) => {
      setData(d);
      setYesterdayPriorities(yp);
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    if (location.search.includes('upgraded=true')) {
      setUpgraded(true);
      navigate('/dashboard', { replace: true });
    }
  }, [location, navigate]);

  const handleUpgrade = async (annual: boolean) => {
    if (!user) return;
    setCheckoutLoading(true);
    try {
      await startCheckout(user.id, user.email!, annual);
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert('Checkout failed: ' + (err?.message || 'Unknown error'));
      setCheckoutLoading(false);
    }
  };

  const togglePriority = async (priority: DailyPriority) => {
    const next = priority.status === 'pending' ? 'done' : 'pending';
    await updatePriorityStatus(priority.id, next);
    setData(prev => prev ? {
      ...prev,
      todayPriorities: prev.todayPriorities.map(p =>
        p.id === priority.id ? { ...p, status: next } : p
      )
    } : prev);
  };

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const weekNum = getWeekNumber(now);

  const userName = (data?.user as any)?.name || user?.email?.split('@')[0] || 'Friend';

  const eli = useEli({
    sessionType: 'dashboard',
    user: data?.user ?? user,
    mission: data?.mission ?? null,
    roles: data?.roles ?? [],
    roleGoals: data?.roleGoals ?? [],
    todayPriorities: data?.todayPriorities ?? [],
    yesterdayPriorities,
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ff-body)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--ff-display)', fontSize: '1.5rem', color: 'var(--ink)' }}>
            Mission<span style={{ color: 'var(--gold)' }}>ly</span>
          </div>
          <div style={{ color: 'var(--mist)', marginTop: '0.5rem', fontSize: '0.875rem' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)', fontFamily: 'var(--ff-body)', display: 'flex' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: '240px', flexShrink: 0, background: 'var(--ink)', display: 'flex',
        flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh',
        zIndex: 10
      }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
          <span style={{ fontFamily: 'var(--ff-display)', fontSize: '1.4rem', color: '#fff' }}>
            Mission<span style={{ color: 'var(--gold)' }}>ly</span>
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.5rem 0.75rem' }}>
          {[
            { to: '/dashboard', icon: '⬛', label: 'Dashboard' },
            { to: '/daily-plan', icon: '☀️', label: 'Daily Plan' },
            { to: '/weekly-plan', icon: '📅', label: 'This Week' },
            { to: '/reflection', icon: '🌙', label: 'Reflection' },
            ...(isAdmin ? [{ to: '/admin', icon: '🔧', label: 'Admin' }] : []),
          ].map(({ to, icon, label }) => {
            const active = window.location.pathname === to;
            return (
              <Link key={to} to={to} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.65rem 0.75rem', borderRadius: '8px', marginBottom: '0.25rem',
                textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500,
                background: active ? 'rgba(201,168,76,0.15)' : 'transparent',
                color: active ? 'var(--gold)' : 'var(--mist)',
                transition: 'all 0.15s'
              }}>
                <span style={{ fontSize: '1rem' }}>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--mist)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', background: 'var(--gold-dim)', color: 'var(--gold)', padding: '0.2rem 0.6rem', borderRadius: '10px', border: '1px solid rgba(201,168,76,0.3)' }}>
              {(data?.user as any)?.plan || 'free'}
            </span>
            <button onClick={signOut} style={{ background: 'none', border: 'none', color: 'var(--mist)', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}>
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ marginLeft: '240px', flex: 1, padding: '2rem', maxWidth: 'calc(100vw - 240px)' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '1.75rem', color: 'var(--ink)', margin: 0 }}>
              {greeting}, {userName}
            </h1>
            <p style={{ color: 'var(--mist)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {dayName}, {dateStr} · Week {weekNum}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {data && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--paper)', border: '1px solid var(--paper-dk)', borderRadius: '20px', padding: '0.4rem 0.9rem' }}>
                <span>🔥</span>
                <span style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '0.95rem' }}>{data.streakDaily}</span>
                <span style={{ color: 'var(--mist)', fontSize: '0.8rem' }}>day streak</span>
              </div>
            )}
            <button onClick={() => navigate('/daily-plan')} style={{
              background: 'var(--gold)', border: 'none', borderRadius: '8px',
              padding: '0.65rem 1.25rem', fontWeight: 600, fontSize: '0.9rem',
              color: 'var(--ink)', cursor: 'pointer'
            }}>
              ☀️ Start Daily Plan
            </button>
          </div>
        </div>

        {/* Mission Banner */}
        {data?.mission && (
          <div style={{
            background: 'var(--ink)', borderRadius: '14px', padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem', borderLeft: '4px solid var(--gold)'
          }}>
            <div style={{ color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Your Mission
            </div>
            <p style={{ color: '#fff', fontFamily: 'var(--ff-accent)', fontStyle: 'italic', lineHeight: 1.7, fontSize: '1rem', margin: 0 }}>
              {data.mission.text}
            </p>
          </div>
        )}

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={statCard}>
            <div style={statLabel}>Daily Streak</div>
            <div style={statValue}>{data?.streakDaily ?? 0} <span style={{ fontSize: '1.25rem' }}>🔥</span></div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '0.5rem' }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i < (data?.streakDaily ?? 0) % 7 ? 'var(--gold)' : 'var(--paper-dk)' }} />
              ))}
            </div>
          </div>

          <div style={statCard}>
            <div style={statLabel}>Weekly Streak</div>
            <div style={statValue}>{data?.streakWeekly ?? 0} <span style={{ fontSize: '1.25rem' }}>📅</span></div>
            <div style={{ color: 'var(--mist)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              weeks in a row
            </div>
          </div>

          <div style={statCard}>
            <div style={statLabel}>Week Progress</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
              <svg width="48" height="48" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="var(--paper-dk)" strokeWidth="4" />
                <circle cx="24" cy="24" r="20" fill="none" stroke="var(--gold)" strokeWidth="4"
                  strokeDasharray={`${(data?.weekProgressPct ?? 0) * 1.257} 125.7`}
                  strokeLinecap="round" strokeDashoffset="31.4"
                  transform="rotate(-90 24 24)" />
              </svg>
              <div style={statValue}>{data?.weekProgressPct ?? 0}%</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* Today's Priorities */}
          <div style={sectionCard}>
            <div style={sectionHeader}>
              <span style={sectionTitle}>Today's Priorities</span>
              <Link to="/daily-plan" style={{ fontSize: '0.8rem', color: 'var(--gold)', textDecoration: 'none' }}>+ Add</Link>
            </div>

            {data?.todayPriorities.length ? (
              data.todayPriorities.map(p => {
                const role = data.roles.find(r => r.id === p.roleId);
                return (
                  <div key={p.id} onClick={() => togglePriority(p)} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    padding: '0.75rem', borderRadius: '8px', marginBottom: '0.5rem',
                    background: p.status === 'done' ? 'var(--sage-dim)' : 'var(--paper)',
                    cursor: 'pointer', transition: 'background 0.15s'
                  }}>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0, marginTop: '1px',
                      border: p.status === 'done' ? 'none' : '2px solid var(--paper-dk)',
                      background: p.status === 'done' ? 'var(--sage)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {p.status === 'done' && <span style={{ color: '#fff', fontSize: '0.65rem' }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', color: 'var(--ink)', textDecoration: p.status === 'done' ? 'line-through' : 'none', opacity: p.status === 'done' ? 0.5 : 1 }}>
                        {p.text}
                      </div>
                      {role && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--mist)', marginTop: '0.2rem' }}>
                          {role.emoji} {role.name}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ color: 'var(--mist)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>No priorities set today</div>
                <button onClick={() => navigate('/daily-plan')} style={{ background: 'var(--gold)', border: 'none', borderRadius: '8px', padding: '0.6rem 1.25rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--ink)', cursor: 'pointer' }}>
                  Start Morning Plan
                </button>
              </div>
            )}
          </div>

          {/* Role Goals This Week */}
          <div style={sectionCard}>
            <div style={sectionHeader}>
              <span style={sectionTitle}>This Week's Roles</span>
              <Link to="/weekly-plan" style={{ fontSize: '0.8rem', color: 'var(--gold)', textDecoration: 'none' }}>Plan week</Link>
            </div>

            {data?.roles.length ? (
              data.roles.slice(0, 5).map(role => {
                const goal = data.roleGoals.find(g => g.roleId === role.id);
                return (
                  <div key={role.id} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--ink)' }}>
                        {role.emoji} {role.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--mist)' }}>{goal?.progressPct ?? 0}%</span>
                    </div>
                    {goal?.goal && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--slate)', margin: '0 0 0.35rem' }}>{goal.goal}</p>
                    )}
                    <div style={{ height: '4px', background: 'var(--paper-dk)', borderRadius: '2px' }}>
                      <div style={{ height: '100%', borderRadius: '2px', background: goal?.status === 'complete' ? 'var(--sage)' : 'var(--gold)', width: `${goal?.progressPct ?? 0}%`, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ color: 'var(--mist)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>No weekly goals yet</div>
                <button onClick={() => navigate('/weekly-plan')} style={{ background: 'var(--gold)', border: 'none', borderRadius: '8px', padding: '0.6rem 1.25rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--ink)', cursor: 'pointer' }}>
                  Plan This Week
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upgraded toast */}
        {upgraded && (
          <div style={{ marginTop: '1.5rem', background: 'var(--sage)', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🎉</span>
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Welcome to Pro!</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>You now have full access to Eli and all features.</div>
              </div>
            </div>
            <button onClick={() => setUpgraded(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
          </div>
        )}

        {/* Upgrade banner for free users */}
        {data && (data.user as any)?.plan !== 'pro' && (
          <div style={{ marginTop: '1.5rem', background: 'var(--ink)', borderRadius: 12, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(201,168,76,0.2)' }}>
            <div>
              <div style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.95rem' }}>✦ Unlock Missionly Pro</div>
              <div style={{ color: 'var(--mist)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Get full access to Eli, planning history, and streaks — $9/mo</div>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              style={{ background: 'var(--gold)', border: 'none', borderRadius: 8, padding: '0.6rem 1.25rem', fontWeight: 700, fontSize: '0.875rem', color: 'var(--ink)', cursor: 'pointer', flexShrink: 0 }}
            >
              Upgrade →
            </button>
          </div>
        )}

        {/* Evening Reflection banner */}
        {hour >= 17 && (
          <div onClick={() => navigate('/reflection')} style={{
            marginTop: '1.5rem', background: 'var(--night)', borderRadius: '14px',
            padding: '1.25rem 1.5rem', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>🌙 Evening Reflection</div>
              <div style={{ color: 'var(--mist)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Take a few minutes to close out your day</div>
            </div>
            <span style={{ color: 'var(--gold)', fontSize: '1.25rem' }}>→</span>
          </div>
        )}
      </main>

      {/* ── Upgrade Modal ── */}
      {showUpgradeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} onClick={() => setShowUpgradeModal(false)}>
          <div style={{ background: 'var(--ink)', borderRadius: 16, padding: '2.5rem', maxWidth: 420, width: '100%', border: '1px solid rgba(201,168,76,0.25)' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: 'var(--ff-display)', fontSize: '1.75rem', color: '#fff', marginBottom: '0.5rem' }}>
                Upgrade to <span style={{ color: 'var(--gold)' }}>Pro</span>
              </div>
              <p style={{ color: 'var(--mist)', fontSize: '0.875rem', lineHeight: 1.6 }}>Everything you need to live with intention — unlocked.</p>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.75rem' }}>
              {['Eli AI coach — unlimited chats','Full daily & evening planning','Planning history & streaks','Weekly role review','Priority support'].map(f => (
                <li key={f} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 700 }}>✓</span>{f}
                </li>
              ))}
            </ul>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => handleUpgrade(false)}
                disabled={checkoutLoading}
                style={{ background: 'var(--gold)', border: 'none', borderRadius: 10, padding: '0.875rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)', cursor: 'pointer', opacity: checkoutLoading ? 0.7 : 1 }}
              >
                {checkoutLoading ? 'Redirecting...' : '$9 / month →'}
              </button>
              <button
                onClick={() => handleUpgrade(true)}
                disabled={checkoutLoading}
                style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 10, padding: '0.875rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--gold)', cursor: 'pointer', opacity: checkoutLoading ? 0.7 : 1 }}
              >
                $79 / year — save $29
              </button>
            </div>
            <p style={{ textAlign: 'center', color: 'var(--mist)', fontSize: '0.75rem', marginTop: '1rem' }}>Cancel anytime · Powered by Stripe</p>
          </div>
        </div>
      )}

      {/* ── Eli floating panel ── */}
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 50 }}>
        {/* Toggle button */}
        <button
          onClick={() => setEliOpen(o => !o)}
          style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'var(--ink)', border: '2px solid var(--gold)',
            color: 'var(--gold)', fontSize: '1.1rem', fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            transition: 'transform 0.2s',
            marginLeft: 'auto'
          }}
          title="Chat with Eli"
        >
          {eliOpen ? '×' : 'E'}
        </button>

        {/* Chat panel */}
        {eliOpen && (
          <div style={{
            position: 'absolute', bottom: 64, right: 0,
            width: 320, height: 440, borderRadius: 16,
            overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
            border: '1px solid rgba(201,168,76,0.2)',
            animation: 'eli-slide-up 0.2s ease'
          }}>
            <style>{`@keyframes eli-slide-up { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
            <EliPanel
              messages={eli.messages}
              onSend={eli.sendMessage}
              loading={eli.loading}
              userName={userName}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

const statCard: React.CSSProperties = {
  background: 'var(--paper)', borderRadius: '12px', padding: '1.25rem'
};
const statLabel: React.CSSProperties = {
  color: 'var(--mist)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem'
};
const statValue: React.CSSProperties = {
  fontFamily: 'var(--ff-display)', fontSize: '2rem', color: 'var(--ink)', lineHeight: 1
};
const sectionCard: React.CSSProperties = {
  background: 'var(--paper)', borderRadius: '14px', padding: '1.25rem'
};
const sectionHeader: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'
};
const sectionTitle: React.CSSProperties = {
  fontWeight: 700, color: 'var(--ink)', fontSize: '0.95rem'
};
