import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { signOut } from "../services/supabase";
import { SplashScreen } from "../components/SplashScreen";
import styles from "./Onboarding.module.css";

const GOALS = [
  { id: "habits", icon: "🌱", label: "Criar hábitos saudáveis" },
  { id: "money", icon: "💰", label: "Organizar dinheiro" },
  { id: "career", icon: "🎯", label: "Evoluir na carreira" },
  { id: "study", icon: "📚", label: "Estudar com ritmo" },
];

const HABITS = [
  { id: "meditate", icon: "🧘", label: "MEDITAR" },
  { id: "water", icon: "💧", label: "BEBER 2L" },
  { id: "walk", icon: "🚶", label: "CAMINHAR" },
  { id: "read", icon: "📖", label: "LER" },
];

const WEEK_DAYS = [
  { id: 0, label: "S" },
  { id: 1, label: "T" },
  { id: 2, label: "Q" },
  { id: 3, label: "Q" },
  { id: 4, label: "S" },
  { id: 5, label: "S" },
  { id: 6, label: "D" },
];

const FINANCE_GOALS = [
  { id: "emergency", icon: "🧱", label: "Reserva de emergência" },
  { id: "travel", icon: "✈️", label: "Viagem" },
  { id: "house", icon: "🏠", label: "Casa própria" },
];

const AVATARS = [
  { id: "sunflower", emoji: "🌻", label: "Girassol", locked: false },
  { id: "fox", emoji: "🦊", label: "Raposa", locked: false },
  { id: "turtle", emoji: "🐢", label: "Tartaruga", locked: false },
  { id: "owl", emoji: "🦉", label: "Coruja", locked: false },
  { id: "rocket", emoji: "🚀", label: "Foguete", locked: true, cost: 100 },
  { id: "diamond", emoji: "💎", label: "Diamante", locked: true, cost: 300 },
  { id: "crown", emoji: "👑", label: "Coroa", locked: true, cost: 500 },
  { id: "add", emoji: "+", label: "+", locked: false, isAdd: true, disabled: true },
];

