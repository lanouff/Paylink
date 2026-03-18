from django.contrib import admin
from .models import PasswordResetRequest, ContactMessage


@admin.register(PasswordResetRequest)
class PasswordResetRequestAdmin(admin.ModelAdmin):
    list_display = ("email", "user", "created_at", "used")
    search_fields = ("email", "token")


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "subject", "message_preview", "created_at")
    search_fields = ("name", "email", "subject", "message")

    def message_preview(self, obj):
        if len(obj.message) <= 50:
            return obj.message
        return obj.message[:50] + "..."
    message_preview.short_description = "Message"