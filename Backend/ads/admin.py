from django.contrib import admin
from .models import AdPlacement


@admin.register(AdPlacement)
class AdPlacementAdmin(admin.ModelAdmin):
    list_display = ['name', 'location', 'client_id', 'slot_id', 'is_active']
    list_editable = ['is_active']
    list_display_links = ['name']
