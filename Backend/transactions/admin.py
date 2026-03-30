from django.contrib import admin
from .models import *
from django.utils.html import format_html
from django.urls import reverse
# Register your models here.


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['trans_id', 'get_item', 'get_seller',
                    'get_buyer', 'total_amount', 'net_amount', 'date']
    list_filter = ['buyer', 'seller', 'item', 'buyer_paypal_id', 'date']

    def get_seller(self, obj):
        return format_html('<a href="{}{}/change/">{}</a>', reverse('admin:account_userprofile_changelist'), obj.seller.id, obj.seller.username)
    get_seller.short_description = 'seller'

    def get_buyer(self, obj):
        return format_html('<a href="{}{}/change/">{}</a>', reverse('admin:account_userprofile_changelist'), obj.buyer.id, obj.buyer.username)
    get_buyer.short_description = 'buyer'

    def get_item(self, obj):
        return format_html('<a href="{}{}/change/">{}</a>', reverse('admin:items_item_changelist'), obj.item.id, obj.item.name)
    get_item.short_description = 'item'


@admin.register(Withdraw)
class WithdrawAdmin(admin.ModelAdmin):
    list_display = ['trans_id', 'get_user', 'amount', 'status', 'date']
    list_filter = ['user', 'status', 'date']

    def get_user(self, obj):
        return format_html('<a href="{}{}/change/">{}</a>', reverse('admin:account_userprofile_changelist'), obj.user.id, obj.user.username)
    get_user.short_description = 'buyer'


admin.site.register(BatchID)
