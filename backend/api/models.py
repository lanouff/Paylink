from django.db import models
from django.contrib.auth.models import User
import secrets


class PasswordResetRequest(models.Model):
    email = models.EmailField()
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    token = models.CharField(max_length=64, unique=True, default=secrets.token_hex)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    def __str__(self):
        return f"Password reset request for {self.email}"


class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=150)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.subject}"