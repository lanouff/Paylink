from django.contrib import admin
from .models import Handle


@admin.register(Handle)
class HandleAdmin(admin.ModelAdmin):
    list_display = ("value", "user", "created_at")
    search_fields = ("value", "user__username")