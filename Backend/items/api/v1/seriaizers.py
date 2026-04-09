from rest_framework import serializers
from items.models import *


class WishlistSerializer(serializers.ModelSerializer):

    class Meta:
        model = Wishlist
        fields = '__all__'


class ScreenShotSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScreenShots
        fields = ['image']


class NewRepresent(serializers.StringRelatedField):
    def to_internal_value(self, value):
        return value


class SubCatigorySerializer(serializers.ModelSerializer):

    class Meta:
        model = SubCatigory
        fields = ['id', 'name']


class FrameworkSerializer(serializers.ModelSerializer):
    ftype = serializers.SerializerMethodField()

    class Meta:
        model = Framework
        fields = ['id', 'name', 'ftype']

    def get_ftype(self, obj):
        return obj.ftype.name


class FrameworkTypeSerializer(serializers.ModelSerializer):
    frameworks = serializers.SerializerMethodField()

    class Meta:
        model = FrameworkType
        fields = ['name', 'frameworks']

    def get_frameworks(self, obj):
        return FrameworkSerializer(
            instance=obj.frameworks.all(),
            many=True
        ).data


class FileTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = FileType
        fields = ['id', 'name']


class CatigorySerializer(serializers.ModelSerializer):
    sub_catigories = serializers.SerializerMethodField()
    framework_types = serializers.SerializerMethodField()

    class Meta:
        model = Catigory
        fields = [
            'id',
            'name',
            'sub_catigories',
            'framework_types'
        ]

    def get_sub_catigories(self, obj):
        return SubCatigorySerializer(
            instance=obj.sub_catigories.all(),
            many=True
        ).data

    def get_framework_types(self, obj):
        return FrameworkTypeSerializer(
            instance=obj.framework_types.all(),
            many=True
        ).data


class ReviewSerializer(serializers.ModelSerializer):

    user = NewRepresent()

    class Meta:
        model = Review
        fields = ['id', 'user', 'content', 'date']


class CommentSerializer(serializers.ModelSerializer):
    user = NewRepresent()

    class Meta:
        model = Comment
        fields = ['id', 'user', 'content', 'date']


class LikeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Like
        fields = ['user']


class ItemSerializer(serializers.ModelSerializer):
    frameworks = serializers.SerializerMethodField()
    file_types = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    likes = serializers.SerializerMethodField()
    downloads = serializers.SerializerMethodField()
    screens = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = [
            'id',
            'name',
            'seller',
            'price',
            'discount_price',
            'demo_url',
            'preview_img',
            'icon_img',
            'short_describtion',
            'describtion',
            'featurs',
            'size',
            # 'zip_file',
            # 'file_url',
            'status',
            'downloads',
            'catigory',
            'sub_catigory',
            'frameworks',
            'file_types',
            'reviews',
            'comments',
            'likes',
            'screens',
            'relased_date',
            'last_update',
            'test_apk',
            'test_ios',
            'youtube_url',
            'demo_video',
        ]
        # depth = 1

    def validate_demo_video(self, value):
        if value and value.size > MAX_DEMO_VIDEO_SIZE:
            raise serializers.ValidationError(
                'Demo video file size must be 8 MB or less.'
            )
        return value

    def get_frameworks(self, obj):
        return FrameworkSerializer(
            instance=obj.frameworks.all(),
            many=True
        ).data

    def get_file_types(self, obj):
        return FileTypeSerializer(
            instance=obj.file_types.all(),
            many=True
        ).data

    def get_reviews(self, obj):
        return ReviewSerializer(
            instance=obj.reviews.all(),
            many=True
        ).data

    def get_comments(self, obj):
        return CommentSerializer(
            instance=obj.comments.all(),
            many=True
        ).data

    def get_likes(self, obj):
        if hasattr(obj, 'likes'):
            return LikeSerializer(
                instance=obj.likes.all(),
                many=True
            ).data

    def get_downloads(self, obj):
        if obj.downloads:
            return obj.downloads.all().count()

    def get_screens(request, obj):
        if obj.screens:
            return ScreenShotSerializer(
                instance=obj.screens.all(),
                many=True
            ).data
