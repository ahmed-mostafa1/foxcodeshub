from django.contrib import admin

from account.models import UserProfile
from .models import *
from django.urls import reverse
from django.utils.html import format_html, format_html_join
from django.conf import settings
# Register your models here.


class screen_shots(admin.StackedInline):
    model = ScreenShots
    extra = 2


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'get_seller', 'size', 'price',
                    'relased_date', 'get_catigory', 'get_sub_catigory', 'buyers', 'screen_shots')

    list_filter = ('name', 'relased_date', 'last_update', 'catigory',
                   'sub_catigory', 'seller', 'frameworks', 'file_types')

    search_fields = ('name__startswith', 'seller_startswith')

    inlines = [screen_shots]

    def get_seller(self, obj):
        return format_html('<a href="{}{}/change/">{}</a>', reverse('admin:account_userprofile_changelist'), obj.seller.id, obj.seller.username)
    get_seller.short_description = 'seller'

    def get_catigory(self, obj):
        return format_html('<a href="{}{}/change/">{}</a>', reverse('admin:items_catigory_changelist'), obj.catigory.id, obj.catigory.name)
    get_catigory.short_description = 'catigory'

    def get_sub_catigory(self, obj):
        return format_html('<a href="{}{}/change/">{}</a>', reverse('admin:items_subcatigory_changelist'), obj.sub_catigory.id, obj.sub_catigory.name)
    get_sub_catigory.short_description = 'sub_catigory'

    def buyers(self, obj):
        return format_html_join(', ', '<a href="{}{}/change/">{}</a>', ((reverse('admin:account_userprofile_changelist'), d.buyer.id, d.buyer.username) for d in obj.downloads.all()))

    def screen_shots(self, obj):
        return format_html_join(', ', '<a href="{}">{}</a>', ((s.image.url, s.image.name) for s in obj.screens.all()))

    fieldsets = (
        ['Basic Info', {'fields': ['name', 'seller', 'short_describtion',  'demo_url', 'status',
                                   'describtion', 'featurs']}],
        ['Catigory & Frameworks', {'fields': [
            'catigory', 'sub_catigory', 'file_types', 'frameworks']}],
        ['Size & Price', {'fields': ['size', 'price', 'discount_price']}],
        ['dates', {'fields': ['relased_date', 'last_update']}],
        ['Assets', {'fields': ['icon_img', 'preview_img', 'file_url']}]
    )


admin.site.register(Catigory)
admin.site.register(SubCatigory)
admin.site.register(FrameworkType)
admin.site.register(Framework)
admin.site.register(FileType)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    pass


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    pass


admin.site.register(Like)
admin.site.register(Wishlist)


@admin.register(ScreenShots)
class ScreenShotsAdmin(admin.ModelAdmin):
    pass
