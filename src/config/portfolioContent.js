// Portfolio content — sections are "floors" in the building the elevator
// just carried you into. Edit copy here; layout lives in PortfolioFloors.jsx.

export const CONTACT = {
  email: 'EdKiboma@outlook.com',
  github: { label: 'github.com/Ed-Key', url: 'https://github.com/Ed-Key' },
  linkedin: { label: 'linkedin.com/in/Edward-Kiboma', url: 'https://linkedin.com/in/Edward-Kiboma' },
}

export const PROJECTS = [
  {
    id: 'pageaura',
    name: 'PageAura',
    blurb: 'A reading app that lights the room to match the book — mood-reactive ambient shaders wrap your library in cinematic color.',
    stack: 'React · Three.js · Supabase · Claude API',
    year: '2026',
    url: 'https://github.com/Ed-Key',
  },
  {
    id: 'showdown-copilot',
    name: 'Showdown Copilot',
    blurb: 'Human-in-the-loop battle copilot for Pokemon Showdown — a Rust MCTS engine with Bayesian belief tracking over hidden opponent state.',
    stack: 'Rust · Python · TypeScript',
    year: '2026',
    url: null,
  },
  {
    id: 'daily-bread',
    name: 'Daily Bread',
    blurb: 'Chrome extension pairing daily scripture with AI-synthesized study notes from three commentary sources.',
    stack: 'TypeScript · React · Firebase · Claude API',
    year: '2026',
    url: 'https://daily-bread-landing.web.app',
  },
  {
    id: 'avirem',
    name: 'Avirem',
    blurb: 'HIPAA-aware marketplace connecting clients with licensed aesthetic-medicine practitioners — onboarding, booking, and Stripe Connect payouts.',
    stack: 'Next.js · Supabase · Stripe Connect',
    year: '2026',
    url: null,
  },
  {
    id: 'elevator',
    name: 'This Elevator',
    blurb: 'The site you are standing in — a 3D elevator ride that opens into a living golden void.',
    stack: 'React Three Fiber · GSAP · GLSL',
    year: '2026',
    url: 'https://github.com/Ed-Key',
  },
  {
    id: 'potencia',
    name: 'Potencia Tutor Chatbot',
    blurb: 'RAG-grounded WhatsApp assistant that answers volunteer tutors straight from program documentation.',
    stack: 'Python · LangChain · GCP',
    year: '2025',
    url: null,
  },
  {
    id: 'water-sim',
    name: 'Water Purification Sim',
    blurb: 'Unity 3D simulator teaching water treatment to 200+ environmental-engineering students at Tufts.',
    stack: 'Unity · C#',
    year: '2025',
    url: null,
  },
  {
    id: 'ace',
    name: 'ACE++ Website',
    blurb: 'Where it started — my first website, built for the Tufts program that brought me into CS. Reached 500+ students at launch.',
    stack: 'React · Figma',
    year: '2023',
    url: 'https://ed-key.github.io/ACE/',
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
