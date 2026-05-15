"use client";

import { type ReactNode, createContext, useContext } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type TimelinePosition = "left" | "right" | "alternate" | "alternate-reverse";
type ConnectorColor = "inherit" | "primary" | "secondary" | "error" | "info" | "success" | "warning" | string;

export interface TimelineProps {
  children?: ReactNode;
  position?: TimelinePosition;
  className?: string;
}

export interface TimelineItemProps {
  children?: ReactNode;
  /** Override position for this item */
  position?: "left" | "right";
  className?: string;
}

export interface TimelineSeparatorProps { children?: ReactNode; }
export interface TimelineConnectorProps { color?: ConnectorColor; style?: React.CSSProperties; }
export interface TimelineDotProps {
  children?: ReactNode;
  color?: ConnectorColor;
  variant?: "filled" | "outlined";
  style?: React.CSSProperties;
}
export interface TimelineContentProps {
  children?: ReactNode;
  className?: string;
}
export interface TimelineOppositeContentProps {
  children?: ReactNode;
  color?: string;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

interface TimelineCtx { position: TimelinePosition; itemIndex: number; }
const TimelineCtx = createContext<TimelineCtx>({ position: "right", itemIndex: 0 });

// ─────────────────────────────────────────────────────────────────────────────
// Color tokens
// ─────────────────────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, { bg: string; border: string }> = {
  inherit:   { bg: "var(--tl-text)",    border: "var(--tl-text)" },
  primary:   { bg: "#F59E0B",            border: "#F59E0B" },
  secondary: { bg: "#7F77DD",            border: "#7F77DD" },
  error:     { bg: "#E24B4A",            border: "#E24B4A" },
  info:      { bg: "#378ADD",            border: "#378ADD" },
  success:   { bg: "#3B6D11",            border: "#3B6D11" },
  warning:   { bg: "#EF9F27",            border: "#EF9F27" },
};

