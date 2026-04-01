# Hostinger Deployment Guide

This repository cannot be deployed intact to Hostinger shared hosting.

As of March 31, 2026, Hostinger shared hosting can serve static sites and selected Node.js apps, but this backend is a Django/Python application and the project uses PostgreSQL. Treat deployment as one of these two options:

1. Host the React frontend on Hostinger shared hosting and run the Django backend on a VPS or another Python host.
2. Move both frontend and backend to a VPS, including Hostinger KVM VPS if you want to stay on Hostinger.

If you must stay entirely on shared hosting, this backend would need to be moved to an external API provider or rewritten for a stack supported by that plan.

## What Was Prepared

- Django settings now use environment variables for production secrets, OAuth keys, Cloudinary, support email, security headers, and PayPal mode.
- Django static files now use WhiteNoise with a dedicated `staticfiles/` output directory instead of collecting into the checked-in `static/` tree.
- PayPal server code now switches between sandbox and live mode using `PAYPAL_USE_SANDBOX`.
- The React app now includes an Apache `.htaccess` file so browser-routed URLs fall back to `index.html` on shared hosting.
- Environment example files exist for both apps.
- `Backend/requirements.txt` was added for non-Pipenv production installs.

## Recommended Architecture

Frontend:
- Deploy `Frontend/build/` to Hostinger `public_html`.
- Point `REACT_APP_API_BASE_URL` to `https://api.foxcodeshub.com/api`.

Backend:
- Deploy `Backend/` to a VPS or Python-capable host.
- Put it behind Apache or Nginx with HTTPS.
- Use PostgreSQL via `DATABASE_URL`.

## Frontend on Hostinger Shared Hosting

1. Create `Frontend/.env.production` from `Frontend/.env.example`.
2. Set these values:

```env
REACT_APP_API_BASE_URL=https://api.foxcodeshub.com/api
REACT_APP_SITE_URL=https://foxcodeshub.com
REACT_APP_OAUTH_CLIENT_ID=your-oauth-client-id
REACT_APP_OAUTH_CLIENT_SECRET=your-oauth-client-secret
REACT_APP_PAYPAL_CLIENT_ID=your-paypal-client-id
```

3. Build the frontend:

```powershell
cd Frontend
npm install
npm run build
```

4. Upload the contents of `Frontend/build/` to Hostinger `public_html/`.
5. Keep the generated `.htaccess` file in place so React Router routes resolve correctly.

## Backend on VPS or Python Hosting

1. Create a production `.env` from `Backend/.env.example`.
2. Set at minimum:

```env
DEBUG=0
PRODUCTION_KEY=replace-me
ALLOWED_HOSTS=api.foxcodeshub.com
CSRF_TRUSTED_ORIGINS=https://foxcodeshub.com,https://www.foxcodeshub.com,https://api.foxcodeshub.com
CORS_ALLOW_ALL_ORIGINS=0
CORS_ALLOWED_ORIGINS=https://foxcodeshub.com,https://www.foxcodeshub.com
SECURE_SSL_REDIRECT=1
SESSION_COOKIE_SECURE=1
CSRF_COOKIE_SECURE=1
USE_X_FORWARDED_HOST=1
DATABASE_URL=postgres://user:password@host:5432/dbname
OAUTH_CLIENT_ID=your-oauth-client-id
OAUTH_CLIENT_SECRET=your-oauth-client-secret
PAYPAL_USE_SANDBOX=0
PAYPAL_CLIENT_ID_LIVE=your-live-paypal-client-id
PAYPAL_CLIENT_SECRET_LIVE=your-live-paypal-client-secret
PAYPAL_WEBHOOK_ID_LIVE=your-live-webhook-id
DEFAULT_FROM_EMAIL=no-reply@foxcodeshub.com
SUPPORT_EMAIL=support@foxcodeshub.com
```

3. Install and prepare:

```powershell
cd Backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
```

4. Run with Gunicorn:

```powershell
gunicorn core.wsgi:application --bind 0.0.0.0:8000
```

5. Put Apache or Nginx in front of Gunicorn and forward HTTPS traffic to it.

## Domain Layout

- `https://foxcodeshub.com` -> React frontend on Hostinger shared hosting
- `https://www.foxcodeshub.com` -> redirect to `https://foxcodeshub.com`
- `https://api.foxcodeshub.com` -> Django backend on VPS/Python hosting

Update DNS so the frontend and backend are on separate hosts if you keep Hostinger shared for the frontend.

Recommended DNS records:

- `@` -> Hostinger shared hosting IP for the frontend
- `www` -> CNAME to `foxcodeshub.com`
- `api` -> A record to your VPS or Python hosting IP

## Important Follow-Up

- A real `.env` file with live-looking secrets already exists under `Backend/.env`. Rotate those secrets before any public deployment.
- Shared hosting usually does not let you run long-lived Python app processes or provide PostgreSQL for this stack. Do not plan around that limitation disappearing during deployment.
