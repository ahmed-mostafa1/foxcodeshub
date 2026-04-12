from importlib.resources import path
from rest_framework import serializers
from account.models import *
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import smart_str
from django.utils.http import urlsafe_base64_decode
from rest_framework.exceptions import AuthenticationFailed
from items.api.v1.seriaizers import ItemSerializer
from transactions.api.v1.serializers import *


class OsSerializer(serializers.ModelSerializer):

    class Meta:
        model = OperationSystem
        fields = ['id', 'name']


class UframeworkSerializer(serializers.ModelSerializer):

    class Meta:
        model = Framework
        fields = ['id', 'name']


class UserSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'id',
            'email',
            'username',
            'password',
            'fullname',
            'profile_pic',
            'public_email',
            'devtype',
            'dev_exp',
            'join_date',
            'items',
            'frameworks',
            'operation_systems'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def save(self, **kwargs):
        user = UserProfile(
            email=self.validated_data.get('email'),
            username=self.validated_data.get('username'),
            fullname=self.validated_data.get('fullname'),
            profile_pic=self.validated_data.get('profile_pic'),
            public_email=self.validated_data.get('public_email'),
            devtype=self.validated_data.get('devtype'),
            dev_exp=self.validated_data.get('dev_exp'),

        )

        user.set_password(self.validated_data.get('password'))
        user.save()
        user.frameworks.add(*get_default_frameworks())
        user.operation_systems.add(*get_default_os())
        user.save()
        return user

    def get_items(self, obj):
        if obj.items:
            return ItemSerializer(
                instance=obj.items.all(),
                many=True
            ).data


class UpdatePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('check old password again')

    def validate_new_password(self, value):
        try:
            validate_password(value, self.context['request'].user)
        except Exception as e:
            raise serializers.ValidationError(str(e))
        return value

    def save(self, **kwargs):
        password = self.validated_data['new_password']
        user = self.context['request'].user
        user.set_password(password)
        user.save()
        return user


class resetPasswordCompleteSerializer(serializers.Serializer):
    password = serializers.CharField(required=True)
    uid64 = serializers.CharField(required=True)
    token = serializers.CharField(required=True)

    class Meta:
        fields = ['password', 'uid64', 'token']

    def validate_password(self, value):
        try:
            validate_password(value)
        except Exception as e:
            raise serializers.ValidationError(str(e), code=400)
        return value

    def save(self, **kwargs):

        uid64 = self.validated_data['uid64']
        token = self.validated_data['token']
        id = smart_str(urlsafe_base64_decode(uid64))
        user = UserProfile.objects.get(id=id)

        if not PasswordResetTokenGenerator().check_token(user, token):
            raise AuthenticationFailed(
                detail='link has been expired', code=401)

        user.set_password(self.validated_data['password'])
        user.save()
        return user


class UserDataSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    credit = serializers.SerializerMethodField()
    payments = serializers.SerializerMethodField()
    withdraws = serializers.SerializerMethodField()
    frameworks = serializers.SerializerMethodField()
    operation_systems = serializers.SerializerMethodField()
    wishlist_items = serializers.SerializerMethodField()
    earnings = serializers.SerializerMethodField()
    downloads = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'id',
            'email',
            'username',
            'password',
            'fullname',
            'profile_pic',
            'public_email',
            'devtype',
            'dev_exp',
            'join_date',
            'items',
            'payments',
            'withdraws',
            'credit',
            'frameworks',
            'operation_systems',
            'wishlist_items',
            'earnings',
            'downloads'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def get_items(self, obj):
        if obj.items:
            return ItemSerializer(
                instance=obj.items.all(),
                many=True
            ).data

    def get_payments(self, obj):
        if obj.payments:
            return PaymentSerializer(
                instance=obj.payments.all(),
                many=True
            ).data

    def get_withdraws(self, obj):
        if obj.withdraws:
            return WithdrawSerializer(
                instance=obj.withdraws.all(),
                many=True
            ).data

    def get_credit(self, obj):
        earnings_credit = 0
        withdraws_credit = 0
        if obj.earnings:
            for i in obj.earnings.all():
                earnings_credit += i.net_amount
        if obj.withdraws:
            for i in obj.withdraws.all():
                withdraws_credit += i.amount
        return earnings_credit - withdraws_credit

    def get_frameworks(self, obj):
        if obj.frameworks:
            return UframeworkSerializer(
                instance=obj.frameworks.all(),
                many=True
            ).data

    def get_operation_systems(self, obj):
        if obj.operation_systems:
            return OsSerializer(
                instance=obj.operation_systems.all(),
                many=True
            ).data

    def get_wishlist_items(self, obj):
        if hasattr(obj, 'wishlist'):
            return ItemSerializer(
                instance=obj.wishlist.items.all(),
                many=True
            ).data

    def get_earnings(self, obj):
        if obj.earnings:
            return PaymentSerializer(
                instance=obj.earnings.all(),
                many=True
            ).data

    def get_downloads(self, obj):
        if hasattr(obj, 'payments'):
            dl = []
            for d in obj.payments.select_related('item').all():
                if d.item_id and d.item is not None:
                    dl.append(d.item)
            return ItemSerializer(
                instance=dl,
                many=True
            ).data
