from django.db import models
from django.conf import settings


class PaymentRequest(models.Model):
    class Status(models.TextChoices):
        CREATED = "CREATED"
        INITIATED = "INITIATED"
        PAID = "PAID"
        CANCELLED = "CANCELLED"
        FAILED = "FAILED"

    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_requests",
    )

    payer_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payment_requests_to_pay",
    )

    target_handle = models.CharField(max_length=30)
    amount_in_minor = models.PositiveIntegerField()
    currency = models.CharField(max_length=3, default="GBP")
    note = models.CharField(max_length=140, blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.CREATED,
    )

    truelayer_payment_id = models.CharField(max_length=100, blank=True)
    truelayer_resource_token = models.TextField(blank=True)
    truelayer_payment_url = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.requester.username} → @{self.target_handle} ({self.amount_in_minor})"


class TrueLayerAuthSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    state = models.CharField(max_length=128, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"TrueLayerAuthSession(user={self.user_id}, used={bool(self.used_at)})"


class BankConnection(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    access_token = models.TextField()
    refresh_token = models.TextField(null=True, blank=True)
    expires_at = models.DateTimeField()
    token_type = models.CharField(max_length=32, default="Bearer")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"BankConnection(user={self.user_id})"


class PayLinkBalance(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="paylink_balance",
    )
    amount_in_minor = models.IntegerField(default=100000)  # £1000.00 demo default
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}: {self.amount_in_minor}"