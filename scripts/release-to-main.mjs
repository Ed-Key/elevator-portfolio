// Builds the release branch that goes to main.
//
//   node scripts/release-to-main.mjs            # prepare, push, print the PR link
//   node scripts/release-to-main.mjs --dry-run  # prepare locally, push nothing
//
// Why this exists: main is a merge of dev, so anything on dev reaches main by
// default. Deleting the tooling from main once does not hold. A dev-side edit
// to a deleted path is a modify/delete conflict on the next release, and files
// added on dev after that deletion re-enter main untouched. Both were tested.
//
// So the strip happens on the way in, every time, the same way: merge dev into
// a release branch, remove every path in .github/dev-only-paths.txt, commit.
// Deterministic, and .github/workflows/main-stays-clean.yml fails the PR if
// anything slips through.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const DRY_RUN = process.argv.includes('--dry-run')

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()
const gitAllowFail = (...args) => {
  try {
    return { ok: true, out: git(...args) }
  } catch (error) {
    return { ok: false, out: `${error.stdout ?? ''}${error.stderr ?? ''}` }
  }
}
const die = (message) => {
  console.error(message)
  process.exit(1)
}

const devOnly = readFileSync('.github/dev-only-paths.txt', 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'))

if (!devOnly.length) die('.github/dev-only-paths.txt lists no paths')

if (git('status', '--porcelain')) die('working tree is dirty; commit or stash first')

git('fetch', 'origin', '--prune')

const ahead = git('rev-list', '--count', 'origin/main..origin/dev')
if (ahead === '0') die('origin/dev has nothing main does not already have')

// A fixed branch name would collide with an open release; stamp it from the
// commit being released so re-running is idempotent for the same dev tip.
const devSha = git('rev-parse', '--short', 'origin/dev')
const branch = `release/${devSha}`

git('checkout', '-B', branch, 'origin/main')

const merge = gitAllowFail('merge', '--no-commit', '--no-ff', 'origin/dev')

// Strip first: most conflicts a release hits are inside the dev-only paths
// themselves, and removing them resolves those outright.
for (const path of devOnly) {
  gitAllowFail('rm', '-r', '--force', '--quiet', '--ignore-unmatch', '--', path)
}

const unresolved = git('diff', '--name-only', '--diff-filter=U')
  .split('\n')
  .filter(Boolean)

if (unresolved.length) {
  console.error('Conflicts outside the dev-only paths, so this needs a human:')
  unresolved.forEach((file) => console.error(`  ${file}`))
  console.error('\nResolve them, then: git commit && git push -u origin ' + branch)
  process.exit(1)
}

if (!merge.ok && !git('diff', '--cached', '--name-only')) {
  die(`merge failed and produced nothing to commit:\n${merge.out}`)
}

git('commit', '--no-edit')

// Belt and braces: prove the tree is clean before anyone sees the PR.
const leaked = devOnly.filter((path) => git('ls-tree', '-r', '--name-only', 'HEAD', '--', path))
if (leaked.length) die(`still present after the strip: ${leaked.join(', ')}`)

console.log(`prepared ${branch} from origin/main + origin/dev`)
console.log(`stripped: ${devOnly.join(', ')}`)

if (DRY_RUN) {
  console.log('\n--dry-run: nothing pushed. Inspect with `git show --stat HEAD`.')
  process.exit(0)
}

git('push', '-u', 'origin', branch)
console.log(`\nOpen the release PR:\n  gh pr create --base main --head ${branch} --title "release: ${devSha} to main"`)
