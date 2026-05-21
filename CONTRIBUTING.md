# Contributing to Pars

Thanks for your interest in contributing. Here's everything you need to know.

---

## Development setup

Follow the [README](README.md) getting started guide. Make sure all tests pass before opening a PR.

---

## Branches

| Pattern | Purpose |
|---|---|
| `main` | Production-ready code |
| `feat/<name>` | New features |
| `fix/<name>` | Bug fixes |
| `chore/<name>` | Tooling, deps, config |
| `docs/<name>` | Documentation only |

Never commit directly to `main`.

---

## Commits

Follow [Conventional Commits](https://www.conventionalcommits.org):

```
feat(user): add follow/unfollow endpoint
fix(auth): prevent token reuse after logout
chore(deps): update prisma to 6.x
docs(readme): clarify docker setup
```

Keep messages in the imperative mood ("add" not "added", "fix" not "fixed").

---

## Pull requests

1. Branch from `main`
2. Keep PRs focused — one concern per PR
3. All CI checks must be green
4. Add/update tests for any changed behaviour
5. Summarise what changed and why in the PR description

---

## Hooks

The repo uses Husky. After cloning, hooks are installed automatically via `bun run prepare`.

- **pre-commit**: Gitleaks secrets scan + lint-staged (Biome lint + format)
- **pre-push**: `tsc --noEmit` + tests + build. Run `FULL_PRE_PUSH=1 git push` to also run security scans.

---

## Commit flags

Add these anywhere in your commit message to control CI:

| Flag | Effect |
|---|---|
| `[skip-backend]` | Skip backend CI job |
| `[skip-frontend]` | Skip frontend CI job |
| `[skip-deploy]` | Skip deploy job |
| `[run-partial]` | Run only changed-path jobs |
| `[run-full]` | Force all jobs regardless of changed paths |

---

## Code style

Both packages use [Biome](https://biomejs.dev) for linting and formatting. Run `bun run check:fix` in the relevant package before committing.

---

## Reporting issues

Use the [bug report](.github/ISSUE_TEMPLATE/bug_report.md) template. Include reproduction steps and environment details.
