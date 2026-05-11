export const semanticTokens = {
  colors: {
    background: {
      base: '--background',
      secondary: '--secondary-background',
      alt: '--bg2',
      alt2: '--bg3',
      alt3: '--bg4',
      alt4: '--bg5',
    },
    text: {
      primary: '--foreground',
      heading: '--t1',
      body: '--t2',
      muted: '--t3',
      subtle: '--t4',
    },
    accent: {
      base: '--main',
      foreground: '--main-foreground',
    },
    surface: {
      habit: '--c-habit',
      habitBorder: '--c-habit-b',
      habitText: '--c-habit-t',
      goal: '--c-goal',
      goalBorder: '--c-goal-b',
      goalText: '--c-goal-t',
      task: '--c-task',
      taskBorder: '--c-task-b',
      taskText: '--c-task-t',
      event: '--c-event',
      eventBorder: '--c-event-b',
      eventText: '--c-event-t',
      note: '--c-note-bg',
    },
    border: {
      base: '--border',
      default: '--b',
      muted: '--b2',
      subtle: '--b3',
      focus: '--b-focus',
    },
    icon: {
      time: '--time-icon-color',
    },
    brand: {
      amber: '--amber',
      amberLight: '--amber-2',
      amberDeep: '--amber-deep',
      amberSoft: '--amber-soft',
      sun: '--sun',
      grass: '--grass',
      sky: '--sky',
      violet: '--violet',
      coral: '--coral',
      peach: '--peach',
      mute: '--mute',
      mute2: '--mute-2',
    },
    destructive: {
      base: '--destructive-pastel',
      foreground: '--destructive-pastel-foreground',
    },
  },
  spacing: {
    base: '--spacing',
    section: '--section-gap',
    grid: '--grid-gap',
  },
  typography: {
    sans: '--font-sans',
    mono: '--font-mono',
  },
  radius: {
    base: '--radius-base',
    sm: '--radius-sm',
    lg: '--radius-lg',
    full: '--radius-full',
  },
  shadow: {
    default: '--shadow',
    noBrand: '--shadow-nb',
    noBrandSm: '--shadow-nb-sm',
    x: '--shadow-x',
    y: '--shadow-y',
  },
  borderWidth: {
    base: '--border-width',
  },
} as const

export type SemanticTokens = typeof semanticTokens