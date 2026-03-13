import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, X, Bot, User } from 'lucide-react'
import { chatApi } from '../utils/api'

const MOCK_RESPONSES = [
  "CPU overload detected on production-node-1. Current CPU is at 94.2%. Recommend scaling api-service to 5 replicas immediately.",
  "Based on current metrics, api-service is experiencing a traffic spike. Requests/sec jumped to 1450 (normal: ~300). Auto-scaling is recommended.",
  "Memory pressure detected on production-node-2 (87.5%). This could be a memory leak in auth-service. Recommend rolling restart: kubectl rollout restart deployment/auth-service",
  "All systems appear stable currently. CPU avg is 42%, memory at 55%, no critical alerts active.",
  "To scale a deployment in Kubernetes: kubectl scale deployment <name> --replicas=<count>. To monitor: kubectl get pods -w",
]

let mockIdx = 0

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '🤖 AI DevOps Assistant online. Ask me about infrastructure issues, incidents, or commands.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const history = messages.slice(-6)
      const res = await chatApi.sendMessage(userMsg, history)
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }])
    } catch {
      const mock = MOCK_RESPONSES[mockIdx % MOCK_RESPONSES.length]
      mockIdx++
      setMessages(prev => [...prev, { role: 'assistant', content: mock }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00e5ff22, #00e5ff44)',
          border: '1px solid #00e5ff66',
          color: '#00e5ff',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px #00e5ff33',
          zIndex: 1000,
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 30px #00e5ff55'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px #00e5ff33'}
      >
        <MessageSquare size={20} />
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: '84px',
          right: '24px',
          width: '360px',
          height: '480px',
          background: 'var(--bg-card)',
          border: '1px solid #00e5ff44',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 0 40px #00e5ff20',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999,
          animation: 'slide-in-up 0.3s ease',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'linear-gradient(90deg, #00e5ff10, transparent)',
          }}>
            <Bot size={16} color="#00e5ff" />
            <span style={{ fontFamily: 'var(--font-display)', color: '#00e5ff', fontSize: '13px', fontWeight: 600 }}>
              DevOps AI
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00ff88' }} className="animate-pulse-glow" />
              <span style={{ fontSize: '9px', color: '#00ff88' }}>ONLINE</span>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: '8px' }}>
              <X size={14} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex', gap: '8px',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                animation: 'slide-in-up 0.2s ease',
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: msg.role === 'user' ? '#7c3aed33' : '#00e5ff22',
                  border: `1px solid ${msg.role === 'user' ? '#7c3aed66' : '#00e5ff44'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {msg.role === 'user' ? <User size={12} color="#7c3aed" /> : <Bot size={12} color="#00e5ff" />}
                </div>
                <div style={{
                  maxWidth: '75%',
                  padding: '8px 10px',
                  background: msg.role === 'user' ? '#7c3aed15' : 'var(--bg-secondary)',
                  border: `1px solid ${msg.role === 'user' ? '#7c3aed33' : 'var(--border)'}`,
                  borderRadius: msg.role === 'user' ? '10px 2px 10px 10px' : '2px 10px 10px 10px',
                  fontSize: '11px',
                  color: 'var(--text-primary)',
                  lineHeight: '1.6',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#00e5ff22', border: '1px solid #00e5ff44', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={12} color="#00e5ff" />
                </div>
                <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '2px 10px 10px 10px', fontSize: '11px', color: '#00e5ff' }}>
                  <span className="animate-blink">▌</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid var(--border)',
            display: 'flex', gap: '8px',
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask about infrastructure..."
              style={{
                flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '7px 10px', color: 'var(--text-primary)',
                fontSize: '11px', fontFamily: 'var(--font-mono)', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = '#00e5ff44'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              style={{
                width: 32, height: 32, borderRadius: 'var(--radius)',
                background: '#00e5ff22', border: '1px solid #00e5ff44',
                color: '#00e5ff', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
