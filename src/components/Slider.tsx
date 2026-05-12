"use client";

import {
  useState, useRef, useCallback, useEffect, useId, forwardRef,
  type ReactNode, type MouseEvent, type TouchEvent, type KeyboardEvent,
} from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Mark {
  value: number;
  label?: ReactNode;
}

export interface SliderProps {
  /** Single value (or [start, end] for range) */
  value?: number | [number, number];
  defaultValue?: number | [number, number];
  onChange?: (value: number | [number, number]) => void;
  onChangeCommitted?: (value: number | [number, number]) => void;
  min?: number;
  max?: number;
  step?: number | null;
  /** Show marks. Pass `true` for auto-marks at every `step`, or an array for custom marks */
  marks?: boolean | Mark[];
  /** Always show value label, "auto" = on hover/focus, false = hidden */
  valueLabelDisplay?: "on" | "auto" | "off";
  valueLabelFormat?: (value: number, index: number) => ReactNode;
  label?: string;
  disabled?: boolean;
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
  size?: "small" | "medium";
  orientation?: "horizontal" | "vertical";
  /** Height for vertical slider */
  height?: number;
  track?: "normal" | "inverted" | false;
  name?: string;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Color tokens
// ─────────────────────────────────────────────────────────────────────────────

const COLOR_MAP = {
  primary:   "#F59E0B",
  secondary: "#7F77DD",
  error:     "#E24B4A",
  info:      "#378ADD",
  success:   "#3B6D11",
  warning:   "#EF9F27",
};

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────

const CSS = `
  .sl-root {
    --sl-track: #e0e0e0;
    --sl-text: #1a1a1a;
    --sl-text-sec: #888;
    --sl-bg: #fff;
    --sl-shadow: 0 2px 8px rgba(0,0,0,0.15);
    --sl-border: #000000;
    font-family: 'DM Sans','Helvetica Neue',sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    .sl-root {
      --sl-track: #3a3a3c; --sl-text: #f0f0f0;
      --sl-text-sec: #888; --sl-bg: #2c2c2e;
      --sl-border: #555555;
    }
  }

  .sl-wrap { width: 100%; user-select: none; }
  .sl-label {
    font-size: 12px; font-weight: 600; letter-spacing: 0.04em;
    color: var(--sl-text-sec); text-transform: uppercase; margin-bottom: 20px;
    display: block;
  }

  /* Track area */
  .sl-track-area {
    position: relative; display: flex; align-items: center;
    cursor: pointer;
  }
  .sl-track-area.disabled { cursor: not-allowed; opacity: 0.38; }
  .sl-track-area.vertical {
    flex-direction: column-reverse; align-items: center;
    cursor: pointer;
  }

  /* Rail */
  .sl-rail {
    position: absolute; border-radius: var(--radius-sm, 4px);
    background: var(--sl-track);
    border: 2px solid var(--sl-border);
  }

  /* Active track */
  .sl-active-track {
    position: absolute; border-radius: var(--radius-sm, 4px);
    transition: none;
    border: 2px solid var(--sl-border);
  }

  /* Thumb */
  .sl-thumb {
    position: absolute; border-radius: var(--radius-sm, 4px);
    display: flex; align-items: center; justify-content: center;
    box-sizing: border-box; cursor: grab; z-index: 2;
    transition: box-shadow 0.15s, transform 0.1s;
    outline: none;
    touch-action: none;
    border: 2px solid var(--sl-border);
    box-shadow: 2px 2px 0 var(--sl-border);
  }
  .sl-thumb:active { cursor: grabbing; }
  .sl-thumb:focus-visible { outline: 3px solid; outline-offset: 3px; }

  /* Value label */
  .sl-label-bubble {
    position: absolute; bottom: calc(100% + 10px);
    left: 50%; transform: translateX(-50%);
    background: var(--sl-color, #F59E0B);
    color: #fff; font-size: 11px; font-weight: 700;
    padding: 4px 8px; border-radius: 6px;
    white-space: nowrap; pointer-events: none;
    transition: opacity 0.15s, transform 0.15s;
  }
  .sl-label-bubble::after {
    content: ''; position: absolute;
    top: 100%; left: 50%; transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: var(--sl-color, #F59E0B);
  }

  /* Marks */
  .sl-mark {
    position: absolute; border-radius: 50%;
    background: var(--sl-track);
    pointer-events: none; transition: background 0.15s;
  }
  .sl-mark.active { background: #fff; }
  .sl-mark-label {
    position: absolute; font-size: 11px; font-weight: 500;
    color: var(--sl-text-sec); white-space: nowrap;
    pointer-events: none;
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function snapToStep(v: number, min: number, step: number | null) {
  if (!step) return v;
  return Math.round((v - min) / step) * step + min;
}

function pct(v: number, min: number, max: number) {
  return ((v - min) / (max - min)) * 100;
}

function getMarks(marks: boolean | Mark[], min: number, max: number, step: number | null): Mark[] {
  if (!marks) return [];
  if (marks === true) {
    if (!step) return [{ value: min }, { value: max }];
    const out: Mark[] = [];
    for (let v = min; v <= max; v = Math.round((v + step) * 1e10) / 1e10) out.push({ value: v });
    return out;
  }
  return marks;
}

// ─────────────────────────────────────────────────────────────────────────────
// Slider
// ─────────────────────────────────────────────────────────────────────────────

export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    value: valueProp,
    defaultValue,
    onChange,
    onChangeCommitted,
    min = 0, max = 100, step = 1,
    marks = false,
    valueLabelDisplay = "auto",
    valueLabelFormat,
    label,
    disabled = false,
    color = "primary",
    size = "medium",
    orientation = "horizontal",
    height = 200,
    track = "normal",
    name,
    className,
  },
  ref
) {
  const id = useId();
  const isControlled = valueProp !== undefined;
  const isRange = Array.isArray(valueProp ?? defaultValue ?? 0);

  const [internalValue, setInternalValue] = useState<number | [number, number]>(
    defaultValue ?? (isRange ? [25, 75] : 0)
  );

  const value: number | [number, number] = isControlled ? valueProp! : internalValue;
  const accentColor = COLOR_MAP[color];

  const trackRef = useRef<HTMLDivElement>(null);
  const draggingThumb = useRef<0 | 1 | null>(null);
  const [activeThumb, setActiveThumb] = useState<0 | 1 | null>(null);
  const [hoveredThumb, setHoveredThumb] = useState<0 | 1 | null>(null);

  // Size tokens
  const THUMB_SIZE = size === "small" ? 14 : 20;
  const TRACK_THICKNESS = size === "small" ? 2 : 4;

  const markList = getMarks(marks, min, max, step);

  // ── Value helpers ──

  function getVal(idx: 0 | 1 = 0): number {
    if (Array.isArray(value)) return value[idx];
    return value as number;
  }

  function emit(newVal: number | [number, number], commit = false) {
    if (!isControlled) setInternalValue(newVal);
    onChange?.(newVal);
    if (commit) onChangeCommitted?.(newVal);
  }

  // ── Coordinate → value ──

  function coordToValue(clientX: number, clientY: number): number {
    const el = trackRef.current;
    if (!el) return min;
    const rect = el.getBoundingClientRect();
    let ratio: number;
    if (orientation === "vertical") {
      ratio = 1 - (clientY - rect.top) / rect.height;
    } else {
      ratio = (clientX - rect.left) / rect.width;
    }
    const raw = ratio * (max - min) + min;
    const snapped = snapToStep(clamp(raw, min, max), min, step);
    return clamp(snapped, min, max);
  }

  // ── Pointer events ──

  function startDrag(thumb: 0 | 1, e: MouseEvent | TouchEvent) {
    if (disabled) return;
    e.preventDefault();
    draggingThumb.current = thumb;
    setActiveThumb(thumb);
  }

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (draggingThumb.current === null) return;
    const newVal = coordToValue(clientX, clientY);
    const thumb = draggingThumb.current;

    if (Array.isArray(value)) {
      const next: [number, number] = [value[0], value[1]];
      next[thumb] = newVal;
      // Swap if crossed
      if (next[0] > next[1]) {
        next.reverse();
        draggingThumb.current = thumb === 0 ? 1 : 0;
        setActiveThumb(draggingThumb.current);
      }
      emit(next as [number, number]);
    } else {
      emit(newVal);
    }
  }, [value, min, max, step]);

  const handleUp = useCallback((clientX: number, clientY: number) => {
    if (draggingThumb.current === null) return;
    handleMove(clientX, clientY);
    const newVal = coordToValue(clientX, clientY);
    if (Array.isArray(value)) {
      const next: [number, number] = [value[0], value[1]];
      next[draggingThumb.current] = newVal;
      onChangeCommitted?.(next);
    } else {
      onChangeCommitted?.(newVal);
    }
    draggingThumb.current = null;
    setActiveThumb(null);
  }, [handleMove, value]);

  useEffect(() => {
    function onMouseMove(e: globalThis.MouseEvent) { handleMove(e.clientX, e.clientY); }
    function onMouseUp(e: globalThis.MouseEvent) { handleUp(e.clientX, e.clientY); }
    function onTouchMove(e: globalThis.TouchEvent) {
      const t = e.touches[0];
      handleMove(t.clientX, t.clientY);
    }
    function onTouchEnd(e: globalThis.TouchEvent) {
      const t = e.changedTouches[0];
      handleUp(t.clientX, t.clientY);
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [handleMove, handleUp]);

  // Click on track
  function handleTrackClick(e: MouseEvent) {
    if (disabled) return;
    const newVal = coordToValue(e.clientX, e.clientY);
    if (Array.isArray(value)) {
      const d0 = Math.abs(newVal - value[0]);
      const d1 = Math.abs(newVal - value[1]);
      const thumb = d0 <= d1 ? 0 : 1;
      const next: [number, number] = [value[0], value[1]];
      next[thumb] = newVal;
      emit(next, true);
    } else {
      emit(newVal, true);
    }
  }

  // Keyboard
  function handleKeyDown(thumb: 0 | 1, e: KeyboardEvent) {
    if (disabled) return;
    const dir = (e.key === "ArrowRight" || e.key === "ArrowUp") ? 1 : (e.key === "ArrowLeft" || e.key === "ArrowDown") ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const delta = (step ?? 1) * dir;
    if (Array.isArray(value)) {
      const next: [number, number] = [value[0], value[1]];
      next[thumb] = clamp(next[thumb] + delta, min, max);
      emit(next, true);
    } else {
      emit(clamp((value as number) + delta, min, max), true);
    }
  }

  // ── Rendering helpers ──

  const v0 = getVal(0);
  const v1 = isRange ? getVal(1) : v0;

  const pct0 = pct(v0, min, max);
  const pct1 = pct(v1, min, max);

  function trackStyle(): React.CSSProperties {
    if (orientation === "horizontal") {
      if (!isRange) {
        return track === "inverted"
          ? { left: `${pct0}%`, right: 0, width: `${100 - pct0}%` }
          : { left: 0, width: `${pct0}%` };
      }
      return { left: `${pct0}%`, width: `${pct1 - pct0}%` };
    } else {
      if (!isRange) {
        return track === "inverted"
          ? { bottom: `${pct0}%`, top: 0, height: `${100 - pct0}%` }
          : { bottom: 0, height: `${pct0}%` };
      }
      return { bottom: `${pct0}%`, height: `${pct1 - pct0}%` };
    }
  }

  function thumbStyle(pctVal: number): React.CSSProperties {
    const half = THUMB_SIZE / 2;
    if (orientation === "horizontal") {
      return { left: `${pctVal}%`, top: "50%", transform: `translate(-50%, -50%)`, width: THUMB_SIZE, height: THUMB_SIZE };
    } else {
      return { bottom: `${pctVal}%`, left: "50%", transform: `translate(-50%, 50%)`, width: THUMB_SIZE, height: THUMB_SIZE };
    }
  }

  function showLabel(thumbIdx: 0 | 1) {
    if (valueLabelDisplay === "on") return true;
    if (valueLabelDisplay === "auto") return activeThumb === thumbIdx || hoveredThumb === thumbIdx;
    return false;
  }

  function labelText(v: number, i: number) {
    return valueLabelFormat ? valueLabelFormat(v, i) : v;
  }

  const thumbs: Array<{ pctVal: number; val: number; idx: 0 | 1 }> = isRange
    ? [{ pctVal: pct0, val: v0, idx: 0 }, { pctVal: pct1, val: v1, idx: 1 }]
    : [{ pctVal: pct0, val: v0, idx: 0 }];

  const isHoriz = orientation === "horizontal";
  const trackAreaStyle: React.CSSProperties = isHoriz
    ? { height: Math.max(THUMB_SIZE, 24), width: "100%" }
    : { width: Math.max(THUMB_SIZE, 24), height };

  const railStyle: React.CSSProperties = isHoriz
    ? { left: 0, right: 0, height: TRACK_THICKNESS, top: "50%", transform: "translateY(-50%)" }
    : { top: 0, bottom: 0, width: TRACK_THICKNESS, left: "50%", transform: "translateX(-50%)" };

  const activeTrackBase: React.CSSProperties = isHoriz
    ? { height: TRACK_THICKNESS, top: "50%", transform: "translateY(-50%)" }
    : { width: TRACK_THICKNESS, left: "50%", transform: "translateX(-50%)" };

  return (
    <div ref={ref} className={`sl-root sl-wrap ${className ?? ""}`}>
      <style>{CSS}</style>

      {name && <input type="hidden" name={name} value={isRange ? `${v0},${v1}` : v0} />}
      {label && <label htmlFor={id} className="sl-label">{label}</label>}

      <div
        ref={trackRef}
        id={id}
        className={`sl-track-area${disabled ? " disabled" : ""}${isHoriz ? "" : " vertical"}`}
        style={trackAreaStyle}
        onClick={handleTrackClick}
      >
        {/* Rail */}
        <div className="sl-rail" style={railStyle} />

        {/* Active track */}
        {track !== false && (
          <div
            className="sl-active-track"
            style={{ ...activeTrackBase, ...trackStyle(), background: accentColor }}
          />
        )}

        {/* Marks */}
        {markList.map((mark) => {
          const mp = pct(mark.value, min, max);
          const isActive = isRange
            ? mark.value >= v0 && mark.value <= v1
            : mark.value <= v0;
          const dotSize = size === "small" ? 4 : 6;
          const dotStyle: React.CSSProperties = isHoriz
            ? { width: dotSize, height: dotSize, left: `${mp}%`, top: "50%", transform: "translate(-50%,-50%)" }
            : { width: dotSize, height: dotSize, bottom: `${mp}%`, left: "50%", transform: "translate(-50%,50%)" };
          const labelStyle: React.CSSProperties = isHoriz
            ? { left: `${mp}%`, top: "calc(50% + 14px)", transform: "translateX(-50%)" }
            : { bottom: `${mp}%`, left: "calc(50% + 16px)", transform: "translateY(50%)" };

          return (
            <span key={mark.value}>
              <span
                className={`sl-mark${isActive ? " active" : ""}`}
                style={{ ...dotStyle, background: isActive ? accentColor : undefined }}
              />
              {mark.label && (
                <span className="sl-mark-label" style={labelStyle}>
                  {mark.label}
                </span>
              )}
            </span>
          );
        })}

        {/* Thumbs */}
        {thumbs.map(({ pctVal, val, idx }) => {
          const isActive = activeThumb === idx;
          const isHovered = hoveredThumb === idx;
          const labelVisible = showLabel(idx);

          return (
            <div
              key={idx}
              className="sl-thumb"
              role="slider"
              tabIndex={disabled ? -1 : 0}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={val}
              aria-disabled={disabled}
              style={{
                ...thumbStyle(pctVal),
                background: accentColor,
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                boxShadow: isActive
                  ? `0 0 0 14px ${accentColor}26`
                  : isHovered
                    ? `0 0 0 8px ${accentColor}1a`
                    : `0 2px 6px rgba(0,0,0,0.2)`,
                outlineColor: accentColor,
                transform: thumbStyle(pctVal).transform,
                zIndex: isActive ? 3 : 2,
              }}
              onMouseDown={(e) => { e.stopPropagation(); startDrag(idx, e); }}
              onTouchStart={(e) => { e.stopPropagation(); startDrag(idx, e); }}
              onMouseEnter={() => setHoveredThumb(idx)}
              onMouseLeave={() => setHoveredThumb(null)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onFocus={() => setActiveThumb(idx)}
              onBlur={() => setActiveThumb(null)}
            >
              {/* Value label bubble */}
              {valueLabelDisplay !== "off" && (
                <div
                  className="sl-label-bubble"
                  style={{
                    "--sl-color": accentColor,
                    opacity: labelVisible ? 1 : 0,
                    transform: `translateX(-50%) ${labelVisible ? "scale(1)" : "scale(0.8)"}`,
                    pointerEvents: "none",
                  } as React.CSSProperties}
                >
                  {labelText(val, idx)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});