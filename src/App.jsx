import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWallet } from './hooks/useWallet';
import { useGhostRoom } from './hooks/useGhostRoom';
import './App.css';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCountdown(seconds) {
  if (seconds <= 0) return '00:00:00';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m`;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function shortAddr(addr) {
  if (!addr) return '';
  return `${addr.slice(0,6)}…${addr.slice(-4)}`;
}

function timeAgo(ts) {
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  return `${Math.floor(diff/3600)}h ago`;
}

const DURATION_PRESETS = [
  { label: '5 min',   value: 300 },
  { label: '1 hour',  value: 3600 },
  { label: '24 hours',value: 86400 },
  { label: '7 days',  value: 604800 },
];

// ─── Particle Canvas ─────────────────────────────────────────────────────────

function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.5 - 0.1,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      life: Math.random(),
    }));

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.002;
        if (p.life <= 0 || p.y < -10) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 10;
          p.life = 1;
          p.vx = (Math.random() - 0.5) * 0.3;
          p.vy = -Math.random() * 0.5 - 0.1;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 180, ${p.opacity * p.life})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="particle-canvas" />;
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────

function Countdown({ expiresAt, onExpired }) {
  const [secs, setSecs] = useState(Math.max(0, expiresAt - Math.floor(Date.now() / 1000)));
  useEffect(() => {
    const id = setInterval(() => {
      const remaining = Math.max(0, expiresAt - Math.floor(Date.now() / 1000));
      setSecs(remaining);
      if (remaining === 0) { clearInterval(id); onExpired?.(); }
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const pct = Math.min(100, (secs / (expiresAt - (expiresAt - secs - (expiresAt - Math.floor(Date.now()/1000))))) * 100);
  const urgent = secs < 300;
  const critical = secs < 60;

  return (
    <div className={`countdown ${urgent ? 'urgent' : ''} ${critical ? 'critical' : ''}`}>
      <div className="countdown-label">SELF-DESTRUCTS IN</div>
      <div className="countdown-time">{formatCountdown(secs)}</div>
      <div className="countdown-bar">
        <div className="countdown-bar-fill" style={{ width: `${Math.max(2, (secs / Math.max(1, secs)) * 100)}%` }} />
      </div>
    </div>
  );
}

// ─── Destruction Animation ────────────────────────────────────────────────────

function DestructionOverlay({ roomName, onDone }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 1500);
    const t3 = setTimeout(() => setPhase(3), 3000);
    const t4 = setTimeout(() => onDone(), 4500);
    return () => [t1,t2,t3,t4].forEach(clearTimeout);
  }, []);
  return (
    <div className={`destruction-overlay phase-${phase}`}>
      <div className="destruction-content">
        <div className="destruction-skull">👻</div>
        <div className="destruction-title">ROOM DESTROYED</div>
        <div className="destruction-name">"{roomName}"</div>
        <div className="destruction-sub">Proof of destruction recorded on-chain.</div>
        <div className="destruction-sub dim">This room never existed.</div>
        <div className="glitch-lines">
          {Array.from({length:8}).map((_,i) => <div key={i} className="glitch-line" style={{animationDelay:`${i*0.07}s`}}/>)}
        </div>
      </div>
    </div>
  );
}

// ─── Create Room Modal ────────────────────────────────────────────────────────

function CreateRoomModal({ onClose, onCreate, loading }) {
  const [name, setName]         = useState('');
  const [duration, setDuration] = useState(3600);
  const [custom, setCustom]     = useState(false);
  const [customVal, setCustomVal] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;
    const d = custom ? (parseInt(customVal) * 60 || 3600) : duration;
    onCreate(name.trim(), d);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-icon">👻</span>
          <h2>CREATE GHOST ROOM</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <label className="field-label">ROOM NAME</label>
          <input
            className="ghost-input"
            placeholder="Enter room name…"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={60}
            autoFocus
          />
          <label className="field-label">SELF-DESTRUCT TIMER</label>
          <div className="preset-grid">
            {DURATION_PRESETS.map(p => (
              <button
                key={p.value}
                className={`preset-btn ${!custom && duration === p.value ? 'active' : ''}`}
                onClick={() => { setCustom(false); setDuration(p.value); }}
              >
                {p.label}
              </button>
            ))}
            <button
              className={`preset-btn ${custom ? 'active' : ''}`}
              onClick={() => setCustom(true)}
            >
              Custom
            </button>
          </div>
          {custom && (
            <input
              className="ghost-input"
              type="number"
              placeholder="Minutes…"
              value={customVal}
              onChange={e => setCustomVal(e.target.value)}
              min={1}
            />
          )}
          <div className="modal-warning">
            ⚠ Once created, this room will permanently self-destruct. Messages cannot be recovered.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>CANCEL</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={!name.trim() || loading}>
            {loading ? <span className="spinner" /> : 'SUMMON ROOM'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Room Card ────────────────────────────────────────────────────────────────

function RoomCard({ room, onClick, userAddress }) {
  const [secs, setSecs] = useState(Math.max(0, room.expiresAt - Math.floor(Date.now()/1000)));
  useEffect(() => {
    const id = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const isCreator = room.creator?.toLowerCase() === userAddress?.toLowerCase();
  const dead = room.destroyed || secs === 0;

  return (
    <div className={`room-card ${dead ? 'dead' : ''}`} onClick={() => !dead && onClick(room.id)}>
      <div className="room-card-header">
        <span className={`status-dot ${dead ? 'dead' : 'live'}`} />
        <span className="room-card-name">{room.name}</span>
        {isCreator && <span className="creator-badge">CREATOR</span>}
      </div>
      <div className="room-card-meta">
        <span>👥 {room.participantCount}</span>
        <span>💬 {room.messageCount}</span>
        <span className={`timer-small ${secs < 300 ? 'urgent' : ''}`}>
          {dead ? '💀 DESTROYED' : `⏳ ${formatCountdown(secs)}`}
        </span>
      </div>
    </div>
  );
}

// ─── Room View ────────────────────────────────────────────────────────────────

function RoomView({ roomId, signer, provider, userAddress, onBack, onDestroyed }) {
  const { getRoom, getMessages, sendMessage, destroyRoom, joinRoom, checkIsParticipant, loading, error, clearError } = useGhostRoom(signer, provider);
  const [room, setRoom]           = useState(null);
  const [messages, setMessages]   = useState([]);
  const [msgText, setMsgText]     = useState('');
  const [isParticipant, setIsParticipant] = useState(false);
  const [destroying, setDestroying] = useState(false);
  const [showDestroy, setShowDestroy] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const refresh = useCallback(async () => {
    const r = await getRoom(roomId);
    if (!r) return;
    setRoom(r);
    if (!r.destroyed) {
      const [msgs, part] = await Promise.all([
        getMessages(roomId),
        userAddress ? checkIsParticipant(roomId, userAddress) : Promise.resolve(false),
      ]);
      setMessages(msgs);
      setIsParticipant(part);
    }
  }, [roomId, userAddress]);

  useEffect(() => {
    refresh();
    pollRef.current = setInterval(refresh, 5000);
    return () => clearInterval(pollRef.current);
  }, [refresh]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!msgText.trim()) return;
    const ok = await sendMessage(roomId, msgText.trim());
    if (ok) { setMsgText(''); refresh(); }
  };

  const handleJoin = async () => {
    const ok = await joinRoom(roomId);
    if (ok) refresh();
  };

  const handleDestroy = async () => {
    setDestroying(true);
    const ok = await destroyRoom(roomId);
    if (ok) { setShowDestroy(true); }
    else setDestroying(false);
  };

  const handleExpired = useCallback(() => {
    setShowDestroy(true);
  }, []);

  if (!room) return (
    <div className="room-loading">
      <div className="ghost-spinner">👻</div>
      <p>Entering the void…</p>
    </div>
  );

  const isCreator = room.creator?.toLowerCase() === userAddress?.toLowerCase();
  const expired   = !room.isLive && !room.destroyed;
  const canDestroy = isCreator || expired;

  return (
    <div className={`room-view ${room.destroyed ? 'destroyed' : ''}`}>
      {showDestroy && (
        <DestructionOverlay
          roomName={room.name}
          onDone={() => { setShowDestroy(false); onDestroyed(); }}
        />
      )}

      <div className="room-header">
        <button className="btn-back" onClick={onBack}>← BACK</button>
        <div className="room-header-info">
          <h2 className="room-title">{room.name}</h2>
          <div className="room-header-meta">
            <span>Room #{room.id}</span>
            <span>·</span>
            <span>{shortAddr(room.creator)}</span>
            {isCreator && <span className="creator-badge">YOU</span>}
          </div>
        </div>
        {!room.destroyed && !expired && (
          <Countdown expiresAt={room.expiresAt} onExpired={handleExpired} />
        )}
        {(room.destroyed || expired) && (
          <div className="status-dead">💀 {room.destroyed ? 'DESTROYED' : 'EXPIRED'}</div>
        )}
      </div>

      {error && (
        <div className="error-bar" onClick={clearError}>
          ⚠ {error} <span className="error-dismiss">✕</span>
        </div>
      )}

      <div className="room-body">
        <div className="messages-panel">
          {messages.length === 0 && !room.destroyed && (
            <div className="messages-empty">
              <span>No messages yet.</span>
              <span className="dim">Be the first to speak before this room vanishes.</span>
            </div>
          )}
          {room.destroyed && (
            <div className="messages-empty destroyed-msg">
              <span>💀</span>
              <span>This room has been destroyed.</span>
              <span className="dim">Messages are permanently inaccessible.</span>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.sender.toLowerCase() === userAddress?.toLowerCase() ? 'own' : ''}`}>
              <div className="message-sender">{shortAddr(msg.sender)}</div>
              <div className="message-content">{msg.content}</div>
              <div className="message-time">{timeAgo(msg.timestamp)}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="room-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-label">PARTICIPANTS</div>
            <div className="sidebar-value">{room.participantCount}</div>
          </div>
          <div className="sidebar-section">
            <div className="sidebar-label">MESSAGES</div>
            <div className="sidebar-value">{room.messageCount}</div>
          </div>
          <div className="sidebar-section">
            <div className="sidebar-label">STATUS</div>
            <div className={`sidebar-value status-${room.destroyed ? 'dead' : room.isLive ? 'live' : 'expired'}`}>
              {room.destroyed ? 'DESTROYED' : room.isLive ? 'LIVE' : 'EXPIRED'}
            </div>
          </div>

          {!isParticipant && !room.destroyed && room.isLive && (
            <button className="btn-join" onClick={handleJoin} disabled={loading}>
              {loading ? <span className="spinner" /> : '+ JOIN ROOM'}
            </button>
          )}

          {canDestroy && !room.destroyed && (
            <button className="btn-destroy" onClick={handleDestroy} disabled={destroying || loading}>
              {destroying ? <span className="spinner" /> : '💀 DESTROY NOW'}
            </button>
          )}
        </div>
      </div>

      {isParticipant && !room.destroyed && room.isLive && (
        <div className="message-input-bar">
          <input
            className="ghost-input message-input"
            placeholder="Type a message… it won't last forever."
            value={msgText}
            onChange={e => setMsgText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            maxLength={500}
          />
          <button className="btn-send" onClick={handleSend} disabled={!msgText.trim() || loading}>
            {loading ? <span className="spinner" /> : 'SEND →'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const { address, shortAddress, signer, provider, connecting, error: walletError, connect, disconnect } = useWallet();
  const { getRoom, getUserRooms, createRoom, loading, error: contractError, clearError } = useGhostRoom(signer, provider);

  const [view, setView]           = useState('home'); // home | room
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [userRooms, setUserRooms] = useState([]);
  const [roomData, setRoomData]   = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [joinInput, setJoinInput] = useState('');
  const [notification, setNotification] = useState(null);

  const notify = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadUserRooms = useCallback(async () => {
    if (!address) return;
    const ids = await getUserRooms(address);
    setUserRooms(ids);
    const entries = await Promise.all(ids.map(id => getRoom(id)));
    const map = {};
    entries.forEach((r, i) => { if (r) map[ids[i]] = r; });
    setRoomData(map);
  }, [address]);

  useEffect(() => { loadUserRooms(); }, [loadUserRooms]);

  const handleCreate = async (name, duration) => {
    const id = await createRoom(name, duration);
    if (id !== null) {
      setShowCreate(false);
      notify(`Room "${name}" created!`);
      await loadUserRooms();
      setActiveRoomId(id);
      setView('room');
    }
  };

  const handleJoinById = () => {
    const id = parseInt(joinInput);
    if (isNaN(id)) return;
    setActiveRoomId(id);
    setView('room');
    setJoinInput('');
  };

  const handleBack = () => { setView('home'); setActiveRoomId(null); loadUserRooms(); };
  const handleDestroyed = () => { setView('home'); setActiveRoomId(null); loadUserRooms(); notify('Room permanently destroyed.', 'destroy'); };

  // ── Room view ──
  if (view === 'room' && activeRoomId !== null) {
    return (
      <div className="app">
        <ParticleField />
        <RoomView
          roomId={activeRoomId}
          signer={signer}
          provider={provider}
          userAddress={address}
          onBack={handleBack}
          onDestroyed={handleDestroyed}
        />
      </div>
    );
  }

  // ── Home ──
  return (
    <div className="app">
      <ParticleField />

      {notification && (
        <div className={`notification ${notification.type}`}>{notification.msg}</div>
      )}

      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
          loading={loading}
        />
      )}

      <header className="app-header">
        <div className="logo">
          <span className="logo-ghost">👻</span>
          <span className="logo-text">GHOST</span>
          <span className="logo-sub">programmable impermanence</span>
        </div>
        <div className="header-right">
          {address ? (
            <div className="wallet-connected">
              <span className="wallet-dot" />
              <span className="wallet-addr">{shortAddress}</span>
              <button className="btn-disconnect" onClick={disconnect}>disconnect</button>
            </div>
          ) : (
            <button className="btn-connect" onClick={connect} disabled={connecting}>
              {connecting ? 'CONNECTING…' : 'CONNECT WALLET'}
            </button>
          )}
        </div>
      </header>

      {walletError && <div className="error-bar">{walletError}</div>}

      <main className="app-main">
        {!address ? (
          <div className="landing">
            <div className="landing-hero">
              <div className="hero-ghost">👻</div>
              <h1 className="hero-title">
                What if apps were<br />
                <em>designed to disappear?</em>
              </h1>
              <p className="hero-desc">
                Ghost creates temporary blockchain rooms that permanently self-destruct.
                No traces. No recovery. Only proof that it existed.
              </p>
              <button className="btn-connect-large" onClick={connect} disabled={connecting}>
                {connecting ? 'CONNECTING…' : '⚡ CONNECT TO ENTER THE VOID'}
              </button>
            </div>

            <div className="features-grid">
              {[
                { icon: '⏳', title: 'Programmable Timers', desc: 'Set any duration from 1 minute to 30 days.' },
                { icon: '💀', title: 'On-Chain Destruction', desc: 'Self-destruct is permanent and recorded forever.' },
                { icon: '🔒', title: 'Access Revocation', desc: 'Messages become inaccessible the moment the room dies.' },
                { icon: '👥', title: 'Ephemeral Collaboration', desc: 'Gather, discuss, decide — then vanish.' },
              ].map(f => (
                <div key={f.title} className="feature-card">
                  <div className="feature-icon">{f.icon}</div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="dashboard">
            <div className="dashboard-actions">
              <button className="btn-primary large" onClick={() => setShowCreate(true)}>
                + SUMMON ROOM
              </button>
              <div className="join-row">
                <input
                  className="ghost-input join-input"
                  placeholder="Enter Room ID to join…"
                  value={joinInput}
                  onChange={e => setJoinInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleJoinById()}
                  type="number"
                  min={0}
                />
                <button className="btn-ghost" onClick={handleJoinById} disabled={!joinInput}>
                  ENTER →
                </button>
              </div>
            </div>

            <div className="rooms-section">
              <div className="section-header">
                <h3>YOUR ROOMS</h3>
                <button className="btn-refresh" onClick={loadUserRooms}>↻</button>
              </div>
              {userRooms.length === 0 ? (
                <div className="rooms-empty">
                  <span className="empty-ghost">👻</span>
                  <p>No rooms yet. Summon your first Ghost Room.</p>
                </div>
              ) : (
                <div className="rooms-grid">
                  {userRooms.map(id => roomData[id] && (
                    <RoomCard
                      key={id}
                      room={roomData[id]}
                      onClick={id => { setActiveRoomId(id); setView('room'); }}
                      userAddress={address}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <span>GHOST · Programmable Impermanence · Built on EVM</span>
      </footer>
    </div>
  );
}
