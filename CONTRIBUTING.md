# Contributing

English is the primary language for this repository. Write documentation, code comments, UI copy, commit messages, and pull requests in English.

Keep changes small and maintain the site's static architecture. Project content belongs in `src/data/studio.ts`; shared page elements belong in components.

Before submitting a pull request, run `pnpm check`, `pnpm build`, and `git diff --check`. For visible changes, inspect both desktop and mobile layouts. For analytics changes, verify consent and production-host restrictions without sending test traffic to the live property.

Use placeholders in examples. Do not commit credentials, private account IDs, server addresses, SSH aliases, deployment receipts, `.env`, or `.deploy.env`. Values prefixed with `PUBLIC_` are embedded in browser code and must never contain secrets. Use your GitHub no-reply email for commits.
