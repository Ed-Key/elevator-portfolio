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

- `dev` is the default branch and the integration target. Feature PRs
  merge into `dev`; nothing merges into `main` except release PRs from
  `dev`.
- Never commit directly to `main` or `dev`.
- One branch and one PR per cohesive polish item (`fix/...`, `style/...`,
  `docs/...`), branched off `dev`.
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
(apex and www both serve directly). `dev` and feature branches get
Vercel preview URLs, so merging a feature PR into `dev` publishes
nothing. Deploying is an explicit act: open a `dev` to `main` PR and
merge it when the accumulated work is ready to go live.
