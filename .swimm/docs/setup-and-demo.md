## Setup, demo users, and deployment (high level)

For full detail, see the repository **`README.md`** and **`backend/HOW_TO_RUN.md`**. This page tracks the same facts for Swimm readers.

### Secrets and passwords
- **`JWT_SECRET`**, **database password**, and **`DEMO_SEED_PASSWORD`** live in **`backend/.env`** (from `.env.example`). **Never commit** `.env` or put real passwords in issues, Swimm snippets, or markdown in the repo.
- Demo login credentials are **not** documented as literals in git: you choose a value for **`DEMO_SEED_PASSWORD`**, run seeds, then sign in with that password.

### Demo personas (after seeding)
| Role | Email |
|------|--------|
| Owner (Darude Sandstorm) | `darude@example.com` |
| Sitter (Toru Jüri) | `toru@example.com` |

Both accounts receive the hash of **`DEMO_SEED_PASSWORD`** when `seed-demo-users.js` runs.

### Seeding
From `backend/`:

```bash
npm run seed
```

Requires **`DEMO_SEED_PASSWORD`** set; runs user → sitter profile → animal types → demo animals → demo messages (see `seeders/seed-all.js`).

### Production‑relevant behavior (security)
- **`NODE_ENV=production`**: dev-only routes **`/api/auth/test-token`** and **`/api/auth/update-role`** return **404**.
- **Sitter profile** `POST /api/sitters/profile` and **`DELETE`** require JWT; identity comes from the token, not a trusted `userId` body field.
- **`CORS_ORIGIN`**: optional comma-separated allowlist; if unset, CORS stays permissive (dev-friendly).
- **`TRUST_PROXY=1`**, **`DB_SSL=1`**: see `.env.example` for reverse proxies and managed MySQL.

### Frontend API URL
- If **`VITE_API_URL`** is set at **build** time, the SPA uses it for all API calls.
- In **production** builds, if unset, the client defaults to **`window.location.origin + '/api'`** (same-host demos, e.g. Express `SERVE_SPA=1`).
- Stale **`localStorage`** pointing at `localhost` is ignored when the site is not opened on localhost.

### Where to look in code
- API entry: `backend/App.js`, `backend/server.js`
- Auth: `backend/routes/AuthRoutes.js`, `backend/middleware/auth.js`, `backend/middleware/blockInProduction.js`
- Seeds: `backend/seeders/`
