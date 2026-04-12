from django.conf import settings
from django.db.models.signals import post_save
from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.utils import timezone
from oauth2_provider.models import AccessToken
from oauth2_provider.models import Application
from oauth2_provider.models import RefreshToken
from oauthlib.common import generate_token

from .models import UserProfile


def refresh_time():
    time = timezone.now() + timezone.timedelta(days=7)
    return time


def access_time():
    time = timezone.now() + timezone.timedelta(hours=10)
    return time


def get_oauth_application():
    app, created = Application.objects.get_or_create(
        id=1,
        defaults={
            'name': 'Local Development',
            'client_id': settings.OAUTH_CLIENT_ID,
            'client_secret': settings.OAUTH_CLIENT_SECRET,
            'client_type': Application.CLIENT_CONFIDENTIAL,
            'authorization_grant_type': Application.GRANT_PASSWORD,
            'skip_authorization': True,
            'user': UserProfile.objects.filter(is_superuser=True).first(),
        }
    )

    update_fields = []
    if app.client_id != settings.OAUTH_CLIENT_ID:
        app.client_id = settings.OAUTH_CLIENT_ID
        update_fields.append('client_id')
    if app.client_secret != settings.OAUTH_CLIENT_SECRET:
        app.client_secret = settings.OAUTH_CLIENT_SECRET
        update_fields.append('client_secret')
    if app.client_type != Application.CLIENT_CONFIDENTIAL:
        app.client_type = Application.CLIENT_CONFIDENTIAL
        update_fields.append('client_type')
    if app.authorization_grant_type != Application.GRANT_PASSWORD:
        app.authorization_grant_type = Application.GRANT_PASSWORD
        update_fields.append('authorization_grant_type')
    if not app.skip_authorization:
        app.skip_authorization = True
        update_fields.append('skip_authorization')
    if app.user_id is None:
        app.user = UserProfile.objects.filter(is_superuser=True).first()
        update_fields.append('user')

    if created:
        return app

    if update_fields:
        app.save(update_fields=update_fields)

    return app


@receiver(post_migrate)
def ensure_oauth_application(sender, **kwargs):
    get_oauth_application()


@receiver(post_save, sender=UserProfile)
def signupToken(sender, instance, created, **kwargs):
    if not created or instance.is_superuser:
        return

    try:
        app = get_oauth_application()
        if RefreshToken.objects.filter(user=instance, application=app).exists():
            return

        ref_tok = generate_token()
        acc_tok = generate_token()
        refresh_token = RefreshToken.objects.create(
            user=instance,
            application=app,
            revoked=refresh_time(),
            token=ref_tok
        )
        access_token = AccessToken.objects.create(
            user=instance,
            source_refresh_token=refresh_token,
            application=app,
            expires=access_time(),
            token=acc_tok,
            scope='read write'
        )
        RefreshToken.objects.filter(token=ref_tok).update(
            access_token=access_token
        )
    except Exception as e:
