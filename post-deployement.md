🟡 When You Get Stripe Keys
1. Add to server .env:

bash
nano /home/ahmed/web/api.foxcodeshub.com/app/Backend/.env
# Add:
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://foxcodeshub.com
2. Register webhook in Stripe Dashboard → Developers → Webhooks:

Endpoint: https://api.foxcodeshub.com/api/payments/webhook/stripe/
Event: checkout.session.completed
Then restart Django: ./deploy-django

🟢 When AdSense Account is Approved
1. Add ad placements in Django Admin: https://api.foxcodeshub.com/admin/ads/adplacement/

2. Uncomment AdSense script in public/index.html:

html
<!-- Change this: -->
<!-- <script async src="...?client=ca-pub-YOUR_ID"...></script> -->
<!-- To this: -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_REAL_ID" crossorigin="anonymous"></script>
