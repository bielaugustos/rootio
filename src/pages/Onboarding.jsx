import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  PiArrowRightBold,
  PiArrowLeftBold,
  PiCheckBold,
  PiLockBold,
  PiBellBold,
  } from "react-icons/pi";
import { signOut } from "../services/supabase";
import styles from "./Onboarding.module.css";

const GOALS = [
  { id: "habits", icon: "🌱", label: "Criar hábitos saudáveis" },
  { id: "money", icon: "💰", label: "Organizar dinheiro" },
  { id: "career", icon: "🎯", label: "Evoluir na carreira" },
  { id: "study", icon: "📚", label: "Estudar com ritmo" },
];

const HABITS = [
  { id: "meditate", icon: "🧘", label: "MEDITAR 10MIN" },
  { id: "water", icon: "💧", label: "BEBER 2L ÁGUA" },
  { id: "walk", icon: "🚶", label: "CAMINHAR 20MIN" },
  { id: "read", icon: "📖", label: "LER 10PG" },
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
  { id: "rose", emoji: "🌹", label: "Rosa", locked: false },
  { id: "tree", emoji: "🌳", label: "Árvore", locked: false },
  { id: "moon", emoji: "🌙", label: "Lua", locked: false },
  { id: "star", emoji: "⭐", label: "Estrela", locked: false },
  { id: "mountain", emoji: "⛰️", label: "Montanha", locked: true, cost: 100 },
  { id: "ocean", emoji: "🌊", label: "Oceano", locked: true, cost: 100 },
  { id: "fire", emoji: "🔥", label: "Fogo", locked: true, cost: 100 },
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
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [firstHabit, setFirstHabit] = useState({
    name: "",
    days: [],
    time: "07:00",
  });
  const [selectedGoal, setSelectedGoal] = useState("emergency");
  const [goalAmount, setGoalAmount] = useState(3000);
  const [goalMonths, setGoalMonths] = useState(6);
  const [editingGoal, setEditingGoal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("sunflower");
  const [avatarColor, setAvatarColor] = useState("yellow");
  const [username, setUsername] = useState("");
  const [editingHabit, setEditingHabit] = useState(false);

  // Load saved progress on mount
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

  // Save step changes
  useEffect(() => {
    localStorage.setItem("ior_onboarding_step", String(currentStep));
  }, [currentStep]);

  // Save goals
  useEffect(() => {
    localStorage.setItem("ior_onboarding_choices", JSON.stringify({ goals: selectedGoals }));
  }, [selectedGoals]);

  // Save habit
  useEffect(() => {
    localStorage.setItem("ior_first_habit", JSON.stringify(firstHabit));
  }, [firstHabit]);

  // Save selected financial goal
  useEffect(() => {
    localStorage.setItem("ior_first_goal", selectedGoal);
  }, [selectedGoal]);

  // Save avatar
  useEffect(() => {
    localStorage.setItem("ior_avatar", selectedAvatar);
  }, [selectedAvatar]);

  // Save username
  useEffect(() => {
    localStorage.setItem("ior_username", username);
  }, [username]);

  // Step 1 handlers
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
      // Navigate to login
      navigate('/login');
    }
   };

  // Step 2 handlers
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

  // Step 3 handlers
  const handleHabitSelect = (habitId) => {
    setFirstHabit((prev) => ({ ...prev, name: HABITS.find((h) => h.id === habitId).label }));
  };

  const handleDayToggle = (dayId) => {
    setFirstHabit((prev) => ({
      ...prev,
      days: prev.days.includes(dayId) ? prev.days.filter((d) => d !== dayId) : [...prev.days, dayId],
    }));
  };

  const handleTimeChange = (e) => {
    setFirstHabit((prev) => ({ ...prev, time: e.target.value }));
  };

  const handleBackStep3 = () => {
    setCurrentStep(2);
  };

  const handlePlantHabit = () => {
    setCurrentStep(4);
  };

  // Step 4 handlers
  const handleGoalSelect = (goalId) => {
    setSelectedGoal(goalId);
  };

  const handleSkipStep4 = () => {
    setCurrentStep(5);
  };

  const handleDefineGoal = () => {
    setCurrentStep(5);
  };

  // Step 5 handlers
  const handleAvatarSelect = (avatarId) => {
    const avatar = AVATARS.find((a) => a.id === avatarId);
    if (avatar?.locked) return;
    setSelectedAvatar(avatarId);
  };

  const handleSkipStep5 = () => {
    setCurrentStep(6);
  };

  const handleContinueStep5 = () => {
    setCurrentStep(6);
  };

  // Step 6 handlers
  const handleGoHome = () => {
    completeOnboarding();
    navigate("/");
  };

  const handleActivateNotifications = async () => {
    if ("Notification" in window) {
      await Notification.requestPermission();
    }
    completeOnboarding();
    navigate("/");
  };

  const completeOnboarding = () => {
    // Verificar se já existem dados no sistema para não sobrescrever
    const existingHabits = localStorage.getItem('nex_habits');
    const existingGoals = localStorage.getItem('nex_fin_goals');
    const existingAvatar = localStorage.getItem('nex_avatar');
    const existingUsername = localStorage.getItem('nex_username');
    
    // Integrar hábito inicial no sistema de hábitos (apenas se não existirem dados)
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

    // Integrar meta financeira inicial no sistema de finanças (apenas se não existirem dados)
    if (!existingGoals && selectedGoal) {
      const goalLabel = FINANCE_GOALS.find(g => g.id === selectedGoal)?.label || selectedGoal;
      
      // Mapear icones para o sistema de finanças
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

    // Salvar avatar no sistema principal (apenas se não existirem dados)
    if (!existingAvatar && selectedAvatar) {
      const avatarEmoji = AVATARS.find(a => a.id === selectedAvatar)?.emoji || '🌻';
      // Salvar apenas o emoji (string) para compatibilidade com o sistema existente
      localStorage.setItem("nex_avatar", avatarEmoji);
      
      // Salvar também os metadados do avatar em uma chave separada para uso futuro
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

    // Salvar nome do usuário no sistema principal (apenas se não existirem dados)
    if (!existingUsername && username) {
      localStorage.setItem("nex_username", username);
    }

    localStorage.setItem("ior_onboarding_done", "true");
    localStorage.removeItem("ior_onboarding_step");
    localStorage.removeItem("ior_first_habit");
    localStorage.removeItem("ior_first_goal");
    localStorage.removeItem("ior_onboarding_choices");
    localStorage.removeItem("ior_avatar");
    localStorage.removeItem("ior_username");
    // Track completion event if analytics available
  };

  // Render Step 1
  const renderStep1 = () => (
    <div className={`${styles.stepContent} ${styles.step1}`}>

      {/* Spacer empurra o bloco central para o meio */}
      <div className={styles.step1Spacer} />

      {/* Bloco central: logo + label + título */}
      <div className={styles.step1Center}>
        {/* Logo + countdown lado a lado, colados acima do título */}
        <div className={styles.step1Meta}>
          <span className={styles.stepLabel}>01 / 06 • INÍCIO</span>
          <div className={styles.logoWrap}>
            <img src="/icons/logo.png" alt="Rootio" className={styles.logoImg} />
          </div>
        </div>

        <div className={styles.titleSection}>
          <h2 className={styles.mainTitle}>
            OI!<br />
            BEM-VINDZ<br />
            AO ROOTIO.
          </h2>
          <p className={styles.subtitle}>
            Hábitos, finanças e carreira num lugar só. Honesto, aberto, gamificado.
          </p>
        </div>
      </div>

      {/* Spacer empurra os controles para baixo */}
      <div className={styles.step1Spacer} />

      {/* Progress bar + botões colados na base */}
      <div className={styles.step1Bottom}>
        <div className={styles.nbProg}>
          <i style={{ width: "16.66%" }}></i>
        </div>
        <div className={styles.bottomActions}>
          <button className={styles.btnPrimary} onClick={handleStart}>
            <span>COMEÇAR</span>
            <PiArrowRightBold size={18} />
          </button>
          <button className={styles.btnTertiary} onClick={handleAlreadyHaveAccount}>
            <span>JÁ TENHO CONTA</span>
            <PiArrowRightBold size={18} />
          </button>
        </div>
      </div>

    </div>
  );

  // Render Step 2
  const renderStep2 = () => (
    <div className={styles.stepContent}>
      <div className={styles.header}>
        <span className={styles.stepLabel}>02 / 06 • OBJETIVOS</span>
        <button className={styles.skipBtn} onClick={handleSkipStep2}>
          PULAR
        </button>
      </div>

      <div className={styles.stepCenter}>
        {/* Progress bar - striped amber */}
        <div className={styles.nbProg}>
          <i style={{ width: "33%" }}></i>
        </div>

        <div className={styles.titleSection}>
          <h2 className={styles.mainTitle}>O QUE VOCÊ QUER PLANTAR AQUI?</h2>
          <p className={styles.subtitle}>Pode escolher mais de 1. Dá pra mudar depois.</p>
        </div>

        <div className={`${styles.cardsGrid} ${styles.cols2}`}>
          {GOALS.map((goal) => (
            <button
              key={goal.id}
              className={`${styles.card} ${selectedGoals.includes(goal.id) ? styles.selected : ""}`}
              onClick={() => handleGoalToggle(goal.id)}
            >
              <span className={styles.cardIcon}>{goal.icon}</span>
              <span className={styles.cardText}>{goal.label}</span>
              <div className={styles.checkboxWrap}>
                <div className={`${styles.checkbox} ${selectedGoals.includes(goal.id) ? styles.checked : ""}`}>
                  {selectedGoals.includes(goal.id) && <PiCheckBold size={16} />}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.stepBottom}>
        <div className={styles.bottomActions}>
          <button
            className={styles.btnPrimary}
            onClick={handleContinueStep2}
            disabled={selectedGoals.length === 0}
          >
            CONTINUAR • {selectedGoals.length} ESCOLHIDOS
            <PiArrowRightBold size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  // Render Step 3
  const renderStep3 = () => {
    const selectedHabit = HABITS.find((h) => h.label === firstHabit.name);

    return (
      <div className={styles.stepContent}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={handleBackStep3}>
            <PiArrowLeftBold size={18} />
            <span>VOLTAR</span>
          </button>
          <span className={styles.stepLabel}>03 / 06 • HÁBITO</span>
        </div>

        <div className={styles.stepCenter}>
          {/* Progress bar - striped amber */}
          <div className={styles.nbProg}>
            <i style={{ width: "50%" }}></i>
          </div>

          <div className={styles.titleSection}>
            <h2 className={styles.mainTitle}>ESCOLHA UM HÁBITO PRA COMEÇAR.</h2>
            <p className={styles.subtitle}>A raiz nasce pequena. Um só • o resto vem.</p>
          </div>

          <div className={`${styles.cardsGrid} ${styles.cols2}`}>
            {HABITS.map((habit) => (
              <button
                key={habit.id}
                className={`${styles.card} ${firstHabit.name === habit.label ? styles.selected : ""}`}
                onClick={() => handleHabitSelect(habit.id)}
              >
                <span className={styles.cardIcon}>{habit.icon}</span>
                <span className={styles.cardText}>{habit.label}</span>
              </button>
            ))}
          </div>

          {firstHabit.name && (
            <div className={styles.habitForm}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>NOME</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={firstHabit.name}
                  onChange={(e) => setFirstHabit((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Meditar 10min"
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>FREQUÊNCIA</label>
                <div className={styles.weekSelector}>
                  {WEEK_DAYS.map((day) => (
                    <button
                      key={day.id}
                      className={`${styles.weekDay} ${firstHabit.days.includes(day.id) ? styles.selected : ""}`}
                      onClick={() => handleDayToggle(day.id)}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>LEMBRAR ÀS</label>
                <input
                  type="time"
                  className={styles.formInput}
                  value={firstHabit.time}
                  onChange={handleTimeChange}
                />
              </div>
            </div>
          )}
        </div>

        <div className={styles.stepBottom}>
          <div className={styles.bottomActions}>
            <button className={styles.btnPrimary} onClick={handlePlantHabit}>
              PLANTAR HÁBITO
              <PiArrowRightBold size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render Step 4
  const renderStep4 = () => (
    <div className={styles.stepContent}>
      <div className={styles.header}>
        <button className={styles.skipBtn} onClick={handleSkipStep4}>
          PULAR
        </button>
        <span className={styles.stepLabel}>04 / 06 • META $</span>
      </div>

      <div className={styles.stepCenter}>
        {/* Progress bar - striped amber */}
        <div className={styles.nbProg}>
          <i style={{ width: "66%" }}></i>
        </div>

        <div className={styles.titleSection}>
          <h2 className={styles.mainTitle}>E UMA META DE DINHEIRO?</h2>
          <p className={styles.subtitle}>Começa pequeno. Um número concreto vale mais que ouro.</p>
        </div>

        <div className={styles.cardsGrid}>
          {FINANCE_GOALS.map((goal) => (
            <button
              key={goal.id}
              className={`${styles.card} ${selectedGoal === goal.id ? styles.selected : ""}`}
              onClick={() => handleGoalSelect(goal.id)}
            >
              <span className={styles.cardIcon}>{goal.icon}</span>
              <span className={styles.cardText}>{goal.label}</span>
              <span className={styles.cardArrow}>→</span>
            </button>
          ))}
        </div>

        <div className={`${styles.card} ${styles.financeMetaCard}`}>
          <div style={{ flex: 1 }}>
            <div className={styles.cardText}>VALOR DA META</div>
            <input
              type="number"
              className={styles.goalInput}
              value={goalAmount}
              onChange={(e) => setGoalAmount(Number(e.target.value))}
              placeholder="3000"
              min="100"
              step="100"
            />
            <div className={styles.cardSubtitle}>EM {goalMonths} MESES</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className={styles.cardText}>R$ {Math.round(goalAmount / goalMonths)}/MÊS</div>
          </div>
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel}>TEMPO</label>
          <div className={styles.monthSelector}>
            {[3, 6, 12, 24].map((months) => (
              <button
                key={months}
                className={`${styles.monthOption} ${goalMonths === months ? styles.selected : ""}`}
                onClick={() => setGoalMonths(months)}
              >
                {months} MESES
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.stepBottom}>
        <div className={styles.bottomActions}>
          <button className={styles.btnPrimary} onClick={handleDefineGoal}>
            DEFINIR META
            <PiArrowRightBold size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  // Render Step 5
  const renderStep5 = () => (
      <div className={styles.stepContent}>
        <div className={styles.header}>
          <button className={styles.skipBtn} onClick={handleSkipStep5}>
            PULAR
          </button>
          <span className={styles.stepLabel}>05 / 06 • SEU AVATAR</span>
        </div>

        <div className={styles.stepCenter}>
          {/* Progress bar - striped amber */}
          <div className={styles.nbProg}>
            <i style={{ width: "83%" }}></i>
          </div>

          <div className={styles.titleSection}>
            <h2 className={styles.mainTitle}>ESCOLHE SUA CARA</h2>
            <p className={styles.subtitle}>Todos começam com um Girassol. Outros desbloqueiam com IO.</p>
          </div>

          <div className={styles.avatarGrid}>
            {AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                className={`${styles.avatarCard} ${
                  selectedAvatar === avatar.id ? styles.selected : ""
                } ${avatar.locked ? styles.locked : ""} ${
                  avatar.isAdd ? styles.isAdd : ""
                }`}
                onClick={() => handleAvatarSelect(avatar.id)}
                disabled={avatar.locked || avatar.disabled}
                style={selectedAvatar === avatar.id ? { backgroundColor: AVATAR_COLORS.find(c => c.id === avatarColor)?.color || '#FFD23F' } : {}}
              >
                {avatar.isAdd ? (
                  <span className={styles.avatarAdd}>+</span>
                ) : (
                  <>
                    <span className={styles.avatarEmoji}>{avatar.emoji}</span>
                    <span className={styles.avatarLabel}>{avatar.label}</span>
                  </>
                )}
                {avatar.locked && (
                  <div className={styles.avatarCost}>
                    <PiLockBold size={12} /> {avatar.cost} IO
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel}>COR DO FUNDO</label>
            <div className={styles.colorSelector}>
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color.id}
                  className={`${styles.colorOption} ${avatarColor === color.id ? styles.selected : ""}`}
                  onClick={() => setAvatarColor(color.id)}
                  style={{ backgroundColor: color.color }}
                  aria-label={color.label}
                />
              ))}
            </div>
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel}>COMO TE CHAMO?</label>
            <input
              type="text"
              className={styles.nameInput}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu nome"
              maxLength={20}
            />
          </div>
        </div>

        <div className={styles.stepBottom}>
          <div className={styles.bottomActions}>
            <button
              className={styles.btnPrimary}
              onClick={handleContinueStep5}
              disabled={!username.trim()}
            >
              É ESSE AÍ
              <PiArrowRightBold size={18} />
            </button>
          </div>
        </div>
      </div>
  );

  // Render Step 6
  const renderStep6 = () => {
    const habitData = HABITS.find((h) => h.label === firstHabit.name);
    const goalData = FINANCE_GOALS.find((g) => g.id === selectedGoal);
    const avatarData = AVATARS.find((a) => a.id === selectedAvatar);

    return (
      <div className={`${styles.stepContent} ${styles.step6}`}>
        <div className={styles.header}>
          <span className={styles.stepLabel}>06 / 06 • PRONTO</span>
        </div>

        <div className={styles.stepCenter}>
          <div className={styles.titleSection}>
            <span className={styles.badge}>+10 IO • BEM VINDZ!</span>
            <h2 className={styles.mainTitle}>PRONTO, {username || "AMIGX"}.</h2>
            <p className={styles.message}>
              Sua raiz tá plantada. A gente te encontra às {firstHabit.time || "07:00"} pra meditar.
            </p>
          </div>

          {editingHabit ? (
            <div className={styles.habitForm}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>NOME</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={firstHabit.name}
                  onChange={(e) => setFirstHabit((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Meditar 10min"
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>FREQUÊNCIA</label>
                <div className={styles.weekSelector}>
                  {WEEK_DAYS.map((day) => (
                    <button
                      key={day.id}
                      className={`${styles.weekDay} ${firstHabit.days.includes(day.id) ? styles.selected : ""}`}
                      onClick={() => handleDayToggle(day.id)}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>LEMBRAR ÀS</label>
                <input
                  type="time"
                  className={styles.formInput}
                  value={firstHabit.time}
                  onChange={handleTimeChange}
                />
              </div>

              <button className={styles.btnSecondary} onClick={() => setEditingHabit(false)}>
                <PiCheckBold size={18} />
                SALVAR
              </button>
            </div>
          ) : (
            <div className={styles.summaryCard}>
              <span className={styles.summaryIcon}>{habitData?.icon || "🧘"}</span>
              <div className={styles.summaryContent}>
                <span className={styles.summaryText}>{firstHabit.name || "Meditar 10min"}</span>
                <span className={styles.summarySubtitle}>
                  {firstHabit.days.length > 0
                    ? `${firstHabit.days.length}×/sem`
                    : "SEG-SEX"}
                </span>
              </div>
              <button className={styles.editBtn} onClick={() => setEditingHabit(true)}>
                EDITAR
              </button>
            </div>
          )}

        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}>{goalData?.icon || "💰"}</span>
          <div className={styles.summaryContent}>
            <span className={styles.summaryText}>Meta R$ {goalAmount.toLocaleString()}</span>
            <span className={styles.summarySubtitle}>{goalMonths} MESES</span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}>{avatarData?.emoji || "🌻"}</span>
          <div className={styles.summaryContent}>
            <span className={styles.summaryText}>{avatarData?.label || "Girassol"}</span>
            <span className={styles.summarySubtitle}>NV 1</span>
          </div>
        </div>
        </div>

        <div className={styles.stepBottom}>
          <div className={`${styles.bottomActions} ${styles.centered}`}>
            <button className={styles.btnPrimary} onClick={handleGoHome}>
              IR PRO HOJE
              <PiArrowRightBold size={18} />
            </button>
            <button className={styles.btnSecondary} onClick={handleActivateNotifications}>
              <PiBellBold size={18} />
              ATIVAR NOTIFICAÇÕES
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.page} ${currentStep === 1 ? styles.step1Page : currentStep === 6 ? styles.step6Page : styles.whitePage}`}>
      <div className={styles.container}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
        {currentStep === 6 && renderStep6()}
      </div>
    </div>
  );
}
