export const POSTS = [
  {
    id: '1',
    user: 'Beatriz Silva', handle: '@beatriz_silva', initials: 'BS', time: '2h',
    category: 'Hábitos',
    text: 'Finalmente bati a meta de 30 dias de meditação matinal! 🧘 A sensação de clareza mental é indescritível. Alguém mais começando essa jornada?',
    hasImage: true, imageSrc: null as string | null,
    likes: 124, comments: 18,
    bgColor: 'var(--c-habit)', fgColor: 'var(--c-habit-t)', badge: '',
  },
  {
    id: '2',
    user: 'Ricardo Mendonça', handle: '@ricardo_m', initials: 'RM', time: '4h',
    category: 'Finanças',
    text: 'Dica do dia: Automatize suas economias assim que o salário cair. Regra dos 50/30/20 mudou minha vida! 📊🚀',
    hasImage: false, imageSrc: null,
    likes: 45, comments: 5,
    bgColor: 'var(--c-task-bg)', fgColor: 'var(--c-task-t)', badge: 'DICA',
  },
  {
    id: '3',
    user: 'Mariana Costa', handle: '@mari_costa', initials: 'MC', time: '6h',
    category: 'Carreira',
    text: 'Acabei de publicar um artigo sobre síndrome do impostor em transição de carreira. Link na bio! 💼✨',
    hasImage: false, imageSrc: null,
    likes: 89, comments: 12,
    bgColor: 'var(--c-goal-bg)', fgColor: 'var(--c-goal-t)', badge: '',
  },
  {
    id: '4',
    user: 'Felipe Santos', handle: '@felipecode', initials: 'FS', time: '9h',
    category: 'Tech',
    text: 'A Revolução do Design Neo-Brutalista. Cores vibrantes, sombras pesadas, tipografia que não pede desculpas. É a volta da honestidade estrutural.',
    hasImage: true, imageSrc: null,
    likes: 1200, comments: 84,
    bgColor: 'var(--bg3)', fgColor: 'var(--t1)', badge: '',
  },
  {
    id: '5',
    user: 'Ana Luiza', handle: '@analu_mind', initials: 'AL', time: '12h',
    category: 'Mentalidade',
    text: 'Produtividade não é sobre fazer mais, é sobre fazer o que importa. Hoje decidi dizer não para três reuniões irrelevantes. Foco total no Deep Work! 🧠🔌',
    hasImage: false, imageSrc: null,
    likes: 231, comments: 42,
    bgColor: 'var(--c-mental)', fgColor: 'var(--c-mental-t)', badge: 'INSIGHT',
  },
  {
    id: '6',
    user: 'Lucas Oliveira', handle: '@lucas_dev', initials: 'LO', time: '1d',
    category: 'Tech',
    text: 'Documentação lida, café servido e VS Code configurado. Começando o novo projeto com Clean Architecture. O esforço inicial paga o dobro no futuro! 💻☕',
    hasImage: true, imageSrc: null,
    likes: 560, comments: 29,
    bgColor: 'var(--bg3)', fgColor: 'var(--t1)', badge: '',
  },
]

export const CATEGORIES = ['Tudo', 'Hábitos', 'Finanças', 'Carreira', 'Tech', 'Mentalidade']

export type Post = typeof POSTS[number]