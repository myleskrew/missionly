import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { upsertMission, createRole } from '../lib/db';
import { supabase } from '../lib/supabase';

const PRESET_ROLES = [
  { name: 'Father', emoji: '👨‍👧' },
  { name: 'Husband', emoji: '💍' },
  { name: 'Mother', emoji: '👩‍👧' },
  { name: 'Wife', emoji: '💐' },
  { name: 'Professional', emoji: '💼' },
  { name: 'Disciple', emoji: '✝️' },
  { name: 'Health', emoji: '💪' },
  { name: 'Learner', emoji: '📚' },
  { name: 'Friend', emoji: '🤝' },
  { name: 'Builder', emoji: '🔨' },
  { name: 'Son', emoji: '👦' },
  { name: 'Daughter', emoji: '👧' },
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 2 — mission
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');

  // Step 3 — roles
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [customRole, setCustomRole] = useState('');

  // Step 4 — preferences (just UI for now)
  const [morningPlan, setMorningPlan] = useState(true);
  const [eveningReflection, setEveningReflection] = useState(true);
  const [sundayReminder, setSundayReminder] = useState(true);

  const missionPreview = (() => {
    const parts = [];
    if (q1) parts.push(`I am ${q1.trim().replace(/^I am /i, '').replace(/\.$/, '')}`);
    if (q2) parts.push(`I am committed to ${q2.trim().replace(/^I am committed to /i, '').replace(/^to /i, '').replace(/\.$/, '')}`);
    if (q3) parts.push(`Those around me feel ${q3.trim().replace(/^Those around me feel /i, '').replace(/\.$/, '')}`);
    return parts.join('. ') + (parts.length ? '.' : '');
  })();

  const toggleRole = (name: string) => {
    setSelectedRoles(prev =>
      prev.includes(name) ? prev.filter(r => r !== name) : [...prev, name]
    );
  };

  const addCustomRole = () => {
    const trimmed = customRole.trim();
    if (trimmed && !selectedRoles.includes(trimmed)) {
      setSelectedRoles(prev => [...prev, trimmed]);
    }
    setCustomRole('');
  };

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);

    // Save mission
    await upsertMission(user.id, missionPreview || 'My mission is to live with intention.');

    // Save roles
    const roleList = selectedRoles.length > 0 ? selectedRoles : ['Professional'];
    for (let i = 0; i < roleList.length; i++) {
      const preset = PRESET_ROLES.find(r => r.name === roleList[i]);
      await createRole(user.id, roleList[i], preset?.emoji || '◎', i);
    }

    // Mark onboarding done
    await supabase.from('users').update({ onboarding_done: true }).eq('id', user.id);

    navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)', fontFamily: 'var(--ff-body)' }}>
      {/* Progress bar */}
      <div style={{ height: '3px', background: 'var(--paper-dk)' }}>
        <div style={{ height: '100%', background: 'var(--gold)', width: `${(step / 5) * 100}%`, transition: 'width 0.4s ease' }} />
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontFamily: 'var(--ff-display)', fontSize: '1.5rem', color: 'var(--ink)' }}>
            Mission<span style={{ color: 'var(--gold)' }}>ly</span>
          </span>
          <div style={{ color: 'var(--mist)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            Step {step} of 5
          </div>
        </div>

        {/* ── STEP 1: Welcome ── */}
        {step === 1 && (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '2.25rem', color: 'var(--ink)', marginBottom: '1rem' }}>
              Welcome to Missionly
            </h1>
            <p style={{ color: 'var(--slate)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
              In the next few minutes you'll write your personal mission statement, define your key roles, and set up your planning preferences.
            </p>
            <p style={{ color: 'var(--mist)', fontSize: '0.9rem', marginBottom: '2.5rem', fontStyle: 'italic' }}>
              "Begin with the end in mind." — Stephen Covey
            </p>
            <button onClick={() => setStep(2)} style={primaryBtn}>
              Let's Start →
            </button>
          </div>
        )}

        {/* ── STEP 2: Mission Builder ── */}
        {step === 2 && (
          <div>
            <h2 style={heading}>Your Mission Statement</h2>
            <p style={subtext}>Answer these three questions. Your mission will be built from your answers.</p>

            <div style={card}>
              <label style={label}>
                <span style={{ color: 'var(--mist)', fontWeight: 400 }}>I am… </span>
                who do you want to be?
              </label>
              <textarea
                value={q1}
                onChange={e => setQ1(e.target.value)}
                placeholder="e.g. a man of integrity who leads his family with love and purpose"
                style={textarea}
              />
            </div>

            <div style={card}>
              <label style={label}>
                <span style={{ color: 'var(--mist)', fontWeight: 400 }}>I am committed to… </span>
                what matters most to you?
              </label>
              <textarea
                value={q2}
                onChange={e => setQ2(e.target.value)}
                placeholder="e.g. building things that help people grow and becoming the best version of myself"
                style={textarea}
              />
            </div>

            <div style={card}>
              <label style={label}>
                <span style={{ color: 'var(--mist)', fontWeight: 400 }}>Those around me feel… </span>
                what do you want people to experience?
              </label>
              <textarea
                value={q3}
                onChange={e => setQ3(e.target.value)}
                placeholder="e.g. inspired, safe, and challenged to be their best"
                style={textarea}
              />
            </div>

            {missionPreview && (
              <div style={{ background: 'var(--ink)', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ color: 'var(--gold)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Your Mission Preview
                </div>
                <p style={{ color: '#fff', fontFamily: 'var(--ff-accent)', fontStyle: 'italic', lineHeight: 1.6, fontSize: '1rem' }}>
                  {missionPreview}
                </p>
              </div>
            )}

            <div style={navRow}>
              <button onClick={() => setStep(1)} style={ghostBtn}>← Back</button>
              <button onClick={() => setStep(3)} disabled={!q1 && !q2 && !q3} style={{ ...primaryBtn, opacity: (!q1 && !q2 && !q3) ? 0.5 : 1 }}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Roles ── */}
        {step === 3 && (
          <div>
            <h2 style={heading}>Your Key Roles</h2>
            <p style={subtext}>Select the roles that matter most to you. These will anchor your weekly planning.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {PRESET_ROLES.map(role => {
                const selected = selectedRoles.includes(role.name);
                return (
                  <button key={role.name} onClick={() => toggleRole(role.name)} style={{
                    padding: '0.85rem 0.5rem',
                    borderRadius: '10px',
                    border: selected ? '2px solid var(--gold)' : '2px solid var(--paper-dk)',
                    background: selected ? 'var(--gold-dim)' : 'var(--paper)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.15s'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>{role.emoji}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 500, color: selected ? 'var(--ink)' : 'var(--slate)' }}>{role.name}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input
                value={customRole}
                onChange={e => setCustomRole(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomRole()}
                placeholder="Add a custom role..."
                style={{ ...inputStyle, flex: 1 }}
              />
              <button onClick={addCustomRole} style={{ ...primaryBtn, padding: '0.75rem 1rem' }}>Add</button>
            </div>

            {selectedRoles.filter(r => !PRESET_ROLES.find(p => p.name === r)).map(role => (
              <span key={role} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'var(--gold-dim)', border: '1px solid var(--gold)', borderRadius: '20px', padding: '0.3rem 0.75rem', fontSize: '0.85rem', marginRight: '0.5rem', marginBottom: '0.5rem' }}>
                ◎ {role}
                <button onClick={() => toggleRole(role)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate)', fontSize: '1rem', padding: 0, lineHeight: 1 }}>×</button>
              </span>
            ))}

            <div style={navRow}>
              <button onClick={() => setStep(2)} style={ghostBtn}>← Back</button>
              <button onClick={() => setStep(4)} disabled={selectedRoles.length === 0} style={{ ...primaryBtn, opacity: selectedRoles.length === 0 ? 0.5 : 1 }}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Preferences ── */}
        {step === 4 && (
          <div>
            <h2 style={heading}>Planning Preferences</h2>
            <p style={subtext}>Choose how Missionly fits into your day.</p>

            {[
              { label: 'Morning daily plan', desc: 'Set your top 3 priorities each morning', value: morningPlan, set: setMorningPlan },
              { label: 'Evening reflection', desc: 'Review your day before bed', value: eveningReflection, set: setEveningReflection },
              { label: 'Sunday weekly reminder', desc: 'Plan your week every Sunday', value: sundayReminder, set: setSundayReminder },
            ].map(({ label: lbl, desc, value, set }) => (
              <div key={lbl} onClick={() => set(!value)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--paper)', borderRadius: '12px', padding: '1rem 1.25rem',
                marginBottom: '0.75rem', cursor: 'pointer',
                border: value ? '2px solid var(--gold)' : '2px solid transparent'
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '0.95rem' }}>{lbl}</div>
                  <div style={{ color: 'var(--mist)', fontSize: '0.8rem', marginTop: '0.2rem' }}>{desc}</div>
                </div>
                <div style={{
                  width: '44px', height: '24px', borderRadius: '12px',
                  background: value ? 'var(--gold)' : 'var(--paper-dk)',
                  position: 'relative', transition: 'background 0.2s', flexShrink: 0
                }}>
                  <div style={{
                    position: 'absolute', top: '2px', left: value ? '22px' : '2px',
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: '#fff', transition: 'left 0.2s'
                  }} />
                </div>
              </div>
            ))}

            <div style={navRow}>
              <button onClick={() => setStep(3)} style={ghostBtn}>← Back</button>
              <button onClick={() => setStep(5)} style={primaryBtn}>Next →</button>
            </div>
          </div>
        )}

        {/* ── STEP 5: Complete ── */}
        {step === 5 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
            <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '2rem', color: 'var(--ink)', marginBottom: '1rem' }}>
              You're ready.
            </h2>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <div style={statPill}>✍️ Mission written</div>
              <div style={statPill}>🎭 {selectedRoles.length} roles defined</div>
              <div style={statPill}>⚙️ Reminders set</div>
            </div>

            <div style={{ background: 'var(--ink)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
              <div style={{ color: 'var(--gold)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Your Mission</div>
              <p style={{ color: '#fff', fontFamily: 'var(--ff-accent)', fontStyle: 'italic', lineHeight: 1.7 }}>
                {missionPreview || 'My mission is to live with intention.'}
              </p>
            </div>

            <button onClick={handleComplete} disabled={saving} style={{ ...primaryBtn, fontSize: '1rem', padding: '0.9rem 2.5rem' }}>
              {saving ? 'Saving...' : 'Start My First Plan →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Styles ──
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
  width: '100%', minHeight: '80px', background: 'transparent', border: 'none',
  resize: 'vertical', fontFamily: 'var(--ff-body)', fontSize: '0.9rem',
  color: 'var(--ink)', outline: 'none', lineHeight: 1.6, boxSizing: 'border-box'
};
const inputStyle: React.CSSProperties = {
  padding: '0.75rem', background: 'var(--paper)', border: '1px solid var(--paper-dk)',
  borderRadius: '8px', fontSize: '0.9rem', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box'
};
const navRow: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem'
};
const statPill: React.CSSProperties = {
  background: 'var(--paper)', border: '1px solid var(--paper-dk)', borderRadius: '20px',
  padding: '0.4rem 1rem', fontSize: '0.85rem', color: 'var(--slate)'
};
