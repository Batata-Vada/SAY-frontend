This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Automatic Codeforces practice tracking

The Practice page starts a timer when you select **Open on Codeforces**.
It periodically refreshes official submission status through SAY-backend,
while the backend's separate `flask --app main watch-cf-practice` worker
checks the linked Codeforces account and completes sessions upon a verified
`OK` verdict. SAY shows pending and failed verdicts without stopping the
timer. The timer continues when the browser tab is closed; a continuously
running backend worker is required. No browser-to-Codeforces scraping occurs.

## Updating safely without losing local files

**Fetching is the safe first step:**

```bash
git fetch --tags origin main
git status --short
git diff --name-status HEAD FETCH_HEAD
```

These commands do not change working files. `git fetch` is not a pull; it
does not delete local `.env` files, SQLite databases, training CSVs, virtual
environments, or model artifacts.

New clones can use the guarded updater from the repository root:

```bash
bash scripts/safe_update.sh          # Fetch only; leave working files untouched
bash scripts/safe_update.sh --apply  # Attempt a checked fast-forward
```

The `--apply` option refuses the update when tracked files have uncommitted
changes, incoming commits would delete existing tracked files, incoming
files collide with existing ignored or untracked paths, or the branch
cannot fast-forward. If checks pass, version-controlled application files
**are updated** to the newer commit while personal ignored files are
preserved. This guard applies only when this script is used: Git cannot
prevent someone from running a regular `git pull` directly.

**Existing clones without this script** should use `git fetch` and inspect
the incoming file changes before their first pull. Earlier cleanup commits
stopped tracking databases, exported CSVs, and generated model artifacts.
An ordinary pull may delete previously tracked local copies. Back up those
files **outside the repository** before applying any deletion and restore
them afterward if needed. Do not run `git reset --hard` or `git clean -fdx`
as a shortcut.

`.gitignore` only controls new untracked files; it never protects files
recorded in older commits. Keep user data and credentials out of Git.
