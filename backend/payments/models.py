from django.db import models
from django.conf import settings


class PaymentRequest(models.Model):
    class Status(models.TextChoices):
        CREATED = "CREATED"
        PAID = "PAID"
        CANCELLED = "CANCELLED"
        FAILED = "FAILED"

    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_requests"
    )

    target_handle = models.CharField(max_length=30)
    amount_in_minor = models.PositiveIntegerField()  # e.g. £10 = 1000
    currency = models.CharField(max_length=3, default="GBP")
    note = models.CharField(max_length=140, blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.CREATED,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.requester.username} → @{self.target_handle} ({self.amount_in_minor})"