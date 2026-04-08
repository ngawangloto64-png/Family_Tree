"""Admin configuration for the Spinner app."""

from django.contrib import admin
from .models import SpinnerPreset, SpinnerItem, SpinHistory


class SpinnerItemInline(admin.TabularInline):
    model = SpinnerItem
    extra = 1


@admin.register(SpinnerPreset)
class SpinnerPresetAdmin(admin.ModelAdmin):
    list_display = ['title', 'spinner_type', 'created_at', 'updated_at']
    list_filter = ['spinner_type']
    search_fields = ['title']
    inlines = [SpinnerItemInline]


@admin.register(SpinHistory)
class SpinHistoryAdmin(admin.ModelAdmin):
    list_display = ['result', 'preset', 'spun_at']
    list_filter = ['preset']
    readonly_fields = ['result', 'preset', 'spun_at']
