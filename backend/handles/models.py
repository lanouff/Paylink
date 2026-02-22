from django.db import models
from django.conf import settings

class Handle(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="handles",
        null=True,
        blank=True,
    )
    value = models.CharField(max_length=30, unique=True)
    display_name = models.CharField(max_length=60, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.value