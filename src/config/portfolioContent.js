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
export const PROJECTS = [
  {
    id: 'pageaura',
    name: 'PageAura',
    blurb: 'A reading app that lights the room to match the book — mood-reactive ambient shaders wrap your library in cinematic color.',
    year: '2026',
    url: 'https://github.com/Ed-Key',
    status: 'live',
    tech: [TECH.react, TECH.threejs, TECH.supabase, TECH.claude],
    media: { video: null, poster: null },
  },
  {
    id: 'showdown-copilot',
    name: 'Showdown Copilot',
    blurb: 'Human-in-the-loop battle copilot for Pokemon Showdown — a Rust MCTS engine with Bayesian belief tracking over hidden opponent state.',
    year: '2026',
    url: null,
    status: 'private',
    tech: [TECH.rust, TECH.python, TECH.typescript],
    media: { video: null, poster: null },
  },
  {
    id: 'daily-bread',
    name: 'Daily Bread',
    blurb: 'Chrome extension pairing daily scripture with AI-synthesized study notes from three commentary sources.',
    year: '2026',
    url: 'https://daily-bread-landing.web.app',
    status: 'live',
    tech: [TECH.typescript, TECH.react, TECH.firebase, TECH.claude],
    media: { video: null, poster: null },
  },
  {
    id: 'avirem',
    name: 'Avirem',
    blurb: 'HIPAA-aware marketplace connecting clients with licensed aesthetic-medicine practitioners — onboarding, booking, and Stripe Connect payouts.',
    year: '2026',
    url: null,
    status: 'private',
    tech: [TECH.nextjs, TECH.supabase, TECH.stripe],
    media: { video: null, poster: null },
  },
  {
    id: 'elevator',
    name: 'This Elevator',
    blurb: 'The site you are standing in — a 3D elevator ride that opens into a living golden void.',
    year: '2026',
    url: 'https://github.com/Ed-Key',
    status: 'live',
    tech: [TECH.r3f, TECH.gsap, TECH.glsl],
    media: { video: null, poster: null },
  },
  {
    id: 'potencia',
    name: 'Potencia Tutor Chatbot',
    blurb: 'RAG-grounded WhatsApp assistant that answers volunteer tutors straight from program documentation.',
    year: '2025',
    url: null,
    status: 'private',
    tech: [TECH.python, TECH.langchain, TECH.gcp],
    media: { video: null, poster: null },
  },
  {
    id: 'water-sim',
    name: 'Water Purification Sim',
    blurb: 'Unity 3D simulator teaching water treatment to 200+ environmental-engineering students at Tufts.',
    year: '2025',
    url: null,
    status: 'private',
    tech: [TECH.unity, TECH.csharp],
    media: { video: null, poster: null },
  },
  {
    id: 'ace',
    name: 'ACE++ Website',
    blurb: 'Where it started — my first website, built for the Tufts program that brought me into CS. Reached 500+ students at launch.',
    year: '2023',
    url: 'https://ed-key.github.io/ACE/',
    status: 'live',
    tech: [TECH.react, TECH.figma],
    media: { video: null, poster: null },
  },
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
