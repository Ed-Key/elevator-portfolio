// Portfolio content — sections are "floors" in the building the elevator
// just carried you into. Edit copy here; layout lives in PortfolioFloors.jsx.

export const COMPANIES = [
  { id: 'matrices', name: 'Matrices.ai', initial: 'M', wordmark: '/images/logos/matrices-full.svg', wordmarkHeight: 18 },
  { id: 'godaddy', name: 'GoDaddy', initial: 'G', wordmark: '/images/logos/godaddy-full.svg', wordmarkHeight: 19 },
  { id: 'tufts', name: 'Tufts', initial: 'T', wordmark: '/images/logos/tufts-wordmark.svg', wordmarkHeight: 26 },
]

export const CONTACT = {
  email: 'EdKiboma@outlook.com',
  github: { label: 'github.com/Ed-Key', url: 'https://github.com/Ed-Key' },
  linkedin: { label: 'linkedin.com/in/edward-kiboma', url: 'https://www.linkedin.com/in/edward-kiboma-697578245/' },
  resume: { label: 'Resume', url: '/resume.pdf' },
}

// Tech glyph colors are brand colors curated for the dark void background
// (pure-black brands like Three.js/Next.js/Unity become white, dark brands
// get their community light variant). Slugs match public/images/tech/*.svg.
const TECH = {
  claude: { name: 'Claude API', slug: 'claude', color: '#d97757' },
  csharp: { name: 'C#', slug: 'csharp', color: '#a179dc' },
  figma: { name: 'Figma', slug: 'figma', color: '#f24e1e' },
  firebase: { name: 'Firebase', slug: 'firebase', color: '#ffca28' },
  gcp: { name: 'GCP', slug: 'googlecloud', color: '#4285f4' },
  glsl: { name: 'GLSL', slug: 'opengl', color: '#5586a4' },
  gsap: { name: 'GSAP', slug: 'greensock', color: '#88ce02' },
  langchain: { name: 'LangChain', slug: 'langchain', color: '#5ac8a8' },
  nextjs: { name: 'Next.js', slug: 'nextdotjs', color: '#ffffff' },
  python: { name: 'Python', slug: 'python', color: '#4b8bbe' },
  r3f: { name: 'React Three Fiber', slug: 'react', color: '#61dafb' },
  react: { name: 'React', slug: 'react', color: '#61dafb' },
  rust: { name: 'Rust', slug: 'rust', color: '#ce6d35' },
  stripe: { name: 'Stripe Connect', slug: 'stripe', color: '#635bff' },
  supabase: { name: 'Supabase', slug: 'supabase', color: '#3fcf8e' },
  threejs: { name: 'Three.js', slug: 'threedotjs', color: '#ffffff' },
  typescript: { name: 'TypeScript', slug: 'typescript', color: '#3178c6' },
  unity: { name: 'Unity', slug: 'unity', color: '#ffffff' },
}

// media: best available asset per project — the stage renders
// video → poster → monogram (nothing blocks on recordings existing).
// logo, when present, replaces the monogram mark beside the text;
// model (draco glb) outranks logo as a spinning 3D mark on the stage.
// backdrop, when present, plays dimmed behind the whole stage while the
// project is staged (skipped under reduced motion).
// prop, when present, is a still (or list of stills that cycle) tucked
// behind the window with a corner peeking out (desktop stage only).
export const PROJECTS = [
  {
    id: 'pageaura',
    name: 'PageAura',
    blurb: 'Public bookshelf and EPUB reader with mood-reactive ambience, personal libraries, progress, and audio companions.',
    year: '2026',
    status: 'live',
    tech: [TECH.react, TECH.threejs, TECH.supabase, TECH.claude],
    links: [{ label: 'Demo', url: 'https://pageaura.app/' }],
    media: {
      video: null,
      poster: '/media/projects/pageaura-shelf.png',
      logo: '/media/projects/pageaura-book.svg',
      model: null,
      stageMark: 'pageauraSparkles',
    },
  },
  {
    id: 'showdown-copilot',
    name: 'Showdown Copilot',
    blurb: 'Pokemon Showdown advisor: TypeScript overlay, Python belief proxy, Rust MCTS, and neural priors for human decisions.',
    year: '2026',
    status: 'private',
    tech: [TECH.rust, TECH.python, TECH.typescript],
    links: [],
    media: {
      video: '/media/projects/showdown-demo.mp4',
      poster: '/media/projects/showdown-dashboard.png',
      logo: null,
      model: null,
      backdrop: '/media/projects/showdown-teaser.mp4',
      prop: [
        '/media/projects/showdown-tcg-card.png',
        '/media/projects/showdown-card-ogerpon.png',
        '/media/projects/showdown-card-gholdengo.png',
        '/media/projects/showdown-card-garchomp.png',
      ],
    },
  },
  {
    id: 'daily-bread',
    name: 'Daily Bread',
    blurb: 'YouVersion companion that puts the verse of the day in every new tab, with study notes and prayer one click away.',
    year: '2026',
    status: 'live',
    tech: [TECH.typescript, TECH.react, TECH.firebase, TECH.claude],
    links: [{ label: 'Landing', url: 'https://daily-bread-landing.web.app' }],
    media: {
      video: null,
      poster: '/media/projects/daily-bread-landing.png',
      logo: '/media/projects/daily-bread-logo.svg',
      model: '/media/projects/daily-bread-logo.glb',
    },
  },
  {
    id: 'avirem',
    name: 'Avirem',
    blurb: 'Aesthetic-medicine marketplace for onboarding, provider review, booking, and Stripe Connect payouts.',
    year: '2026',
    status: 'live',
    tech: [TECH.nextjs, TECH.supabase, TECH.stripe],
    links: [{ label: 'Open', url: 'https://www.joinavirem.com/' }],
    media: { video: null, poster: '/media/projects/avirem-preview.png', logo: null, model: null },
  },
  {
    id: 'elevator',
    name: 'This Elevator',
    blurb: 'Interactive 3D elevator portfolio with R3F, GSAP timing, and a golden shader modal.',
    year: '2026',
    status: 'live',
    tech: [TECH.r3f, TECH.gsap, TECH.glsl],
    links: [{ label: 'Code', url: 'https://github.com/Ed-Key/elevator-portfolio' }],
    media: { video: null, poster: null, logo: null, model: null },
  },
  {
    id: 'potencia',
    name: 'Potencia Tutor Chatbot',
    blurb: 'WhatsApp RAG assistant that answers volunteer tutors from program docs during live support.',
    year: '2025',
    status: 'private',
    tech: [TECH.python, TECH.langchain, TECH.gcp],
    links: [],
    media: { video: null, poster: null, logo: null, model: null },
  },
  {
    id: 'water-sim',
    name: 'Water Purification Sim',
    blurb: 'Unity simulator teaching water-treatment systems through interactive 3D scenarios.',
    year: '2025',
    status: 'private',
    tech: [TECH.unity, TECH.csharp],
    links: [],
    media: { video: null, poster: null, logo: null, model: null },
  },
  {
    id: 'ace',
    name: 'ACE++ Website',
    blurb: 'First shipped website: a Tufts CS access program site that reached 500+ students at launch.',
    year: '2023',
    status: 'live',
    tech: [TECH.react, TECH.figma],
    links: [
      { label: 'Site', url: 'https://ed-key.github.io/ACE/' },
      { label: 'Code', url: 'https://github.com/Ed-Key/ACE' },
    ],
    media: { video: null, poster: '/media/projects/ace-preview.png', logo: null, model: null },
  },
]

