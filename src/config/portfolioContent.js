// Portfolio content — sections are "floors" in the building the elevator
// just carried you into. Edit copy here; layout lives in PortfolioFloors.jsx.

import { DEMO } from './cuaCaseStudy'

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
  gcp: { name: 'Google Cloud', slug: 'googlecloud', color: '#4285f4' },
  javascript: { name: 'JavaScript', slug: 'javascript', color: '#f7df1e' },
  langchain: { name: 'LangChain', slug: 'langchain', color: '#5ac8a8' },
  nextjs: { name: 'Next.js', slug: 'nextdotjs', color: '#ffffff' },
  python: { name: 'Python', slug: 'python', color: '#4b8bbe' },
  react: { name: 'React', slug: 'react', color: '#61dafb' },
  rust: { name: 'Rust', slug: 'rust', color: '#ce6d35' },
  sqlite: { name: 'SQLite', slug: 'sqlite', color: '#3ba0d8' },
  supabase: { name: 'Supabase', slug: 'supabase', color: '#3fcf8e' },
  threejs: { name: 'Three.js', slug: 'threedotjs', color: '#ffffff' },
  typescript: { name: 'TypeScript', slug: 'typescript', color: '#3178c6' },
  unity: { name: 'Unity', slug: 'unity', color: '#ffffff' },
}

