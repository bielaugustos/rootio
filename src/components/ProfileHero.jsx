import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useHabits } from "../hooks/useHabits";
import { usePlan } from "../hooks/usePlan";
import { calcLevel } from "../services/levels";
import { loadStorage } from "../services/storage";

// Emojis disponíveis do onboarding
const ONBOARDING_EMOJIS = ["🌻", "🦊", "🐢", "🦉", "🚀", "💎", "👑"];

// Helper to remove quotes from username
function cleanUsername(name) {
  if (!name) return name;
  return name.replace(/^"|"$/g, '');
}

export function ProfileHero() {
  const { user, profile } = useAuth();
  const { allPoints } = useHabits();
  const { isPro } = usePlan();
  
  const level = calcLevel(allPoints);
  
  // Estado para avatar com edição
  const [userAvatar, setUserAvatar] = useState(() => {
    const avatar = loadStorage("nex_avatar", "🌻");
    // Se for um objeto (do onboarding), extrai o emoji
    if (typeof avatar === "object" && avatar?.emoji) {
      return avatar.emoji;
    }
    // Verifica se o avatar está na lista do onboarding
    if (ONBOARDING_EMOJIS.includes(avatar)) {
      return avatar;
    }
    // Se não estiver, usa girassol como padrão
    return "🌻";
  });
  
  const [userName, setUserName] = useState(() => {
    const name = loadStorage("nex_username") || loadStorage("ior_username", "Amigo");
    return cleanUsername(name);
  });
  
  const [showPicker, setShowPicker] = useState(false);
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(userName);

  // Sincroniza nome e avatar do localStorage quando onboarding é completado
  useEffect(() => {
    const handleOnboardingCompleted = () => {
      const rawName = localStorage.getItem('nex_username') || localStorage.getItem('ior_username', 'Amigo');
      const newName = cleanUsername(rawName);
      const newAvatar = localStorage.getItem('nex_avatar', '🌻');
      
      if (ONBOARDING_EMOJIS.includes(newAvatar)) {
        setUserAvatar(newAvatar);
      }
      
      if (newName) {
        setUserName(newName);
        setTempName(newName);
      }
    };

    // Verifica dados na montagem inicial
    const checkOnboardingData = () => {
      const rawName = localStorage.getItem('nex_username') || localStorage.getItem('ior_username');
      const storedName = cleanUsername(rawName);
      const storedAvatar = localStorage.getItem('nex_avatar');
      const onboardingDone = localStorage.getItem('ior_onboarding_done');

      if (onboardingDone === 'true') {
        if (storedName) {
          setUserName(storedName);
          setTempName(storedName);
        }
        if (storedAvatar && ONBOARDING_EMOJIS.includes(storedAvatar)) {
          setUserAvatar(storedAvatar);
        }
      }
    };

    checkOnboardingData();
    window.addEventListener('onboarding_completed', handleOnboardingCompleted);
    return () => {
      window.removeEventListener('onboarding_completed', handleOnboardingCompleted);
    };
  }, []);

  // Sincroniza com Supabase
  useEffect(() => {
    if (profile?.username) {
      setUserName(profile.username);
      setTempName(profile.username);
    }
    if (profile?.avatar_emoji && ONBOARDING_EMOJIS.includes(profile.avatar_emoji)) {
      setUserAvatar(profile.avatar_emoji);
    }
  }, [profile?.username, profile?.avatar_emoji]);

  // Formatar data de ingresso
  const getCreationLabel = () => {
    const createdAt = profile?.created_at || user?.created_at;
    if (!createdAt) {
      return "DESDE AGORA";
    }
    try {
      const date = new Date(createdAt);
      return `DESDE ${date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).toUpperCase()}`;
    } catch {
      return "DESDE AGORA";
    }
  };

  // Handle — primeiros 12 chars do username em lowercase
  const handle = (userName || "usuario")
    .toLowerCase()
    .replace(/\s+/g, '')
    .slice(0, 12);

  // Função para salvar nome
  async function handleSaveName() {
    const { updateProfile } = await import("../services/supabase");
    const name = tempName.trim() || "Amigo";
    setUserName(name);
    localStorage.setItem("nex_username", name);
    setEditing(false);
    setShowPicker(false);
    
    if (user?.id) {
      await updateProfile(user.id, { username: name });
    }
  }

  // Função para escolher avatar
  async function pickAvatar(emoji) {
    const { updateProfile } = await import("../services/supabase");
    setUserAvatar(emoji);
    localStorage.setItem("nex_avatar", emoji);
    setShowPicker(false);
    
    if (user?.id) {
      await updateProfile(user.id, { avatar_emoji: emoji });
    }
  }

  return (
    <div
      className="nb-card"
      style={{
        background: '#FFD23F',
        padding: '14px',
        border: '4px solid #111111',
        boxShadow: '5px 5px 0 0 #111111',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Avatar — quadrado branco com borda ink */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowPicker((p) => !p)}
            style={{
              width: 72,
              height: 72,
              background: '#FFFFFF',
              border: '3px solid #111111',
              boxShadow: '3px 3px 0 0 #111111',
              fontSize: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
            }}
            aria-label="Trocar avatar"
          >
            {userAvatar || '🌻'}
          </button>
          
          {/* Avatar Picker */}
          {showPicker && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                padding: '12px',
                background: '#FFFFFF',
                border: '3px solid #111111',
                boxShadow: '4px 4px 0 0 #111111',
                zIndex: 100,
              }}
            >
              {ONBOARDING_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => pickAvatar(emoji)}
                  style={{
                    width: 48,
                    height: 48,
                    fontSize: 24,
                    background: userAvatar === emoji ? '#FFD23F' : '#FFFFFF',
                    border: '3px solid #111111',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.12s ease',
                  }}
                  >
                    {emoji}
                  </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          
          {/* Nome — Geist 900 uppercase */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {editing ? (
              <>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') setEditing(false);
                  }}
                  maxLength={24}
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '-0.01em',
                    lineHeight: 1,
                    padding: '2px 6px',
                    border: '2px solid #111',
                    background: '#FFF',
                    flex: 1,
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  style={{
                    fontSize: 14,
                    background: '#111',
                    color: '#FFD23F',
                    border: '2px solid #111',
                    padding: '4px 8px',
                    cursor: 'pointer',
                  }}
                >
                  ✓
                </button>
              </>
            ) : (
              <>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '-0.01em',
                    lineHeight: 1,
                    margin: 0,
                    color: '#111',
                  }}
                >
                  {userName || 'Usuário'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setTempName(userName);
                    setEditing(true);
                  }}
                  style={{
                    fontSize: 12,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    opacity: 0.6,
                  }}
                  aria-label="Editar nome"
                >
                  ✏️
                </button>
              </>
            )}
          </div>

          {/* Handle + data */}
          <p
            style={{
              fontFamily: 'monospace',
              fontWeight: 700,
              textTransform: 'uppercase',
              fontSize: 10,
              color: '#92400e',
              letterSpacing: '0.08em',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            @{handle} · {getCreationLabel()}
          </p>

          {/* Badges inline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>

            {/* Badge nível — bg ink, texto sun */}
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: '#111111',
                color: '#FFD23F',
                border: '2px solid #111111',
                padding: '3px 8px',
                letterSpacing: '0.06em',
                lineHeight: 1,
              }}
            >
              NV {level.value}
            </span>

            {/* Ticker IO — bg ink, texto sun, ícone raio */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#111111',
                color: '#FFD23F',
                border: '2px solid #111111',
                padding: '3px 8px',
                fontFamily: 'monospace',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {/* Ícone raio SVG nativo */}
              <svg width="9" height="11" viewBox="0 0 10 12" fill="#FFD23F">
                <path d="M5.5 0L0 7h4l-.5 5L10 4H6L6.5 0z" />
              </svg>
              {allPoints} IO
            </span>

            {/* Badge PRO (só se isPro) */}
            {isPro && (
              <span
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  fontSize: 10,
                  background: '#9B7BFF',
                  color: '#ffffff',
                  border: '2px solid #111111',
                  padding: '2px 6px',
                  letterSpacing: '0.06em',
                }}
              >
                PRO ★
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}