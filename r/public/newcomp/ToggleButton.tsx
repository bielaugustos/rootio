"use client";

import {
  useState, useId, createContext, useContext,
  type ReactNode, type MouseEvent,
} from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Color = "standard" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
type Size = "small" | "medium" | "large";
type Orientation = "horizontal" | "vertical";

export interface ToggleButtonProps {
  value: string;
  children?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  color?: Color;
  size?: Size;
  fullWidth?: boolean;
  "aria-label"?: string;
  onChange?: (e: MouseEvent<HTMLButtonElement>, value: string) => void;
  onClick?: (e: MouseEvent<HTMLButtonElement>, value: string) => void;
}

export interface ToggleButtonGroupProps {
  children?: ReactNode;
  value?: string | string[] | null;
  exclusive?: boolean;
  onChange?: (e: MouseEvent<HTMLButtonElement>, value: string | string[] | null) => void;
  color?: Color;
  size?: Size;
  orientation?: Orientation;
  fullWidth?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context (group passes state down to each button)
// ─────────────────────────────────────────────────────────────────────────────

interface GroupCtx {
  groupValue: string | string[] | null;
  exclusive: boolean;
  color: Color;
  size: Size;
  disabled: boolean;
  fullWidth: boolean;
  orientation: Orientation;
  onButtonClick: (e: MouseEvent<HTMLButtonElement>, val: string) => void;
}

const GroupContext = createContext<GroupCtx | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Color tokens
// ─────────────────────────────────────────────────────────────────────────────

const COLOR_TOKENS: Record<Color, { active: string; activeFg: string; hover: string }> = {
  standard: { active: "rgba(0,0,0,0.08)", activeFg: "var(--tb-text)", hover: "rgba(0,0,0,0.04)" },
  primary:  { active: "#F59E0B", activeFg: "#fff", hover: "rgba(245,158,11,0.08)" },
  secondary:{ active: "#7F77DD", activeFg: "#fff", hover: "rgba(127,119,221,0.08)" },
  error:    { active: "#E24B4A", activeFg: "#fff", hover: "rgba(226,75,74,0.08)" },
  info:     { active: "#378ADD", activeFg: "#fff", hover: "rgba(55,138,221,0.08)" },
  success:  { active: "#3B6D11", activeFg: "#fff", hover: "rgba(59,109,17,0.08)" },
  warning:  { active: "#EF9F27", activeFg: "#fff", hover: "rgba(239,159,39,0.08)" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Size tokens
// ─────────────────────────────────────────────────────────────────────────────

const SIZE_TOKENS: Record<Size, { padding: string; fontSize: number; minW: number; minH: number }> = {
  small:  { padding: "5px 11px",  fontSize: 13, minW: 32, minH: 32 },
  medium: { padding: "8px 15px",  fontSize: 14, minW: 40, minH: 40 },
  large:  { padding: "11px 21px", fontSize: 15, minW: 48, minH: 48 },
};

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────

const CSS = `
  .tb-root {
    --tb-bg: #fff;
    --tb-border: rgba(0,0,0,0.12);
    --tb-text: #1a1a1a;
    --tb-muted: rgba(0,0,0,0.38);
    font-family: 'DM Sans','Helvetica Neue',sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    .tb-root {
      --tb-bg: #1c1c1e; --tb-border: rgba(255,255,255,0.12);
      --tb-text: #f0f0f0; --tb-muted: rgba(255,255,255,0.3);
    }
  }
  .tb-group {
    display: inline-flex;
    border-radius: 6px;
    border: 1px solid var(--tb-border);
    background: var(--tb-bg);
    overflow: hidden;
  }
  .tb-group.vertical { flex-direction: column; }
  .tb-group.fullwidth { width: 100%; }

  .tb-btn {
    border: none; background: transparent;
    color: var(--tb-text); cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    font-family: inherit; font-weight: 500; letter-spacing: 0.02em;
    transition: background 0.15s, color 0.15s;
    position: relative;
    flex-shrink: 0;
  }
  .tb-btn:not(:first-child) { border-left: 1px solid var(--tb-border); }
  .tb-group.vertical .tb-btn:not(:first-child) { border-left: none; border-top: 1px solid var(--tb-border); }
  .tb-btn.fullwidth { flex: 1; width: 100%; }
  .tb-btn:focus-visible { outline: 2px solid var(--tb-focus, #F59E0B); outline-offset: -2px; }

  .tb-standalone {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    border: 1px solid var(--tb-border); border-radius: 6px;
    background: var(--tb-bg); color: var(--tb-text);
    font-family: inherit; font-weight: 500; cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .tb-standalone:focus-visible { outline: 2px solid #F59E0B; outline-offset: 2px; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// ToggleButton (standalone or inside group)
// ─────────────────────────────────────────────────────────────────────────────

export function ToggleButton({
  value,
  children,
  selected: selectedProp,
  disabled: disabledProp = false,
  color: colorProp = "standard",
  size: sizeProp = "medium",
  fullWidth: fullWidthProp = false,
  "aria-label": ariaLabel,
  onChange,
  onClick,
}: ToggleButtonProps) {
  const ctx = useContext(GroupContext);

  // Resolve from context or direct props
  const isSelected = ctx
    ? Array.isArray(ctx.groupValue)
      ? ctx.groupValue.includes(value)
      : ctx.groupValue === value
    : (selectedProp ?? false);

  const color = ctx?.color ?? colorProp;
  const size = ctx?.size ?? sizeProp;
  const disabled = (ctx?.disabled ?? false) || disabledProp;
  const fullWidth = ctx?.fullWidth ?? fullWidthProp;
  const isStandalone = !ctx;

  const tok = COLOR_TOKENS[color];
  const sz = SIZE_TOKENS[size];

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (disabled) return;
    onClick?.(e, value);
    if (ctx) {
      ctx.onButtonClick(e, value);
    } else {
      onChange?.(e, value);
    }
  }

  const style: React.CSSProperties = {
    padding: sz.padding,
    fontSize: sz.fontSize,
    minWidth: sz.minW,
    minHeight: sz.minH,
    background: isSelected ? tok.active : "transparent",
    color: isSelected ? tok.activeFg : disabled ? "var(--tb-muted)" : "var(--tb-text)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
  };

  return (
    <button
      type="button"
      role="button"
      aria-pressed={isSelected}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`${isStandalone ? "tb-standalone" : "tb-btn"}${fullWidth ? " fullwidth" : ""}`}
      style={style}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (!isSelected && !disabled)
          (e.currentTarget as HTMLButtonElement).style.background = tok.hover;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = isSelected ? tok.active : "transparent";
      }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ToggleButtonGroup
// ─────────────────────────────────────────────────────────────────────────────

export function ToggleButtonGroup({
  children,
  value = null,
  exclusive = false,
  onChange,
  color = "standard",
  size = "medium",
  orientation = "horizontal",
  fullWidth = false,
  disabled = false,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: ToggleButtonGroupProps) {
  function onButtonClick(e: MouseEvent<HTMLButtonElement>, val: string) {
    if (exclusive) {
      const next = value === val ? null : val;
      onChange?.(e, next);
    } else {
      const arr = Array.isArray(value) ? [...value] : [];
      const idx = arr.indexOf(val);
      if (idx >= 0) arr.splice(idx, 1); else arr.push(val);
      onChange?.(e, arr);
    }
  }

  return (
    <GroupContext.Provider value={{ groupValue: value, exclusive, color, size, disabled, fullWidth, orientation, onButtonClick }}>
      <div
        role="group"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={`tb-group${orientation === "vertical" ? " vertical" : ""}${fullWidth ? " fullwidth" : ""}`}
      >
        {children}
      </div>
    </GroupContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Icon helpers (inline SVG — no deps)
// ─────────────────────────────────────────────────────────────────────────────

const I = ({ d, size = 20 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d={d} />
  </svg>
);

const icons = {
  alignLeft:     "M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z",
  alignCenter:   "M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z",
  alignRight:    "M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z",
  alignJustify:  "M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z",
  bold:          "M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z",
  italic:        "M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z",
  underline:     "M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z",
  list:          "M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z",
  module:        "M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z",
  quilt:         "M10 18h5v-6h-5v6zm-6 0h5V5H4v13zm12 0h5v-6h-5v6zM10 5v6h11V5H10z",
  laptop:        "M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z",
  tv:            "M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z",
  phone:         "M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5S10.67 19 11.5 19s1.5.67 1.5 1.5S12.33 22 11.5 22zm4.5-4H7V4h9v14z",
  check:         "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  colorFill:     "M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z",
};

// ─────────────────────────────────────────────────────────────────────────────
// Demo
// ─────────────────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#999", textTransform: "uppercase", marginBottom: 12 }}>
        {title}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

export default function ToggleButtonDemo() {
  const [alignment, setAlignment] = useState<string | null>("left");
  const [formats, setFormats] = useState<string[]>(["bold", "italic"]);
  const [view, setView] = useState("list");
  const [devices, setDevices] = useState<string[]>(["phone"]);
  const [alignEnforce, setAlignEnforce] = useState("left");
  const [standalone, setStandalone] = useState(false);
  const [color, setColor] = useState("web");

  return (
    <div className="tb-root" style={{ minHeight: "100vh", background: "#F5F3EE", padding: "40px 24px", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{CSS}</style>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <h1 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", color: "#999", textTransform: "uppercase", marginBottom: 36 }}>
          ToggleButton · variantes
        </h1>

        {/* Exclusive */}
        <Section title="Exclusive selection">
          <ToggleButtonGroup value={alignment} exclusive onChange={(_, v) => setAlignment(v)} aria-label="alinhamento de texto">
            <ToggleButton value="left" aria-label="esquerda"><I d={icons.alignLeft} /></ToggleButton>
            <ToggleButton value="center" aria-label="centro"><I d={icons.alignCenter} /></ToggleButton>
            <ToggleButton value="right" aria-label="direita"><I d={icons.alignRight} /></ToggleButton>
            <ToggleButton value="justify" aria-label="justificado" disabled><I d={icons.alignJustify} /></ToggleButton>
          </ToggleButtonGroup>
        </Section>

        {/* Multiple */}
        <Section title="Multiple selection">
          <ToggleButtonGroup value={formats} onChange={(_, v) => setFormats(v as string[])} aria-label="formatação de texto">
            <ToggleButton value="bold" aria-label="negrito"><I d={icons.bold} /></ToggleButton>
            <ToggleButton value="italic" aria-label="itálico"><I d={icons.italic} /></ToggleButton>
            <ToggleButton value="underlined" aria-label="sublinhado"><I d={icons.underline} /></ToggleButton>
            <ToggleButton value="color" aria-label="cor" disabled>
              <I d={icons.colorFill} />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 10l5 5 5-5z"/></svg>
            </ToggleButton>
          </ToggleButtonGroup>
        </Section>

        {/* Sizes */}
        <Section title="Sizes">
          {(["small", "medium", "large"] as Size[]).map((sz) => (
            <ToggleButtonGroup key={sz} value={alignment} exclusive onChange={(_, v) => setAlignment(v)} size={sz} aria-label={sz}>
              <ToggleButton value="left"><I d={icons.alignLeft} size={sz === "small" ? 16 : sz === "large" ? 22 : 18} /></ToggleButton>
              <ToggleButton value="center"><I d={icons.alignCenter} size={sz === "small" ? 16 : sz === "large" ? 22 : 18} /></ToggleButton>
              <ToggleButton value="right"><I d={icons.alignRight} size={sz === "small" ? 16 : sz === "large" ? 22 : 18} /></ToggleButton>
            </ToggleButtonGroup>
          ))}
        </Section>

        {/* Colors */}
        <Section title="Colors">
          {(["standard","primary","secondary","error","info","success","warning"] as Color[]).map((c) => (
            <ToggleButtonGroup key={c} value={color} exclusive onChange={(_, v) => v && setColor(v)} color={c} aria-label={c}>
              <ToggleButton value="web">Web</ToggleButton>
              <ToggleButton value="android">Android</ToggleButton>
              <ToggleButton value="ios">iOS</ToggleButton>
            </ToggleButtonGroup>
          ))}
        </Section>

        {/* Vertical */}
        <Section title="Vertical orientation">
          <ToggleButtonGroup orientation="vertical" value={view} exclusive onChange={(_, v) => v && setView(v)} aria-label="visualização">
            <ToggleButton value="list" aria-label="lista"><I d={icons.list} /></ToggleButton>
            <ToggleButton value="module" aria-label="módulo"><I d={icons.module} /></ToggleButton>
            <ToggleButton value="quilt" aria-label="mosaico"><I d={icons.quilt} /></ToggleButton>
          </ToggleButtonGroup>
        </Section>

        {/* Enforce value set */}
        <Section title="Enforce value set (always one active)">
          <ToggleButtonGroup value={alignEnforce} exclusive
            onChange={(_, v) => { if (v !== null) setAlignEnforce(v); }}
            aria-label="alinhamento forçado">
            <ToggleButton value="left"><I d={icons.alignLeft} /></ToggleButton>
            <ToggleButton value="center"><I d={icons.alignCenter} /></ToggleButton>
            <ToggleButton value="right"><I d={icons.alignRight} /></ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup value={devices}
            onChange={(_, v) => { if ((v as string[]).length) setDevices(v as string[]); }}
            aria-label="dispositivos">
            <ToggleButton value="laptop" aria-label="laptop"><I d={icons.laptop} /></ToggleButton>
            <ToggleButton value="tv" aria-label="tv"><I d={icons.tv} /></ToggleButton>
            <ToggleButton value="phone" aria-label="celular"><I d={icons.phone} /></ToggleButton>
          </ToggleButtonGroup>
        </Section>

        {/* Standalone */}
        <Section title="Standalone toggle button">
          <ToggleButton
            value="check"
            selected={standalone}
            color="primary"
            onChange={() => setStandalone((p) => !p)}
            aria-label="confirmar"
          >
            <I d={icons.check} />
          </ToggleButton>
        </Section>

        {/* Full width */}
        <Section title="Full width">
          <div style={{ width: "100%", maxWidth: 400 }}>
            <ToggleButtonGroup value={alignment} exclusive onChange={(_, v) => setAlignment(v)} fullWidth color="primary" aria-label="alinhamento full width">
              <ToggleButton value="left">Esquerda</ToggleButton>
              <ToggleButton value="center">Centro</ToggleButton>
              <ToggleButton value="right">Direita</ToggleButton>
            </ToggleButtonGroup>
          </div>
        </Section>

        {/* Disabled group */}
        <Section title="Disabled group">
          <ToggleButtonGroup value="center" exclusive disabled aria-label="desabilitado">
            <ToggleButton value="left"><I d={icons.alignLeft} /></ToggleButton>
            <ToggleButton value="center"><I d={icons.alignCenter} /></ToggleButton>
            <ToggleButton value="right"><I d={icons.alignRight} /></ToggleButton>
          </ToggleButtonGroup>
        </Section>

        {/* Text labels */}
        <Section title="Text labels">
          <ToggleButtonGroup value={alignment} exclusive onChange={(_, v) => setAlignment(v)} color="primary" size="small" aria-label="plataforma">
            <ToggleButton value="left">Web</ToggleButton>
            <ToggleButton value="center">Android</ToggleButton>
            <ToggleButton value="right">iOS</ToggleButton>
          </ToggleButtonGroup>
        </Section>

      </div>
    </div>
  );
}