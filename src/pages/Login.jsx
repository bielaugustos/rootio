import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PiFingerprintBold,
  PiEnvelopeBold,
  PiArrowRightBold,
  PiEyeBold,
  PiEyeSlashBold,
  PiArrowLeftBold,
  PiLockKeyBold,
  PiFingerprint,
  } from "react-icons/pi";
import { signIn, signUp, resetPassword } from "../services/supabase";

import styles from "./Login.module.css";

export default function Login({ onSkip }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState("");

  async function handleFaceId() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    // Simulate login success for demo; in real app this would call signIn with biometrics
    
    // Verificar se usuário já tem dados no app (hábitos ou metas financeiras)
    const hasExistingData = 
      localStorage.getItem('nex_habits') || 
      localStorage.getItem('nex_fin_goals');
    
    // Se já tem dados, marca onboarding como feito para não perder dados existentes
    if (hasExistingData && !localStorage.getItem('ior_onboarding_done')) {
      localStorage.setItem('ior_onboarding_done', 'true');
    }
    
    const onboardingDone = localStorage.getItem('ior_onboarding_done');
    if (!onboardingDone) {
      navigate('/onboarding');
    } else {
      navigate('/');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Preencha e-mail e senha.");
      return;
    }

    setLoading(true);
    try {
      const { error: err } = await signIn({ email, password });
      if (err) {
        const msg = err.message ?? "";
        if (msg.includes("Email not confirmed"))
          setError("Confirme seu e-mail antes de entrar.");
        else if (msg.includes("Invalid login credentials"))
          setError("E-mail ou senha incorretos.");
        else setError(msg);
        return;
      }
      // Login successful - verificar se usuário já tem dados antes de redirecionar
      const hasExistingData = 
        localStorage.getItem('nex_habits') || 
        localStorage.getItem('nex_fin_goals');
      
      // Se já tem dados, marca onboarding como feito para não perder dados existentes
      if (hasExistingData && !localStorage.getItem('ior_onboarding_done')) {
        localStorage.setItem('ior_onboarding_done', 'true');
      }
      
      const onboardingDone = localStorage.getItem('ior_onboarding_done');
      if (!onboardingDone) {
        navigate('/onboarding');
      } else {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Digite seu e-mail para recuperar a senha.");
      return;
    }

    setLoading(true);
    try {
      const { error: err } = await resetPassword(email);
      if (err) {
        const msg = err.message ?? "";
        if (msg.toLowerCase().includes("user not found") || msg.toLowerCase().includes("email not registered"))
          setError("E-mail não encontrado. Verifique se digitou corretamente ou crie uma conta.");
        else if (msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("too many requests"))
          setError("Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.");
        else setError(msg);
        return;
      }
      setSuccess("E-mail de recuperação enviado! Verifique sua caixa de entrada e spam.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      {mode === "welcome" ? (
        <div className={styles.container}>
          <div className={styles.logoSection}>
            <div className={styles.logoWrap}>
              <img src="/icons/logo.png" alt="Rootio" className={styles.logoImg} />
            </div>
            <h1 className={styles.brandName}>ROOTIO</h1>
            <p className={styles.tagline}>HÁBITOS • FINANÇAS E CARREIRA</p>
          </div>

          <div className={styles.buttonsSection}>
            <button 
              type="button" 
              className={styles.btnPrimary}
              onClick={handleFaceId}
              disabled={loading}
            >
              <div className={styles.btnRow} >
                <span>ENTRAR COM TAP</span>
              </div>
            </button>

            <button 
              type="button" 
              className={styles.btnSecondary}
              onClick={() => setMode("email")}
              disabled={loading}
            >
              <div className={styles.btnRow}>
                <span>ENTRAR COM EMAIL</span>
              </div>
            </button>

            <button 
              type="button" 
              className={styles.btnTertiary}
              onClick={onSkip}
              disabled={loading}
            >
              <span>CONTINUAR SEM LOGIN</span>
              <PiArrowRightBold size={18} />
            </button>

            <span className={styles.badge}>+10 IO NO 1º LOGIN</span>
          </div>

          <div className={styles.privacyAlert}>
            <PiFingerprint size={20} />
            <p>
              Ao continuar, você concorda com nossa{" "}
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => {
                  setDrawerContent("privacidade");
                  setDrawerOpen(true);
                }}
              >
                <strong>Política de Privacidade</strong>
              </button>
              ,{" "}
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => {
                  setDrawerContent("termos");
                  setDrawerOpen(true);
                }}
              >
                <strong>Termos de Uso</strong>
              </button>{" "}
              e{" "}
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => {
                  setDrawerContent("lgpd");
                  setDrawerOpen(true);
                }}
              >
                <strong>LGPD</strong>
              </button>
              . Dados protegidos pela LGPD.
            </p>
          </div>
        </div>
      ) : mode === "forgot" ? (
        <div className={styles.container}>
          <button 
            type="button" 
            className={styles.backBtn}
            onClick={() => setMode("email")}
          >
            <PiArrowLeftBold size={18} />
            <span>VOLTAR</span>
          </button>

          <div className={styles.logoSection}>
            <div className={styles.logoWrap}>
              <img src="/icons/logo.png" alt="Rootio" className={styles.logoImgSmall} />
            </div>
            <h1 className={styles.brandName}>ROOTIO</h1>
          </div>

          <form className={styles.form} onSubmit={handleForgot}>
            <div className={styles.field}>
              <label className={styles.label}>E-MAIL</label>
              <input
                className={styles.input}
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "ENVIANDO..." : "RECUPERAR SENHA"}
            </button>
          </form>

          <div className={styles.privacyAlert}>
            <PiFingerprint size={16} />
            <p>
              Ao continuar, você concorda com nossa{" "}
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => {
                  setDrawerContent("privacidade");
                  setDrawerOpen(true);
                }}
              >
                <strong>Política de Privacidade</strong>
              </button>
              . Dados protegidos pela LGPD.
            </p>
          </div>
        </div>
      ) : (
        <div className={styles.container}>
          <button 
            type="button" 
            className={styles.backBtn}
            onClick={() => setMode("welcome")}
          >
            <PiArrowLeftBold size={18} />
            <span>VOLTAR</span>
          </button>

          <div className={styles.logoSection}>
            <div className={styles.logoWrap}>
              <img src="/icons/logo.png" alt="Rootio" className={styles.logoImgSmall} />
            </div>
            <h1 className={styles.brandName}>ROOTIO</h1>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>E-MAIL</label>
              <input
                className={styles.input}
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.label}>SENHA</label>
                <button type="button" className={styles.forgotBtn} onClick={() => setMode("forgot")}>
                  ESQUECI A SENHA
                </button>
              </div>
              <div className={styles.passwordWrap}>
                <input
                  className={styles.input}
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPass ? <PiEyeSlashBold size={16} /> : <PiEyeBold size={16} />}
                </button>
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "AGUARDE..." : "ENTRAR"}
            </button>
          </form>

          <div className={styles.privacyAlert}>
            <PiFingerprint size={20} />
            <p>
              Ao continuar, você concorda com nossa{" "}
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => {
                  setDrawerContent("privacidade");
                  setDrawerOpen(true);
                }}
              >
                <strong>Política de Privacidade</strong>
              </button>
              ,{" "}
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => {
                  setDrawerContent("termos");
                  setDrawerOpen(true);
                }}
              >
                <strong>Termos de Uso</strong>
              </button>{" "}
              e{" "}
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => {
                  setDrawerContent("lgpd");
                  setDrawerOpen(true);
                }}
              >
                <strong>LGPD</strong>
              </button>
              . Dados protegidos pela LGPD.
            </p>
          </div>
        </div>
      )}

      {drawerOpen && (
        <div className={styles.drawerOverlay} onClick={() => setDrawerOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3>
                {drawerContent === "privacidade" && "Política de Privacidade"}
                {drawerContent === "termos" && "Termos de Uso"}
                {drawerContent === "lgpd" && "LGPD"}
              </h3>
              <button type="button" className={styles.drawerClose} onClick={() => setDrawerOpen(false)}>×</button>
            </div>
            <div className={styles.drawerContent}>
              {drawerContent === "privacidade" && (
                <p>
                  1. Dados coletados: Nós coletamos apenas e-mail, nome e dados de uso do aplicativo necessários para o funcionamento da plataforma Rootio. 2. Uso dos dados: Seus dados são usados exclusivamente para personalizar sua experiência, enviar notificações de progresso e melhorar o produto. 3. Compartilhamento: Não vendemos, alugamos ou compartilhamos seus dados com terceiros para fins comerciais. 4. Armazenamento de Dados: Dados são armazenados com criptografia via Supabase em servidores seguros. Retenção máxima de 2 anos após inatividade. 5. Seus direitos: Você pode solicitar exclusão, exportação ou correção dos seus dados a qualquer momento excluindo seus dados no aplicativo.
                </p>
              )}
              {drawerContent === "termos" && (
                <p>
                  1. Ao aceitar usar o Rootio, você concorda com estes termos. Caso não concorde, não utilize o serviço. 2. Uso permitido O Rootio é uma ferramenta de desenvolvimento pessoal. É proibido usar a plataforma para fins ilícitos ou prejudiciais a terceiros. 3. Conta Você é responsável pela segurança da sua conta e por todas as atividades realizadas nela. 4. O plano gratuito permite até 10 hábitos ativos. Recursos adicionais estão disponíveis no plano Pro. 5. Podemos alterar estes termos com aviso prévio.
                </p>
              )}
              {drawerContent === "lgpd" && (
                <p>
                  Lei 13.709/2018 O Rootio opera em conformidade com a Lei Geral de Proteção de Dados do Brasil (LGPD). Base legal O tratamento dos seus dados tem como base legal o legítimo interesse e o consentimento explícito obtido no momento do cadastro. A Ioverso (Startup) possui CNPJ em processo de atualização. Responsável pelo tratamento dos dados pessoais dos usuários. DPO Encarregado de dados: Gabriel Augusto - gscontatoec@gmail.com Seus direitos (Art. 18) Acesso · Correção · Anonimização · Portabilidade · Eliminação · Revogação do consentimento.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}