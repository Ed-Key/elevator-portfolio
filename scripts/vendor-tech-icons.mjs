// Copies the tech-stack SVGs used by ProjectsPanel into public/images/tech/.
// Re-run after adding a tech.
//
// Two sources, because simple-icons (CC0) has dropped several AI vendor marks
// on trademark request and no longer ships OpenAI. lobehub's set (MIT) exists
// for exactly those. The glyphs render as a CSS mask, so only each file's
// alpha matters and the differing fill and sizing attributes between the two
// sources make no difference.
import { copyFile, mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'

const SLUGS = [
  'c', 'claude', 'cplusplus', 'csharp', 'css', 'figma', 'firebase',
  'gnubash', 'googlecloud', 'greensock', 'html5', 'javascript', 'langchain',
  'nextdotjs', 'openjdk', 'opengl', 'python', 'react', 'rust', 'stripe',
  'sqlite', 'supabase', 'threedotjs', 'typescript', 'unity',
]

// Slugs that only exist in the lobehub set.
const AI_SLUGS = ['openai', 'gemini']
// If upstream renamed a slug, try these before failing.
const FALLBACKS = {
  claude: ['anthropic'],
  csharp: ['dotnet'],
  css: ['css3'],
  greensock: ['gsap'],
  openjdk: ['java'],
  opengl: ['webgl'],
}

const ICONS_DIR = path.resolve('node_modules/simple-icons/icons')
const AI_ICONS_DIR = path.resolve('node_modules/@lobehub/icons-static-svg/icons')
const OUT_DIR = path.resolve('public/images/tech')
await mkdir(OUT_DIR, { recursive: true })
const available = new Set(await readdir(ICONS_DIR))
const aiAvailable = new Set(await readdir(AI_ICONS_DIR))

let failed = false

for (const slug of AI_SLUGS) {
  if (!aiAvailable.has(`${slug}.svg`)) {
    console.error(`MISSING ${slug} in the lobehub set`)
    failed = true
    continue
  }
  await copyFile(path.join(AI_ICONS_DIR, `${slug}.svg`), path.join(OUT_DIR, `${slug}.svg`))
  console.log(`ok ${slug} (lobehub)`)
}
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
