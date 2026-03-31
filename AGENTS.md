# AGENTS.md

## Project Overview

This repository is split into two independent applications:

- `Backend/`: Django 4 REST API with PostgreSQL, OAuth/social auth, PayPal integration, Cloudinary, and custom apps for accounts, items, and transactions.
- `Frontend/`: Create React App frontend using React 17, React Router 6, Ant Design, Axios, and PayPal React components.

There is no single root app runner or workspace toolchain. Work inside `Backend/` or `Frontend/` directly.

## Repository Layout

- `Backend/core/`: Django settings, root URLs, ASGI/WSGI.
- `Backend/account/`: custom user model, auth/profile/support endpoints.
- `Backend/items/`: marketplace item models and item/review/comment/wishlist endpoints.
- `Backend/transactions/`: PayPal webhook and payout handling.
- `Backend/media/`: checked-in uploaded assets and admin branding.
- `Frontend/src/pages/`: route-level screens.
- `Frontend/src/components/`: UI grouped by feature area.
- `Frontend/src/Axios.js`: shared API clients and token refresh handling.
- `Frontend/src/App.js`: router, auth bootstrap, and app-wide context.
foxcodeshub.com
## Local Setup

Backend:

```powershell
cd Backend
pipenv install
pipenv run python manage.py migrate
pipenv run python manage.py runserver
```

Frontend:

```powershell
cd Frontend
npm install
npm start
```

Useful checks:

```powershell
cd Backend
pipenv run python manage.py test
```

```powershell
cd Frontend
npm test -- --watchAll=false
npm run build
```

## Important Constraints

- The frontend API base URL is hard-coded to `https://foxsourcecode.com/api` in `Frontend/src/Axios.js`. Local backend changes will not be exercised by the frontend unless you intentionally switch that URL or proxy requests.
- `Frontend/src/App.js` also hard-codes OAuth client credentials and the public host. Treat auth changes as cross-cutting frontend/backend work.
- `Backend/core/settings.py` has `DEBUG = False` by default. Local runs depend on production-style env vars such as `PRODUCTION_KEY`, PayPal secrets, and other credentials unless you change settings deliberately.
- Backend database settings are currently hard-coded for a local PostgreSQL database named `foxcodes`. Verify the actual local DB state before changing schema or auth behavior.
- The backend default DRF permission class is `IsAuthenticated`. Public endpoints are likely opened per-view; inspect the specific view before assuming anonymous access.
- Tests are mostly placeholders. Do not assume automated coverage will catch regressions.

## Editing Guidance

- Keep backend changes scoped to the owning app: `account`, `items`, or `transactions`.
- If you change an API contract, update the matching Axios calls and UI flow in the frontend in the same pass.
- Be careful around auth, token refresh, password reset, and PayPal flows. Those paths mix frontend constants, backend settings, and external services.
- Avoid casually renaming existing fields or routes. The codebase contains several misspelled identifiers such as `catigory`, `describtion`, and `featurs`; preserve existing API/model names unless the task explicitly includes a coordinated cleanup.
- Media files and build artifacts exist in the repo. Do not bulk-delete generated-looking assets unless the task specifically requires cleanup.

## Suggested Exploration Path

If you are new to the codebase, read files in this order:

1. `Backend/core/settings.py`
2. `Backend/core/urls.py`
3. `Backend/account/api/v1/urls.py`
4. `Backend/items/api/v1/urls.py`
5. `Backend/transactions/api/v1/urls.py`
6. `Frontend/src/App.js`
7. `Frontend/src/Axios.js`

Then inspect the relevant models, serializers, views, page components, and feature components for the area you are changing.

## Verification Strategy

- Backend-only changes: run the affected Django tests if any exist, then hit the relevant endpoint manually.
- Frontend-only changes: run `npm run build` at minimum; use `npm test -- --watchAll=false` only if you add or touch tests.
- Cross-stack changes: verify the request path end-to-end, especially for auth-protected routes.
- Payment or webhook changes: prefer minimal edits and document any behavior you could not verify locally.
