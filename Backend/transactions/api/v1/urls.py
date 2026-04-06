from django.urls import path
from .views import *
from .stripe_views import create_stripe_checkout_session, StripeWebhookView

urlpatterns = [
    path('webhook/paypal/', process_webhook.as_view(), name='webhook-paypal'),
    path('create-payout/', create_payout, name='create-payout'),
    path('stripe/create-checkout/', create_stripe_checkout_session, name='stripe-checkout'),
    path('webhook/stripe/', StripeWebhookView.as_view(), name='webhook-stripe'),
]
