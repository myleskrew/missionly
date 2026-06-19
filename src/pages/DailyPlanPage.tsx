import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRoles, createDailyPlan, upsertPriority, updateStreak, getTodaysPlan, getTodaysPriorities } from '../lib/db';
import { Role, DailyPriority } from '../types';
import { ProGate } from '../components/ProGate';
import { supabase } from '../lib/supabase';

const INTENTIONS = [
  'I will be fully present in my most important moments',
  'I will do the hard thing first',
  'I will protect my energy and say no when needed',
  'I will treat people with patience and respect',
  'I will make progress on what matters most',
];

const FEELINGS = ['😤 Fired up', '😊 Solid', '😐 Neutral', '😴 Tired', '😰 Stressed'];

export default function DailyPlanPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [roles, setRoles] = useState<Role[]>([]);
  const [saving, setSaving] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [dbUser, setDbUser] = useState<any>(null);

  // Step 1
  const [feeling, setFeeling] = useState('');
  const [checkIn, setCheckIn] = useState('');

  // Step 2 — priorities
  const [priorities, setPriorities] = useState([
    { text: '', roleId: '' },
    { text: '', roleId: '' },
    { text: '', roleId: '' },
  ]);

  // Step 3
  const [winStatement, setWinStatement] = useState('');
  const [obstacle, setObstacle] = useState('');

  // Step 4
  const [intentions, setIntentions] = useState<boolean[]>(Array(INTENTIONS.length).fill(false));

  useEffect(() => {
    if (!user) return;
    supabase.from('users').select('plan, name').eq('id', user.id).single().then(({ data }) => setDbUser(data));
    getRoles(user.id).then(setRoles);
    getTodaysPlan(user.id).then(plan => {
      if (plan) setAlreadyDone(true);
    });
  }, [user]);

  if (dbUser && dbUser.plan !== 'pro') {
    return (
      <ProGate
        user={{ ...dbUser, id: user?.id, email: user?.email }}
        feature="Daily Planning"
        description="Start every day with intention. Daily planning — check-in, priorities, and your win statement — is a Pro feature that keeps your mission at the center of each day."
      >
        <></>
      </ProGate>
    );
  }

  const toggleIntention = (i: number) => {
    setIntentions(prev => prev.map((v, idx) => idx === i ? !v : v));
  };

  const updatePriority = (i: number, field: 'text' | 'roleId', value: string) => {
    setPriorities(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  };

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);

    const selectedIntentions = INTENTIONS.filter((_, i) => intentions[i]);
    const { data: plan } = await createDailyPlan(
      user.id,
      `${feeling} — ${checkIn}`.trim(),
      winStatement,
      obstacle,
      selectedIntentions
    );

    if (plan) {
      for (let i = 0; i < priorities.length; i++) {
        const p = priorities[i];
        if (p.text.trim()) {
          await upsertPriority(plan.id, p.text.trim(), p.roleId, i);
        }
      }
      await updateStreak(user.id, 'daily');
    }

    setStep(5);
    setSaving(false);
  };

  if (alreadyDone && step === 1) {
    return (
      <PageShell step={1} total={5}>
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={heading}>You've already planned today</h2>
          <p style={subtext}>Your morning plan is set. Come back tomorrow or check your dashboard.</p>
          <button onClick={() => navigate('/dashboard')} style={primaryBtn}>Back to Dashboard</button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell step={step} total={5}>

      {/* ── STEP 1: Morning check-in ── */}
      {step === 1 && (
        <div>
          <h2 style={heading}>Morning Check-In</h2>
          <p style={subtext}>How are you showing up today?</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {FEELINGS.map(f => (
              <button key={f} onClick={() => setFeeling(f)} style={{
                padding: '0.5rem 1rem', borderRadius: '20px', border: '2px solid',
                borderColor: feeling === f ? 'var(--gold)' : 'var(--paper-dk)',
                background: feeling === f ? 'var(--gold-dim)' : 'var(--paper)',
                color: 'var(--ink)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500
              }}>
                {f}
              </button>
            ))}
          </div>

          <div style={card}>
            <label style={label}>Anything on your mind this morning?</label>
            <textarea
              value={checkIn}
              onChange={e => setCheckIn(e.target.value)}
              placeholder="What are you carrying into today? What's got your attention?"
              style={{ ...textarea, minHeight: '100px' }}
            />
          </div>

          <div style={navRow}>
            <button onClick={() => navigate('/dashboard')} style={ghostBtn}>← Dashboard</button>
            <button onClick={() => setStep(2)} style={primaryBtn}>Next →</button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Top 3 priorities ── */}
      {step === 2 && (
        <div>
          <h2 style={heading}>Your Top 3 Priorities</h2>
          <p style={subtext}>What absolutely must happen today? Assign each to a role.</p>

          {priorities.map((p, i) => (
            <div key={i} style={{ ...card, marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: 'var(--gold)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: 'var(--ink)', flexShrink: 0
                }}>
                  {i + 1}
                </div>
                <input
                  value={p.text}
                  onChange={e => updatePriority(i, 'text', e.target.value)}
                  placeholder={`Priority ${i + 1}...`}
                  style={{ ...inputStyle, flex: 1 }}
                />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {roles.map(role => (
                  <button key={role.id} onClick={() => updatePriority(i, 'roleId', p.roleId === role.id ? '' : role.id)} style={{
                    padding: '0.3rem 0.7rem', borderRadius: '14px', border: '1px solid',
                    borderColor: p.roleId === role.id ? 'var(--gold)' : 'var(--paper-dk)',
                    background: p.roleId === role.id ? 'var(--gold-dim)' : 'transparent',
                    color: p.roleId === role.id ? 'var(--ink)' : 'var(--mist)',
                    cursor: 'pointer', fontSize: '0.78rem'
                  }}>
                    {role.emoji} {role.name}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div style={navRow}>
            <button onClick={() => setStep(1)} style={ghostBtn}>← Back</button>
            <button
              onClick={() => setStep(3)}
              disabled={priorities.every(p => !p.text.trim())}
              style={{ ...primaryBtn, opacity: priorities.every(p => !p.text.trim()) ? 0.5 : 1 }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Win statement ── */}
      {step === 3 && (
        <div>
          <h2 style={heading}>Define Your Win</h2>
          <p style={subtext}>What would make today a success? Be specific.</p>

          <div style={{ background: 'var(--ink)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
            <label style={{ ...label, color: 'var(--gold)' }}>Today is a win if…</label>
            <textarea
              value={winStatement}
              onChange={e => setWinStatement(e.target.value)}
              placeholder="e.g. I finish the project proposal, spend quality time with my kids, and get a workout in."
              style={{ ...textarea, color: '#fff', minHeight: '90px' }}
            />
          </div>

          <div style={card}>
            <label style={label}>What could get in the way?</label>
            <textarea
              value={obstacle}
              onChange={e => setObstacle(e.target.value)}
              placeholder="e.g. Back-to-back meetings, low energy in the afternoon..."
              style={{ ...textarea, minHeight: '70px' }}
            />
          </div>

          <div style={navRow}>
            <button onClick={() => setStep(2)} style={ghostBtn}>← Back</button>
            <button onClick={() => setStep(4)} style={primaryBtn}>Next →</button>
          </div>
        </div>
      )}

      {/* ── STEP 4: Intentions ── */}
      {step === 4 && (
        <div>
          <h2 style={heading}>Set Your Intentions</h2>
          <p style={subtext}>Choose the commitments you're making for today.</p>

          {INTENTIONS.map((intention, i) => (
            <div key={i} onClick={() => toggleIntention(i)} style={{
              display: 'flex', alignItems: 'center', gap: '0.85rem',
              padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '0.6rem',
              background: intentions[i] ? 'var(--gold-dim)' : 'var(--paper)',
              border: `2px solid ${intentions[i] ? 'var(--gold)' : 'transparent'}`,
              cursor: 'pointer', transition: 'all 0.15s'
            }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                border: intentions[i] ? 'none' : '2px solid var(--paper-dk)',
                background: intentions[i] ? 'var(--gold)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {intentions[i] && <span style={{ color: 'var(--ink)', fontSize: '0.65rem', fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ fontSize: '0.9rem', color: 'var(--ink)', lineHeight: 1.4 }}>{intention}</span>
            </div>
          ))}

          <div style={navRow}>
            <button onClick={() => setStep(3)} style={ghostBtn}>← Back</button>
            <button onClick={handleComplete} disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Complete Plan ✓'}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 5: Done ── */}
      {step === 5 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
          <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '2rem', color: 'var(--ink)', marginBottom: '0.75rem' }}>
            Day locked in.
          </h2>
          <p style={{ color: 'var(--slate)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Your priorities are set. Your intentions are clear. Now go execute.
          </p>

          <div style={{ background: 'var(--paper)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            <div style={{ color: 'var(--mist)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Your priorities today</div>
            {priorities.filter(p => p.text.trim()).map((p, i) => {
              const role = roles.find(r => r.id === p.roleId);
              return (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--ink)' }}>{p.text}</div>
                    {role && <div style={{ fontSize: '0.75rem', color: 'var(--mist)' }}>{role.emoji} {role.name}</div>}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/dashboard')} style={primaryBtn}>
              Go to Dashboard →
            </button>
          </div>
        </div>
      )}

    </PageShell>
  );
}

function PageShell({ step, total, children }: { step: number; total: number; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)', fontFamily: 'var(--ff-body)' }}>
      <div style={{ height: '3px', background: 'var(--paper-dk)' }}>
        <div style={{ height: '100%', background: 'var(--gold)', width: `${(step / total) * 100}%`, transition: 'width 0.4s ease' }} />
      </div>
      <div style={{ maxWidth: '580px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontFamily: 'var(--ff-display)', fontSize: '1.4rem', color: 'var(--ink)' }}>
            Mission<span style={{ color: 'var(--gold)' }}>ly</span>
          </span>
          <div style={{ color: 'var(--mist)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Daily Plan · Step {step} of {total}</div>
        </div>
        {children}
      </div>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  background: 'var(--gold)', border: 'none', borderRadius: '8px',
  padding: '0.8rem 1.75rem', fontWeight: 600, fontSize: '0.95rem',
  color: 'var(--ink)', cursor: 'pointer'
};
const ghostBtn: React.CSSProperties = {
  background: 'none', border: '1px solid var(--paper-dk)', borderRadius: '8px',
  padding: '0.8rem 1.25rem', fontWeight: 500, fontSize: '0.9rem',
  color: 'var(--slate)', cursor: 'pointer'
};
const heading: React.CSSProperties = {
  fontFamily: 'var(--ff-display)', fontSize: '1.85rem', color: 'var(--ink)', marginBottom: '0.5rem'
};
const subtext: React.CSSProperties = {
  color: 'var(--slate)', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: 1.6
};
const card: React.CSSProperties = {
  background: 'var(--paper)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem'
};
const label: React.CSSProperties = {
  display: 'block', fontWeight: 600, color: 'var(--ink)', fontSize: '0.9rem', marginBottom: '0.6rem'
};
const textarea: React.CSSProperties = {
  width: '100%', background: 'transparent', border: 'none',
  resize: 'vertical', fontFamily: 'var(--ff-body)', fontSize: '0.9rem',
  color: 'var(--ink)', outline: 'none', lineHeight: 1.6, boxSizing: 'border-box'
};
const inputStyle: React.CSSProperties = {
  padding: '0.6rem 0.75rem', background: 'var(--ivory)', border: '1px solid var(--paper-dk)',
  borderRadius: '8px', fontSize: '0.9rem', color: 'var(--ink)', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'var(--ff-body)'
};
const navRow: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem'
};
