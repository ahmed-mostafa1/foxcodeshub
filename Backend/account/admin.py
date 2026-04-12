from django.contrib import admin
from items.models import Item
from .models import *
from django.urls import reverse
from django.utils.html import format_html_join


class items(admin.StackedInline):
    model = Item
    extra = 2


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('username', 'devtype', 'dev_exp',
                    'Items', 'downloads', 'Frameworks', 'OS', 'Earnings', 'Withdraws', 'credit')

    list_filter = ('join_date',
                   'operation_systems', 'frameworks', 'devtype', 'dev_exp')

    search_fields = ('username__startswith', 'fullname__startswith')

    inlines = [items]

    def Frameworks(self, obj):
        return ", ".join([f.name for f in obj.frameworks.all()])

    def OS(self, obj):
        return ", ".join([f.name for f in obj.operation_systems.all()])

    def Items(self, obj):
        return format_html_join(', ', '<a href="{}{}/change/">{}</a>', ((reverse("admin:items_item_changelist"), i.id, i.name) for i in obj.items.all()))

    def downloads(self, obj):
        return format_html_join(', ', '<a href="{}{}/change/">{}</a>', ((reverse("admin:items_item_changelist"), i.item.id, i.item.name) for i in obj.payments.all() if i.item_id and getattr(i, 'item', None)))

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related(
            'frameworks', 'operation_systems', 'items', 'payments__item', 'withdraws', 'earnings'
        )

    def Withdraws(self, obj):
        return sum([w.amount for w in obj.withdraws.all()])

    def Earnings(self, obj):
        return sum([e.net_amount for e in obj.earnings.all()])

    def credit(self, obj):
        return self.Earnings(obj) - self.Withdraws(obj)

    fieldsets = (
        ['Personal Details', {'fields': [
            'email', 'username', 'fullname', 'public_email', 'profile_pic']}],
        ['Developer Details', {'fields': ['devtype',
                                          'dev_exp', 'frameworks', 'operation_systems']}],
        ['Status', {'fields': ['is_active', 'is_staff', 'is_superuser']}],
        ['Dates', {'fields': ['join_date', 'last_login']}],
        ['Permissions', {'fields': ['groups', 'user_permissions']}]
    )


admin.site.register(OperationSystem)
admin.site.register(Framework)
