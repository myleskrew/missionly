import { Link } from 'react-router-dom';

const features = [
  {
    icon: '🧭',
    title: 'Your Mission Statement',
    desc: 'Build a personal mission that anchors every decision — in minutes. Revisit it every morning.',
  },
  {
    icon: '☀️',
    title: 'Daily Planning Ritual',
    desc: 'Set your top 3 priorities, define your win, and commit to daily intentions before the chaos starts.',
  },
  {
    icon: '📅',
    title: 'Weekly Role Review',
    desc: 'Covey\'s 7 Habits in action — review every role you play and set meaningful goals for the week.',
  },
  {
    icon: '🌙',
    title: 'Evening Reflection',
    desc: 'Close each day with gratitude, honest assessment, and clarity on what to carry into tomorrow.',
  },
  {
    icon: '✨',
    title: 'Eli — Your AI Coach',
    desc: 'Eli knows your mission and your roles. Ask for accountability, encouragement, or a challenge.',
  },
  {
    icon: '🔥',
    title: 'Streaks & Momentum',
    desc: 'Daily and weekly streaks keep you honest. Consistency is the discipline. Discipline is freedom.',
  },
];

const steps = [
  { num: '01', title: 'Write your mission', desc: 'A few fill-in-the-blank prompts and you\'ll have a personal mission statement that actually sounds like you.' },
  { num: '02', title: 'Name your roles', desc: 'Father. Professional. Disciple. Friend. You live multiple lives — plan all of them.' },
  { num: '03', title: 'Plan every morning', desc: 'Three priorities. One win condition. Five minutes. Day locked in.' },
  { num: '04', title: 'Reflect every evening', desc: 'What went well, what didn\'t, what you\'re letting go. Sleep lighter.' },
];

const testimonials = [
  { quote: 'I\'ve tried every planner. Missionly is the first one that made me feel like my whole life was accounted for — not just my work tasks.', name: 'Jordan T.', role: 'Entrepreneur & Father of 3' },
  { quote: 'The weekly role review changed everything. I realized I was crushing it at work and failing at home. Now I balance both.', name: 'Sarah M.', role: 'Sales Manager' },
  { quote: 'Eli pushed back on me when I was making excuses. I needed that. A planner that actually holds you accountable.', name: 'Marcus L.', role: 'Construction Business Owner' },
];