function resolveColor(color?: string) {
  if (!color || color === "grey") return { bg: "var(--tl-dot-bg)", border: "var(--tl-dot-bg)" };
  return COLOR_MAP[color] ?? { bg: color, border: color };
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────

const CSS = `
  .tl-root {
    --tl-bg: #fff;
    --tl-text: var(--t1, #1a1a1a);
    --tl-text-secondary: var(--t2, #888);
    --tl-border: var(--border, #e0e0e0);
    --tl-connector: #bdbdbd;
    --tl-dot-bg: #bdbdbd;
    --tl-shadow: var(--shadow, 0 2px 8px rgba(0,0,0,0.08));
    font-family: 'DM Sans','Helvetica Neue',sans-serif;
    padding: 6px 0;
  }
  @media (prefers-color-scheme: dark) {
    .tl-root {
      --tl-bg: #1c1c1e; --tl-text: var(--t1, #f0f0f0);
      --tl-text-secondary: var(--t2, #888); --tl-border: var(--border, #3a3a3c);
      --tl-connector: #555; --tl-dot-bg: #555;
    }
  }

  /* Item row */
  .tl-item {
    display: flex;
    min-height: 70px;
    position: relative;
  }

  /* Separator (dot + connectors) */
  .tl-separator {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    padding: 0 16px;
  }
  .tl-connector {
    width: 2px;
    flex-grow: 1;
    background: var(--tl-connector);
    min-height: 16px;
  }
  .tl-connector:first-child { min-height: 12px; }
  .tl-connector.hidden { visibility: hidden; }

  /* Dot */
  .tl-dot {
    width: 12px; height: 12px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; z-index: 1;
    box-sizing: border-box;
    transition: transform 0.15s;
  }
  .tl-dot.with-children {
    width: 40px; height: 40px;
    box-shadow: var(--tl-shadow);
  }

  /* Content / Opposite */
  .tl-content {
    flex: 1; padding: 6px 16px 16px;
    min-width: 0;
  }
  .tl-content-right { padding-left: 0; }
  .tl-content-left  { padding-right: 0; text-align: right; }

  .tl-opposite {
    flex: 1; padding: 6px 16px 16px;
    min-width: 0;
  }
  .tl-opposite-right { text-align: right; padding-right: 0; }
  .tl-opposite-left  { padding-left: 0; }

  /* Typography helpers */
  .tl-title {
    font-size: 15px; font-weight: 600;
    color: var(--tl-text); margin: 0 0 3px;
    line-height: 1.4;
  }
  .tl-body {
    font-size: 13px; color: var(--t1, #888);
    margin: 0; line-height: 1.5;
  }
  .tl-time {
    font-size: 12px; color: var(--t1, #888);
    line-height: 1.6;
  }

  /* Card inside content */
  .tl-card {
    background: #000;
    border: 0.5px solid var(--tl-border);
    border-radius: 10px;
    padding: 12px 16px;
    box-shadow: var(--tl-shadow);
  }
  .tl-card .tl-title,
  .tl-card .tl-body {
    color: #fff;
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

export function Timeline({ children, position = "right", className }: TimelineProps) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <div className={`tl-root ${className ?? ""}`} style={{ listStyle: "none", margin: 0, padding: "6px 0" }}>
      <style>{CSS}</style>
      {items.map((child, i) => (
        <TimelineCtx.Provider key={i} value={{ position, itemIndex: i }}>
          {child}
        </TimelineCtx.Provider>
      ))}
    </div>
  );
}

export function TimelineItem({ children, position: posProp, className }: TimelineItemProps) {
  const { position: groupPos, itemIndex } = useContext(TimelineCtx);

  let pos: "left" | "right";
  if (posProp) {
    pos = posProp;
  } else if (groupPos === "alternate") {
    pos = itemIndex % 2 === 0 ? "right" : "left";
  } else if (groupPos === "alternate-reverse") {
    pos = itemIndex % 2 === 0 ? "left" : "right";
  } else {
    pos = groupPos === "left" ? "left" : "right";
  }

  return (
    <TimelineCtx.Provider value={{ position: groupPos, itemIndex: pos === "left" ? 1 : 0 }}>
      <div className={`tl-item ${className ?? ""}`} style={{ flexDirection: pos === "left" ? "row-reverse" : "row" }}>
        {children}
      </div>
    </TimelineCtx.Provider>
  );
}

export function TimelineSeparator({ children }: TimelineSeparatorProps) {
  return <div className="tl-separator">{children}</div>;
}

export function TimelineConnector({ color, style }: TimelineConnectorProps) {
  const c = resolveColor(color);
  return (
    <div
      className="tl-connector"
      style={{ background: color ? c.bg : undefined, ...style }}
    />
  );
}

export function TimelineDot({ children, color, variant = "filled", style }: TimelineDotProps) {
  const c = resolveColor(color);
  const hasChildren = !!children;
  return (
    <div
      className={`tl-dot${hasChildren ? " with-children" : ""}`}
      style={{
        background: variant === "filled" ? c.bg : "transparent",
        border: variant === "outlined" ? `2px solid ${c.border}` : "none",
        color: variant === "filled" ? "#fff" : c.border,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function TimelineContent({ children, className }: TimelineContentProps) {
  const { itemIndex } = useContext(TimelineCtx);
  const isLeft = itemIndex === 1;
  return (
    <div className={`tl-content ${isLeft ? "tl-content-left" : "tl-content-right"} ${className ?? ""}`}>
      {children}
    </div>
  );
}

export function TimelineOppositeContent({ children, color, className }: TimelineOppositeContentProps) {
  const { itemIndex } = useContext(TimelineCtx);
  const isLeft = itemIndex === 1;
  return (
    <div
      className={`tl-opposite ${isLeft ? "tl-opposite-left" : "tl-opposite-right"} ${className ?? ""}`}
      style={{ color: color ?? "var(--tl-text-secondary)" }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG Icons (inline)
// ─────────────────────────────────────────────────────────────────────────────

function Icon({ d, size = 18, color = "currentColor" }: { d: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  fastfood:  "M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7H1v-2h15.03v2zm0-4H1v-2h15.03v2z",
  laptop:    "M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z",
  hotel:     "M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z",
  repeat:    "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z",
  coffee:    "M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z",
  code:      "M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z",
  check:     "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  work:      "M20 6h-2.18c.07-.44.18-.88.18-1.36 0-2.59-2.12-4.64-4.73-4.64C11.1 0 9.34 1.3 8.41 3.12L8 3.93l-.41-.81C6.66 1.3 4.9 0 2.73 0 .12 0-2 2.05-2 4.64c0 .48.11.92.18 1.36H-2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7H1v-2h15.03v2zm0-4H1v-2h15.03v2z",
  star:      "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
};

// ─────────────────────────────────────────────────────────────────────────────
// Demo
// ─────────────────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#999", textTransform: "uppercase", margin: "0 0 8px" }}>
      {children}
    </p>
  );
}

export default function TimelineDemo() {
  return (
    <div className="tl-root" style={{ background: "#F5F3EE", minHeight: "100vh", padding: "40px 24px", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{CSS}</style>
      <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", flexDirection: "column", gap: 48 }}>

        <h1 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", color: "#999", textTransform: "uppercase", margin: 0 }}>
          Timeline · variantes
        </h1>

        {/* Basic */}
        <div>
          <SectionLabel>Basic (right)</SectionLabel>
          <Timeline>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <p className="tl-title">Eat</p>
                <p className="tl-body">Because you need strength</p>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color="primary" />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <p className="tl-title">Code</p>
                <p className="tl-body">Because it&apos;s awesome!</p>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color="secondary" />
              </TimelineSeparator>
              <TimelineContent>
                <p className="tl-title">Sleep</p>
                <p className="tl-body">Because you need rest</p>
              </TimelineContent>
            </TimelineItem>
          </Timeline>
        </div>

        {/* Left */}
        <div>
          <SectionLabel>Position left</SectionLabel>
          <Timeline position="left">
            {[
              { label: "Eat",    color: "inherit" as const },
              { label: "Code",   color: "primary" as const },
              { label: "Sleep",  color: "secondary" as const },
            ].map(({ label, color }, i) => (
              <TimelineItem key={label}>
                <TimelineSeparator>
                  <TimelineDot color={color} />
                  {i < 2 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent><p className="tl-title">{label}</p></TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </div>

        {/* Alternate */}
        <div>
          <SectionLabel>Alternate</SectionLabel>
          <Timeline position="alternate">
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color="primary"><Icon d={ICONS.fastfood} size={16} color="#fff" /></TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <p className="tl-title">Eat</p>
                <p className="tl-body">Because you need strength</p>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color="secondary"><Icon d={ICONS.laptop} size={16} color="#fff" /></TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <p className="tl-title">Code</p>
                <p className="tl-body">Because it&apos;s fun</p>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color="warning"><Icon d={ICONS.hotel} size={16} color="#fff" /></TimelineDot>
              </TimelineSeparator>
              <TimelineContent>
                <p className="tl-title">Sleep</p>
                <p className="tl-body">Because you need rest</p>
              </TimelineContent>
            </TimelineItem>
          </Timeline>
        </div>

        {/* Opposite content */}
        <div>
          <SectionLabel>Opposite content (alternate)</SectionLabel>
          <Timeline position="alternate">
            {[
              { time: "09:30 am", event: "Eat breakfast",  body: "Pancakes and coffee",   color: "primary"   as const, icon: ICONS.fastfood },
              { time: "10:00 am", event: "Start coding",   body: "TypeScript + React",    color: "secondary" as const, icon: ICONS.code     },
              { time: "12:00 pm", event: "Coffee break",   body: "Arabica single origin", color: "warning"   as const, icon: ICONS.coffee   },
            ].map(({ time, event, body, color, icon }, i, arr) => (
              <TimelineItem key={event}>
                <TimelineOppositeContent>
                  <span className="tl-time">{time}</span>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color={color}><Icon d={icon} size={16} color="#fff" /></TimelineDot>
                  {i < arr.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <p className="tl-title">{event}</p>
                  <p className="tl-body">{body}</p>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </div>

        {/* Outlined dots */}
        <div>
          <SectionLabel>Outlined dots</SectionLabel>
          <Timeline>
            {(["primary","secondary","error","warning","info","success"] as const).map((c, i, arr) => (
              <TimelineItem key={c}>
                <TimelineSeparator>
                  <TimelineDot color={c} variant="outlined" />
                  {i < arr.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <p className="tl-title" style={{ textTransform: "capitalize" }}>{c}</p>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </div>

        {/* Card content */}
        <div>
          <SectionLabel>Card content</SectionLabel>
          <Timeline position="alternate">
            {[
              { year: "2015", title: "First launch", body: "Initial release shipped to early adopters.", color: "primary" as const },
              { year: "2018", title: "Series A",     body: "$4M raised to expand the engineering team.",  color: "secondary" as const },
              { year: "2020", title: "10k users",    body: "Milestone reached in record time.",           color: "success" as const },
            ].map(({ year, title, body, color }, i, arr) => (
              <TimelineItem key={year}>
                <TimelineOppositeContent>
                  <span className="tl-time">{year}</span>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color={color} />
                  {i < arr.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <div className="tl-card">
                    <p className="tl-title" style={{ margin: 0 }}>{title}</p>
                    <p className="tl-body" style={{ marginTop: 4 }}>{body}</p>
                  </div>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </div>

        {/* Custom connector colors */}
        <div>
          <SectionLabel>Colored connectors</SectionLabel>
          <Timeline>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color="primary" />
                <TimelineConnector color="primary" />
              </TimelineSeparator>
              <TimelineContent><p className="tl-title">Step 1 · Design</p></TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color="secondary" />
                <TimelineConnector color="secondary" />
              </TimelineSeparator>
              <TimelineContent><p className="tl-title">Step 2 · Develop</p></TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color="success" />
              </TimelineSeparator>
              <TimelineContent><p className="tl-title">Step 3 · Deploy</p></TimelineContent>
            </TimelineItem>
          </Timeline>
        </div>

      </div>
    </div>
  );
}