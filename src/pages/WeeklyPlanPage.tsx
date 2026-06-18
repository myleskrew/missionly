import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRoles, getMission, createWeeklyPlan, upsertRoleGoal, updateStreak, getCurrentWeeklyPlan } from '../lib/db';
import { Role, Mission } from '../types';

const THEME_WORDS = ['Present', 'Disciplined', 'Grounded', 'Bold', 'Focused', 'Faithful', 'Relentless', 'Intentional', 'Grateful', 'Humble'];

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export default function WeeklyPlanPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [roles, setRoles] = useState<Role[]>([]);
  const [mission, setMission] = useState<Mission | null>(null);
  const [saving, setSaving] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);

  // Step 1 — last week review
  const [reviewWins, setReviewWins] = useState('');
  const [reviewLessons, setReviewLessons] = useState('');

  // Step 3 — role goals: roleId → { goal, goalSecondary }
  const [roleGoals, setRoleGoals] = useState<Record<string, { goal: string; goalSecondary: string }>>({});

  // Step 4 — theme
  const [themeWord, setThemeWord] = useState('');
  const [customTheme, setCustomTheme] = useState('');
  const [themeMeaning, setThemeMeaning] = useState('');
  const [themeNo, setThemeNo] = useState('');

  const now = new Date();
  const weekNum = getWeekNumber(now);
  const year = now.getFullYear();

  useEffect(() => {
    if (!user) return;
    Promise.all([getRoles(user.id), getMission(user.id)]).then(([r, m]) => {
      setRoles(r);
      setMission(m);
      const initial: Record<string, { goal: string; goalSecondary: string }> = {};
      r.forEach(role => { initial[role.id] = { goal: '', goalSecondary: '' }; });
      setRoleGoals(initial);
    });
    getCurrentWeeklyPlan(user.id).then(plan => {
      if (plan) setAlreadyDone(true);
    });
  }, [user]);

  const updateGoal = (roleId: string, field: 'goal' | 'goalSecondary', value: string) => {
    setRoleGoals(prev => ({ ...prev, [roleId]: { ...prev[roleId], [field]: value } }));
  };

  const finalThemeWord = themeWord || customTheme;

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);

    const { data: plan } = await createWeeklyPlan(
      user.id, weekNum, year,
      finalThemeWord, themeMeaning,
      reviewWins, reviewLessons
    );

    if (plan) {
      for (const role of roles) {
        const g = roleGoals[role.id];
        if (g?.goal.trim()) {
          await upsertRoleGoal(plan.id, role.id, g.goal.trim(), g.goalSecondary.trim());
        }
      }
      await updateStreak(user.id, 'weekly');
    }

    setSaving(false);
    navigate('/dashboard');
  };

  if (alreadyDone && step === 1) {
    return (
      <PageShell step={1} total={5} weekNum={weekNum}>
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={heading}>Week {weekNum} is already planned</h2>
          <p style={subtext}>Your weekly plan is set. Check back next Sunday.</p>
          <button onClick={() => navigate('/dashboard')} style={primaryBtn}>Back to Dashboard</button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell step={step} total={5} weekNum={weekNum}>

      {/* ── STEP 1: Last week review ── */}
      {step === 1 && (
        <div>
          <h2 style={heading}>Last Week Review</h2>
          <p style={subtext}>Before you plan ahead, look back. What happened last week?</p>

          <div style={card}>
            <label style={label}>🏆 What were your wins?</label>
            <textarea
              value={reviewWins}
              onChange={e => setReviewWins(e.target.value)}
              placeholder="What went well? What are you proud of?"
              style={{ ...textarea, minHeight: '90px' }}
            />
          </div>

          <div style={card}>
            <label style={label}>📖 What did you learn?</label>
            <textarea
              value={reviewLessons}
              onChange={e => setReviewLessons(e.target.value)}
              placeholder="What would you do differently? What patterns did you notice?"
              style={{ ...textarea, minHeight: '90px' }}
            />
          </div>

          <div style={navRow}>
            <button onClick={() => navigate('/dashboard')} style={ghostBtn}>← Dashboard</button>
            <button onClick={() => setStep(2)} style={primaryBtn}>Next →</button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Mission re-read ── */}
      {step === 2 && (
        <div>
          <h2 style={heading}>Your Mission</h2>
          <p style={subtext}>Read this slowly. Let it anchor your week.</p>

          <div style={{ background: 'var(--ink)', borderRadius: '14px', padding: '1.75rem', marginBottom: '1.5rem' }}>
            <div style={{ color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Your Mission Statement
            </div>
            <p style={{ color: '#fff', fontFamily: 'var(--ff-accent)', fontStyle: 'italic', lineHeight: 1.8, fontSize: '1.05rem', margin: 0 }}>
              {mission?.text || 'Your mission statement will appear here.'}
            </p>
          </div>

          <div style={card}>
            <label style={label}>How aligned was last week with this mission?</label>
            <textarea
              placeholder="Be honest. Where did you live it out? Where did you fall short?"
              style={{ ...textarea, minHeight: '80px' }}
            />
          </div>

          <div style={card}>
            <label style={label}>What's one thing you can do this week to live this more fully?</label>
            <textarea
              placeholder="One concrete action..."
              style={{ ...textarea, minHeight: '70px' }}
            />
          </div>

          <div style={navRow}>
            <button onClick={() => setStep(1)} style={ghostBtn}>← Back</button>
            <button onClick={() => setStep(3)} style={primaryBtn}>Next →</button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Role goals ── */}
      {step === 3 && (
        <div>
          <h2 style={heading}>Role Goals</h2>
          <p style={subtext}>Set 1–2 goals for each role this week. Keep them specific and achievable.</p>

          {roles.map(role => (
            <div key={role.id} style={{ ...card, marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem' }}>{role.emoji}</span>
                <span style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '0.95rem' }}>{role.name}</span>
              </div>
              <input
                value={roleGoals[role.id]?.goal || ''}
                onChange={e => updateGoal(role.id, 'goal', e.target.value)}
                placeholder={`Main goal for ${role.name} this week...`}
                style={{ ...inputStyle, width: '100%', marginBottom: '0.5rem' }}
              />
              <input
                value={roleGoals[role.id]?.goalSecondary || ''}
                onChange={e => updateGoal(role.id, 'goalSecondary', e.target.value)}
                placeholder="Secondary goal (optional)..."
                style={{ ...inputStyle, width: '100%' }}
              />
            </div>
          ))}

          <div style={navRow}>
            <button onClick={() => setStep(2)} style={ghostBtn}>← Back</button>
            <button
              onClick={() => setStep(4)}
              disabled={roles.every(r => !roleGoals[r.id]?.goal.trim())}
              style={{ ...primaryBtn, opacity: roles.every(r => !roleGoals[r.id]?.goal.trim()) ? 0.5 : 1 }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: Weekly theme ── */}
      {step === 4 && (
        <div>
          <h2 style={heading}>Your Word for the Week</h2>
          <p style={subtext}>One word to define how you'll show up. It becomes your filter for every decision.</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {THEME_WORDS.map(word => (
              <button key={word} onClick={() => { setThemeWord(word); setCustomTheme(''); }} style={{
                padding: '0.5rem 1rem', borderRadius: '20px', border: '2px solid',
                borderColor: themeWord === word ? 'var(--gold)' : 'var(--paper-dk)',
                background: themeWord === word ? 'var(--gold-dim)' : 'var(--paper)',
                color: 'var(--ink)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500
              }}>
                {word}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <input
              value={customTheme}
              onChange={e => { setCustomTheme(e.target.value); setThemeWord(''); }}
              placeholder="Or type your own word..."
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>

          {finalThemeWord && (
            <>
              <div style={card}>
                <label style={label}>What does <em>{finalThemeWord}</em> mean to you this week?</label>
                <textarea
                  value={themeMeaning}
                  onChange={e => setThemeMeaning(e.target.value)}
                  placeholder="In concrete terms, what does living this word look like?"
                  style={{ ...textarea, minHeight: '80px' }}
                />
              </div>
              <div style={card}>
                <label style={label}>What are you saying NO to this week to protect this?</label>
                <textarea
                  value={themeNo}
                  onChange={e => setThemeNo(e.target.value)}
                  placeholder="What distractions, habits, or time-wasters are you cutting?"
                  style={{ ...textarea, minHeight: '70px' }}
                />
              </div>
            </>
          )}

          <div style={navRow}>
            <button onClick={() => setStep(3)} style={ghostBtn}>← Back</button>
            <button onClick={() => setStep(5)} disabled={!finalThemeWord} style={{ ...primaryBtn, opacity: !finalThemeWord ? 0.5 : 1 }}>
              Preview Week →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 5: Preview + commit ── */}
      {step === 5 && !saving && (
        <div>
          <h2 style={heading}>Week {weekNum} — Locked In</h2>
          <p style={subtext}>Here's your plan. Commit to it.</p>

          {/* Theme word */}
          <div style={{ background: 'var(--ink)', borderRadius: '14px', padding: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--mist)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Word of the Week</div>
            <div style={{ fontFamily: 'var(--ff-display)', fontSize: '2.5rem', color: 'var(--gold)' }}>{finalThemeWord}</div>
            {themeMeaning && <p style={{ color: 'var(--mist)', fontSize: '0.85rem', marginTop: '0.5rem', fontStyle: 'italic' }}>{themeMeaning}</p>}
          </div>

          {/* Mission */}
          <div style={{ background: 'var(--paper)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem', borderLeft: '3px solid var(--gold)' }}>
            <div style={{ color: 'var(--mist)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Mission</div>
            <p style={{ color: 'var(--ink)', fontFamily: 'var(--ff-accent)', fontStyle: 'italic', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              {mission?.text}
            </p>
          </div>

          {/* Role goals summary */}
          <div style={{ background: 'var(--paper)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ color: 'var(--mist)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Role Goals</div>
            {roles.filter(r => roleGoals[r.id]?.goal.trim()).map(role => (
              <div key={role.id} style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ink)', marginBottom: '0.2rem' }}>
                  {role.emoji} {role.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--slate)' }}>{roleGoals[role.id].goal}</div>
                {roleGoals[role.id].goalSecondary && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--mist)', marginTop: '0.15rem' }}>{roleGoals[role.id].goalSecondary}</div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setStep(4)} style={ghostBtn}>← Edit</button>
            <button onClick={handleComplete} disabled={saving} style={{ ...primaryBtn, fontSize: '1rem', padding: '0.9rem 2rem' }}>
              {saving ? 'Saving...' : 'Commit to This Week →'}
            </button>
          </div>
        </div>
      )}


    </PageShell>
  );
}

function PageShell({ step, total, weekNum, children }: { step: number; total: number; weekNum: number; children: React.ReactNode }) {
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
          <div style={{ color: 'var(--mist)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Weekly Plan · Week {weekNum} · Step {step} of {total}</div>
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
  padding: '0.65rem 0.75rem', background: 'var(--ivory)', border: '1px solid var(--paper-dk)',
  borderRadius: '8px', fontSize: '0.9rem', color: 'var(--ink)', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'var(--ff-body)'
};
const navRow: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem'
};