// The capacity plate: languages the operator is rated for. `projects`
// lists which ring projects light each glyph (cross-highlight); empty
// arrays stay etched — rated beyond what's on display.
export const LANGUAGES = [
  { name: 'TypeScript', slug: 'typescript', color: '#3178c6', projects: ['pageaura', 'showdown-copilot', 'daily-bread', 'avirem'] },
  { name: 'JavaScript', slug: 'javascript', color: '#f7df1e', projects: ['elevator', 'ace'] },
  { name: 'Python', slug: 'python', color: '#4b8bbe', projects: ['showdown-copilot', 'potencia'] },
  { name: 'Rust', slug: 'rust', color: '#ce6d35', projects: ['showdown-copilot'] },
  { name: 'Java', slug: 'openjdk', color: '#f89820', projects: [] },
  { name: 'C', slug: 'c', color: '#a8b9cc', projects: [] },
  { name: 'C++', slug: 'cplusplus', color: '#659ad2', projects: [] },
  { name: 'C#', slug: 'csharp', color: '#a179dc', projects: ['water-sim'] },
  { name: 'SQL', slug: null, color: '#e8b54a', projects: ['pageaura', 'avirem'] },
  { name: 'HTML', slug: 'html5', color: '#e34f26', projects: ['daily-bread', 'ace'] },
  { name: 'CSS', slug: 'css', color: '#2965f1', projects: ['elevator', 'daily-bread', 'ace'] },
  { name: 'GLSL', slug: 'opengl', color: '#5586a4', projects: ['pageaura', 'elevator'] },
  { name: 'Bash', slug: 'gnubash', color: '#4eaa25', projects: [] },
]

export const EXPERIENCE = [
  { company: 'Matrices.ai', role: 'Software Developer / Project Lead', period: '2025 — 2026' },
  { company: 'Tufts Engineering Education', role: 'Software Developer', period: '2023 — 2025' },
  { company: 'GoDaddy', role: 'Software Developer Intern', period: '2024' },
]

export const CAPABILITIES = [
  { label: 'Build', items: 'TypeScript · React · Next.js · Node · Unity' },
  { label: 'Render', items: 'Three.js · R3F · GLSL · GSAP' },
  { label: 'Reason', items: 'Claude API · LangChain · RAG pipelines' },
  { label: 'Ship', items: 'Firebase · Supabase · GCP · GitHub Actions' },
]

export const BIO = [
  'Computer science at Tufts School of Engineering, class of ’25. Since then I’ve shipped agent-evaluation infrastructure at Matrices.ai, built social-platform integrations at GoDaddy, and put a 3D simulator in front of two hundred engineering students.',
  'I like software that feels considered — interfaces with motion and weight, tools that respect the person using them.',
]

export const PORTFOLIO_FLOORS = [
  { id: 'home', number: '01', label: 'Lobby' },
  { id: 'projects', number: '02', label: 'Projects' },
  { id: 'about', number: '03', label: 'About' },
  { id: 'contact', number: '04', label: 'Contact' },
]
