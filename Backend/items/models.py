from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.utils import timezone

# Create your models here.

MAX_DEMO_VIDEO_SIZE = 8 * 1024 * 1024
DEMO_VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'mov']


def validate_demo_video_size(file):
    if file.size > MAX_DEMO_VIDEO_SIZE:
        raise ValidationError('Demo video file size must be 8 MB or less.')


class Catigory(models.Model):
    name = models.CharField(unique=True, max_length=255)

    def __str__(self):
        return self.name


class SubCatigory(models.Model):
    name = models.CharField(unique=True, max_length=255)
    catigory = models.ForeignKey(
        'Catigory', on_delete=models.CASCADE, related_name='sub_catigories')

    def __str__(self):
        return self.name


class FrameworkType(models.Model):
    catigory = models.ManyToManyField(
        'Catigory', related_name='framework_types')
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Framework(models.Model):
    name = models.CharField(max_length=100)
    ftype = models.ForeignKey(
        'FrameworkType', on_delete=models.CASCADE, related_name='frameworks')

    def __str__(self):
        return self.name


class FileType(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Item(models.Model):
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=100)
    price = models.IntegerField()
    discount_price = models.IntegerField(null=True, blank=True)
    preview_img = models.ImageField(
        upload_to='items/preview_imgs', null=True, blank=True)
    icon_img = models.ImageField(
        upload_to='items/icon_imgs', null=True, blank=True)
    short_describtion = models.CharField(max_length=100)
    describtion = models.TextField()
    featurs = models.TextField()
    size = models.IntegerField()
    # zip_file = models.FileField(
    #     upload_to='items/zip_files', null=True, blank=True)
    file_url = models.URLField(null=True, blank=True)
    status = models.CharField(default='waiting', max_length=100)
    catigory = models.ForeignKey(
        'Catigory', on_delete=models.SET_NULL, related_name='items', null=True)
    sub_catigory = models.ForeignKey(
        'SubCatigory', on_delete=models.SET_NULL, related_name='items', null=True)
    demo_url = models.URLField()
    frameworks = models.ManyToManyField(
        'Framework', related_name='items', blank=True)
    file_types = models.ManyToManyField(
        'FileType', related_name='items', blank=True)
    relased_date = models.DateTimeField(default=timezone.now)
    last_update = models.DateTimeField(null=True, blank=True)
    test_apk = models.URLField(blank=True, null=True)
    test_ios = models.URLField(blank=True, null=True)
    youtube_url = models.URLField(blank=True, null=True)
    demo_video = models.FileField(
        upload_to='items/demo_videos',
        null=True,
        blank=True,
        validators=[
            FileExtensionValidator(allowed_extensions=DEMO_VIDEO_EXTENSIONS),
            validate_demo_video_size,
        ],
    )

    def __str__(self):
        return self.name


class Review(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE, related_name='reviews')
    item = models.ForeignKey(
        'Item', on_delete=models.CASCADE, related_name='reviews')
    content = models.TextField()
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user} add a review on {self.item.seller} item"


class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE, related_name='comments')
    item = models.ForeignKey(
        'Item', on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user} add a commented on {self.item.seller} item"


class Like(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE, related_name='likes')
    item = models.ForeignKey(
        'Item', on_delete=models.CASCADE, related_name='likes')

    def __str__(self):
        return f"{self.user.username} liked {self.item.name}"


class ScreenShots(models.Model):
    item = models.ForeignKey(
        'Item', on_delete=models.CASCADE, related_name='screens')
    image = models.ImageField(null=True, blank=True, upload_to='items/screens')

    def __str__(self):
        return f"{self.item.name}"


class Wishlist(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist')
    items = models.ManyToManyField(Item)

    def __str__(self):
        return f"{self.user.username} Wishlist"