// Floor 02 lists these in order. tag is the one line a visitor scans in the
// list; blurb is the longer caption under the stage. media is either a video
// (with a poster shown until it plays) or a still image; a project with
// neither shows its name on a dark tile. contain letterboxes footage that is
// not landscape (a phone recording) instead of cropping it. meta and
// eventLogo sit under the blurb.
export const PROJECTS = [
  {
    id: 'trailblazer',
    name: 'Trailblazer',
    year: '2026',
    tag: "Spot moving objects in NASA's infrared sky",
    blurb: "A public window into NASA's SPHEREx telescope. Explore the whole infrared sky, open a time-lapse of any spot, and find the dots that move.",
    eventLogo: { src: '/images/logos/space-apps-white.png', alt: 'NASA Space Apps Challenge' },
    tech: [TECH.javascript, TECH.python, TECH.threejs],
    links: [
      { label: 'Visit', url: 'https://comet-hunt.comet-hunt.workers.dev' },
      { label: 'Code', url: 'https://github.com/hkafle3/space-apps-2026-nyc' },
    ],
    media: { video: '/media/projects/trailblazer-intro.mp4', poster: '/media/projects/trailblazer-poster.jpg' },
  },
  {
    id: 'pageaura',
    name: 'PageAura',
    year: '2026',
    tag: 'A public bookshelf and the EPUB reader behind it',
    blurb: 'My public bookshelf and the EPUB reader behind it. Upload books to build your own shelf, or just listen.',
    tech: [TECH.typescript, TECH.react, TECH.threejs, TECH.supabase],
    links: [{ label: 'Visit', url: 'https://pageaura.app/' }],
    media: { video: '/media/projects/pageaura-stage.mp4', poster: '/media/projects/pageaura-poster.jpg' },
  },
  {
    id: 'cua',
    name: 'cua-driver Fork',
    year: '2026',
    tag: 'AI agents use Mac apps while you keep working',
    blurb: 'My fork of an open-source tool that lets AI agents use Mac apps in the background while you keep working.',
    tech: [TECH.rust, TECH.python],
    links: [
      { label: 'Case study', url: '/cua' },
      { label: 'Code', url: 'https://github.com/Ed-Key/cua/tree/ed/main' },
    ],
    media: { video: '/media/projects/cua-stage.mp4', poster: DEMO.poster },
  },
  {
    id: 'showdown-copilot',
    name: 'Showdown Copilot',
    year: '2026',
    tag: 'Live move advice in Pokémon Showdown battles',
    blurb: 'An advisor that suggests moves during live Pokémon Showdown battles, built on Monte Carlo tree search in Rust.',
    tech: [TECH.rust, TECH.python, TECH.typescript],
    links: [{ label: 'Code', url: 'https://github.com/Ed-Key/showdown-stack' }],
    media: { video: '/media/projects/showdown-stage.mp4', poster: '/media/projects/showdown-poster.jpg' },
  },
  {
    id: 'keep-my-snap',
    name: 'Keep My SNAP',
    year: '2026',
    tag: 'Helps New Jersey residents keep their food benefits',
    meta: '2nd place, Newark Tech Week hackathon',
    blurb: 'A resident tells their story and photographs the county letter. It fills in the New Jersey SNAP exemption form so they keep their benefits.',
    tech: [TECH.javascript, TECH.nextjs, TECH.claude],
    links: [
      { label: 'Watch demo', url: '/keep-my-snap/demo' },
      { label: 'Code', url: 'https://github.com/Ed-Key/keep-my-snap-newark' },
    ],
    media: { video: '/media/projects/snap-stage.mp4', poster: '/media/projects/snap-poster.jpg', contain: true },
  },
  {
    id: 'kemuma-studio',
    name: 'Kemuma Studio',
    year: '2026',
    tag: 'Turns a photo of a carving into an Etsy listing',
    blurb: "The tool behind my family's Etsy shop. Photograph a carving and it drafts, prices and photographs the listing.",
    tech: [TECH.typescript, TECH.nextjs, TECH.sqlite],
    links: [
      { label: 'Code', url: 'https://github.com/Ed-Key/kemuma-studio' },
      { label: 'Shop', url: 'https://www.etsy.com/shop/KemumaCarvings' },
    ],
    media: { video: '/media/projects/kemuma-stage.mp4', poster: '/media/projects/kemuma-poster.jpg' },
  },
  {
    id: 'daily-bread',
    name: 'Daily Bread',
    year: '2026',
    tag: 'The verse of the day in every new tab',
    blurb: 'A YouVersion companion that puts the verse of the day in every new tab. Study notes and prayer are one click away.',
    tech: [TECH.typescript, TECH.react, TECH.firebase],
    links: [{ label: 'Visit', url: 'https://daily-bread-landing.web.app' }],
    media: { image: '/media/projects/daily-bread.jpg' },
  },
  {
    id: 'hone',
    name: 'Hone',
    year: '2026',
    tag: 'Python interview practice that runs on your laptop',
    meta: 'Built on the open-source Anvil app (MIT)',
    blurb: 'Private Python interview practice that runs on your own laptop. Predict what code does, write it, then prove the idea transfers.',
    tech: [TECH.typescript, TECH.rust],
    links: [],
    media: {},
  },
  {
    id: 'potencia',
    name: 'Potencia Tutor Chatbot',
    year: '2025',
    tag: 'Answers volunteer tutors on WhatsApp, mid-session',
    meta: 'Private build, ask for a walkthrough',
    blurb: 'A WhatsApp assistant that answers volunteer tutors’ questions from program documents during live sessions.',
    tech: [TECH.python, TECH.langchain, TECH.gcp],
    links: [],
    media: {},
  },
  {
    id: 'water-sim',
    name: 'Water Purification Sim',
    year: '2025',
    tag: 'Teaches water treatment to 200 Tufts engineers',
    meta: 'Private build, ask for a walkthrough',
    blurb: 'A Unity simulator that teaches water-treatment systems, used by two hundred engineering students at Tufts.',
    tech: [TECH.csharp, TECH.unity],
    links: [],
    media: {},
  },
  {
    id: 'ace',
    name: 'ACE++ Website',
    year: '2023',
    tag: 'My first shipped site, for 500+ Tufts students',
    blurb: 'The first website I shipped: a CS access program site at Tufts that reached 500+ students at launch.',
    tech: [TECH.javascript, TECH.react, TECH.figma],
    links: [
      { label: 'Visit', url: 'https://ed-key.github.io/ACE/' },
      { label: 'Code', url: 'https://github.com/Ed-Key/ACE' },
    ],
    media: { image: '/media/projects/ace.jpg' },
  },
]

export const EXPERIENCE = [
  { company: 'Stax Labs', role: 'Software Engineer', period: '2026 — Present' },
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
  'Computer science at Tufts School of Engineering, class of ’25. Right now I’m at Stax Labs building the company-exposure service behind Buddi, their investing assistant, where every claim it renders carries a dated source receipt. Before that I built agent-evaluation infrastructure at Matrices.ai and interned at GoDaddy on social-platform integrations. Along the way I put a 3D simulator in front of two hundred engineering students.',
  'I care a lot about how interfaces feel. Most of my side projects start there.',
]

export const PORTFOLIO_FLOORS = [
  { id: 'home', number: '1', label: 'Lobby' },
  { id: 'projects', number: '2', label: 'Projects' },
  { id: 'about', number: '3', label: 'About' },
  { id: 'contact', number: '4', label: 'Contact' },
]