const AVATAR_COLORS = [
  { id: "yellow", color: "#FFD23F", label: "Amarelo" },
  { id: "pink", color: "#FF6B9D", label: "Rosa" },
  { id: "blue", color: "#6BC5FF", label: "Azul" },
  { id: "green", color: "#6BCB77", label: "Verde" },
  { id: "purple", color: "#A855F7", label: "Roxo" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { addHabit } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSplash, setShowSplash] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [firstHabit, setFirstHabit] = useState({
    name: "Meditar",
    days: [0,1, 2, 3, 4],
  });
  const [selectedGoal, setSelectedGoal] = useState("emergency");
  const [goalAmount, setGoalAmount] = useState(3000);
  const [goalMonths, setGoalMonths] = useState(6);
  const [selectedAvatar, setSelectedAvatar] = useState("sunflower");
  const [avatarColor, setAvatarColor] = useState("yellow");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const savedStep = localStorage.getItem("ior_onboarding_step");
    if (savedStep) {
      setCurrentStep(Number(savedStep));
    }

    const savedGoals = localStorage.getItem("ior_onboarding_choices");
    if (savedGoals) {
      try {
        const parsed = JSON.parse(savedGoals);
        setSelectedGoals(parsed.goals || []);
      } catch (e) {}
    }

    const savedHabit = localStorage.getItem("ior_first_habit");
    if (savedHabit) {
      try {
        setFirstHabit(JSON.parse(savedHabit));
      } catch (e) {}
    }

    const savedGoal = localStorage.getItem("ior_first_goal");
    if (savedGoal) {
      setSelectedGoal(savedGoal);
    }

    const savedAvatar = localStorage.getItem("ior_avatar");
    if (savedAvatar) {
      setSelectedAvatar(savedAvatar);
    }

    const savedUsername = localStorage.getItem("ior_username");
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ior_onboarding_step", String(currentStep));
  }, [currentStep]);

  useEffect(() => {
    localStorage.setItem("ior_onboarding_choices", JSON.stringify({ goals: selectedGoals }));
  }, [selectedGoals]);

  useEffect(() => {
    localStorage.setItem("ior_first_habit", JSON.stringify(firstHabit));
  }, [firstHabit]);

  useEffect(() => {
    localStorage.setItem("ior_first_goal", selectedGoal);
  }, [selectedGoal]);

  useEffect(() => {
    localStorage.setItem("ior_avatar", selectedAvatar);
  }, [selectedAvatar]);

  useEffect(() => {
    if (username.trim()) {
      localStorage.setItem("ior_username", username);
    }
  }, [username]);

  const handleStart = () => {
    setCurrentStep(2);
  };

  const handleAlreadyHaveAccount = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem('ior_auth_skipped');
      localStorage.removeItem('ior_onboarding_done');
      localStorage.removeItem('ior_onboarding_step');
      navigate('/login');
    }
  };

  const handleGoalToggle = (goalId) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    );
  };

  const handleSkipStep2 = () => {
    setCurrentStep(3);
  };

  const handleContinueStep2 = () => {
    setCurrentStep(3);
  };

  const handleHabitSelect = (habitId) => {
    const habit = HABITS.find((h) => h.id === habitId);
    if (habit) {
      setFirstHabit((prev) => ({ ...prev, name: `${habit.label}` }));
    }
  };

  const handleDayToggle = (dayId) => {
    setFirstHabit((prev) => ({
      ...prev,
      days: prev.days.includes(dayId) ? prev.days.filter((d) => d !== dayId) : [...prev.days, dayId],
    }));
  };

  const handleBackStep3 = () => {
    setCurrentStep(2);
  };

  const handlePlantHabit = () => {
    setCurrentStep(4);
  };

  const handleGoalSelect = (goalId) => {
    setSelectedGoal(goalId);
  };

  const handleSkipStep4 = () => {
    setCurrentStep(5);
  };

  const handleDefineGoal = () => {
    setCurrentStep(5);
  };

  const handleAvatarSelect = (avatarId) => {
    const avatar = AVATARS.find((a) => a.id === avatarId);
    if (avatar?.locked) return;
    setSelectedAvatar(avatarId);
  };

  const handleSkipStep5 = () => {
    setCurrentStep(6);
  };

  const handleContinueStep5 = () => {
    if (!username.trim()) return;
    setCurrentStep(6);
  };

  const handleGoHome = () => {
    completeOnboarding();
    setShowSplash(true);
    setTimeout(() => {
      navigate("/");
    }, 1350);
  };

  const handleActivateNotifications = async () => {
    if ("Notification" in window) {
      await Notification.requestPermission();
    }
    completeOnboarding();
    setShowSplash(true);
    setTimeout(() => {
      navigate("/");
    }, 1350);
  };

  const completeOnboarding = () => {
    const existingHabits = localStorage.getItem('nex_habits');
    const existingGoals = localStorage.getItem('nex_fin_goals');
    const existingAvatar = localStorage.getItem('nex_avatar');
    const existingUsername = localStorage.getItem('nex_username');
    
    if (!existingHabits && firstHabit.name && firstHabit.days.length > 0) {
      addHabit({
        name: firstHabit.name,
        done: false,
        pts: 20,
        icon: 'PiStarBold',
        priority: 'media',
        freq: 'personalizado',
        days: firstHabit.days,
        subtasks: [],
        notes: '',
        estMins: null,
        deadline: null,
        createdAt: new Date().toISOString().slice(0, 10)
      });
    }

    if (!existingGoals && selectedGoal) {
      const goalLabel = FINANCE_GOALS.find(g => g.id === selectedGoal)?.label || selectedGoal;
      
      const iconMap = {
        'emergency': 'shield',
        'travel': 'plane',
        'house': 'house'
      };
      
      const newGoal = {
        id: Date.now(),
        label: goalLabel,
        target: goalAmount,
        saved: 0,
        aportes: [],
        icon: iconMap[selectedGoal] || 'target'
      };
      
      localStorage.setItem("nex_fin_goals", JSON.stringify([newGoal]));
    }

    if (!existingAvatar && selectedAvatar) {
      const avatarEmoji = AVATARS.find(a => a.id === selectedAvatar)?.emoji || '🌻';
      localStorage.setItem("nex_avatar", avatarEmoji);
      
      const avatarMetadata = {
        id: selectedAvatar,
        emoji: avatarEmoji,
        label: AVATARS.find(a => a.id === selectedAvatar)?.label || 'Girassol',
        color: AVATAR_COLORS.find(c => c.id === avatarColor)?.color || '#FFD23F',
        level: 1,
        unlockedAt: new Date().toISOString()
      };
      localStorage.setItem("nex_avatar_metadata", JSON.stringify(avatarMetadata));
    }

    if (!existingUsername && username) {
      localStorage.setItem("nex_username", username);
    }

    localStorage.setItem("ior_onboarding_done", "true");
    localStorage.setItem("ior_auth_skipped", "true");
    localStorage.removeItem("ior_onboarding_step");
    localStorage.removeItem("ior_first_habit");
    localStorage.removeItem("ior_first_goal");
    localStorage.removeItem("ior_onboarding_choices");
    localStorage.removeItem("ior_avatar");
    localStorage.removeItem("ior_username");

    // Dispara evento customizado para notificar mudanças
    console.log('Onboarding completo - dados salvos:', {
      username: localStorage.getItem('nex_username'),
      avatar: localStorage.getItem('nex_avatar'),
      onboardingDone: localStorage.getItem('ior_onboarding_done')
    });
    window.dispatchEvent(new Event('onboarding_completed'));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDayRange = (days) => {
    if (days.length === 0) return "Todos os dias";
    if (days.length === 7) return "Todos os dias";
    if (days.length === 5 && !days.includes(5) && !days.includes(6)) return "SEG-SEX";
    const dayLabels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
    return days.map(d => dayLabels[d]).join('-');
  };

  const progressPercents = {
    1: 16,
    2: 33,
    3: 50,
    4: 66,
    5: 83,
    6: 100,
  };

  const renderStep1 = () => (
    <>
      <div className={`${styles.statusbar} ${styles.yellowBg}`}>
      </div>
      <div className={`${styles.content} ${styles.spaceBetween}`} style={{ gap: '0', textAlign: 'center', alignItems: 'center', marginTop: '200px' }}>
        <div className={styles.stepIndicator} style={{ width: '100%', textAlign: 'left', position: 'relative', bottom: '200px'}}>01 / 06 · INÍCIO</div>
        <div className={styles.logoSection} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div className={styles.logoWrap}>
            <img src="/icons/logo.png" alt="Rootio" className={styles.logoImg} />
          </div>
          <h2 className={styles.mainTitle} style={{fontSize: '44px'}} >OI!<br />BEM-VINDO<br />AO ROOTIO.</h2>
          <p className={styles.subtitle} >
            Hábitos, finanças e carreira num lugar só. Honesto, gamificado.
          </p>
        </div>
        <div className={`${styles.bottomActions}`} style={{ marginBottom: '150px' }}>
          <div className={styles.nbProg}>
            <i style={{ width: `${progressPercents[1]}%` }}></i>
          </div>
          <button className={styles['nb-btn']} onClick={handleStart}>
            <span>Começar →</span>
          </button>
          <button className={`${styles['nb-btn']} ${styles.ghost}`} style={{ fontSize: '9px', padding: '4px 8px', marginTop: '10px', width: '300px' }} onClick={handleAlreadyHaveAccount}>
            <span >Ja tenho conta</span>
          </button>
        </div>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className={styles.statusbar}>
      </div>
      <div className={styles.content} style={{ textAlign: 'center', alignItems: 'center', marginTop: '200px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <span className={`${styles.stepIndicator} ${styles.lightText}`}>02 / 06 · OBJETIVOS</span>
          <button className={styles.skipBtn} onClick={handleSkipStep2}>Pular</button>
        </div>
        <div className={styles.nbProg}>
          <i style={{ width: `${progressPercents[2]}%` }}></i>
        </div>
        <h3 className={styles.mainTitle} style={{ fontSize: '16px', textAlign: 'center', marginTop: '20px' }}>O QUE VOCÊ QUER PLANTAR AQUI?</h3>
        <p className={styles.label} style={{ fontSize: '10px', color: 'var(--onboarding-mute)', textAlign: 'center' }}>
          Pode escolher mais de 1. Dá pra mudar depois.
        </p>
        <div style={{ width: '100%', gap: '10px', display: 'flex', flexDirection: 'column', marginTop: '50px' }}>
          {GOALS.map((goal) => {
            const baseColor = goal.id === 'habits' ? '#F59E0B' 
                          : goal.id === 'money' ? '#7CE577' 
                          : '#FFFFFF';
            const bgColor = selectedGoals.includes(goal.id) ? '#F59E0B' : baseColor;
            const textColor = selectedGoals.includes(goal.id) ? '#FFFFFF' : '#111111';
            
            return (
              <button
                key={goal.id}
                className={`${styles['nb-btn']} ${styles.withIcon}`}
                style={{ backgroundColor: bgColor, color: textColor }}
                onClick={() => handleGoalToggle(goal.id)}
              >
                <span style={{ fontSize: '13px' }}>{goal.icon}</span>
                <span style={{ fontSize: '10px', textTransform: 'none', letterSpacing: '0', flex: 1, textAlign: 'left' }}>
                  {goal.label}
                </span>
                <div className={`${styles['nb-check']} ${selectedGoals.includes(goal.id) ? styles.checked : ''}`} style={{ width: '13px', height: '13px', flexShrink: 0 }}>
                  {selectedGoals.includes(goal.id) && '✓'}
                </div>
              </button>
            );
          })}
        </div>
        <button 
          className={`${styles['nb-btn']} ${styles.sm}`}
          style={{ marginTop: '10px', width: '100%' }}
          onClick={handleContinueStep2}
          disabled={selectedGoals.length === 0}
        >
          <span>Continuar · {selectedGoals.length} escolhidos →</span>
        </button>
      </div>
    </>
  );

  const renderStep3 = () => {
    const selectedHabit = HABITS.find((h) => firstHabit.name.includes(h.label));

    return (
      <>
        <div className={styles.statusbar}>
        </div>
        <div className={styles.content} style={{ textAlign: 'center', alignItems: 'center', marginTop: '200px', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <span className={`${styles.stepIndicator} ${styles.lightText}`}>03 / 06 · 1° HÁBITO</span>
            <button className={styles.backBtn} onClick={handleBackStep3}>← Voltar</button>
          </div>
          <div className={styles.nbProg}>
            <i style={{ width: `${progressPercents[3]}%` }}></i>
          </div>
          <h3 className={styles.mainTitle} style={{ fontSize: '15px', textAlign: 'center', marginTop: '20px' }}>ESCOLHA 1 HÁBITO PRA COMEÇAR.</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
            {HABITS.map((habit) => (
              <span
                key={habit.id}
                className={`${styles['nb-tag']} ${selectedHabit?.id === habit.id ? styles.selected : ''}`}
                onClick={() => handleHabitSelect(habit.id)}
              >
                {habit.icon} {habit.label}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
            <div className={styles.label} style={{ marginBottom: '1px', textAlign: 'center' }}>NOME</div>
            <input
              type="text"
              className={styles.input}
              value={firstHabit.name}
              onChange={(e) => setFirstHabit((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Meditar"
            />
            <div className={styles.label} style={{ marginBottom: '1px', textAlign: 'center' }}>FREQUÊNCIA</div>
            <div className={styles.dayPicker}>
              {WEEK_DAYS.map((day) => (
                <button
                  key={day.id}
                  className={`${styles.dayBtn} ${firstHabit.days.includes(day.id) ? styles.selected : ''}`}
                  onClick={() => handleDayToggle(day.id)}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
          <button className={styles['nb-btn']} style={{ marginTop: 'auto', width: '100%', marginBottom: '10px' }} onClick={handlePlantHabit}>
            <span>Plantar hábito →</span>
          </button>
        </div>
      </>
    );
  };

  const renderStep4 = () => (
    <>
      <div className={styles.statusbar} style={{marginTop: '200px'}}>
      </div>
      <div className={styles.content} style={{ textAlign: 'center', alignItems: 'center'}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <span className={`${styles.stepIndicator} ${styles.lightText}`}>04 / 06 · 1ª META $</span>
          <button className={styles.skipBtn} onClick={handleSkipStep4}>Pular</button>
        </div>
        <div className={styles.nbProg}>
          <i style={{ width: `${progressPercents[4]}%` }}></i>
        </div>
        <h3 className={styles.mainTitle} style={{ fontSize: '15px', textAlign: 'center', marginTop: '20px'}}>E UMA META DE DINHEIRO?</h3>
        <div style={{ width: '100%', gap: '10px', display: 'flex', flexDirection: 'column' }}>
          {FINANCE_GOALS.map((goal) => {
            const baseColor = goal.id === 'emergency' ? '#F59E0B' 
                          : goal.id === 'travel' ? '#7CE577' 
                          : '#FFFFFF';
            const bgColor = selectedGoal === goal.id ? '#F59E0B' : baseColor;
            const textColor = selectedGoal === goal.id ? '#FFFFFF' : '#111111';
            
            return (
              <button
                key={goal.id}
                className={`${styles['nb-btn']} ${styles.withIcon}`}
                style={{ backgroundColor: bgColor, color: textColor }}
                onClick={() => handleGoalSelect(goal.id)}
              >
                <span style={{ fontSize: '13px' }}>{goal.icon}</span>
                <span style={{ fontSize: '10px', textTransform: 'none', letterSpacing: '0', flex: 1, textAlign: 'left' }}>
                  {goal.label}
                </span>
                <span>→</span>
              </button>
            );
          })}
        </div>
        <div className={`${styles['nb-card']} ${styles.amber}`} style={{ padding: '9px', width: '100%' }}>
          <div className={styles.label} style={{ marginBottom: '3px', textAlign: 'left', color: '#111' }}>VALOR DA META</div>
          <div className={styles.display} style={{ fontSize: '22px', textAlign: 'left', fontWeight: '900', color: '#111' }}>{formatCurrency(goalAmount)}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
            <span className={styles.mono} style={{ fontSize: '8px', color: '#111' }}>EM {goalMonths} MESES</span>
            <span className={styles.mono} style={{ fontSize: '8px', color: '#111' }}>{formatCurrency(goalAmount / goalMonths)}/MÊS</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '5px', justifyContent: 'center' }}>
          {[3, 6, 12, 24].map((months) => (
            <span
              key={months}
              className={`${styles['nb-tag']} ${goalMonths === months ? styles.selected : ''}`}
              onClick={() => setGoalMonths(months)}
            >
              {months} MESES
            </span>
          ))}
        </div>
        <button className={styles['nb-btn']} style={{ marginTop: 'auto', width: '100%', marginBottom: '10px'}} onClick={handleDefineGoal}>
          <span>Definir meta →</span>
        </button>
      </div>
    </>
  );

  const renderStep5 = () => (
    <>
      <div className={styles.statusbar} style={{marginTop: '200px'}}>
      </div>
      <div className={styles.content} style={{ textAlign: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <span className={`${styles.stepIndicator} ${styles.lightText}`}>05 / 06 · SEU AVATAR</span>
          <button className={styles.skipBtn} onClick={handleSkipStep5}>Pular</button>
        </div>
        <div className={styles.nbProg}>
          <i style={{ width: `${progressPercents[5]}%` }}></i>
        </div>
        <h3 className={styles.mainTitle} style={{ fontSize: '16px', textAlign: 'center', marginTop: '20px' }}>ESCOLHE SUA CARA.</h3>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div 
            style={{ 
              width: '68px', 
              height: '68px', 
              background: AVATAR_COLORS.find(c => c.id === avatarColor)?.color || '#FFD23F', 
              border: '3px solid #111', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '34px' 
            }}
          >
            {AVATARS.find(a => a.id === selectedAvatar)?.emoji || '🌻'}
          </div>
        </div>
        <div className={styles.avatarGrid}>
          {AVATARS.map((avatar) => (
            <div
              key={avatar.id}
              className={`${styles.avatarCard} ${selectedAvatar === avatar.id ? styles.selected : ''} ${avatar.locked ? styles.locked : ''} ${avatar.isAdd ? styles.add : ''}`}
              onClick={() => handleAvatarSelect(avatar.id)}
              style={{ cursor: avatar.locked || avatar.isAdd ? 'not-allowed' : 'pointer' }}
            >
              {avatar.isAdd ? (
                <span style={{ fontSize: '15px', color: 'var(--onboarding-mute)' }}>+</span>
              ) : (
                <>
                  <span style={{ fontSize: '19px' }}>{avatar.emoji}</span>
                  {avatar.locked && (
                    <span className={styles.avatarCost}>{avatar.cost}</span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        <div className={styles.colorSelector}>
          {AVATAR_COLORS.map((color) => (
            <button
              key={color.id}
              className={`${styles.colorOption} ${avatarColor === color.id ? styles.selected : ''}`}
              style={{ backgroundColor: color.color }}
              onClick={() => setAvatarColor(color.id)}
              aria-label={color.label}
            />
          ))}
        </div>
        <input
          type="text"
          className={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && username.trim()) {
              handleContinueStep5();
            }
          }}
          placeholder="Digite seu nome"
          maxLength={20}
          style={{ width: '100%'}}
        />
        <button 
          className={styles['nb-btn']} 
          style={{ marginTop: 'auto', width: '100%', marginBottom: '10px' }}
          onClick={handleContinueStep5}
          disabled={!username.trim()}
        >
          <span>É esse aí →</span>
        </button>
      </div>
    </>
  );

  const renderStep6 = () => {
    const habitData = HABITS.find((h) => firstHabit.name.includes(h.label));
    const goalData = FINANCE_GOALS.find((g) => g.id === selectedGoal);
    const avatarData = AVATARS.find((a) => a.id === selectedAvatar);

    return (
      <>
        <div className={`${styles.statusbar} ${styles.amberBg}`} style={{marginTop: '200px'}}>
        </div>
        <div className={`${styles.content} ${styles.spaceBetween} ${styles.step6Page}`}>
          <div className={`${styles.stepIndicator} ${styles.whiteText}`} style={{ width: '100%', textAlign: 'center' }}>06 / 06 · PRONTO</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textAlign: 'center' }}>
            <div className={`${styles.stamp} ${styles.amberBg}`}>+10 IO · BEM-VINDO!</div>
            <h2 className={`${styles.mainTitle} ${styles.whiteText}`} style={{ fontSize: '44px' }}>
              PRONTO,<br />{username || "AMIGX"}.
            </h2>
            <p className={`${styles.subtitle} ${styles.whiteText}`} style={{ fontSize: '10px', maxWidth: '24ch' }}>
              Sua raiz tá plantada. A gente se encontra para {firstHabit.name}.
            </p>
          </div>
          <div className={styles['nb-card']} style={{ background: '#fff', border: '3px solid #111', padding: '9px', marginBottom: '6px', width: '100%' }}>
            <div className={styles.label} style={{ marginBottom: '5px', textAlign: 'center' }}>SEU PLANO INICIAL</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px', color: '#111' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{habitData?.icon || "🧘"} {firstHabit.name}</span>
                <span className={`${styles.mono} ${styles.muted}`}>{formatDayRange(firstHabit.days)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{goalData?.icon || "💰"} Meta {formatCurrency(goalAmount)}</span>
                <span className={`${styles.mono} ${styles.muted}`}>{goalMonths} MESES</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{avatarData?.emoji || "🌻"} Avatar {avatarData?.label || "Girassol"}</span>
                <span className={`${styles.mono} ${styles.muted}`}>NV 1</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
            <button className={`${styles['nb-btn']} ${styles.primary}`} onClick={handleGoHome}>
              <span>Ir pro Hoje →</span>
            </button>
            <button 
              className={`${styles['nb-btn']} ${styles.ghost}`} 
              style={{ fontSize: '9px', background: 'transparent', color: '#fff', borderColor: '#111', marginBottom: '10px' }}
              onClick={handleActivateNotifications}
            >
              <span>Ativar notificações</span>
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      <div className={`${styles.page} ${currentStep === 1 ? styles.step1Page : ''} ${currentStep === 6 ? styles.step6Page : ''}`}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
        {currentStep === 6 && renderStep6()}
      </div>
    </>
  );
}
