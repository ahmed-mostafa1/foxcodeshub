from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.apps import apps
import datetime
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.db.models import Q
from django.utils import timezone

# Create your models here.


class OperationSystem(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Framework(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


def get_default_frameworks():
    frameworks = Framework.objects.filter(Q(id=1) | Q(id=2))
    print(frameworks)
    return frameworks


def get_default_os():
    os = OperationSystem.objects.filter(Q(id=1) | Q(id=2))
    return os


class UserProfileManager(BaseUserManager):

    def create_user(self, email, username, password=None, **kwargs):
        if not email:
            raise ValueError('You must enter an email address')
        GlobalUserModel = apps.get_model(
            self.model._meta.app_label, self.model._meta.object_name)
        username = GlobalUserModel.normalize_username(username)
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **kwargs)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password, **kwargs):
        user = self.create_user(email, username, password, **kwargs)
        user.is_superuser = True
        user.is_staff = True
        user.save(using=self._db)
        return user


class UserProfile(AbstractBaseUser, PermissionsMixin):

    username_validator = UnicodeUsernameValidator()

    email = models.EmailField(max_length=255, unique=True)
    username = models.CharField(
        max_length=255, unique=True, validators=[username_validator])
    fullname = models.CharField(max_length=255)
    public_email = models.EmailField(
        max_length=255, unique=True, blank=True, null=True)
    join_date = models.DateTimeField(default=timezone.now)
    profile_pic = models.ImageField(
        upload_to='account/profile_pics', null=True, blank=True)
    dev_exp = models.CharField(
        max_length=255, default='1-3 years', blank=True, null=True)
    devtype = models.CharField(
        max_length=255, blank=True, default='Indbendent Developer', null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    frameworks = models.ManyToManyField(
        'Framework', related_name='users', blank=True)
    operation_systems = models.ManyToManyField(
        'OperationSystem', related_name='users', blank=True)

    objects = UserProfileManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def get_name(self):
        return self.first_name

    def __str__(self):
        return self.username