export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'var(--ff-body)', color: 'var(--ink)', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(26,26,46,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', height: 60
      }}>
        <span style={{ fontFamily: 'var(--ff-display)', fontSize: '1.35rem', color: '#fff' }}>
          Mission<span style={{ color: 'var(--gold)' }}>ly</span>
        </span>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/signin" style={{ color: 'var(--mist)', textDecoration: 'none', fontSize: '0.9rem', padding: '0.5rem 0.75rem' }}>
            Sign in
          </Link>
          <Link to="/signin" style={{
            background: 'var(--gold)', color: 'var(--ink)', textDecoration: 'none',
            padding: '0.5rem 1.25rem', borderRadius: 8, fontWeight: 600, fontSize: '0.875rem'
          }}>
            Get started free
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        background: 'var(--ink)', minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '8rem 1.5rem 5rem', position: 'relative'
      }}>
        {/* subtle grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'linear-gradient(var(--gold) 1px, transparent 1px), linear-gradient(90deg, var(--gold) 1px, transparent 1px)',
          backgroundSize: '60px 60px', pointerEvents: 'none'
        }} />

        <div style={{
          display: 'inline-block', background: 'var(--gold-dim)', border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: 20, padding: '0.35rem 1rem', marginBottom: '1.75rem',
          fontSize: '0.8rem', fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.04em'
        }}>
          Built on Covey's 7 Habits · Powered by AI
        </div>

        <h1 style={{
          fontFamily: 'var(--ff-display)', fontSize: 'clamp(2.75rem, 7vw, 5rem)',
          color: '#fff', lineHeight: 1.1, marginBottom: '1.5rem', maxWidth: 800
        }}>
          Live with intention.<br />
          <span style={{ color: 'var(--gold)' }}>Lead your own life.</span>
        </h1>

        <p style={{
          color: 'var(--mist)', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
          lineHeight: 1.7, maxWidth: 560, marginBottom: '2.5rem'
        }}>
          Missionly is the daily planning system for people who want to win at work
          <em> and</em> at home. Mission-first. Role-based. AI-coached.
        </p>

        <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3.5rem' }}>
          <Link to="/signin" style={{
            background: 'var(--gold)', color: 'var(--ink)', textDecoration: 'none',
            padding: '0.9rem 2.25rem', borderRadius: 10, fontWeight: 700, fontSize: '1rem',
            boxShadow: '0 4px 24px rgba(201,168,76,0.35)'
          }}>
            Start for free →
          </Link>
          <a href="#how-it-works" style={{
            background: 'transparent', color: '#fff', textDecoration: 'none',
            padding: '0.9rem 2rem', borderRadius: 10, fontWeight: 500, fontSize: '1rem',
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
            See how it works
          </a>
        </div>

        {/* Dashboard preview mockup */}
        <div style={{
          width: '100%', maxWidth: 860,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: '1.5rem',
          boxShadow: '0 40px 80px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            {['#ff5f57','#febc2e','#28c840'].map(c => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1rem', textAlign: 'left' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '1rem' }}>
              {['Dashboard','Daily Plan','This Week','Reflection'].map(label => (
                <div key={label} style={{
                  padding: '0.5rem 0.6rem', borderRadius: 6, marginBottom: 4,
                  fontSize: '0.78rem', color: label === 'Dashboard' ? 'var(--gold)' : 'var(--mist)',
                  background: label === 'Dashboard' ? 'rgba(201,168,76,0.12)' : 'transparent'
                }}>{label}</div>
              ))}
            </div>
            <div>
              <div style={{ color: '#fff', fontFamily: 'var(--ff-display)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                Good morning, Myles
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {['Daily Streak\n7 🔥','Weekly Streak\n3 📅','Week Progress\n68%'].map(t => {
                  const [label, val] = t.split('\n');
                  return (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '0.6rem 0.8rem' }}>
                      <div style={{ fontSize: '0.6rem', color: 'var(--mist)', marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>{val}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ background: 'rgba(201,168,76,0.08)', borderRadius: 8, padding: '0.6rem 0.8rem', borderLeft: '3px solid var(--gold)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
                "I am a man of faith and discipline, committed to building things that last..."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section style={{ background: 'var(--paper)', padding: '2.5rem 1.5rem', textAlign: 'center', borderBottom: '1px solid var(--paper-dk)' }}>
        <p style={{ color: 'var(--mist)', fontSize: '0.825rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          Trusted by people who want to live intentionally
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2.5rem' }}>
          {['Fathers', 'Entrepreneurs', 'Coaches', 'Sales Leaders', 'Builders'].map(g => (
            <span key={g} style={{ color: 'var(--slate)', fontWeight: 600, fontSize: '0.95rem' }}>{g}</span>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ background: 'var(--ivory)', padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--ink)', marginBottom: '0.75rem' }}>
              Everything you need to lead yourself
            </h2>
            <p style={{ color: 'var(--slate)', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto' }}>
              One system for your mission, your roles, your day, and your growth.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {features.map(f => (
              <div key={f.title} style={{
                background: 'var(--paper)', borderRadius: 14, padding: '1.75rem',
                border: '1px solid var(--paper-dk)', transition: 'box-shadow 0.2s'
              }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.875rem' }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--slate)', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ background: 'var(--ink)', padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#fff', marginBottom: '0.75rem' }}>
              Simple. Powerful. Repeatable.
            </h2>
            <p style={{ color: 'var(--mist)', fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>
              Four rituals. Five minutes each. A life that reflects what you actually value.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
            {steps.map((s, i) => (
              <div key={s.num} style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                <div style={{
                  fontFamily: 'var(--ff-display)', fontSize: '2.5rem', color: 'var(--gold)',
                  opacity: 0.3 + i * 0.18, marginBottom: '0.75rem'
                }}>{s.num}</div>
                <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginBottom: '0.5rem' }}>{s.title}</h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--mist)', lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ELI SECTION ── */}
      <section style={{ background: 'var(--night)', padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <div style={{
              display: 'inline-block', background: 'var(--gold-dim)', border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: 20, padding: '0.35rem 1rem', marginBottom: '1.25rem',
              fontSize: '0.78rem', fontWeight: 600, color: 'var(--gold)'
            }}>Meet Eli</div>
            <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', color: '#fff', marginBottom: '1rem', lineHeight: 1.2 }}>
              Your AI coach who<br />actually knows you
            </h2>
            <p style={{ color: 'var(--mist)', lineHeight: 1.75, marginBottom: '1.25rem', fontSize: '0.95rem' }}>
              Eli isn't a generic chatbot. She knows your mission statement, your roles, your weekly goals, and your priorities today. She'll encourage you, challenge your excuses, and help you think through hard decisions.
            </p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {['Knows your mission & roles', 'Tracks your priorities and progress', 'Available any time on your dashboard', 'Speaks with honesty and warmth'].map(item => (
                <li key={item} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.6rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Eli chat mockup */}
          <div style={{
            background: 'var(--ink)', borderRadius: 16, overflow: 'hidden',
            border: '1px solid rgba(201,168,76,0.15)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
          }}>
            <div style={{
              padding: '0.875rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: '0.625rem'
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: 'var(--gold-dim)',
                border: '1.5px solid var(--gold)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: 'var(--gold)'
              }}>E</div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Eli</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--mist)' }}>AI Planning Coach</div>
              </div>
              <div style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: 'var(--sage)', boxShadow: '0 0 6px rgba(107,143,113,0.6)' }} />
            </div>
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                { role: 'eli', text: 'Good morning! You have "Finish project proposal" as your top priority — what\'s the first step you\'re taking right now?' },
                { role: 'user', text: 'Honestly I\'m not sure where to start. It feels overwhelming.' },
                { role: 'eli', text: 'That\'s normal. You wrote that this week\'s theme is "Focus." What\'s the one section of the proposal that moves the needle most?' },
              ].map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    background: msg.role === 'eli' ? 'var(--gold-dim)' : 'rgba(255,255,255,0.08)',
                    border: msg.role === 'eli' ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6rem', fontWeight: 700, color: msg.role === 'eli' ? 'var(--gold)' : 'rgba(255,255,255,0.5)'
                  }}>{msg.role === 'eli' ? 'E' : 'M'}</div>
                  <div style={{
                    maxWidth: '80%', padding: '0.6rem 0.75rem', borderRadius: 10,
                    fontSize: '0.775rem', lineHeight: 1.55,
                    background: msg.role === 'eli' ? 'rgba(255,255,255,0.06)' : 'rgba(201,168,76,0.1)',
                    border: msg.role === 'eli' ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(201,168,76,0.18)',
                    color: 'rgba(255,255,255,0.8)',
                    fontStyle: msg.role === 'eli' ? 'italic' : 'normal',
                    fontFamily: msg.role === 'eli' ? 'var(--ff-accent)' : 'var(--ff-body)'
                  }}>{msg.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: 'var(--ivory)', padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', color: 'var(--ink)', textAlign: 'center', marginBottom: '3rem' }}>
            What users are saying
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {testimonials.map(t => (
              <div key={t.name} style={{
                background: 'var(--paper)', borderRadius: 14, padding: '1.75rem',
                border: '1px solid var(--paper-dk)', display: 'flex', flexDirection: 'column', gap: '1.25rem'
              }}>
                <div style={{ color: 'var(--gold)', fontSize: '1.5rem' }}>❝</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--slate)', lineHeight: 1.7, fontStyle: 'italic', fontFamily: 'var(--ff-accent)', flex: 1 }}>
                  {t.quote}
                </p>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '0.875rem' }}>{t.name}</div>
                  <div style={{ color: 'var(--mist)', fontSize: '0.78rem' }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ background: 'var(--paper)', padding: '6rem 1.5rem', borderTop: '1px solid var(--paper-dk)' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', color: 'var(--ink)', marginBottom: '0.75rem' }}>
            Simple pricing
          </h2>
          <p style={{ color: 'var(--slate)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>One plan. Everything included. Cancel anytime.</p>
          <div style={{
            background: 'var(--ink)', borderRadius: 16, padding: '2.5rem 2rem',
            border: '1px solid rgba(201,168,76,0.2)', boxShadow: '0 8px 40px rgba(0,0,0,0.15)'
          }}>
            <div style={{ color: 'var(--gold)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Missionly Pro
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--ff-display)', fontSize: '3.5rem', color: '#fff' }}>$9</span>
              <span style={{ color: 'var(--mist)', fontSize: '0.9rem' }}>/month</span>
            </div>
            <p style={{ color: 'var(--mist)', fontSize: '0.825rem', marginBottom: '2rem' }}>Or $79/year — save two months free</p>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', textAlign: 'left' }}>
              {[
                'Daily & weekly planning system',
                'Mission statement builder',
                'Role-based goal tracking',
                'Evening reflection journal',
                'Eli AI coach — unlimited chats',
                'Streak tracking & momentum',
                'Web app — works on any device',
              ].map(item => (
                <li key={item} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/signin" style={{
              display: 'block', background: 'var(--gold)', color: 'var(--ink)',
              textDecoration: 'none', padding: '0.9rem', borderRadius: 10,
              fontWeight: 700, fontSize: '0.95rem', textAlign: 'center'
            }}>
              Start free — no card required
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'var(--ink)', padding: '7rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#fff', lineHeight: 1.15, marginBottom: '1.25rem', maxWidth: 600, margin: '0 auto 1.25rem' }}>
          Your life won't plan itself.
        </h2>
        <p style={{ color: 'var(--mist)', fontSize: '1rem', marginBottom: '2.25rem', maxWidth: 440, margin: '0 auto 2.25rem' }}>
          Five minutes in the morning changes everything. Start today.
        </p>
        <Link to="/signin" style={{
          display: 'inline-block', background: 'var(--gold)', color: 'var(--ink)',
          textDecoration: 'none', padding: '1rem 2.75rem', borderRadius: 10,
          fontWeight: 700, fontSize: '1.05rem', boxShadow: '0 4px 24px rgba(201,168,76,0.35)'
        }}>
          Get started — it's free →
        </Link>
        <p style={{ color: 'var(--mist)', fontSize: '0.78rem', marginTop: '1rem' }}>
          No credit card required · Cancel anytime
        </p>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'var(--night)', padding: '2rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <span style={{ fontFamily: 'var(--ff-display)', fontSize: '1.1rem', color: '#fff' }}>
          Mission<span style={{ color: 'var(--gold)' }}>ly</span>
        </span>
        <p style={{ color: 'var(--mist)', fontSize: '0.78rem' }}>
          © {new Date().getFullYear()} Missionly · Built for people who lead themselves
        </p>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <Link to="/signin" style={{ color: 'var(--mist)', textDecoration: 'none', fontSize: '0.8rem' }}>Sign in</Link>
          <a href="mailto:myles.wanczyk@gmail.com" style={{ color: 'var(--mist)', textDecoration: 'none', fontSize: '0.8rem' }}>Contact</a>
        </div>
      </footer>

    </div>
  );
}
