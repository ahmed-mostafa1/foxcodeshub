from operator import mod
from pyexpat import model
from django.db import models
from account.models import UserProfile
from django.conf import settings
from items.models import Item
from datetime import datetime
from django.utils import timezone

# Create your models here.


class Payment(models.Model):
    trans_id = models.CharField(max_length=255)
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='payments')
    buyer_paypal_id = models.CharField(max_length=255, blank=True, default='')
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name='earnings')
    item = models.ForeignKey(
        Item, on_delete=models.SET_NULL, null=True, related_name='downloads')
    paypal_email = models.EmailField(max_length=255, blank=True, default='')
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True, null=True)
    payment_method = models.CharField(
        max_length=20,
        choices=[('paypal', 'PayPal'), ('stripe', 'Stripe')],
        default='paypal'
    )
    date = models.DateTimeField(default=timezone.now)
    total_amount = models.IntegerField()
    net_amount = models.FloatField()

    class Meta:
        unique_together = ('buyer', 'item')

    def __str__(self):
        buyer_name = self.buyer.username if self.buyer else 'Unknown buyer'
        item_name = self.item.name if self.item else 'deleted item'
        return f'{buyer_name} purchased {item_name}'


class Withdraw(models.Model):
    trans_id = models.CharField(max_length=255)
    user = models.ForeignKey(
        UserProfile, on_delete=models.CASCADE, related_name='withdraws')
    paypal_email = models.EmailField()
    amount = models.IntegerField()
    date = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=100, blank=True, default='pending')

    def __str__(self):
        return f"{self.user.username} has withdrwaed {self.amount} id={self.trans_id}"


class BatchID(models.Model):
    batch_id = models.IntegerField()
