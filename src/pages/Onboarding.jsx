import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  { id: "rose", emoji: "🌹", label: "Rosa", locked: true, cost: 100 },
  { id: "tree", emoji: "🌳", label: "Árvore", locked: true, cost: 100 },
  { id: "moon", emoji: "🌙", label: "Lua", locked: true, cost: 100 },
  { id: "star", emoji: "⭐", label: "Estrela", locked: true, cost: 100 },
  { id: "mountain", emoji: "⛰️", label: "Montanha", locked: true, cost: 100 },
  { id: "ocean", emoji: "🌊", label: "Oceano", locked: true, cost: 100 },
  { id: "fire", emoji: "🔥", label: "Fogo", locked: true, cost: 100 },
  { id: "add", emoji: "+", label: "+", locked: false, isAdd: true },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [firstHabit, setFirstHabit] = useState({
    name: "",
    days: [],
    time: "07:00",
  });
  const [selectedGoal, setSelectedGoal] = useState("emergency");
  const [selectedAvatar, setSelectedAvatar] = useState("sunflower");
  const [username, setUsername] = useState("");

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
    localStorage.setItem("ior_onboarding_done", "true");
    localStorage.removeItem("ior_onboarding_step");
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
          <button className={styles.btnSecondary} onClick={handleAlreadyHaveAccount}>
            <span>JÁ TENHO CONTA</span>
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

        {selectedHabit && (
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

        <div className={styles.bottomActions}>
          <button className={styles.btnPrimary} onClick={handlePlantHabit}>
            PLANTAR HÁBITO
            <PiArrowRightBold size={18} />
          </button>
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

      <div className={styles.card} style={{ marginTop: "8px" }}>
        <div style={{ flex: 1 }}>
          <div className={styles.cardText}>VALOR DA META</div>
          <div className={styles.mainTitle} style={{ fontSize: "32px", marginTop: "4px" }}>
            R$3.000
          </div>
          <div className={styles.cardSubtitle}>EM 6 MESES</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className={styles.cardText}>R$ 500/MÊS</div>
        </div>
      </div>

      <div className={styles.bottomActions}>
        <button className={styles.btnPrimary} onClick={handleDefineGoal}>
          DEFINIR META
          <PiArrowRightBold size={18} />
        </button>
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
            disabled={avatar.locked}
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

      <div className={styles.formField} style={{ marginTop: "16px" }}>
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
  );

  // Render Step 6
  const renderStep6 = () => {
    const habitData = HABITS.find((h) => h.label === firstHabit.name);
    const goalData = FINANCE_GOALS.find((g) => g.id === selectedGoal);
    const avatarData = AVATARS.find((a) => a.id === selectedAvatar);

    return (
      <div className={styles.stepContent}>
        <div className={styles.header}>
          <span className={styles.stepLabel}>06 / 06 • PRONTO</span>
        </div>

        <div className={styles.titleSection}>
          <span className={styles.badge}>+10 IO • BEM VINDZ!</span>
          <h2 className={styles.mainTitle}>PRONTO, {username || "AMIGX"}.</h2>
          <p className={styles.message}>
            Sua raiz tá plantada. A gente te encontra às {firstHabit.time || "07:00"} pra meditar.
          </p>
        </div>

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
        </div>

        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}>{goalData?.icon || "💰"}</span>
          <div className={styles.summaryContent}>
            <span className={styles.summaryText}>Meta R$ 3.000</span>
            <span className={styles.summarySubtitle}>6 MESES</span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}>{avatarData?.emoji || "🌻"}</span>
          <div className={styles.summaryContent}>
            <span className={styles.summaryText}>Avatar {avatarData?.label || "Girassol"}</span>
            <span className={styles.summarySubtitle}>NV 1</span>
          </div>
        </div>

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
    );
  };

  return (
    <div className={styles.page}>
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