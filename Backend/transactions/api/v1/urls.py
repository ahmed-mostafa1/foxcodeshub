from django.urls import path
from .views import *

urlpatterns = [
    path('webhook/paypal/', process_webhook.as_view(), name='webhook-paypal'),
    path('create-payout/', create_payout, name='create-payout')
]
