# finance_monitoring

Monorepo Nx — NestJS + Prisma + PostgreSQL (API) et React + TanStack Start / Router / Query / Table + Axios (web).

## Prérequis

- Node.js 20+ (testé avec Node 24)
- npm
- Docker dans WSL / Portainer (pour Postgres local)

## Structure

- `apps/api` — NestJS + Prisma (`GET /api` et `GET /api/health`)
- `apps/web` — TanStack Start (Router inclus), TanStack Query, TanStack Table, Axios
- `docker-compose.yml` — PostgreSQL 16 (host port **5436**)

## Démarrage

```bash
# 1. Dépendances
npm install
cd apps/web && npm install && cd ../..

# 2. Variables d'environnement
copy .env.example .env
copy apps\api\.env.example apps\api\.env
copy apps\web\.env.example apps\web\.env

# 3. Base Postgres (via WSL)
wsl -e bash -lc "cd /mnt/c/Users/cfortunato/projet/GrokBot_playground/finance_monitoring && docker compose up -d postgres"

# 4. Prisma
npm run prisma:generate
npm run prisma:migrate

# 5. API — http://localhost:3000/api  (health: GET /api/health)
npm run api:serve

# 6. Web — http://localhost:3001 (proxy /api → API)
npm run web:dev
```

## Scripts utiles

| Script | Rôle |
|--------|------|
| `npm run api:serve` | Nest via Nx |
| `npm run web:dev` | TanStack Start (port 3001) |
| `npm run db:up` / `db:down` | Postgres via Docker dans WSL |
| `npm run prisma:generate` | Client Prisma |
| `npm run prisma:migrate` | Migrations |
| `npm run prisma:studio` | Prisma Studio |

## Notes

- Aucun modèle métier finance pour l'instant — placeholder Prisma `HealthCheck` uniquement.
- Package manager: **npm**.
- Prisma CLI pinned en **v6** (ORM classique `generate` / `migrate`).
- CORS autorise localhost ; en dev le proxy Vite `/api` évite les appels cross-origin.
- `DATABASE_URL` utilise `localhost:5436` pour éviter un conflit avec un Postgres Windows sur 5432.
