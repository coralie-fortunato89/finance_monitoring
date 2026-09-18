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

# 3. Base Postgres (Docker dans WSL, depuis la racine du repo)
npm run db:up

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
| `npm run db:up` / `db:down` | Postgres via Docker dans WSL (chemin résolu dynamiquement) |
| `npm run prisma:generate` | Client Prisma |
| `npm run prisma:migrate` | Migrations |
| `npm run prisma:studio` | Prisma Studio |

## Notes

- Aucun modèle métier finance pour l'instant — placeholder Prisma `HealthCheck` uniquement.
- Package manager: **npm**.
- Prisma CLI pinned en **v6** (ORM classique `generate` / `migrate`).
- CORS autorise localhost ; en dev le proxy Vite `/api` évite les appels cross-origin.
- `DATABASE_URL` utilise `localhost:5436` pour éviter un conflit avec un Postgres Windows sur 5432.

## Authentification

L'API protège les routes avec JWT (algorithme HS256).

### Secret JWT (obligatoire)

1. Génère un secret long (au moins 32 caractères), par exemple :
   ```bash
   openssl rand -hex 32
   ```
2. Place-le dans `.env` (racine et/ou `apps/api/.env`) :
   ```env
   JWT_SECRET=<ta_valeur>
   ```
3. L'API **refuse de démarrer** si `JWT_SECRET` est absent, trop court (< 32), ou égal à un placeholder connu (`change-me-in-local-env`, etc.).
4. Ne committe jamais un vrai secret. `.env.example` laisse `JWT_SECRET` vide volontairement.

### Endpoints

| Méthode | Chemin | Auth | Notes |
|---------|--------|------|--------|
| POST | `/api/auth/register` | public | rate-limité ; mot de passe ≥ 10, majuscule, minuscule, chiffre |
| POST | `/api/auth/login` | public | rate-limité |
| POST | `/api/auth/refresh` | cookie refresh | rotation du refresh token |
| POST | `/api/auth/logout` | cookie | révoque le refresh token côté serveur |
| GET | `/api/auth/me` | cookie access (ou Bearer) | profil courant |

### CORS

Par défaut l'API n'autorise que `http://localhost:3001` et `http://127.0.0.1:3001` (front Vite).
Override via `CORS_ORIGINS` (liste séparée par des virgules) — plus de wildcard `localhost:*`.

### Front auth (TanStack Query + Form)

- Session utilisateur : query key `['auth','me']` (`ensureQueryData` / `useQuery` / `setQueryData` après login-register).
- Mutations login/register/logout via `useMutation` (invalidation / cache explicite).
- Formulaires login/register via `@tanstack/react-form` (`useForm` + `form.Field`).
- Refresh token single-flight côté client pour éviter les courses concurrentes.

### Cookies (pas de localStorage)

- `fm_access_token` : httpOnly, SameSite=Lax, durée **15 minutes**
- `fm_refresh_token` : httpOnly, SameSite=Lax, path `/api/auth`, durée **7 jours**, stocké hashé en base (révocable au logout)
- Le front envoie `withCredentials: true` via le proxy Vite ; le JS n'a pas accès aux tokens (réduit le vol XSS).

### Garde front

Les routes sous `_authenticated` appellent `/api/auth/me` (puis `/refresh` en secours) avant de rendre la page. Un 401 redirige vers `/login`.

