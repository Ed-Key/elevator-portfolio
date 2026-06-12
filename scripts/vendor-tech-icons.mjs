// Copies the tech-stack SVGs used by ProjectsPanel from the simple-icons
// package (CC0) into public/images/tech/. Re-run after adding a tech.
import { copyFile, mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'

const SLUGS = [
  'claude', 'csharp', 'figma', 'firebase', 'googlecloud', 'greensock',
  'langchain', 'nextdotjs', 'opengl', 'python', 'react', 'rust', 'stripe',
  'supabase', 'threedotjs', 'typescript', 'unity',
]
// If upstream renamed a slug, try these before failing.
const FALLBACKS = {
  claude: ['anthropic'],
  csharp: ['dotnet'],
  greensock: ['gsap'],
  opengl: ['webgl'],
}

const ICONS_DIR = path.resolve('node_modules/simple-icons/icons')
const OUT_DIR = path.resolve('public/images/tech')
await mkdir(OUT_DIR, { recursive: true })
const available = new Set(await readdir(ICONS_DIR))

let failed = false
for (const slug of SLUGS) {
  const candidates = [slug, ...(FALLBACKS[slug] ?? [])]
  const found = candidates.find((c) => available.has(`${c}.svg`))
  if (!found) {
    const near = [...available].filter((f) => f.includes(slug.slice(0, 4))).slice(0, 8)
    console.error(`MISSING ${slug} — near matches: ${near.join(', ') || 'none'}`)
    failed = true
    continue
  }
  await copyFile(path.join(ICONS_DIR, `${found}.svg`), path.join(OUT_DIR, `${slug}.svg`))
  console.log(`ok ${slug}${found === slug ? '' : ` (from ${found})`}`)
}
process.exit(failed ? 1 : 0)
