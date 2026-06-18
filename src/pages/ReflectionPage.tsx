import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getTodaysPlan, getTodaysPriorities, updatePriorityStatus } from '../lib/db';
import { DailyPriority } from '../types';
import { supabase } from '../lib/supabase';

const GRATITUDE_PROMPTS = ['I am grateful for…', 'A person I appreciate today…', 'Something I noticed today…'];
const DAY_WORDS = ['Productive', 'Peaceful', 'Challenging', 'Meaningful', 'Scattered', 'Connected', 'Hard', 'Good'];

export default function ReflectionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [priorities, setPriorities] = useState<DailyPriority[]>([]);

  // Step 1 — day review
  const [dayWord, setDayWord] = useState('');
  const [customDayWord, setCustomDayWord] = useState('');

  // Step 2 — ratings
  const [scoreMission, setScoreMission] = useState(0);
  const [scorePresence, setScorePresence] = useState(0);
  const [scoreHard, setScoreHard] = useState(0);
  const [wouldDoDifferently, setWouldDoDifferently] = useState('');

  // Step 3 — gratitude
  const [gratitudes, setGratitudes] = useState(['', '', '']);

  // Step 4 — tomorrow
  const [letGo, setLetGo] = useState('');
  const [tomorrowNotes, setTomorrowNotes] = useState('');

  useEffect(() => {
    if (!user) return;
    getTodaysPlan(user.id).then(async plan => {
      if (plan) {
        const p = await getTodaysPriorities(plan.id);
        setPriorities(p);
      }
    });
  }, [user]);

  const cycleStatus = async (p: DailyPriority) => {
    const next = p.status === 'pending' ? 'done' : p.status === 'done' ? 'partial' : p.status === 'partial' ? 'missed' : 'pending';
    await updatePriorityStatus(p.id, next);
    setPriorities(prev => prev.map(pr => pr.id === p.id ? { ...pr, status: next } : pr));
  };

  const statusStyle = (status: string): React.CSSProperties => ({
    padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
    background: status === 'done' ? 'rgba(107,143,113,0.2)' : status === 'partial' ? 'rgba(201,168,76,0.2)' : status === 'missed' ? 'rgba(196,122,122,0.2)' : 'rgba(144,144,176,0.15)',
    color: status === 'done' ? 'var(--sage)' : status === 'partial' ? 'var(--gold)' : status === 'missed' ? 'var(--rose)' : 'var(--mist)',
  });

  const doneCount = priorities.filter(p => p.status === 'done').length;
  const score = priorities.length > 0 ? Math.round((doneCount / priorities.length) * 100) : 0;
  const finalDayWord = dayWord || customDayWord;

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);
    const today = new Date().toISOString().split('T')[0];
    await supabase.from('evening_reflections').upsert({
      user_id: user.id,
      date: today,
      day_word: finalDayWord,
      score_overall: scoreMission,
      score_presence: scorePresence,
      score_hard_things: scoreHard,
      would_do_differently: wouldDoDifferently,
      gratitude_1: gratitudes[0],
      gratitude_2: gratitudes[1],
      gratitude_3: gratitudes[2],
      let_go: letGo,
      tomorrow_notes: tomorrowNotes,
      completed_at: new Date().toISOString(),
    });
    setSaving(false);
    setStep(5);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--night)', fontFamily: 'var(--ff-body)', position: 'relative', overflow: 'hidden' }}>
      {/* Stars */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: Math.random() > 0.7 ? '2px' : '1px',
            height: Math.random() > 0.7 ? '2px' : '1px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.6)',
            top: `${(i * 137.5) % 100}%`,
            left: `${(i * 97.3) % 100}%`,
            opacity: 0.4 + (i % 3) * 0.2,
          }} />
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ height: '2px', background: 'rgba(255,255,255,0.08)', position: 'relative', zIndex: 1 }}>
        <div style={{ height: '100%', background: 'var(--gold)', width: `${(step / 5) * 100}%`, transition: 'width 0.4s ease' }} />
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '2.5rem 1.5rem', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontFamily: 'var(--ff-display)', fontSize: '1.4rem', color: '#fff' }}>
            Mission<span style={{ color: 'var(--gold)' }}>ly</span>
          </span>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
            Evening Reflection · Step {step} of 5
          </div>
        </div>

        {/* ── STEP 1: Day review ── */}
        {step === 1 && (
          <div>
            <h2 style={nightHeading}>How was your day?</h2>
            <p style={nightSubtext}>Tap a priority to cycle through Done → Partial → Missed.</p>

            {priorities.length > 0 ? (
              <div style={nightCard}>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                  Today's Priorities · {doneCount}/{priorities.length} done
                </div>
                {priorities.map(p => (
                  <div key={p.id} onClick={() => cycleStatus(p)} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.7rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer'
                  }}>
                    <span style={{ fontSize: '0.875rem', color: '#fff', opacity: p.status === 'missed' ? 0.4 : 1 }}>{p.text}</span>
                    <span style={statusStyle(p.status)}>{p.status}</span>
                  </div>
                ))}
                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                    <div style={{ height: '100%', width: `${score}%`, background: score >= 75 ? 'var(--sage)' : score >= 40 ? 'var(--gold)' : 'var(--rose)', borderRadius: '2px', transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>{score}%</span>
                </div>
              </div>
            ) : (
              <div style={{ ...nightCard, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                No daily plan was set today.
              </div>
            )}

            <div style={nightCard}>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                One word for today
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                {DAY_WORDS.map(w => (
                  <button key={w} onClick={() => { setDayWord(w); setCustomDayWord(''); }} style={{
                    padding: '0.35rem 0.75rem', borderRadius: '14px', border: '1px solid',
                    borderColor: dayWord === w ? 'var(--gold)' : 'rgba(255,255,255,0.12)',
                    background: dayWord === w ? 'var(--gold-dim)' : 'transparent',
                    color: dayWord === w ? 'var(--gold)' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer', fontSize: '0.8rem'
                  }}>{w}</button>
                ))}
              </div>
              <input
                value={customDayWord}
                onChange={e => { setCustomDayWord(e.target.value); setDayWord(''); }}
                placeholder="Or type your own..."
                style={nightInput}
              />
            </div>

            <div style={navRow}>
              <button onClick={() => navigate('/dashboard')} style={ghostBtn}>← Dashboard</button>
              <button onClick={() => setStep(2)} style={goldBtn}>Next →</button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Ratings ── */}
        {step === 2 && (
          <div>
            <h2 style={nightHeading}>Rate Your Day</h2>
            <p style={nightSubtext}>Be honest with yourself.</p>

            {[
              { label: 'Mission alignment', sub: 'Did your actions match your mission?', val: scoreMission, set: setScoreMission },
              { label: 'Presence', sub: 'Were you truly present in what mattered?', val: scorePresence, set: setScorePresence },
              { label: 'Doing hard things', sub: 'Did you push through discomfort?', val: scoreHard, set: setScoreHard },
            ].map(({ label: lbl, sub, val, set }) => (
              <div key={lbl} style={nightCard}>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{lbl}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{sub}</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => set(n)} style={{
                      flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid',
                      borderColor: val >= n ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
                      background: val >= n ? 'var(--gold-dim)' : 'transparent',
                      color: val >= n ? 'var(--gold)' : 'rgba(255,255,255,0.3)',
                      cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700
                    }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div style={nightCard}>
              <label style={{ display: 'block', fontWeight: 600, color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                What would you do differently?
              </label>
              <textarea
                value={wouldDoDifferently}
                onChange={e => setWouldDoDifferently(e.target.value)}
                placeholder="No judgement — just honest reflection..."
                style={nightTextarea}
              />
            </div>

            <div style={navRow}>
              <button onClick={() => setStep(1)} style={ghostBtn}>← Back</button>
              <button onClick={() => setStep(3)} style={goldBtn}>Next →</button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Gratitude ── */}
        {step === 3 && (
          <div>
            <h2 style={nightHeading}>Gratitude</h2>
            <p style={nightSubtext}>Three things — big or small. End the day with a full heart.</p>

            {GRATITUDE_PROMPTS.map((prompt, i) => (
              <div key={i} style={nightCard}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{prompt}</label>
                <input
                  value={gratitudes[i]}
                  onChange={e => setGratitudes(prev => prev.map((g, idx) => idx === i ? e.target.value : g))}
                  placeholder="..."
                  style={nightInput}
                />
              </div>
            ))}

            <div style={navRow}>
              <button onClick={() => setStep(2)} style={ghostBtn}>← Back</button>
              <button onClick={() => setStep(4)} style={goldBtn}>Next →</button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Tomorrow ── */}
        {step === 4 && (
          <div>
            <h2 style={nightHeading}>Let It Go & Look Ahead</h2>
            <p style={nightSubtext}>Clear your mind. Tomorrow starts fresh.</p>

            <div style={nightCard}>
              <label style={{ display: 'block', fontWeight: 600, color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                What are you letting go of tonight?
              </label>
              <textarea
                value={letGo}
                onChange={e => setLetGo(e.target.value)}
                placeholder="Worries, frustrations, things out of your control..."
                style={nightTextarea}
              />
            </div>

            <div style={nightCard}>
              <label style={{ display: 'block', fontWeight: 600, color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                What's one thing to remember for tomorrow?
              </label>
              <textarea
                value={tomorrowNotes}
                onChange={e => setTomorrowNotes(e.target.value)}
                placeholder="A reminder, a priority, something to carry forward..."
                style={nightTextarea}
              />
            </div>

            <div style={navRow}>
              <button onClick={() => setStep(3)} style={ghostBtn}>← Back</button>
              <button onClick={handleComplete} disabled={saving} style={{ ...goldBtn, opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Close the Day ✓'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: Complete ── */}
        {step === 5 && (
          <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌙</div>
            <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '2rem', color: '#fff', marginBottom: '0.75rem' }}>
              Rest well.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '1.5rem', fontFamily: 'var(--ff-accent)', fontStyle: 'italic' }}>
              "Come to me, all you who are weary and burdened, and I will give you rest."
            </p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginBottom: '2rem' }}>Matthew 11:28</p>

            {finalDayWord && (
              <div style={{ display: 'inline-block', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '20px', padding: '0.4rem 1.25rem', color: 'var(--gold)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Today was: {finalDayWord}
              </div>
            )}

            <div style={{ display: 'block' }}>
              <button onClick={() => navigate('/dashboard')} style={goldBtn}>
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const nightHeading: React.CSSProperties = {
  fontFamily: 'var(--ff-display)', fontSize: '1.85rem', color: '#fff', marginBottom: '0.5rem'
};
const nightSubtext: React.CSSProperties = {
  color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6
};
const nightCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem'
};
const nightInput: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px', padding: '0.6rem 0.75rem', color: '#fff', fontSize: '0.9rem',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--ff-body)'
};
const nightTextarea: React.CSSProperties = {
  width: '100%', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.8)',
  fontSize: '0.9rem', outline: 'none', lineHeight: 1.6, resize: 'vertical',
  fontFamily: 'var(--ff-body)', boxSizing: 'border-box', minHeight: '80px'
};
const goldBtn: React.CSSProperties = {
  background: 'var(--gold)', border: 'none', borderRadius: '8px',
  padding: '0.8rem 1.75rem', fontWeight: 600, fontSize: '0.95rem',
  color: 'var(--ink)', cursor: 'pointer'
};
const ghostBtn: React.CSSProperties = {
  background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
  padding: '0.8rem 1.25rem', fontWeight: 500, fontSize: '0.9rem',
  color: 'rgba(255,255,255,0.4)', cursor: 'pointer'
};
const navRow: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem'
};
