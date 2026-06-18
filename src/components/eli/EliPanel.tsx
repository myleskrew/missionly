import React, { useState, useRef, useEffect } from 'react';
import { EliMessage } from '../../types';

interface EliPanelProps {
  messages: EliMessage[];
  onSend: (message: string) => void;
  loading?: boolean;
  theme?: 'light' | 'dark';
  userName?: string;
}

export const EliPanel: React.FC<EliPanelProps> = ({
  messages,
  onSend,
  loading = false,
  theme = 'dark',
  userName = 'You'
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      background: 'var(--ink)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--gold-dim)',
          border: '1.5px solid var(--gold)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold)'
        }}>E</div>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--white)' }}>Eli</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--mist)' }}>AI Planning Coach</div>
        </div>
        <div style={{
          marginLeft: 'auto',
          width: 8, height: 8, borderRadius: '50%',
          background: 'var(--sage)',
          boxShadow: '0 0 6px rgba(107,143,113,0.6)'
        }} />
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '1.25rem',
        display: 'flex', flexDirection: 'column', gap: '1rem'
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              gap: '0.625rem',
              alignItems: 'flex-start',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: msg.role === 'eli' ? 'var(--gold-dim)' : 'rgba(255,255,255,0.08)',
              border: msg.role === 'eli' ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.68rem', fontWeight: 700,
              color: msg.role === 'eli' ? 'var(--gold)' : 'rgba(255,255,255,0.5)',
              flexShrink: 0, marginTop: 2
            }}>
              {msg.role === 'eli' ? 'E' : userName[0]}
            </div>
            <div>
              {msg.role === 'user' && (
                <div style={{
                  fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em',
                  color: 'rgba(255,255,255,0.3)', marginBottom: '0.3rem',
                  textAlign: 'right'
                }}>{userName}</div>
              )}
              {msg.role === 'eli' && (
                <div style={{
                  fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em',
                  color: 'var(--gold)', marginBottom: '0.3rem'
                }}>Eli</div>
              )}
              <div style={{
                background: msg.role === 'eli'
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(201,168,76,0.1)',
                border: msg.role === 'eli'
                  ? '1px solid rgba(255,255,255,0.07)'
                  : '1px solid rgba(201,168,76,0.18)',
                borderRadius: 12,
                padding: '0.75rem 0.875rem',
                fontSize: '0.82rem',
                color: msg.role === 'eli' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.85)',
                lineHeight: 1.6,
                maxWidth: 240,
                fontFamily: msg.role === 'eli' ? 'var(--ff-accent)' : 'var(--ff-body)',
                fontStyle: msg.role === 'eli' ? 'italic' : 'normal'
              }}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--gold-dim)', border: '1px solid rgba(201,168,76,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.68rem', fontWeight: 700, color: 'var(--gold)', flexShrink: 0
            }}>E</div>
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12, padding: '0.75rem 1rem',
              color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem'
            }}>
              <span>•••</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '1rem 1.25rem',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', gap: '0.5rem'
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Reply to Eli..."
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '0.625rem 0.875rem',
            fontSize: '0.8rem', color: 'var(--white)',
            fontFamily: 'var(--ff-body)', outline: 'none', height: 40
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            width: 40, height: 40, background: 'var(--gold)',
            border: 'none', borderRadius: 8, color: 'var(--ink)',
            fontSize: '1rem', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            opacity: loading || !input.trim() ? 0.5 : 1
          }}
        >→</button>
      </div>
    </div>
  );
};
