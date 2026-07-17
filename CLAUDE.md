# CLAUDE.md

Working agreements for this repo. Follow these exactly.

## Commits

- Conventional commits, lowercase after the colon: `type(scope): subject`.
  Types in use: `feat`, `fix`, `style`, `docs`, `ci`, `chore`.
- Subjects state the decision in domain language ("make the pill tokens win
  the cascade"), not the file operation ("update CSS").
- Add a body (2-3 sentences) whenever the commit encodes a judgment call:
  why this approach, what the old behavior did wrong.

## Branching and PRs

- Never commit directly to `main`.
- One branch and one PR per cohesive polish item (`fix/...`, `style/...`,
  `docs/...`).
- Squash experimental churn before pushing. Public history should read as
  decisions, not retries. Media and README experiments especially: iterate
  locally, land one commit.
- Worktrees live under `.claude/worktrees/` (kept out of status via
  `.git/info/exclude`).

## Verification

There is no test suite. Before any PR:

```
npm run lint && npm run build
```

Visual changes also need a look in the browser (`npm run dev`).

## Deployment

Vercel project `edwardkiboma` auto-deploys `main` to edwardkiboma.com
(apex and www both serve directly). Merging to `main` is deploying.
