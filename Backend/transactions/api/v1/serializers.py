from xml.parsers.expat import model
from rest_framework import serializers
from transactions.models import *


class NewRepresent(serializers.StringRelatedField):
    def to_internal_value(self, value):
        return value

class PaymentSerializer(serializers.ModelSerializer):
    item = NewRepresent()
    seller = NewRepresent()
    class Meta:
        model = Payment
        fields = '__all__'


class WithdrawSerializer(serializers.ModelSerializer):

    class Meta:
        model = Withdraw
        fields = '__all__'
