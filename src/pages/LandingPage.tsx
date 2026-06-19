import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LandingPage() {
  const [annual, setAnnual] = useState(false);
  const [email, setEmail] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleEarlyAccess = async () => {
    if (!email.trim() || !email.includes('@')) return;
    setSubmitState('loading');
    const { error } = await supabase.from('early_access').insert({ email: email.trim().toLowerCase() });
    if (error && error.code !== '23505') { // 23505 = duplicate, treat as success
      setSubmitState('error');
    } else {
      setSubmitState('success');
    }
  };
  return (
    <div style={{ fontFamily: 'var(--ff-body)', color: 'var(--ink)', overflowX: 'hidden' }}>
      <style>{`
        .nav-link { font-size:.875rem;font-weight:500;color:#4a4a6a;text-decoration:none;transition:color .2s; }
        .nav-link:hover { color:#1a1a2e; }
        .nav-cta { background:#1a1a2e;color:#fff!important;padding:.5rem 1.25rem;border-radius:6px;font-size:.875rem!important;font-weight:500!important;transition:background .2s!important; }
        .nav-cta:hover { background:#c9a84c!important;color:#1a1a2e!important; }
        .btn-primary { background:#1a1a2e;color:#fff;padding:.875rem 2rem;border-radius:8px;font-size:.95rem;font-weight:600;text-decoration:none;transition:background .2s,transform .15s;border:2px solid transparent;display:inline-block; }
        .btn-primary:hover { background:#c9a84c;color:#1a1a2e;transform:translateY(-1px); }
        .btn-secondary { background:transparent;color:#1a1a2e;padding:.875rem 2rem;border-radius:8px;font-size:.95rem;font-weight:500;text-decoration:none;border:2px solid rgba(26,26,46,.2);transition:border-color .2s,transform .15s;display:inline-block; }
        .btn-secondary:hover { border-color:#c9a84c;color:#c9a84c;transform:translateY(-1px); }
        .how-card { background:#fff;border-radius:12px;padding:2rem;border:1px solid rgba(201,168,76,.12);transition:box-shadow .2s,transform .2s; }
        .how-card:hover { box-shadow:0 12px 40px rgba(26,26,46,.08);transform:translateY(-3px); }
        .feature { padding:1.5rem;border-radius:10px;border:1px solid rgba(26,26,46,.08);transition:border-color .2s; }
        .feature:hover { border-color:#e8d5a3; }
        .price-cta { display:block;text-align:center;padding:.875rem;border-radius:8px;font-weight:600;font-size:.9rem;text-decoration:none;transition:all .2s;border:2px solid #1a1a2e;color:#1a1a2e; }
        .price-cta:hover { background:#1a1a2e;color:#fff; }
        .price-cta-featured { background:#c9a84c;color:#1a1a2e;border-color:#c9a84c; }
        .price-cta-featured:hover { background:#e8d5a3; }
        .email-btn { background:#c9a84c;color:#1a1a2e;padding:.875rem 1.75rem;border-radius:8px;border:none;font-size:.9rem;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s,transform .15s; }
        .email-btn:hover { background:#e8d5a3;transform:translateY(-1px); }
        .email-input { flex:1;min-width:220px;padding:.875rem 1.25rem;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.07);color:#fff;font-size:.9rem;font-family:inherit;outline:none;transition:border-color .2s; }
        .email-input::placeholder { color:rgba(255,255,255,.3); }
        .email-input:focus { border-color:#c9a84c; }
        .section-pad { padding:6rem 1.5rem; }
        .hero-section { padding:8rem 1.5rem 5rem; }
        .eli-grid { display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center; }
        .mockup-grid { display:grid;grid-template-columns:220px 1fr;min-height:420px; }
        @media(max-width:768px) {
          .nav-links-hide { display:none!important; }
          .nav-mobile-cta { display:flex!important; }
          .mockup-sidebar-hide { display:none!important; }
          .mockup-grid { grid-template-columns:1fr!important;min-height:auto!important; }
          .eli-grid { grid-template-columns:1fr!important;gap:2.5rem!important; }
          .eli-chat-mockup { display:none!important; }
          .section-pad { padding:3.5rem 1.25rem!important; }
          .hero-section { padding:6.5rem 1.25rem 3rem!important; }
          .diff-strip { display:none!important; }
          .btn-primary,.btn-secondary { padding:.75rem 1.5rem!important;font-size:.875rem!important; }
          .email-input { min-width:0!important;width:100%!important; }
          .email-form-wrap { flex-direction:column!important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position:'fixed',top:0,left:0,right:0,zIndex:100,
        display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'1rem 1.5rem',
        background:'rgba(250,249,246,0.88)',backdropFilter:'blur(12px)',
        borderBottom:'1px solid rgba(201,168,76,0.15)'
      }}>
        <span style={{ fontFamily:'var(--ff-display)',fontSize:'1.9rem',color:'var(--ink)',letterSpacing:'-0.01em' }}>
          Mission<span style={{ color:'var(--gold)' }}>ly</span>
        </span>
        <div className="nav-links-hide" style={{ display:'flex',gap:'2rem',alignItems:'center' }}>
          <a href="#how" className="nav-link">How it works</a>
          <a href="#eli" className="nav-link">Meet Eli</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <Link to="/signin" className="nav-link nav-cta">Get early access</Link>
        </div>
        {/* Mobile-only CTA */}
        <Link className="nav-mobile-cta" to="/signin" style={{ display:'none',background:'var(--ink)',color:'#fff',textDecoration:'none',padding:'0.45rem 1rem',borderRadius:6,fontSize:'0.825rem',fontWeight:600 }}>
          Start free
        </Link>
      </nav>

      {/* HERO */}
      <section className="hero-section" style={{
        minHeight:'100vh',display:'flex',flexDirection:'column',
        alignItems:'center',justifyContent:'center',textAlign:'center',
        position:'relative',overflow:'hidden'
      }}>
        {/* bg gradients */}
        <div style={{
          position:'absolute',inset:0,zIndex:0,
          background:`radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.10) 0%, transparent 70%),
                      radial-gradient(ellipse 50% 40% at 80% 80%, rgba(107,143,113,0.08) 0%, transparent 60%)`
        }} />
        {/* compass rose rings */}
        <div style={{
          position:'absolute',top:'50%',left:'50%',
          transform:'translate(-50%,-50%)',
          width:'min(600px,90vw)',height:'min(600px,90vw)',
          border:'1px solid rgba(201,168,76,0.12)',borderRadius:'50%',
          boxShadow:'0 0 0 40px rgba(201,168,76,0.04),0 0 0 80px rgba(201,168,76,0.025),0 0 0 120px rgba(201,168,76,0.01)',
          zIndex:0,pointerEvents:'none'
        }} />

        <div style={{ position:'relative',zIndex:1,maxWidth:760 }}>
          <div style={{
            display:'inline-flex',alignItems:'center',gap:'0.5rem',
            background:'rgba(201,168,76,0.1)',border:'1px solid rgba(201,168,76,0.25)',
            borderRadius:20,padding:'0.35rem 1rem',marginBottom:'1.75rem',
            fontSize:'0.8rem',fontWeight:600,color:'var(--gold)',letterSpacing:'0.04em'
          }}>
            ✦ The only planner with a built-in AI coach
          </div>

          <h1 style={{
            fontFamily:'var(--ff-display)',fontSize:'clamp(2.8rem,7vw,5rem)',
            lineHeight:1.08,letterSpacing:'-0.02em',color:'var(--ink)',marginBottom:'1.5rem'
          }}>
            The weekly planner<br />with a coach who<br />
            <em style={{ fontStyle:'italic',color:'var(--gold)' }}>holds you to it.</em>
          </h1>

          <p style={{
            fontFamily:'var(--ff-accent)',fontSize:'clamp(1rem,2.5vw,1.2rem)',
            color:'var(--slate)',maxWidth:520,margin:'0 auto 2.5rem',lineHeight:1.7
          }}>
            Mission statement. Life roles. Daily plan. Evening reflection. And Eli — an AI coach who knows your goals and won't let you make excuses.
          </p>

          <div style={{ display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap' }}>
            <Link to="/signin" className="btn-primary">Start free — no credit card</Link>
            <a href="#eli" className="btn-secondary">Meet Eli →</a>
          </div>
          <p style={{ marginTop:'1.25rem',fontSize:'0.8rem',color:'var(--mist)' }}>
            14-day Pro trial included · Free plan available forever
          </p>
        </div>

        {/* App mockup */}
        <div style={{ position:'relative',zIndex:1,marginTop:'4rem',width:'100%',maxWidth:820 }}>
          <div style={{
            background:'#fff',borderRadius:16,
            border:'1px solid rgba(201,168,76,0.2)',
            boxShadow:'0 32px 80px rgba(26,26,46,0.12),0 8px 24px rgba(26,26,46,0.06)',
            overflow:'hidden'
          }}>
            {/* browser bar */}
            <div style={{
              background:'var(--paper)',padding:'0.75rem 1.25rem',
              display:'flex',alignItems:'center',gap:'0.5rem',
              borderBottom:'1px solid rgba(201,168,76,0.15)'
            }}>
              {[['#ff6b6b'],['#ffd93d'],['#6bcb77']].map(([c]) => (
                <div key={c} style={{ width:10,height:10,borderRadius:'50%',background:c }} />
              ))}
              <span style={{ marginLeft:'0.75rem',fontSize:'0.75rem',color:'var(--mist)' }}>
                app.missionly.co · Dashboard
              </span>
            </div>
            {/* mockup body */}
            <div className="mockup-grid">
              {/* sidebar */}
              <div className="mockup-sidebar-hide" style={{ background:'var(--ink)',padding:'1.5rem 1.25rem',color:'#fff' }}>
                <div style={{ fontFamily:'var(--ff-display)',fontSize:'1.1rem',color:'var(--gold)',marginBottom:'2rem' }}>Missionly</div>
                <div style={{ fontSize:'0.65rem',textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--mist)',marginBottom:'0.75rem',marginTop:'1.5rem' }}>Planning</div>
                {[['◈','Dashboard',true],['☀','Daily Plan',false],['📅','This Week',false]].map(([icon,label,active]) => (
                  <div key={label as string} style={{
                    display:'flex',alignItems:'center',gap:'0.625rem',
                    padding:'0.5rem 0.625rem',borderRadius:6,marginBottom:4,fontSize:'0.8rem',
                    color: active ? 'var(--gold)' : 'rgba(255,255,255,0.7)',
                    background: active ? 'rgba(201,168,76,0.15)' : 'transparent'
                  }}><span>{icon as string}</span>{label as string}</div>
                ))}
                <div style={{ fontSize:'0.65rem',textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--mist)',marginBottom:'0.75rem',marginTop:'1.5rem' }}>Growth</div>
                {[['⚑','My Mission'],['◎','My Roles'],['✦','Eli (AI Coach)']].map(([icon,label]) => (
                  <div key={label as string} style={{
                    display:'flex',alignItems:'center',gap:'0.625rem',
                    padding:'0.5rem 0.625rem',borderRadius:6,marginBottom:4,
                    fontSize:'0.8rem',color:'rgba(255,255,255,0.7)'
                  }}><span>{icon as string}</span>{label as string}</div>
                ))}
              </div>
              {/* main */}
              <div style={{ padding:'1.75rem' }}>
                <div style={{ fontFamily:'var(--ff-display)',fontSize:'1.3rem',color:'var(--ink)',marginBottom:'0.25rem' }}>Good morning, Myles.</div>
                <div style={{ fontSize:'0.78rem',color:'var(--mist)',marginBottom:'1.5rem' }}>Wednesday · Week 24 of 52</div>
                <div style={{ background:'linear-gradient(135deg,var(--ink) 0%,#2d2d50 100%)',borderRadius:10,padding:'1rem 1.25rem',marginBottom:'1.25rem' }}>
                  <div style={{ fontSize:'0.65rem',textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--gold)',marginBottom:'0.375rem' }}>✦ Your Mission</div>
                  <div style={{ fontFamily:'var(--ff-accent)',fontStyle:'italic',fontSize:'0.82rem',color:'rgba(255,255,255,0.85)',lineHeight:1.5 }}>
                    "To lead with integrity in every role I hold — as a father, a professional, and a disciple — building a life of purpose, not just productivity."
                  </div>
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.625rem',marginBottom:'1.25rem' }}>
                  {[
                    { name:'👨‍👧 Father', goal:'Take the kids to the park before Saturday', done:false, sage:false },
                    { name:'💼 Professional', goal:'Complete the GRC audit report by Friday', done:true, sage:true },
                  ].map(r => (
                    <div key={r.name} style={{ background:'var(--paper)',borderRadius:8,padding:'0.75rem',borderLeft:`3px solid ${r.sage ? 'var(--sage)' : 'var(--gold)'}` }}>
                      <div style={{ fontSize:'0.7rem',fontWeight:600,color:'var(--slate)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'0.375rem' }}>{r.name}</div>
                      <div style={{ fontSize:'0.75rem',color:'var(--ink)',lineHeight:1.4 }}>{r.goal}</div>
                      <div style={{ display:'flex',alignItems:'center',gap:'0.375rem',marginTop:'0.375rem' }}>
                        <div style={{
                          width:14,height:14,borderRadius:3,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,
                          border:`1.5px solid var(--gold)`,background:r.done ? 'var(--gold)' : 'transparent',color:r.done ? '#fff' : 'var(--gold)'
                        }}>✓</div>
                        <span style={{ fontSize:'0.68rem',color:'var(--mist)' }}>{r.done ? 'Done' : 'In progress'}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ background:'rgba(107,143,113,0.08)',border:'1px solid rgba(107,143,113,0.2)',borderRadius:8,padding:'0.875rem 1rem' }}>
                  <div style={{ fontSize:'0.65rem',textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--sage)',marginBottom:'0.5rem' }}>☀ Today's Daily Plan</div>
                  <div style={{ fontSize:'0.8rem',color:'var(--slate)',fontStyle:'italic',fontFamily:'var(--ff-accent)' }}>"What one thing, if done today, would make this week feel like a win?"</div>
                  <div style={{ display:'inline-flex',alignItems:'center',gap:'0.375rem',background:'var(--ink)',color:'var(--gold)',fontSize:'0.65rem',fontWeight:600,padding:'0.25rem 0.6rem',borderRadius:20,marginTop:'0.625rem',letterSpacing:'0.04em' }}>✦ Eli · AI Coach — tap to chat</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIFFERENTIATOR STRIP */}
      <section className="diff-strip" style={{ background:'var(--ink)',padding:'1.5rem',borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth:1000,margin:'0 auto',display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'2.5rem' }}>
          {[
            { icon:'✦', label:'AI coach built in — knows your mission' },
            { icon:'◎', label:'Role-based, not just task-based' },
            { icon:'🌙', label:'Morning + evening rituals' },
            { icon:'🔥', label:'Streak tracking for accountability' },
          ].map(d => (
            <div key={d.label} style={{ display:'flex',alignItems:'center',gap:'0.5rem',color:'rgba(255,255,255,0.65)',fontSize:'0.85rem' }}>
              <span style={{ color:'var(--gold)' }}>{d.icon}</span>
              {d.label}
            </div>
          ))}
        </div>
      </section>

      {/* ELI — moved up, it's the differentiator */}
      <section id="eli" className="section-pad" style={{ background:'var(--ink)' }}>
        <div className="eli-grid" style={{ maxWidth:1000,margin:'0 auto' }}>
          <div>
            <div style={{ display:'inline-block',background:'rgba(201,168,76,0.12)',border:'1px solid rgba(201,168,76,0.25)',borderRadius:20,padding:'0.35rem 1rem',marginBottom:'1.25rem',fontSize:'0.78rem',fontWeight:600,color:'var(--gold)' }}>
              Meet Eli — your AI coach
            </div>
            <h2 style={{ fontFamily:'var(--ff-display)',fontSize:'clamp(1.75rem,4vw,2.75rem)',lineHeight:1.15,letterSpacing:'-0.02em',color:'#fff',marginBottom:'1rem' }}>
              The only planner<br />that talks back.
            </h2>
            <p style={{ fontSize:'0.95rem',color:'rgba(255,255,255,0.6)',lineHeight:1.75,marginBottom:'1.5rem' }}>
              Eli isn't a generic chatbot. He knows your mission statement, your life roles, your weekly goals, and your priorities today. He'll encourage you, challenge your excuses, and ask the question you're avoiding.
            </p>
            <ul style={{ listStyle:'none',padding:0 }}>
              {[
                'Reads your mission & roles before every chat',
                'Calls out patterns you\'re not seeing',
                'Available any time — morning, midday, evening',
                'Built on Claude — the most human AI available',
              ].map(item => (
                <li key={item} style={{ display:'flex',gap:'0.6rem',alignItems:'flex-start',marginBottom:'0.65rem',fontSize:'0.875rem',color:'rgba(255,255,255,0.7)' }}>
                  <span style={{ color:'var(--gold)',fontWeight:700,flexShrink:0,marginTop:2 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/signin" className="btn-primary" style={{ display:'inline-block',marginTop:'1.75rem',background:'var(--gold)',color:'var(--ink)',border:'none' }}>
              Try Eli free →
            </Link>
          </div>

          {/* Chat mockup */}
          <div className="eli-chat-mockup" style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(201,168,76,0.2)',borderRadius:14,overflow:'hidden' }}>
            <div style={{ padding:'0.875rem 1rem',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',gap:'0.625rem' }}>
              <div style={{ width:32,height:32,borderRadius:'50%',background:'var(--gold)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.8rem',color:'var(--ink)' }}>E</div>
              <div>
                <div style={{ fontSize:'0.85rem',fontWeight:600,color:'#fff' }}>Eli</div>
                <div style={{ fontSize:'0.65rem',color:'var(--mist)' }}>AI Planning Coach</div>
              </div>
              <div style={{ marginLeft:'auto',width:7,height:7,borderRadius:'50%',background:'var(--sage)',boxShadow:'0 0 6px rgba(107,143,113,0.5)' }} />
            </div>
            <div style={{ padding:'1.25rem' }}>
              {[
                { user:false, text:"Good morning. You said your #1 father goal this week was to take your kids to the park before Saturday. It's Wednesday — how's that looking?" },
                { user:true,  text:"Honestly I keep pushing it. Work has been crazy." },
                { user:false, text:"Work will always be there. Your mission says you want to lead with integrity in every role — not just the professional one. What would it take to make Thursday evening happen?" },
              ].map((msg, i) => (
                <div key={i} style={{ display:'flex',gap:'0.75rem',marginBottom:'1rem',alignItems:'flex-start',flexDirection: msg.user ? 'row-reverse' : 'row' }}>
                  <div style={{ width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.65rem',fontWeight:700,flexShrink:0,background: msg.user ? 'rgba(255,255,255,0.1)' : 'var(--gold)',color: msg.user ? 'rgba(255,255,255,0.6)' : 'var(--ink)' }}>
                    {msg.user ? 'M' : 'E'}
                  </div>
                  <div style={{ borderRadius:10,padding:'0.7rem 0.875rem',fontSize:'0.82rem',color:'rgba(255,255,255,0.85)',lineHeight:1.55,maxWidth:'85%',fontStyle: msg.user ? 'normal' : 'italic',fontFamily: msg.user ? 'var(--ff-body)' : 'var(--ff-accent)',background: msg.user ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.06)',border: msg.user ? '1px solid rgba(201,168,76,0.2)' : '1px solid rgba(255,255,255,0.07)' }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="section-pad" style={{ background:'var(--paper)' }}>
        <div style={{ maxWidth:1000,margin:'0 auto' }}>
          <span style={{ fontFamily:'var(--ff-accent)',fontStyle:'italic',fontSize:'0.85rem',color:'var(--gold)',letterSpacing:'0.06em',display:'block',marginBottom:'0.75rem' }}>The rhythm that works</span>
          <h2 style={{ fontFamily:'var(--ff-display)',fontSize:'clamp(2rem,4vw,2.75rem)',lineHeight:1.15,letterSpacing:'-0.02em',color:'var(--ink)',marginBottom:'1rem' }}>Three sessions.<br />One complete day.</h2>
          <p style={{ fontSize:'1rem',color:'var(--slate)',maxWidth:540,lineHeight:1.7 }}>Missionly is built around a simple loop that high performers and mission-driven people already know works.</p>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'2rem',marginTop:'3.5rem' }}>
            {[
              { icon:'☀️', time:'Morning · 5 min', title:'Daily Planning', desc:"Start with intention. Choose your top 3 priorities, connect each one to a life role, and ask Eli what you might be avoiding. Your day gets a purpose before it gets a to-do list." },
              { icon:'📅', time:'Sunday · 15 min', title:'Weekly Planning', desc:"Set 1–2 meaningful goals for each of your life roles. Review last week honestly. Then look ahead with clarity. Your week becomes intentional, not reactive." },
              { icon:'🌙', time:'Evening · 3 min', title:'Daily Reflection', desc:"Did you do what you planned? What carries to tomorrow? Two questions. No journaling pressure. Just honest accountability so you can rest and reset." },
            ].map(c => (
              <div key={c.title} className="how-card">
                <span style={{ fontSize:'1.75rem',marginBottom:'1rem',display:'block' }}>{c.icon}</span>
                <div style={{ fontSize:'0.7rem',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--gold)',marginBottom:'0.75rem' }}>{c.time}</div>
                <div style={{ fontFamily:'var(--ff-display)',fontSize:'1.3rem',color:'var(--ink)',marginBottom:'0.625rem' }}>{c.title}</div>
                <p style={{ fontSize:'0.9rem',color:'var(--slate)',lineHeight:1.65 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section-pad" style={{}}>
        <div style={{ maxWidth:1000,margin:'0 auto' }}>
          <span style={{ fontFamily:'var(--ff-accent)',fontStyle:'italic',fontSize:'0.85rem',color:'var(--gold)',letterSpacing:'0.06em',display:'block',marginBottom:'0.75rem' }}>Everything you need</span>
          <h2 style={{ fontFamily:'var(--ff-display)',fontSize:'clamp(2rem,4vw,2.75rem)',lineHeight:1.15,letterSpacing:'-0.02em',color:'var(--ink)',marginBottom:'1rem' }}>Built for the whole life,<br />not just the work day.</h2>
          <p style={{ fontSize:'1rem',color:'var(--slate)',maxWidth:540,lineHeight:1.7 }}>Most planners are built for productivity. Missionly is built for purpose — every feature connects back to who you're trying to become.</p>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'1.5rem',marginTop:'3.5rem' }}>
            {[
              { icon:'⚑', title:'Personal Mission Builder', desc:'A guided prompt flow that helps you write your life\'s mission statement in under 10 minutes. Not a blank text box — a real process.' },
              { icon:'◎', title:'Life Roles Framework', desc:'Define the roles that matter — Father, Husband, Professional, Disciple. Set goals within each role so no part of your life gets neglected.' },
              { icon:'☀', title:'Daily Planning Session', desc:'A structured morning ritual with guided prompts — not a blank page. Connect today\'s priorities to this week\'s roles before the day pulls you off course.' },
              { icon:'📅', title:'Weekly Planning & Review', desc:'Your Sunday session prompts you to review last week, carry over unfinished goals, and set clear intentions for the week ahead.' },
              { icon:'📈', title:'Progress & Streaks', desc:'See your consistency across roles and weeks. Spot patterns. Know which roles keep getting neglected before it becomes a problem.' },
              { icon:'✦', title:'Eli — Your AI Coach', desc:'Not a chatbot. An AI coach that knows your mission, roles, and weekly goals — and asks the questions that actually move you forward.' },
            ].map(f => (
              <div key={f.title} className="feature">
                <span style={{ fontSize:'1.4rem',marginBottom:'0.75rem',display:'block' }}>{f.icon}</span>
                <div style={{ fontWeight:600,fontSize:'0.95rem',color:'var(--ink)',marginBottom:'0.375rem' }}>{f.title}</div>
                <p style={{ fontSize:'0.875rem',color:'var(--slate)',lineHeight:1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="section-pad" style={{ background:'var(--paper)' }}>
        <div style={{ maxWidth:1000,margin:'0 auto' }}>
          <span style={{ fontFamily:'var(--ff-accent)',fontStyle:'italic',fontSize:'0.85rem',color:'var(--gold)',letterSpacing:'0.06em',display:'block',marginBottom:'0.75rem' }}>Simple pricing</span>
          <h2 style={{ fontFamily:'var(--ff-display)',fontSize:'clamp(2rem,4vw,2.75rem)',lineHeight:1.15,letterSpacing:'-0.02em',color:'var(--ink)',marginBottom:'1rem' }}>Start free.<br />Upgrade when you're ready.</h2>
          <p style={{ fontSize:'1rem',color:'var(--slate)',maxWidth:540,lineHeight:1.7 }}>No credit card to get started. Pro unlocks Eli, history, and the full planning loop.</p>

          {/* Toggle */}
          <div style={{ display:'flex',alignItems:'center',gap:'0.875rem',marginTop:'2rem' }}>
            <span style={{ fontSize:'0.9rem',fontWeight: annual ? 400 : 600,color: annual ? 'var(--mist)' : 'var(--ink)' }}>Monthly</span>
            <div
              onClick={() => setAnnual(a => !a)}
              style={{
                width:48,height:26,borderRadius:13,cursor:'pointer',position:'relative',
                background: annual ? 'var(--ink)' : 'var(--paper-dk)',
                transition:'background 0.2s'
              }}
            >
              <div style={{
                position:'absolute',top:3,left: annual ? 25 : 3,
                width:20,height:20,borderRadius:'50%',background:'#fff',
                transition:'left 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.2)'
              }} />
            </div>
            <span style={{ fontSize:'0.9rem',fontWeight: annual ? 600 : 400,color: annual ? 'var(--ink)' : 'var(--mist)' }}>
              Annual
            </span>
            {annual && (
              <span style={{ background:'var(--sage-dim)',color:'var(--sage)',fontSize:'0.75rem',fontWeight:700,padding:'0.2rem 0.6rem',borderRadius:20,border:'1px solid rgba(107,143,113,0.25)' }}>
                Save $29 — 2 months free
              </span>
            )}
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'1.5rem',marginTop:'3.5rem',maxWidth:700 }}>
            {/* Free */}
            <div style={{ background:'#fff',borderRadius:14,padding:'2rem',border:'1px solid rgba(26,26,46,0.1)' }}>
              <div style={{ fontSize:'0.75rem',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--mist)',marginBottom:'0.5rem' }}>Free</div>
              <div style={{ fontFamily:'var(--ff-display)',fontSize:'2.5rem',color:'var(--ink)',lineHeight:1,marginBottom:'0.25rem' }}>$0</div>
              <div style={{ fontSize:'0.8rem',color:'var(--mist)',marginBottom:'1.5rem' }}>forever</div>
              <ul style={{ listStyle:'none',padding:0,marginBottom:'2rem' }}>
                {['Mission statement builder','Life roles setup','Weekly planning session','Current week only'].map(item => (
                  <li key={item} style={{ display:'flex',gap:'0.625rem',alignItems:'flex-start',fontSize:'0.875rem',color:'var(--slate)',padding:'0.375rem 0',borderBottom:'1px solid rgba(26,26,46,0.05)' }}>
                    <span style={{ color:'var(--sage)',fontWeight:700,flexShrink:0 }}>✓</span>{item}
                  </li>
                ))}
              </ul>
              <Link to="/signin" className="price-cta">Get started free</Link>
            </div>
            {/* Pro */}
            <div style={{ background:'var(--ink)',borderRadius:14,padding:'2rem',border:'1px solid var(--gold)',position:'relative' }}>
              <div style={{ position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:'var(--gold)',color:'var(--ink)',fontSize:'0.7rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',padding:'0.25rem 0.875rem',borderRadius:20 }}>Most Popular</div>
              <div style={{ fontSize:'0.75rem',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--gold)',marginBottom:'0.5rem' }}>Pro</div>
              <div style={{ display:'flex',alignItems:'baseline',gap:'0.375rem' }}>
                <div style={{ fontFamily:'var(--ff-display)',fontSize:'2.5rem',color:'#fff',lineHeight:1,marginBottom:'0.25rem' }}>{annual ? '$79' : '$9'}</div>
                {annual && <span style={{ fontSize:'0.8rem',color:'rgba(255,255,255,0.4)',textDecoration:'line-through' }}>$108</span>}
              </div>
              <div style={{ fontSize:'0.8rem',color:'rgba(255,255,255,0.4)',marginBottom:'1.5rem' }}>{annual ? 'per year · cancel anytime' : 'per month · cancel anytime'}</div>
              <ul style={{ listStyle:'none',padding:0,marginBottom:'2rem' }}>
                {['Everything in Free','Daily planning + reflection','Eli AI coach (full access)','Planning history & streaks','Weekly review prompts','14-day free trial'].map(item => (
                  <li key={item} style={{ display:'flex',gap:'0.625rem',alignItems:'flex-start',fontSize:'0.875rem',color:'rgba(255,255,255,0.7)',padding:'0.375rem 0',borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ color:'var(--gold)',fontWeight:700,flexShrink:0 }}>✓</span>{item}
                  </li>
                ))}
              </ul>
              <Link to="/signin" className="price-cta price-cta-featured">Start 14-day trial</Link>
            </div>
          </div>
        </div>
      </section>

      {/* EMAIL CAPTURE */}
      <section id="early" className="section-pad" style={{ textAlign:'center' }}>
        <div style={{ maxWidth:1000,margin:'0 auto' }}>
          <div style={{ background:'var(--ink)',borderRadius:20,padding:'4rem 2rem',position:'relative',overflow:'hidden' }}>
            <div style={{ position:'absolute',top:-80,right:-80,width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(201,168,76,0.12),transparent 70%)',pointerEvents:'none' }} />
            <h2 style={{ fontFamily:'var(--ff-display)',fontSize:'clamp(2rem,4vw,2.75rem)',lineHeight:1.15,letterSpacing:'-0.02em',color:'#fff',marginBottom:'1rem' }}>Be first in.</h2>
            <p style={{ fontSize:'1rem',color:'rgba(255,255,255,0.55)',maxWidth:440,lineHeight:1.7,margin:'0.75rem auto 2.5rem' }}>
              Missionly is in early access. Join the list and get lifetime Pro pricing locked in before we launch publicly.
            </p>
            {submitState === 'success' ? (
              <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'0.75rem',marginTop:'0.5rem' }}>
                <div style={{ width:48,height:48,borderRadius:'50%',background:'var(--sage)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem' }}>✓</div>
                <p style={{ color:'#fff',fontWeight:600,fontSize:'1rem' }}>You're on the list!</p>
                <p style={{ color:'rgba(255,255,255,0.45)',fontSize:'0.825rem' }}>We'll reach out when early access opens.</p>
              </div>
            ) : (
              <>
                <div className="email-form-wrap" style={{ display:'flex',gap:'0.75rem',maxWidth:460,margin:'0 auto',flexWrap:'wrap',justifyContent:'center' }}>
                  <input
                    className="email-input"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleEarlyAccess()}
                    disabled={submitState === 'loading'}
                  />
                  <button
                    className="email-btn"
                    onClick={handleEarlyAccess}
                    disabled={submitState === 'loading'}
                    style={{ opacity: submitState === 'loading' ? 0.7 : 1 }}
                  >
                    {submitState === 'loading' ? 'Saving...' : 'Get early access'}
                  </button>
                </div>
                {submitState === 'error' && (
                  <p style={{ color:'#f87171',fontSize:'0.8rem',marginTop:'0.75rem' }}>Something went wrong — try again.</p>
                )}
                <p style={{ fontSize:'0.75rem',color:'rgba(255,255,255,0.3)',marginTop:'1rem' }}>No spam. Just a note when we're ready for you.</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:'var(--ink)',borderTop:'1px solid rgba(255,255,255,0.06)',padding:'2.5rem 1.5rem',textAlign:'center' }}>
        <div style={{ fontFamily:'var(--ff-display)',fontSize:'1.25rem',color:'var(--gold)',marginBottom:'0.5rem' }}>Missionly</div>
        <p style={{ fontSize:'0.8rem',color:'rgba(255,255,255,0.3)' }}>© {new Date().getFullYear()} Missionly · Built with purpose.</p>
      </footer>
    </div>
  );
}
