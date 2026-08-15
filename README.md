# finance-app

SPA de finanzas personales (React 19 + TypeScript + Vite). En local habla con
el companion [`personal-api`](https://github.com/FranciscoVeloz1/personal-api)
(`/api/v1/finance` y `/api/v1/auth`). Ese API es un repo aparte (privado).

## Arranque rápido

Arranca `personal-api` en `:3000` (PostgreSQL, migraciones y seed de usuarios
de prueba). Luego, en este repo:

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

`VITE_API_BASE_URL` es el origen de la API (`http://localhost:3000`), sin path.

## Scripts

```powershell
npm run dev
npm run build
npm run typecheck
npm run lint
npm test
npx playwright test e2e/finance-happy-path.spec.ts
```

Playwright asume API en `:3000`, SPA en `:5173` y el ledger tracer ya sembrado.
No imprime passwords ni tokens.

## Auth

La SPA guarda solo el refresh token en `sessionStorage` (`finance:refresh:v1`).
El access token vive en memoria. Tras login siempre consulta `GET /api/v1/auth/me`.
Un 401 reintenta refresh una vez; si falla, redirige a `/login`.
